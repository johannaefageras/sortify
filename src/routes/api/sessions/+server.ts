import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
	const { session } = await locals.safeGetSession();

	if (!session) {
		return json({ error: 'Ej behörig' }, { status: 401 });
	}

	if (!locals.supabase) {
		return json({ error: 'Supabase är inte konfigurerat' }, { status: 503 });
	}

	const { data, error } = await locals.supabase
		.from('sessions')
		.select('id, voice, title, status, started_at, ended_at, created_at')
		.order('created_at', { ascending: false })
		.limit(50);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ sessions: data ?? [] });
}
