import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export async function requireSession(event: Pick<RequestEvent, 'locals' | 'url'>) {
	const { session, user } = await event.locals.safeGetSession();

	if (!session || !user) {
		const next = `${event.url.pathname}${event.url.search}`;
		throw redirect(303, `/auth/login?next=${encodeURIComponent(next)}`);
	}

	return { session, user };
}
