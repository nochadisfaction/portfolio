import type { APIRoute } from 'astro';
import { getAppConfig } from '../../../lib/config-server';

export const GET: APIRoute = async () => {
  try {
    const config = await getAppConfig();
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[api/content/config] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
