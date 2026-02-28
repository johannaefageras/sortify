export function normalizeNext(rawValue: FormDataEntryValue | string | null | undefined): string {
	const value = typeof rawValue === 'string' ? rawValue : '';

	if (!value.startsWith('/')) {
		return '/start';
	}

	// Avoid loops into auth routes after successful login/signup.
	if (value === '/auth' || value.startsWith('/auth/')) {
		return '/start';
	}

	return value;
}

export function callbackUrl(origin: string, next: string): string {
	return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function completionPath(next: string): string {
	return `/auth/complete?next=${encodeURIComponent(next)}`;
}
