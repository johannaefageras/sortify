import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	/**
	 * Declare a dependency so the layout can be invalidated when
	 * `invalidate('supabase:auth')` is called (e.g. after sign-in).
	 */
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(data.supabaseUrl, data.supabaseAnonKey, {
				global: { fetch }
			})
		: createServerClient(data.supabaseUrl, data.supabaseAnonKey, {
				global: { fetch },
				cookies: {
					getAll() {
						return data.cookies;
					}
				}
			});

	if (!isBrowser()) {
		// Server-side: trust the already-verified session/user from +layout.server.ts
		return { session: data.session, user: data.user, supabase };
	}

	const {
		data: { session }
	} = await supabase.auth.getSession();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return { session, user, supabase };
};
