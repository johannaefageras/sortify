import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const next = url.searchParams.get('next');
	const error = url.searchParams.get('error');
	const params = new URLSearchParams();

	if (next) params.set('next', next);
	if (error) params.set('error', error);

	const suffix = params.toString();
	throw redirect(303, suffix ? `/auth/login?${suffix}` : '/auth/login');
};
