import type { LayoutServerLoad } from './$types';
import { hasSupabaseEnv, getSupabaseEnv } from '$lib/server/supabase-env';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const { session, user } = await locals.safeGetSession();

	const { url: supabaseUrl, anonKey: supabaseAnonKey } = hasSupabaseEnv()
		? getSupabaseEnv()
		: { url: '', anonKey: '' };

	return {
		session,
		user,
		cookies: cookies.getAll(),
		supabaseUrl,
		supabaseAnonKey
	};
};
