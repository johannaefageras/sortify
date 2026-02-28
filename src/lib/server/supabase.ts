import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

export function createSupabaseAdminClient() {
	if (!env.PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
		return null;
	}

	return createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}
