import { env } from '$env/dynamic/public';

export function hasSupabaseEnv(): boolean {
	return Boolean(env.PUBLIC_SUPABASE_URL && env.PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
	const url = env.PUBLIC_SUPABASE_URL;
	const anonKey = env.PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !anonKey) {
		throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY');
	}

	return {
		url,
		anonKey
	};
}
