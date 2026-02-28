<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
</script>

<main class="auth-page">
	<section class="auth-card">
		<div class="auth-top">
			<div>
				<p class="ui-label">Välkommen tillbaka</p>
				<h1 class="auth-title">Logga in</h1>
			</div>
			<a href={`/auth/signup?next=${encodeURIComponent(data.next)}`} class="auth-alt-link">Skapa konto</a>
		</div>

		<p class="auth-hint">Använd Google, lösenord eller en magisk länk.</p>

		{#if !data.supabaseConfigured}
			<p class="auth-warning">
				Supabase är inte konfigurerat. Ange `PUBLIC_SUPABASE_URL` och `PUBLIC_SUPABASE_ANON_KEY` i `.env`.
			</p>
		{/if}

		{#if data.callbackError}
			<p class="auth-warning">Inloggningslänken är ogiltig eller har gått ut. Begär en ny nedan.</p>
		{/if}

		{#if form?.error}
			<p class="auth-warning">{form.error}</p>
		{/if}

		{#if form?.success && form?.mode === 'magic'}
			<div class="auth-success">
				<p>
					Magisk länk skickad till <strong>{form.email}</strong>. Öppna den på den här enheten för att fortsätta.
				</p>
			</div>
		{/if}

		<form method="POST" action="?/password" class="auth-form">
			<input type="hidden" name="next" value={form?.next ?? data.next} />
			<div class="field">
				<label class="ui-label" for="password-email">E-post</label>
				<input
					id="password-email"
					name="email"
					type="email"
					required
					autocomplete="email"
					placeholder="du@exempel.se"
					value={form?.mode === 'password' ? form?.email ?? '' : ''}
					class="field-input"
				/>
			</div>
			<div class="field">
				<label class="ui-label" for="password">Lösenord</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autocomplete="current-password"
					placeholder="Minst 8 tecken"
					class="field-input"
				/>
			</div>
			<button class="btn btn-primary auth-submit" type="submit">Logga in med lösenord</button>
		</form>

		<div class="auth-divider">
			<p class="auth-section-hint">Föredrar du utan lösenord?</p>
			<form method="POST" action="?/magic" class="magic-form">
				<input type="hidden" name="next" value={form?.next ?? data.next} />
				<div class="field magic-field">
					<label class="ui-label" for="magic-email">E-post</label>
					<input
						id="magic-email"
						name="email"
						type="email"
						required
						autocomplete="email"
						placeholder="du@exempel.se"
						value={form?.mode === 'magic' ? form?.email ?? '' : ''}
						class="field-input"
					/>
				</div>
				<button class="btn btn-secondary magic-btn" type="submit">Skicka länk</button>
			</form>
		</div>

		<div class="auth-divider">
			<p class="auth-section-hint">Eller fortsätt med Google</p>
			<form method="POST" action="?/google">
				<input type="hidden" name="next" value={form?.next ?? data.next} />
				<button class="btn btn-secondary auth-submit" type="submit">Fortsätt med Google</button>
			</form>
		</div>
	</section>
</main>

<style>
	.auth-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		max-width: 480px;
		margin: 0 auto;
	}

	.auth-card {
		width: 100%;
		padding: 1.5rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.auth-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.auth-title {
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin-top: 0.25rem;
	}

	.auth-alt-link {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-accent);
	}

	.auth-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 1rem 0;
	}

	.auth-warning {
		padding: 0.75rem 1rem;
		margin-bottom: 0.75rem;
		border: 1px solid #fecdd3;
		background: var(--color-danger-soft);
		color: var(--color-danger);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.auth-success {
		padding: 0.75rem 1rem;
		margin-bottom: 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: #f7fcfe;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.auth-success strong {
		color: var(--color-text);
	}

	.auth-success p {
		margin: 0;
		font-size: inherit;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		color: var(--color-text);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.field-input::placeholder {
		color: #7c959d;
		font-weight: var(--weight-light);
	}

	.field-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgb(14 116 144 / 0.1);
	}

	.auth-submit {
		width: 100%;
	}

	.auth-divider {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border);
	}

	.auth-section-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 0.5rem 0;
	}

	.magic-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	@media (min-width: 640px) {
		.magic-form {
			flex-direction: row;
			align-items: flex-end;
		}

		.magic-field {
			flex: 1;
		}

		.magic-btn {
			height: 2.75rem;
		}
	}
</style>
