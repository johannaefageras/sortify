import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { getSupabaseEnv, hasSupabaseEnv } from '$lib/server/supabase-env';

export const handle: Handle = async ({ event, resolve }) => {
	if (hasSupabaseEnv()) {
		const { url, anonKey } = getSupabaseEnv();

		event.locals.supabase = createServerClient(url, anonKey, {
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		});
	} else {
		event.locals.supabase = null;
	}

	event.locals.safeGetSession = async () => {
		if (!event.locals.supabase) {
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
