<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import googleIcon from '$lib/assets/icons/google.svg';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let googleLoading = $state(false);
	let error = $state('');
	let message = $state('');
	let method = $state<'password' | 'magic'>('password');

	async function handleSignup(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		message = '';

		if (method === 'password') {
			const { data, error: err } = await supabase.auth.signUp({ email, password });
			if (err) {
				error = err.message;
			} else if (data.session) {
				goto('/');
			} else {
				message = 'Kolla din e-post för att bekräfta ditt konto.';
			}
		} else {
			const { error: err } = await supabase.auth.signInWithOtp({ email });
			if (err) {
				error = err.message;
			} else {
				message = 'Kolla din e-post för en inloggningslänk.';
			}
		}

		loading = false;
	}

	async function handleGoogleSignup() {
		googleLoading = true;
		error = '';

		const { error: err } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/`
			}
		});

		if (err) {
			error = err.message;
			googleLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Skapa konto — Sortify</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Skapa konto</h1>
		</div>

		{#if error}
			<p class="auth-error">{error}</p>
		{/if}
		{#if message}
			<p class="auth-message">{message}</p>
		{/if}

		<div class="method-toggle">
			<button
				class="method-btn"
				class:active={method === 'password'}
				onclick={() => method = 'password'}
			>E-post & lösenord</button>
			<button
				class="method-btn"
				class:active={method === 'magic'}
				onclick={() => method = 'magic'}
			>Magisk länk</button>
		</div>

		<form class="auth-form" onsubmit={handleSignup}>
			<div class="field">
				<label class="auth-label" for="email">E-postadress</label>
				<input
					class="input"
					id="email"
					type="email"
					placeholder="din@epost.se"
					bind:value={email}
					required
					autocomplete="email"
				/>
			</div>

			{#if method === 'password'}
				<div class="field">
					<label class="auth-label" for="password">Lösenord</label>
					<input
						class="input"
						id="password"
						type="password"
						placeholder="Minst 8 tecken"
						bind:value={password}
						required
						minlength={8}
						autocomplete="new-password"
					/>
				</div>
			{/if}

			<button class="btn btn-primary auth-submit" type="submit" disabled={loading}>
				{#if loading}
					Skapar konto...
				{:else if method === 'magic'}
					Skicka registreringslänk
				{:else}
					Skapa konto
				{/if}
			</button>
		</form>

		<div class="divider">
			<span class="divider-text">eller</span>
		</div>

		<button class="btn-google" onclick={handleGoogleSignup} disabled={googleLoading}>
			<img src={googleIcon} alt="" class="btn-google-icon" />
			{googleLoading ? 'Skapar konto...' : 'Fortsätt med Google'}
		</button>

		<p class="auth-terms">
			Genom att skapa ett konto godkänner du våra <a href="/terms">villkor</a> och <a href="/privacy">integritetspolicy</a>.
		</p>

		<div class="auth-footer">
			<p>Har du redan ett konto? <a href="/login">Logga in</a></p>
		</div>
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100dvh - 80px);
		padding: var(--space-6);
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.auth-header {
		text-align: center;
	}

	.auth-header h1 {
		margin-bottom: 0;
	}

	/* --- Method toggle --- */
	.method-toggle {
		display: flex;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.method-btn {
		flex: 1;
		padding: var(--space-3) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		background: transparent;
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.method-btn:not(:last-child) {
		border-right: 1px solid var(--color-border);
	}

	.method-btn:hover:not(.active) {
		background-color: var(--color-surface);
	}

	.method-btn.active {
		background-color: var(--color-interactive);
		color: var(--color-btn-primary-text, var(--white));
		font-weight: var(--weight-semibold);
	}

	/* --- Form --- */
	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.auth-label {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
	}

	.auth-submit {
		width: 100%;
		margin-top: var(--space-1);
	}

	/* --- Divider --- */
	.divider {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-top: calc(-1 * var(--space-4));
		margin-bottom: calc(-1 * var(--space-4));
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background-color: var(--color-border);
	}

	.divider-text {
		font-size: var(--text-sm);
		color: var(--color-text-faint);
	}

	/* --- Google button --- */
	.btn-google {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-6);
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		line-height: 1;
		color: var(--color-text);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: background-color var(--transition-fast), border-color var(--transition-fast);
	}

	.btn-google:hover:not(:disabled) {
		background-color: var(--color-surface);
		border-color: var(--color-border-strong);
	}

	.btn-google:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-google-icon {
		width: 20px;
		height: 20px;
	}

	.auth-terms {
		text-align: center;
		font-size: var(--text-xs);
		color: var(--color-text-faint);
		margin-top: calc(-1 * var(--space-4));
	}

	.auth-terms a {
		color: var(--color-interactive);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.auth-terms a:hover {
		color: var(--color-interactive-hover);
	}

	.auth-footer {
		text-align: center;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.auth-footer a {
		color: var(--color-interactive);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.auth-footer a:hover {
		color: var(--color-interactive-hover);
	}

	.auth-error {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background-color: hsl(0 80% 95%);
		color: hsl(0 70% 40%);
		font-size: var(--text-sm);
		margin-top: calc(-1 * var(--space-4));
	}

	:global([data-theme='dark']) .auth-error {
		background-color: hsl(0 40% 15%);
		color: hsl(0 80% 75%);
	}

	.auth-message {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		background-color: hsl(140 60% 95%);
		color: hsl(140 50% 30%);
		font-size: var(--text-sm);
		margin-top: calc(-1 * var(--space-4));
	}

	:global([data-theme='dark']) .auth-message {
		background-color: hsl(140 30% 15%);
		color: hsl(140 60% 70%);
	}
</style>
