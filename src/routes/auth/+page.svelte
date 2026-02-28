<main class="redirect-page">
	<section class="redirect-card">
		<p class="ui-label">Omdirigerar</p>
		<h1 class="redirect-title">Tar dig till inloggningen</h1>
		<p class="redirect-hint">Om du inte omdirigeras, fortsätt manuellt.</p>
		<div class="redirect-action">
			<a class="btn btn-secondary" href="/auth/login">Gå till inloggning</a>
		</div>
	</section>
</main>

<style>
	.redirect-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		max-width: 480px;
		margin: 0 auto;
	}

	.redirect-card {
		width: 100%;
		padding: 1.5rem;
		text-align: center;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.redirect-title {
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin-top: 0.5rem;
	}

	.redirect-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0.5rem 0 0 0;
	}

	.redirect-action {
		margin-top: 1rem;
	}
</style>
