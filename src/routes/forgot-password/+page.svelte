<script lang="ts">
	let email = $state('');
	let loading = $state(false);
	let sent = $state(false);

	async function handleReset(e: Event) {
		e.preventDefault();
		loading = true;
		// TODO: Supabase password reset
		console.log('Reset password:', email);
		sent = true;
		loading = false;
	}
</script>

<svelte:head>
	<title>Glömt lösenord — Sortify</title>
</svelte:head>

<div class="auth-page">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Glömt lösenord</h1>
			{#if sent}
				<p>Om det finns ett konto kopplat till <strong>{email}</strong> har vi skickat en återställningslänk.</p>
			{:else}
				<p>Ange din e-post så skickar vi en länk för att återställa ditt lösenord.</p>
			{/if}
		</div>

		{#if !sent}
			<form class="auth-form" onsubmit={handleReset}>
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
				<button class="btn btn-primary auth-submit" type="submit" disabled={loading}>
					{loading ? 'Skickar...' : 'Skicka återställningslänk'}
				</button>
			</form>
		{:else}
			<a href="/login" class="btn btn-secondary auth-submit">Tillbaka till inloggningen</a>
		{/if}

		<div class="auth-footer">
			<p>Kom du på det? <a href="/login">Logga in</a></p>
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
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		text-align: center;
	}

	.auth-header h1 {
		margin-bottom: 0;
	}

	.auth-header p {
		color: var(--color-text-muted);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.auth-label {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
	}

	.auth-label + .input {
		margin-top: calc(-1 * var(--space-2));
	}

	.auth-submit {
		width: 100%;
		margin-top: var(--space-2);
		text-align: center;
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
</style>
