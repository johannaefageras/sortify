<main class="library-page">
	<header class="page-header">
		<h1 class="page-title">Bibliotek</h1>
		<p class="page-subtitle">
			Den här sidan kommer att lista sparade sessioner från Supabase. Just nu är det en platshållare.
		</p>
	</header>

	<div class="empty-state">
		Inga sparade sessioner ännu.
	</div>
</main>

<style>
	.library-page {
		max-width: 700px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 1.5rem;
	}

	.page-title {
		font-family: var(--font-primary);
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.page-subtitle {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	.empty-state {
		padding: 1.25rem;
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		text-align: center;
	}
</style>
