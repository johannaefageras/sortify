<main class="landing">
	<div class="hero">
		<span class="hero-pill">Reflektionsverktyg</span>
		<h1 class="hero-title">Red ut det som tynger.</h1>
		<p class="hero-subtitle">
			Sortify hjälper dig bearbeta en situation genom ett guidat samtal och ger dig en skriftlig sammanfattning att spara.
		</p>
		<p class="hero-disclaimer">
			Sortify är inte terapi och inte krisstöd. Om du befinner dig i akut fara, kontakta 112.
		</p>
		<div class="hero-actions">
			<a href="/start" class="btn btn-primary btn-large">
				Starta en session
			</a>
			<a
				target="_blank"
				rel="noreferrer"
				href="https://mind.se"
				class="btn btn-secondary btn-large"
			>
				Krisresurser
			</a>
		</div>
	</div>

	<div class="milestone-card">
		<h2 class="ui-label">Första byggmilstolpe</h2>
		<ul class="milestone-list">
			<li>1 röstval</li>
			<li>Guidat samtal med säkerhetskontroll</li>
			<li>Sammanfattning</li>
			<li>Sparade sessioner i biblioteket</li>
		</ul>
	</div>
</main>

<style>
	.landing {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2.5rem;
		min-height: 70vh;
		text-align: center;
		max-width: 580px;
		margin: 0 auto;
	}

	.hero-pill {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.875rem;
		border: 1px solid var(--color-border-strong);
		border-radius: 999px;
		background: var(--color-accent-soft);
		color: var(--color-accent);
		font-family: var(--font-primary);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		font-stretch: 110%;
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
	}

	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.hero-title {
		font-family: var(--font-primary);
		font-size: var(--text-4xl);
		font-weight: var(--weight-medium);
		font-stretch: 110%;
		letter-spacing: var(--tracking-tighter);
		line-height: var(--leading-tight);
		color: var(--color-text);
	}

	.hero-subtitle {
		font-size: var(--text-lg);
		line-height: var(--leading-base);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		max-width: 480px;
		margin: 0;
	}

	.hero-disclaimer {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		opacity: 0.8;
		margin: 0;
	}

	.hero-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.milestone-card {
		width: 100%;
		padding: 1.5rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-align: left;
	}

	.milestone-list {
		list-style: none;
		padding: 0;
		margin: 0.75rem 0 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
	}

	@media (min-width: 640px) {
		.hero-title {
			font-size: 3rem;
			font-stretch: 120%;
		}
	}
</style>
