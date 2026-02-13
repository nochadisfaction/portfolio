import type { APIRoute } from 'astro';

// Portfolio status endpoint for cross-project synergy
// Returns current activity data that Gem City can display

export const GET: APIRoute = async () => {
  try {
    // In a real implementation, this would:
    // - Check VS Code extension for current file being edited
    // - Query music player for current track
    // - Get current background from session storage
    // - Check recent GitHub activity
    
    // For now, return mock data that represents typical state
    const activities = [
      "Currently coding: Pixelated Empathy AI systems",
      "Debugging emotional intelligence patterns",
      "Writing: Tech culture critique",
      "Exploring: New Rust async patterns",
      "Reviewing: Open source PRs",
      "Thinking: About surveillance tech",
      "Building: The next feature",
      "Probably: Drinking coffee",
    ];
    
    const backgrounds = [
      "Midnight Terminal",
      "Matrix Rain",
      "Glitch City",
      "Neural Network",
      "Plain Black (focusing)",
    ];
    
    const tracks = [
      "Tool - Lateralus",
      "Deftones - Change",
      "Nine Inch Nails - Closer",
      "Radiohead - Idioteque",
      "Aphex Twin - Windowlicker",
      "Silence (focus mode)",
    ];

    // Randomly select state
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

    const status = {
      lastUpdated: new Date().toISOString(),
      activity: randomActivity,
      background: {
        name: randomBackground,
        id: `bg-${Math.floor(Math.random() * 10) + 1}`,
      },
      music: {
        track: randomTrack,
        isPlaying: Math.random() > 0.3, // 70% chance of playing
      },
      coding: {
        language: ["TypeScript", "Python", "Rust", "Astro"][Math.floor(Math.random() * 4)],
        file: "src/components/EmotionalIntelligence.ts",
        editor: "VS Code",
      },
      // Links back to portfolio
      portfolioUrl: "https://vivi.rocks",
      repoActivity: "2 commits today",
    };

    return new Response(
      JSON.stringify(status),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Allow Gem City to fetch
          'Cache-Control': 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('[Status API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch status' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
