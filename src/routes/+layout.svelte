<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types';
	import '../app.css';

	let { children, data } = $props<{ children: import('svelte').Snippet; data: LayoutData }>();

	onMount(() => {
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Sortify</title>
</svelte:head>

<div class="shell">
	<header class="navbar">
		<div class="navbar-inner">
			<a href="/" class="navbar-brand">Sortify</a>
			<nav class="navbar-nav">
				<a class="nav-link" href="/chat">Chatta</a>
				<a class="nav-link" href="/library">Bibliotek</a>
				{#if data.session && data.user}
					<a class="nav-link" href="/account">Konto</a>
				{/if}
			</nav>
			<div class="navbar-actions">
				{#if data.session && data.user}
					<p class="navbar-email">{data.user.email}</p>
					<form method="POST" action="/auth/signout">
						<button type="submit" class="btn btn-secondary">Logga ut</button>
					</form>
				{:else}
					<a href="/auth/login" class="btn btn-secondary">Logga in</a>
				{/if}
			</div>
		</div>
	</header>
	<main class="main-content">
		{@render children()}
	</main>

	<footer class="site-footer">
		<nav class="footer-nav">
			<a class="footer-link" href="#">Integritetspolicy</a>
			<a class="footer-link" href="#">Villkor</a>
			<a class="footer-link" href="#">Cookies</a>
			<a class="footer-link" href="#">Kontakt</a>
			<a class="footer-link" href="#">Om oss</a>
			<a class="footer-link" href="#">Användarguide</a>
		</nav>
		<span class="footer-copy">
			Upphovsrätt &copy; {new Date().getFullYear()} Sortify | Alla rättigheter förbehållna.
		</span>
	</footer>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		padding: 0.75rem 1.25rem;
		background: var(--color-bg);
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		max-width: 960px;
		margin: 0 auto;
		width: 100%;
	}

	.navbar-brand {
		font-family: var(--font-primary);
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		font-stretch: 115%;
		letter-spacing: var(--tracking-tighter);
		color: var(--color-text);
		text-decoration: none;
	}

	.navbar-brand:hover {
		text-decoration: none;
	}

	.navbar-nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.nav-link {
		padding: 0.5rem 0.75rem;
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		border-radius: var(--radius-sm);
		text-decoration: none;
		transition: color 0.15s ease, background-color 0.15s ease;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-bg-elevated);
		text-decoration: none;
	}

	.navbar-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.navbar-email {
		display: none;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	@media (min-width: 768px) {
		.navbar-email {
			display: block;
		}
	}

	.main-content {
		flex: 1;
		max-width: 960px;
		margin: 0 auto;
		width: 100%;
		padding: 1.5rem 1.25rem;
	}

	.site-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1.25rem 1.5rem;
		border-top: 1px solid var(--color-border);
	}

	.footer-nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem;
		margin-bottom: 1.25rem;
	}

	.footer-link {
		padding: 0.375rem 0.625rem;
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		text-decoration: none;
		border-radius: var(--radius-sm);
		transition: color 0.15s ease;
	}

	.footer-link:hover {
		color: var(--color-text);
		text-decoration: none;
	}

	.footer-copy {
		font-size: var(--text-xs);
		font-weight: var(--weight-regular);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text-muted);
		opacity: 0.7;
	}
</style>
