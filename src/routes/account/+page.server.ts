import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { requireSession } from '$lib/server/require-session';

const profileSchema = z.object({
	displayName: z.string().trim().max(80),
	aboutMe: z.string().trim().max(800)
});

const passwordSchema = z.object({
	newPassword: z.string().min(8).max(128),
	confirmPassword: z.string().min(8).max(128)
});

const AVATAR_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

type ProfileRecord = {
	display_name: string | null;
	about_me: string | null;
	avatar_path: string | null;
	updated_at: string | null;
};

export const load: PageServerLoad = async (event) => {
	const { user } = await requireSession(event);

	if (!event.locals.supabase) {
		return {
			email: user.email ?? '',
			profile: {
				displayName: '',
				aboutMe: '',
				avatarUrl: null as string | null
			},
			loadError:
				'Supabase är inte konfigurerat. Lägg till PUBLIC_SUPABASE_URL och PUBLIC_SUPABASE_ANON_KEY i .env.'
		};
	}

	const { data, error } = await event.locals.supabase
		.from('profiles')
		.select('display_name, about_me, avatar_path, updated_at')
		.eq('user_id', user.id)
		.maybeSingle<ProfileRecord>();

	let avatarUrl: string | null = null;
	if (data?.avatar_path) {
		const {
			data: { publicUrl }
		} = event.locals.supabase.storage.from('avatars').getPublicUrl(data.avatar_path);

		avatarUrl = data.updated_at ? `${publicUrl}?t=${Date.parse(data.updated_at)}` : publicUrl;
	}

	return {
		email: user.email ?? '',
		profile: {
			displayName: data?.display_name ?? '',
			aboutMe: data?.about_me ?? '',
			avatarUrl
		},
		loadError: error?.message ?? null
	};
};

export const actions: Actions = {
	profile: async (event) => {
		const { user } = await requireSession(event);
		const formData = await event.request.formData();

		const parsed = profileSchema.safeParse({
			displayName: formData.get('displayName'),
			aboutMe: formData.get('aboutMe')
		});

		if (!parsed.success) {
			return fail(400, {
				mode: 'profile',
				error: 'Visningsnamn eller Om mig är ogiltigt.',
				displayName: String(formData.get('displayName') ?? ''),
				aboutMe: String(formData.get('aboutMe') ?? '')
			});
		}

		if (!event.locals.supabase) {
			return fail(500, {
				mode: 'profile',
				error: 'Supabase är inte konfigurerat. Lägg till PUBLIC_SUPABASE_URL och PUBLIC_SUPABASE_ANON_KEY.',
				displayName: parsed.data.displayName,
				aboutMe: parsed.data.aboutMe
			});
		}

		const avatar = formData.get('avatar');
		let avatarPath: string | undefined;

		if (avatar instanceof File && avatar.size > 0) {
			if (!AVATAR_ALLOWED_TYPES.has(avatar.type)) {
				return fail(400, {
					mode: 'profile',
					error: 'Avatar måste vara JPG, PNG, WEBP eller GIF.',
					displayName: parsed.data.displayName,
					aboutMe: parsed.data.aboutMe
				});
			}

			if (avatar.size > AVATAR_MAX_BYTES) {
				return fail(400, {
					mode: 'profile',
					error: 'Avatar måste vara 2 MB eller mindre.',
					displayName: parsed.data.displayName,
					aboutMe: parsed.data.aboutMe
				});
			}

			avatarPath = `${user.id}/avatar`;
			const { error: uploadError } = await event.locals.supabase.storage
				.from('avatars')
				.upload(avatarPath, avatar, {
					upsert: true,
					contentType: avatar.type
				});

			if (uploadError) {
				return fail(400, {
					mode: 'profile',
					error: uploadError.message,
					displayName: parsed.data.displayName,
					aboutMe: parsed.data.aboutMe
				});
			}
		}

		const upsertPayload = {
			user_id: user.id,
			display_name: parsed.data.displayName || null,
			about_me: parsed.data.aboutMe || null,
			updated_at: new Date().toISOString(),
			...(avatarPath ? { avatar_path: avatarPath } : {})
		};

		const { error: profileError } = await event.locals.supabase
			.from('profiles')
			.upsert(upsertPayload, { onConflict: 'user_id' });

		if (profileError) {
			return fail(400, {
				mode: 'profile',
				error: profileError.message,
				displayName: parsed.data.displayName,
				aboutMe: parsed.data.aboutMe
			});
		}

		return {
			mode: 'profile',
			success: true
		};
	},
	password: async (event) => {
		await requireSession(event);
		const formData = await event.request.formData();

		const parsed = passwordSchema.safeParse({
			newPassword: formData.get('newPassword'),
			confirmPassword: formData.get('confirmPassword')
		});

		if (!parsed.success) {
			return fail(400, {
				mode: 'password',
				error: 'Lösenordet måste vara mellan 8 och 128 tecken.'
			});
		}

		if (parsed.data.newPassword !== parsed.data.confirmPassword) {
			return fail(400, {
				mode: 'password',
				error: 'Nytt lösenord och bekräftelse stämmer inte överens.'
			});
		}

		if (!event.locals.supabase) {
			return fail(500, {
				mode: 'password',
				error: 'Supabase är inte konfigurerat. Lägg till PUBLIC_SUPABASE_URL och PUBLIC_SUPABASE_ANON_KEY.'
			});
		}

		const { error } = await event.locals.supabase.auth.updateUser({
			password: parsed.data.newPassword
		});

		if (error) {
			return fail(400, {
				mode: 'password',
				error: error.message
			});
		}

		return {
			mode: 'password',
			success: true
		};
	}
};
