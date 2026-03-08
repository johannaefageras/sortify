import { supabaseAdmin } from './supabase';

/**
 * Extract the authenticated user from a request's Authorization header.
 * Expects: Authorization: Bearer <access_token>
 */
export async function getUser(request: Request) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return null;
	}

	const token = authHeader.slice(7);
	const { data, error } = await supabaseAdmin.auth.getUser(token);

	if (error || !data.user) {
		return null;
	}

	return data.user;
}
