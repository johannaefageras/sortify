<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	onMount(async () => {
		// Invalidate the auth dependency so the layout re-checks the session,
		// then navigate to the destination.
		await invalidate('supabase:auth');
		goto(data.next, { replaceState: true });
	});
</script>

<main class="complete-page">
	<section class="complete-card">
		<p class="ui-label">Loggar in dig</p>
		<h1 class="complete-title">Slutför autentisering</h1>
		<p class="complete-hint">
			Om det tar mer än några sekunder, fortsätt manuellt.
		</p>
		<div class="complete-actions">
			<a class="btn btn-primary" href={data.next}>Fortsätt</a>
			<a class="btn btn-secondary" href="/auth/login">Tillbaka till inloggning</a>
		</div>
	</section>
</main>

<style>
	.complete-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 56vh;
		max-width: 480px;
		margin: 0 auto;
	}

	.complete-card {
		width: 100%;
		padding: 1.5rem;
		text-align: center;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.complete-title {
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin-top: 0.5rem;
	}

	.complete-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0.5rem 0 0 0;
	}

	.complete-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1.25rem;
	}

	@media (min-width: 640px) {
		.complete-actions {
			flex-direction: row;
			justify-content: center;
		}
	}
</style>
