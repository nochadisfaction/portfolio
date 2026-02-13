import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, message } = data;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save to Supabase
    if (supabase) {
      const { error: supabaseError } = await supabase
        .from('contacts')
        .insert([{ name, email, message, created_at: new Date().toISOString() }]);

      if (supabaseError) {
        console.error('[Contact API] Supabase insertion error:', supabaseError);
        throw new Error('Failed to save message to database');
      }
    } else {
      console.warn('[Contact API] Supabase client not initialized, message lost');
      throw new Error('Database service unavailable');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
