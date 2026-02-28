<script lang="ts">
	import { VOICES } from '$lib/constants/voices';
</script>

<main class="voice-page">
	<header class="page-header">
		<h1 class="page-title">Välj din reflektionsröst</h1>
		<p class="page-subtitle">Välj den stil som känns rätt för den här sessionen.</p>
	</header>

	<section class="voice-grid">
		{#each VOICES as voice}
			<a href={`/chat?voice=${voice.id}`} class="voice-option {voice.accentClass}">
				<h2 class="voice-name">{voice.name}</h2>
				<p class="voice-desc">{voice.description}</p>
				<p class="voice-opening">{voice.opening}</p>
			</a>
		{/each}
	</section>
</main>

<style>
	.voice-page {
		max-width: 720px;
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

	.voice-grid {
		display: grid;
		gap: 0.75rem;
	}

	@media (min-width: 640px) {
		.voice-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.voice-option {
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
	}

	.voice-option:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
		border-color: var(--color-accent);
		text-decoration: none;
	}

	.voice-option:active {
		transform: scale(0.98);
	}

	.voice-name {
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin-bottom: 0.25rem;
	}

	.voice-desc {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		margin: 0;
	}

	.voice-opening {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-book);
		letter-spacing: var(--tracking-wide);
		line-height: var(--leading-relaxed);
		margin: 1rem 0 0 0;
		opacity: 0.85;
	}
</style>
