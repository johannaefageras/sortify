import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { normalizeNext } from '$lib/server/auth-utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const next = normalizeNext(url.searchParams.get('next'));
	const { session } = await locals.safeGetSession();

	if (session) {
		throw redirect(303, next);
	}

	return { next };
};
