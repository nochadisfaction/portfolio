import type { APIRoute } from 'astro';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });

const bad = (message: string, status = 400) => json({ error: message }, status);

// Simple in-memory cache
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes cache

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached) {
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    cache.delete(key); // Expired
  }
  return null;
}

function setCachedData(key: string, data: any) {
  // Limit cache size to prevent memory leaks
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// Extract the album id from the provided albumUrl, fallback to default if missing
const DEFAULT_ALBUM_ID = 'B2EJtdOXm2MG2Rb';

function getAlbumIdFromUrl(albumUrl: string | undefined): string {
  if (!albumUrl) return DEFAULT_ALBUM_ID;
  // This will extract after the '#' (icloud.com/sharedalbum/#ID) or last '/' as a fallback.
  const hashMatch = albumUrl.match(/#([^?/]+)/);
  if (hashMatch) return hashMatch[1];
  const pathMatch = albumUrl.match(/\/([^/]+)\/?$/);
  return pathMatch ? pathMatch[1] : DEFAULT_ALBUM_ID;
}

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    console.error('[photo-album] Invalid JSON', e);
    return bad('Invalid JSON', 400);
  }

  const { albumUrl } = body || {};

  if (!albumUrl || typeof albumUrl !== 'string') {
    return bad('Missing or invalid albumUrl', 400);
  }

  const ALBUM_ID = getAlbumIdFromUrl(albumUrl);

  // Check cache first
  const cached = getCachedData(ALBUM_ID);
  if (cached) {
    console.log('[photo-album] Serving from cache:', ALBUM_ID);
    return json(cached);
  }

  const BASE_URL = `https://p107-sharedstreams.icloud.com/${ALBUM_ID}/sharedstreams`;

  console.log('[photo-album] Fetching album:', ALBUM_ID);

  try {
    // 1. Get the Stream (the list of photo identifiers)
    const streamController = new AbortController();
    const timeoutId = setTimeout(() => streamController.abort(), 10000);

    const streamResponse = await fetch(`${BASE_URL}/webstream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ streamGuid: ALBUM_ID }),
      signal: streamController.signal,
    });
    clearTimeout(timeoutId);

    if (!streamResponse.ok) {
      console.error('[photo-album] Stream fetch failed:', streamResponse.status, streamResponse.statusText);
      return bad('Upstream service error', 502);
    }

    const streamData = await streamResponse.json();
    console.log('[photo-album] Stream data received, photos count:', streamData.photos?.length || 0);

    if (!streamData.photos?.length) {
      console.warn('[photo-album] No photos in stream data');
      return bad('No photos found in album', 404);
    }

    // Helper function to get the best available derivative dynamically
    // iCloud uses numeric derivatives (pixel widths) like '342', '2049', '1440', '2208'
    // Higher numbers typically mean better quality/resolution
    function getBestDerivative(derivatives: Record<string, any>): { key: string; checksum: string } | null {
      if (!derivatives || typeof derivatives !== 'object') {
        return null;
      }

      const available = Object.entries(derivatives)
        .filter(([_, value]) => value && value.checksum)
        .map(([key, value]) => {
          // Try to parse as number (numeric derivatives like '2049', '1440' are pixel widths)
          const numericValue = parseInt(key, 10);
          return {
            key,
            checksum: value.checksum,
            numericValue: isNaN(numericValue) ? 0 : numericValue,
            isNumeric: !isNaN(numericValue)
          };
        });

      if (available.length === 0) {
        return null;
      }

      // Sort to get the best quality:
      // 1. Prefer numeric derivatives (higher = better)
      // 2. For non-numeric, prefer known good names
      const sorted = available.sort((a, b) => {
        // Both numeric: prefer higher value
        if (a.isNumeric && b.isNumeric) {
          return b.numericValue - a.numericValue;
        }
        // Prefer numeric over non-numeric
        if (a.isNumeric && !b.isNumeric) return -1;
        if (!a.isNumeric && b.isNumeric) return 1;
        // Both non-numeric: prefer known good names
        const knownGood = ['PosterFrame'];
        const aIndex = knownGood.indexOf(a.key);
        const bIndex = knownGood.indexOf(b.key);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        // Otherwise, alphabetical
        return a.key.localeCompare(b.key);
      });

      return {
        key: sorted[0].key,
        checksum: sorted[0].checksum
      };
    }

    // Extract photo/video guids and map them to their checksums
    const photoMapping: Record<string, { checksum: string; derivative: string }> = {};

    const photoGuids = streamData.photos
      .map((p: any) => {
        if (!p.derivatives || !p.photoGuid) {
          return null;
        }

        const best = getBestDerivative(p.derivatives);

        if (best) {
          photoMapping[p.photoGuid] = {
            checksum: best.checksum,
            derivative: best.key
          };
          return p.photoGuid;
        }

        // Log available derivatives for debugging
        const available = Object.keys(p.derivatives);
        console.warn('[photo-album] No suitable derivative found for GUID:', p.photoGuid, 'Available:', available, 'Type:', p.type || p.assetType || 'unknown');
        return null;
      })
      .filter((guid: string | null) => guid !== null) as string[];

    console.log('[photo-album] Photo GUIDs extracted:', photoGuids.length);

    if (!photoGuids.length) {
      console.warn('[photo-album] No valid photos found');
      return bad('No valid photos found', 404);
    }

    // 2. Get the actual Asset URLs (by photoGuids)
    const assetController = new AbortController();
    const assetTimeoutId = setTimeout(() => assetController.abort(), 10000);

    const assetResponse = await fetch(`${BASE_URL}/webasseturls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoGuids }),
      signal: assetController.signal,
    });
    clearTimeout(assetTimeoutId);

    if (!assetResponse.ok) {
      console.error('[photo-album] Asset fetch failed:', assetResponse.status, assetResponse.statusText);
      return bad('Upstream service error', 502);
    }

    const assetData = await assetResponse.json();
    console.log('[photo-album] Asset data received, items count:', Object.keys(assetData.items || {}).length);

    // 3. Build a lookup map for photos by GUID (optimize PosterFrame lookups)
    const photoByGuid = new Map<string, any>();
    streamData.photos.forEach((p: any) => {
      if (p.photoGuid) {
        photoByGuid.set(p.photoGuid, p);
      }
    });

    // 4. Build URLs using the checksum mapping and detect video type from URL extension
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];

    const mediaItems = photoGuids
      .map((guid: string) => {
        try {
          const mapping = photoMapping[guid];
          if (!mapping) return null;

          const item = assetData.items?.[mapping.checksum];
          if (!item) return null;

          const scheme = item.url_scheme || 'https';
          const host = item.url_location;
          const path = item.url_path;

          if (host && path) {
            const fullUrl = `${scheme}://${host}${path}`;
            const urlObj = new URL(fullUrl);
            const pathname = urlObj.pathname.toLowerCase();
            const isVideo = videoExtensions.some(ext => pathname.endsWith(ext));

            let thumbnail: string | undefined = undefined;
            if (isVideo) {
              const originalPhoto = photoByGuid.get(guid);
              if (originalPhoto?.derivatives?.PosterFrame?.checksum) {
                const posterItem = assetData.items?.[originalPhoto.derivatives.PosterFrame.checksum];
                if (posterItem?.url_location && posterItem?.url_path) {
                  const posterScheme = posterItem.url_scheme || 'https';
                  thumbnail = `${posterScheme}://${posterItem.url_location}${posterItem.url_path}`;
                }
              }
              if (!thumbnail) thumbnail = fullUrl;
            }

            return { url: fullUrl, isVideo, thumbnail };
          }
          return null;
        } catch (e) {
          console.warn('[photo-album] Error mapping Guid:', guid, e);
          return null;
        }
      })
      .filter((item: any) => item !== null);

    console.log('[photo-album] Media items built:', mediaItems.length);
    const videoCount = mediaItems.filter((item: any) => item.isVideo).length;
    const photoCount = mediaItems.length - videoCount;
    console.log('[photo-album] Photos:', photoCount, 'Videos:', videoCount);

    if (!mediaItems.length) {
      console.error('[photo-album] No valid media URLs found');
      return bad('No valid media URLs found', 404);
    }

    const responseData = { photos: mediaItems };
    setCachedData(ALBUM_ID, responseData); // Save to cache

    return json(responseData);
  } catch (err: any) {
    console.error('[photo-album] Error fetching iCloud photos', err);
    if (err.name === 'AbortError' || err?.type === 'aborted') {
      return bad('Request timed out', 504);
    }
    return bad('Internal server error', 500);
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, OPTIONS'
    },
  });
};

export const GET: APIRoute = async () => json({ ok: true });

