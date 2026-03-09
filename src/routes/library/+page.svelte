<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	interface SessionItem {
		id: string;
		voice: string;
		title: string;
		status: string;
		started_at: string;
		turn_count: number;
		has_takeaway: boolean;
	}

	let sessions = $state<SessionItem[]>([]);
	let loading = $state(true);
	let error = $state('');

	const voiceLabels: Record<string, string> = {
		classic: 'Klassisk',
		friendly: 'Vänlig',
		friend: 'Kompis',
		mentor: 'Mentor',
		lifecoach: 'Livscoach',
		philosophical: 'Filosofisk',
		realistic: 'Realistisk',
		formal: 'Formell',
		cynical: 'Cynisk',
		sarcastic: 'Sarkastisk',
		'passive-aggressive': 'Passivt Aggressiv',
		chaotic: 'Kaotisk',
		british: 'Brittisk',
		bureaucratic: 'Byråkratisk',
		tinfoilhat: 'Foliehatt',
		'ai-robot': 'AI-Robot'
	};

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
	}

	async function loadSessions() {
		loading = true;
		error = '';

		const { data: authData } = await supabase.auth.getSession();
		const token = authData.session?.access_token;

		if (!token) {
			goto('/login');
			return;
		}

		try {
			const res = await fetch('/api/sessions', {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!res.ok) {
				if (res.status === 401) {
					goto('/login');
					return;
				}
				throw new Error('Kunde inte ladda sessioner');
			}

			sessions = await res.json();
		} catch (err: any) {
			error = err.message || 'Något gick fel';
		}

		loading = false;
	}

	if (browser) {
		loadSessions();
	}
</script>

<svelte:head>
	<title>Bibliotek — Sortify</title>
</svelte:head>

<div class="library-page">
	<div class="library-container">
		<div class="library-header">
			<h1>Bibliotek</h1>
			<a href="/chat" class="btn btn-primary">Ny session</a>
		</div>

		{#if error}
			<p class="feedback feedback-error">{error}</p>
		{/if}

		{#if loading}
			<div class="library-empty">
				<p class="text-muted">Laddar sessioner...</p>
			</div>
		{:else if sessions.length === 0}
			<div class="library-empty">
				<p class="library-empty-title">Inga sessioner ännu</p>
				<p class="text-muted">När du har haft din första reflektion dyker den upp här.</p>
				<a href="/chat" class="btn btn-secondary">Starta en session</a>
			</div>
		{:else}
			<div class="session-list">
				{#each sessions as session (session.id)}
					<a href="/sessions/{session.id}" class="session-card card card-interactive">
						<div class="session-card-top">
							<span class="session-voice-badge">{voiceLabels[session.voice] ?? session.voice}</span>
							<div class="session-info">
								<span class="session-title">{session.title}</span>
								<span class="session-meta">
									{formatDate(session.started_at)} · {formatTime(session.started_at)} · {session.turn_count} meddelanden
								</span>
							</div>
							<div class="session-badges">
								{#if session.status === 'abandoned'}
									<span class="label label-danger">Avbruten</span>
								{:else if session.status === 'active'}
									<span class="label">Aktiv</span>
								{:else if session.has_takeaway}
									<span class="label label-accent">Insikt sparad</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.library-page {
		display: flex;
		justify-content: center;
		padding: var(--space-10) var(--space-6) var(--space-16);
		min-height: calc(100dvh - 80px);
	}

	.library-container {
		width: 100%;
		max-width: 720px;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.library-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.library-header h1 {
		margin-bottom: 0;
	}

	/* --- Session list --- */
	.session-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.session-card {
		padding: var(--space-5) var(--space-6);
	}

	.session-card-top {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.session-voice-badge {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background-color: var(--color-surface);
		color: var(--color-text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.session-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		flex: 1;
		min-width: 0;
	}

	.session-title {
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.session-meta {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.session-badges {
		flex-shrink: 0;
	}

	/* --- Empty state --- */
	.library-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-16) var(--space-6);
		text-align: center;
	}

	.library-empty-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		color: var(--color-text);
	}

	/* --- Feedback --- */
	.feedback {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.feedback-error {
		background-color: hsl(0 80% 95%);
		color: hsl(0 70% 40%);
	}

	:global([data-theme='dark']) .feedback-error {
		background-color: hsl(0 40% 15%);
		color: hsl(0 80% 75%);
	}

	/* --- Responsive --- */
	@media (max-width: 768px) {
		.library-page {
			padding: var(--space-8) var(--space-4) var(--space-12);
		}

		.session-card {
			padding: var(--space-4);
		}

		.session-card-top {
			gap: var(--space-3);
		}
	}

	@media (max-width: 480px) {
		.library-page {
			padding: var(--space-6) var(--space-3) var(--space-10);
		}

		.session-card-top {
			flex-wrap: wrap;
		}

		.session-info {
			min-width: 100%;
			order: 1;
		}
	}
</style>
