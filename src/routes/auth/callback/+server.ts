import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';
import { completionPath, normalizeNext } from '$lib/server/auth-utils';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const tokenHash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = normalizeNext(url.searchParams.get('next'));

	if (!locals.supabase) {
		throw redirect(303, `/auth/login?next=${encodeURIComponent(next)}&error=callback`);
	}

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			throw redirect(303, completionPath(next));
		}
	}

	if (tokenHash && type) {
		const { error } = await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type });
		if (!error) {
			throw redirect(303, completionPath(next));
		}
	}

	throw redirect(303, `/auth/login?next=${encodeURIComponent(next)}&error=callback`);
};
