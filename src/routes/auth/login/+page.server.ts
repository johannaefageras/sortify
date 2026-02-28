import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { hasSupabaseEnv } from '$lib/server/supabase-env';
import { callbackUrl, completionPath, normalizeNext } from '$lib/server/auth-utils';

const emailSchema = z.object({
	email: z.email().max(320)
});

const passwordSignInSchema = z.object({
	email: z.email().max(320),
	password: z.string().min(8).max(128)
});

export const load: PageServerLoad = async ({ locals, url }) => {
	const { session } = await locals.safeGetSession();
	const next = normalizeNext(url.searchParams.get('next'));

	if (session) {
		throw redirect(303, next);
	}

	return {
		next,
		callbackError: url.searchParams.get('error') === 'callback',
		supabaseConfigured: hasSupabaseEnv()
	};
};

export const actions: Actions = {
	google: async ({ request, url, locals }) => {
		const formData = await request.formData();
		const next = normalizeNext(formData.get('next'));

		if (!locals.supabase) {
			return fail(500, {
				mode: 'google',
				error: 'Supabase är inte konfigurerat. Lägg till PUBLIC_SUPABASE_URL och PUBLIC_SUPABASE_ANON_KEY.',
				next
			});
		}

		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: callbackUrl(url.origin, next),
				queryParams: { prompt: 'select_account' }
			}
		});

		if (error) {
			return fail(400, {
				mode: 'google',
				error: error.message,
				next
			});
		}

		if (data.url) {
			throw redirect(303, data.url);
		}

		return fail(500, {
			mode: 'google',
			error: 'Kunde inte starta Google-inloggning. Försök igen.',
			next
		});
	},
	password: async ({ request, locals }) => {
		const formData = await request.formData();
		const next = normalizeNext(formData.get('next'));
		const parsed = passwordSignInSchema.safeParse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		if (!parsed.success) {
			return fail(400, {
				mode: 'password',
				error: 'Ange en giltig e-postadress och lösenord (minst 8 tecken).',
				next
			});
		}

		if (!locals.supabase) {
			return fail(500, {
				mode: 'password',
				error: 'Supabase är inte konfigurerat. Lägg till PUBLIC_SUPABASE_URL och PUBLIC_SUPABASE_ANON_KEY.',
				next,
				email: parsed.data.email
			});
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email: parsed.data.email,
			password: parsed.data.password
		});

		if (error) {
			return fail(400, {
				mode: 'password',
				error: error.message,
				next,
				email: parsed.data.email
			});
		}

		throw redirect(303, completionPath(next));
	},
	magic: async ({ request, url, locals }) => {
		const formData = await request.formData();
		const next = normalizeNext(formData.get('next'));
		const parsed = emailSchema.safeParse({ email: formData.get('email') });

		if (!parsed.success) {
			return fail(400, {
				mode: 'magic',
				error: 'Ange en giltig e-postadress.',
				next
			});
		}

		if (!locals.supabase) {
			return fail(500, {
				mode: 'magic',
				error: 'Supabase är inte konfigurerat. Lägg till PUBLIC_SUPABASE_URL och PUBLIC_SUPABASE_ANON_KEY.',
				next,
				email: parsed.data.email
			});
		}

		const { error } = await locals.supabase.auth.signInWithOtp({
			email: parsed.data.email,
			options: {
				emailRedirectTo: callbackUrl(url.origin, next)
			}
		});

		if (error) {
			return fail(400, {
				mode: 'magic',
				error: error.message,
				next,
				email: parsed.data.email
			});
		}

		return {
			mode: 'magic',
			success: true,
			email: parsed.data.email,
			next
		};
	}
};
