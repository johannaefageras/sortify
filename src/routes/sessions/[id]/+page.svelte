<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';
	import type { Session, Message, Takeaway } from '$lib/types';

	let session = $state<Session | null>(null);
	let messages = $state<Message[]>([]);
	let takeaway = $state<Takeaway | null>(null);
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

	const formatLabels: Record<string, string> = {
		letter: 'Brev till dig själv',
		realizations: 'Viktiga insikter',
		'next-steps': 'Nästa steg'
	};

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('sv-SE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
	}

	async function loadSession(id: string) {
		loading = true;
		error = '';

		const { data: authData } = await supabase.auth.getSession();
		const token = authData.session?.access_token;

		if (!token) {
			goto('/login');
			return;
		}

		try {
			const res = await fetch(`/api/sessions/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (!res.ok) {
				if (res.status === 401) {
					goto('/login');
					return;
				}
				if (res.status === 404) {
					error = 'Sessionen hittades inte';
					loading = false;
					return;
				}
				throw new Error('Kunde inte ladda sessionen');
			}

			const data = await res.json();
			session = data.session;
			messages = data.messages;
			takeaway = data.takeaway;
		} catch (err: any) {
			error = err.message || 'Något gick fel';
		}

		loading = false;
	}

	if (browser) {
		const id = $page.params.id as string;
		loadSession(id);
	}
</script>

<svelte:head>
	<title>{session?.title || 'Session'} — Sortify</title>
</svelte:head>

<div class="detail-page">
	<div class="detail-container">
		<!-- Back link -->
		<a href="/library" class="back-link">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="15 18 9 12 15 6"/>
			</svg>
			Tillbaka till bibliotek
		</a>

		{#if error}
			<div class="error-state">
				<p class="feedback feedback-error">{error}</p>
				<a href="/library" class="btn btn-secondary">Tillbaka</a>
			</div>
		{:else if loading}
			<div class="loading-state">
				<p class="text-muted">Laddar session...</p>
			</div>
		{:else if session}
			<!-- Session header -->
			<div class="session-header">
				<h1>{session.title || 'Session utan titel'}</h1>
				<div class="session-header-meta">
					<span class="voice-badge">{voiceLabels[session.voice] ?? session.voice}</span>
					<span class="meta-sep">·</span>
					<span>{formatDate(session.started_at)}</span>
					<span class="meta-sep">·</span>
					<span>{formatTime(session.started_at)}</span>
					<span class="meta-sep">·</span>
					<span>{session.turn_count} meddelanden</span>
				</div>
			</div>

			<!-- Takeaway section -->
			{#if takeaway}
				<div class="takeaway-section">
					<div class="takeaway-header">
						<h2>Insikt</h2>
						<span class="takeaway-format">{formatLabels[takeaway.format] ?? takeaway.format}</span>
					</div>
					<div class="takeaway-content">
						{takeaway.content}
					</div>
				</div>
			{/if}

			<!-- Conversation -->
			<div class="conversation-section">
				<h2>Konversation</h2>
				<div class="message-list">
					{#each messages as msg (msg.id)}
						<div class="message" class:message-user={msg.role === 'user'} class:message-assistant={msg.role === 'assistant'}>
							<span class="message-role">{msg.role === 'user' ? 'Du' : 'Sortify'}</span>
							<div class="message-bubble">
								{msg.content}
							</div>
							<span class="message-time">{formatTime(msg.created_at)}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.detail-page {
		display: flex;
		justify-content: center;
		padding: var(--space-8) var(--space-6) var(--space-16);
		min-height: calc(100dvh - 80px);
	}

	.detail-container {
		width: 100%;
		max-width: 720px;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	/* --- Back link --- */
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		transition: color var(--transition-fast);
	}

	.back-link:hover {
		color: var(--color-text);
	}

	/* --- Session header --- */
	.session-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.session-header h1 {
		margin-bottom: 0;
	}

	.session-header-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.meta-sep {
		color: var(--color-text-faint);
	}

	.voice-badge {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background-color: var(--color-surface);
		color: var(--color-text-muted);
	}

	/* --- Takeaway --- */
	.takeaway-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6);
		background-color: var(--accent-subtle);
		border: 1px solid var(--accent-muted);
		border-radius: var(--radius-lg);
	}

	.takeaway-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.takeaway-header h2 {
		margin-bottom: 0;
		font-size: var(--text-lg);
	}

	.takeaway-format {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-interactive);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		background-color: var(--color-surface-raised);
	}

	.takeaway-content {
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--color-text);
		white-space: pre-wrap;
	}

	/* --- Conversation --- */
	.conversation-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.conversation-section h2 {
		margin-bottom: 0;
		font-size: var(--text-lg);
	}

	.message-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.message {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.message-role {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.message-bubble {
		font-size: var(--text-base);
		line-height: var(--leading-relaxed);
		color: var(--color-text);
		white-space: pre-wrap;
		padding: var(--space-4) var(--space-5);
		border-radius: var(--radius-lg);
	}

	.message-user .message-bubble {
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
	}

	.message-assistant .message-bubble {
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
	}

	.message-time {
		font-size: var(--text-xs);
		color: var(--color-text-faint);
	}

	/* --- States --- */
	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-16) var(--space-6);
		text-align: center;
	}

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
		.detail-page {
			padding: var(--space-6) var(--space-4) var(--space-12);
		}

		.takeaway-section {
			padding: var(--space-4);
		}

		.message-bubble {
			padding: var(--space-3) var(--space-4);
		}
	}

	@media (max-width: 480px) {
		.detail-page {
			padding: var(--space-4) var(--space-3) var(--space-10);
		}

		.session-header-meta {
			font-size: var(--text-xs);
		}

		.takeaway-section {
			padding: var(--space-3);
		}

		.message-bubble {
			padding: var(--space-3);
		}
	}
</style>
