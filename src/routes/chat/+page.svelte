<script lang="ts">
	import type { ChatMessage, TakeawayFormat, VoiceOption } from '$lib/types';

	let { data } = $props<{ data: { voice: VoiceOption } }>();

	let draft = $state('');
	let isSending = $state(false);
	let isGeneratingTakeaway = $state(false);
	let errorMessage = $state('');
	let takeaway = $state('');
	let selectedFormat = $state<TakeawayFormat>('letter');
	let messages = $state<ChatMessage[]>([]);
	const userTurnCount = $derived(messages.filter((message) => message.role === 'user').length);

	$effect(() => {
		if (messages.length === 0) {
			messages = [{ role: 'assistant', content: data.voice.opening }];
		}
	});

	async function sendMessage() {
		const trimmed = draft.trim();
		if (!trimmed || isSending) return;

		errorMessage = '';
		isSending = true;

		const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
		messages = nextMessages;
		draft = '';

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ voice: data.voice.id, messages: nextMessages })
			});

			if (!response.ok) {
				throw new Error('Chat request failed');
			}

			const payload = await response.json();
			messages = [...messages, { role: 'assistant', content: payload.reply }];
		} catch {
			errorMessage = 'Kunde inte skicka meddelandet. Försök igen.';
		} finally {
			isSending = false;
		}
	}

	async function generateTakeaway() {
		if (isGeneratingTakeaway) return;
		errorMessage = '';
		isGeneratingTakeaway = true;

		try {
			const response = await fetch('/api/takeaway', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					voice: data.voice.id,
					format: selectedFormat,
					messages
				})
			});

			if (!response.ok) {
				throw new Error('Takeaway request failed');
			}

			const payload = await response.json();
			takeaway = payload.takeaway;
		} catch {
			errorMessage = 'Kunde inte skapa sammanfattningen. Försök igen.';
		} finally {
			isGeneratingTakeaway = false;
		}
	}
</script>

<main class="chat-layout">
	<section class="chat-panel">
		<div class="chat-header">
			<div>
				<p class="ui-label">Röst</p>
				<p class="chat-voice-name">{data.voice.name}</p>
			</div>
			<a href="/start" class="chat-switch-link">Byt röst</a>
		</div>

		<div class="chat-messages">
			{#each messages as message}
				<div class="chat-bubble {message.role === 'assistant' ? 'chat-bubble-assistant' : 'chat-bubble-user'}">
					{message.content}
				</div>
			{/each}
		</div>

		<form
			onsubmit={(event) => {
				event.preventDefault();
				sendMessage();
			}}
			class="chat-input-row"
		>
			<input
				bind:value={draft}
				placeholder="Vad har du på hjärtat just nu?"
				class="chat-input"
				disabled={isSending}
			/>
			<button
				type="submit"
				disabled={isSending}
				class="btn btn-primary"
			>
				{isSending ? 'Skickar...' : 'Skicka'}
			</button>
		</form>

		{#if errorMessage}
			<p class="chat-error">{errorMessage}</p>
		{/if}
	</section>

	<aside class="chat-sidebar">
		<h2 class="sidebar-title">Avslutning</h2>
		<p class="sidebar-hint">Tillgänglig efter 4 meddelanden.</p>

		<div class="sidebar-field">
			<label for="format" class="ui-label">Sammanfattningsformat</label>
			<select
				id="format"
				bind:value={selectedFormat}
				class="sidebar-select"
			>
				<option value="letter">Brev till mig själv</option>
				<option value="realizations">Viktiga insikter</option>
				<option value="steps">Nästa steg</option>
			</select>
		</div>

		<button
			onclick={generateTakeaway}
			disabled={userTurnCount < 4 || isGeneratingTakeaway}
			class="btn btn-neutral sidebar-btn"
		>
			{isGeneratingTakeaway ? 'Skapar...' : 'Jag känner mig redo att avrunda'}
		</button>

		{#if takeaway}
			<div class="takeaway-panel">
				{takeaway}
			</div>
		{/if}
	</aside>
</main>

<style>
	.chat-layout {
		display: grid;
		gap: 1.25rem;
		max-width: 960px;
		margin: 0 auto;
	}

	@media (min-width: 1024px) {
		.chat-layout {
			grid-template-columns: 1fr 320px;
		}
	}

	.chat-panel {
		padding: 1.25rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.chat-voice-name {
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
		margin: 0.125rem 0 0 0;
	}

	.chat-switch-link {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		font-weight: var(--weight-medium);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.chat-switch-link:hover {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.chat-messages {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.chat-bubble {
		max-width: 90%;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		line-height: var(--leading-relaxed);
		letter-spacing: var(--tracking-wide);
	}

	.chat-bubble-assistant {
		background: var(--color-neutral);
		color: #1b3641;
	}

	.chat-bubble-user {
		background: var(--color-accent);
		color: #f4fbfe;
		margin-left: auto;
	}

	.chat-input-row {
		display: flex;
		gap: 0.5rem;
	}

	.chat-input {
		flex: 1;
		padding: 0.625rem 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		color: var(--color-text);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.chat-input::placeholder {
		color: #7c959d;
		font-weight: var(--weight-light);
	}

	.chat-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgb(14 116 144 / 0.1);
	}

	.chat-error {
		margin-top: 0.75rem;
		padding: 0.625rem 0.875rem;
		border: 1px solid #fecdd3;
		background: var(--color-danger-soft);
		color: var(--color-danger);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.chat-sidebar {
		padding: 1.25rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		align-self: start;
	}

	.sidebar-title {
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--color-text);
		margin: 0;
	}

	.sidebar-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0.25rem 0 0 0;
	}

	.sidebar-field {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.sidebar-select {
		width: 100%;
		padding: 0.625rem 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-sm);
		font-weight: var(--weight-regular);
		color: var(--color-text);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.sidebar-select:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgb(14 116 144 / 0.1);
	}

	.sidebar-btn {
		width: 100%;
		margin-top: 1rem;
	}

	.takeaway-panel {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: #f7fcfe;
		font-size: var(--text-sm);
		font-weight: var(--weight-book);
		line-height: var(--leading-loose);
		letter-spacing: var(--tracking-wide);
		color: var(--color-text);
		white-space: pre-wrap;
	}
</style>
