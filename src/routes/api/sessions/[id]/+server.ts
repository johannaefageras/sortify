import { getUser } from '$lib/server/auth';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params }) => {
	const user = await getUser(request);

	if (!user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Load session (verify ownership)
	const { data: session, error: sessionError } = await supabaseAdmin
		.from('sessions')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', user.id)
		.single();

	if (sessionError || !session) {
		return new Response(JSON.stringify({ error: 'Session not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Load messages
	const { data: messages } = await supabaseAdmin
		.from('messages')
		.select('id, role, content, created_at')
		.eq('session_id', params.id)
		.order('created_at', { ascending: true });

	// Load takeaway (latest version)
	const { data: takeaways } = await supabaseAdmin
		.from('takeaways')
		.select('id, format, content, version, created_at')
		.eq('session_id', params.id)
		.order('version', { ascending: false })
		.limit(1);

	return new Response(
		JSON.stringify({
			session,
			messages: messages ?? [],
			takeaway: takeaways?.[0] ?? null
		}),
		{ headers: { 'Content-Type': 'application/json' } }
	);
};
