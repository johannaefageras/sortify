<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import favicon from '$lib/assets/favicon.svg';
	import '../styles/fonts.css';
	import '../styles/variables.css';
	import '../styles/reset.css';
	import '../styles/typography.css';
	import '../styles/components.css';

	let { children } = $props();

	let dark = $state(false);
	let user = $state<import('@supabase/supabase-js').User | null>(null);

	if (browser) {
		const stored = localStorage.getItem('sortify-theme');
		if (stored) {
			dark = stored === 'dark';
		} else {
			dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}

		supabase.auth.onAuthStateChange((event, session) => {
			user = session?.user ?? null;
			if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
				goto('/', { replaceState: true });
			}
		});
	}

	async function handleLogout() {
		await supabase.auth.signOut();
		goto('/login');
	}

	$effect(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
			localStorage.setItem('sortify-theme', dark ? 'dark' : 'light');
		}
	});

	function toggleTheme() {
		dark = !dark;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Sortify</title>
</svelte:head>

<nav class="navbar">
	<div class="navbar-inner">
		<a href="/" class="navbar-brand">Sortify</a>
		<div class="navbar-actions">
			<a href="/chat" class="btn btn-ghost">Ny chatt</a>
			{#if user}
				<a href="/account" class="btn btn-ghost">Mitt konto</a>
				<button class="btn btn-ghost" onclick={handleLogout}>Logga ut</button>
			{:else}
				<a href="/login" class="btn btn-ghost">Logga in</a>
				<a href="/signup" class="btn btn-primary">Kom igång</a>
			{/if}
			<button
				class="theme-toggle"
				onclick={toggleTheme}
				aria-label={dark ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
			>
				{#if dark}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="5"/>
						<line x1="12" y1="1" x2="12" y2="3"/>
						<line x1="12" y1="21" x2="12" y2="23"/>
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
						<line x1="1" y1="12" x2="3" y2="12"/>
						<line x1="21" y1="12" x2="23" y2="12"/>
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
					</svg>
				{:else}
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				{/if}
			</button>
		</div>
	</div>
</nav>

<main>
	{@render children()}
</main>

<footer class="site-footer">
	<div class="footer-inner">
		<nav class="footer-nav" aria-label="Juridisk information">
			<a href="/villkor">Villkor</a>
			<a href="/integritetspolicy">Integritetspolicy</a>
			<a href="/cookiepolicy">Cookiepolicy</a>
			<a href="/kontakt">Kontakt</a>
		</nav>
		<p class="footer-copyright">&copy; {new Date().getFullYear()} Sortify</p>
	</div>
</footer>

<style>
	.navbar {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: hsla(0, 0%, 100%, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border);
	}

	:global([data-theme='dark']) .navbar {
		background-color: hsla(0, 0%, 9%, 0.85);
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: var(--page-width);
		margin-inline: auto;
		padding: var(--space-4) var(--space-6);
	}

	.navbar-brand {
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: var(--color-text);
		letter-spacing: -0.02em;
	}

	.navbar-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.navbar-actions .btn {
		padding-inline: var(--space-4);
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: calc(var(--space-3) * 2 + var(--text-base));
		height: calc(var(--space-3) * 2 + var(--text-base));
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
	}

	.theme-toggle:hover {
		background-color: var(--color-surface);
		border-color: var(--color-border-strong);
		color: var(--color-text);
	}

	/* --- Footer --- */
	.site-footer {
		border-top: 1px solid var(--color-border);
		padding: var(--space-6);
	}

	.footer-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		max-width: var(--page-width);
		margin-inline: auto;
	}

	.footer-copyright {
		font-size: var(--text-sm);
		color: var(--color-text-faint);
	}

	.footer-nav {
		display: flex;
		align-items: center;
		gap: var(--space-6);
	}

	.footer-nav a {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		transition: color var(--transition-fast);
	}

	.footer-nav a:hover {
		color: var(--color-text);
	}

	@media (max-width: 768px) {
		.navbar-inner {
			padding: var(--space-3) var(--space-4);
		}

		.site-footer {
			padding: var(--space-6) var(--space-4);
		}

		.footer-nav {
			gap: var(--space-4);
			flex-wrap: wrap;
		}
	}
</style>
