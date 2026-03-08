import { getUser } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
	const user = await getUser(request);

	if (!user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { data: sessions, error } = await supabaseAdmin
		.from('sessions')
		.select('id, voice, title, status, started_at, ended_at, turn_count, created_at, takeaways(id)')
		.eq('user_id', user.id)
		.order('started_at', { ascending: false });

	if (error) {
		console.error('Failed to load sessions:', error);
		return new Response(JSON.stringify({ error: 'Failed to load sessions' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const result = (sessions ?? []).map((s: any) => ({
		id: s.id,
		voice: s.voice,
		title: s.title || 'Session utan titel',
		status: s.status,
		started_at: s.started_at,
		ended_at: s.ended_at,
		turn_count: s.turn_count,
		created_at: s.created_at,
		has_takeaway: (s.takeaways?.length ?? 0) > 0
	}));

	return new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' }
	});
};
