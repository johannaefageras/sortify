<script lang="ts">
	import iconScale from '$lib/assets/icons/scale.svg';
	import iconTeddyBear from '$lib/assets/icons/teddy-bear.svg';
	import iconBeerMugs from '$lib/assets/icons/beer-mugs.svg';
	import iconOwl from '$lib/assets/icons/owl.svg';
	import iconWomanMeditating from '$lib/assets/icons/woman-meditating.svg';
	import iconFaceThinking from '$lib/assets/icons/face-thinking.svg';
	import iconCamera from '$lib/assets/icons/camera.svg';
	import iconTopHat from '$lib/assets/icons/top-hat.svg';
	import iconFaceUnamused from '$lib/assets/icons/face-unamused.svg';
	import iconFaceSmirking from '$lib/assets/icons/face-smirking.svg';
	import iconFaceUpsideDown from '$lib/assets/icons/face-upside-down.svg';
	import iconTornado from '$lib/assets/icons/tornado.svg';
	import iconFlagUk from '$lib/assets/icons/flag-uk.svg';
	import iconClipboard from '$lib/assets/icons/clipboard.svg';
	import iconFlyingSaucer from '$lib/assets/icons/flying-saucer.svg';
	import iconRobot from '$lib/assets/icons/robot.svg';
	import iconOldWoman from '$lib/assets/icons/old-woman.svg';
	import iconClassicalBuilding from '$lib/assets/icons/classical-building.svg';
	import iconBrain from '$lib/assets/icons/brain.svg';
	import iconMirror from '$lib/assets/icons/mirror.svg';
	import iconFaceMelting from '$lib/assets/icons/face-melting.svg';
	import iconMagnifyingGlass from '$lib/assets/icons/magnifying-glass.svg';

	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	if (browser) {
		supabase.auth.getUser().then(({ data }) => {
			if (!data.user) goto('/login');
		});
	}

	async function authHeaders(): Promise<Record<string, string>> {
		const { data } = await supabase.auth.getSession();
		const token = data.session?.access_token;
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	interface ChatMessage {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		timestamp: Date;
	}

	let message = $state('');
	let messages = $state<ChatMessage[]>([]);
	let isLoading = $state(false);
	let chatContainer = $state<HTMLDivElement>();
	let sessionId = $state<string | null>(null);
	let sessionLocked = $state(false);

	// Takeaway state
	let showWrapUp = $state(false);
	let takeawayLoading = $state(false);
	let takeaway = $state<{ format: string; content: string } | null>(null);
	let selectedFormat = $state<'letter' | 'realizations' | 'next-steps'>('letter');

	const turnCount = $derived(messages.filter((m) => m.role === 'user').length);
	const wrapUpEligible = $derived(turnCount >= 5 && !sessionLocked && !takeaway);

	const hasMessages = $derived(messages.length > 0);
	const canSend = $derived(message.trim().length > 0 && !isLoading && !sessionLocked && !takeaway);

	async function scrollToBottom() {
		await tick();
		if (chatContainer) {
			chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
		}
	}

	async function streamResponse(userContent: string) {
		const assistantId = crypto.randomUUID();
		messages = [...messages, {
			id: assistantId,
			role: 'assistant',
			content: '',
			timestamp: new Date()
		}];
		isLoading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
				body: JSON.stringify({
					sessionId,
					message: userContent,
					voice: selectedVoice
				})
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const reader = response.body!.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;
					const data = line.slice(6);
					if (data === '[DONE]') break;

					try {
						const parsed = JSON.parse(data);
						if (parsed.error) throw new Error(parsed.error);
						if (parsed.sessionId) {
							sessionId = parsed.sessionId;
						}
						if (parsed.crisis) {
							sessionLocked = true;
						}
						if (parsed.text) {
							messages = messages.map((m) =>
								m.id === assistantId
									? { ...m, content: m.content + parsed.text }
									: m
							);
							scrollToBottom();
						}
					} catch (e) {
						if (e instanceof SyntaxError) continue;
						throw e;
					}
				}
			}
		} catch (err) {
			const last = messages.find((m) => m.id === assistantId);
			if (last && !last.content) {
				messages = messages.map((m) =>
					m.id === assistantId
						? { ...m, content: 'Något gick fel. Försök igen.' }
						: m
				);
			}
		} finally {
			isLoading = false;
		}
	}

	const formatLabels: Record<string, string> = {
		letter: 'Brev till dig själv',
		realizations: 'Viktiga insikter',
		'next-steps': 'Nästa steg'
	};

	async function generateTakeaway() {
		if (!sessionId || takeawayLoading) return;
		takeawayLoading = true;

		try {
			const response = await fetch('/api/takeaway', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
				body: JSON.stringify({ sessionId, format: selectedFormat })
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();
			takeaway = { format: data.format, content: data.content };
			showWrapUp = false;
			scrollToBottom();
		} catch (err) {
			console.error('Takeaway generation failed:', err);
		} finally {
			takeawayLoading = false;
		}
	}

	interface Voice {
		id: string;
		label: string;
		description: string;
		icon: string;
		category: 'serious' | 'playful';
	}

	const voices: Voice[] = [
		// Serious
		{ id: 'classic', label: 'Klassisk', description: 'Balanserad och empatisk', icon: iconScale, category: 'serious' },
		{ id: 'friendly', label: 'Vänlig', description: 'Mjuk, varm och tålmodig', icon: iconTeddyBear, category: 'serious' },
		{ id: 'friend', label: 'Kompis', description: 'Avslappnad och jordnära', icon: iconBeerMugs, category: 'serious' },
		{ id: 'mentor', label: 'Mentor', description: 'Lugn, erfaren och vis', icon: iconOwl, category: 'serious' },
		{ id: 'lifecoach', label: 'Livscoach', description: 'Energisk och framåtblickande', icon: iconWomanMeditating, category: 'serious' },
		{ id: 'philosophical', label: 'Filosofisk', description: 'Nyfiken och perspektivvidgande', icon: iconFaceThinking, category: 'serious' },
		{ id: 'realistic', label: 'Realistisk', description: 'Rak och osentimental', icon: iconCamera, category: 'serious' },
		{ id: 'formal', label: 'Formell', description: 'Distinguerad och exakt', icon: iconTopHat, category: 'serious' },
		// Playful
		{ id: 'cynical', label: 'Cynisk', description: 'Skarp och genomskådande', icon: iconFaceUnamused, category: 'playful' },
		{ id: 'sarcastic', label: 'Sarkastisk', description: 'Kvick och lekfullt vass', icon: iconFaceSmirking, category: 'playful' },
		{ id: 'passive-aggressive', label: 'Passivt Aggressiv', description: 'Avväpnande artig', icon: iconFaceUpsideDown, category: 'playful' },
		{ id: 'chaotic', label: 'Kaotisk', description: 'Oförutsägbar och briljant', icon: iconTornado, category: 'playful' },
		{ id: 'british', label: 'Brittisk', description: 'Stiff upper lip, dry humour', icon: iconFlagUk, category: 'playful' },
		{ id: 'bureaucratic', label: 'Byråkratisk', description: 'Absurt administrativ', icon: iconClipboard, category: 'playful' },
		{ id: 'tinfoilhat', label: 'Foliehatt', description: 'Underhållande paranoid', icon: iconFlyingSaucer, category: 'playful' },
		{ id: 'ai-robot', label: 'AI-Robot', description: 'Bokstavlig och lite glitchig', icon: iconRobot, category: 'playful' },
		{ id: 'grandma', label: 'Mormor', description: 'Jordnära och praktiskt vis', icon: iconOldWoman, category: 'serious' },
		{ id: 'socratic', label: 'Sokratisk', description: 'Nyfiken och frågande', icon: iconClassicalBuilding, category: 'serious' }
	];

	const validVoiceIds = new Set(voices.map((v) => v.id));
	function getInitialVoice(): string {
		if (!browser) return 'classic';
		const param = new URLSearchParams(window.location.search).get('voice');
		return param && validVoiceIds.has(param) ? param : 'classic';
	}
	let selectedVoice = $state(getInitialVoice());
	let voiceMenuOpen = $state(false);
	let pendingVoice = $state<string | null>(null);

	const selectedVoiceData = $derived(voices.find((v) => v.id === selectedVoice)!);
	const pendingVoiceData = $derived(pendingVoice ? voices.find((v) => v.id === pendingVoice) : null);

	function selectVoice(id: string) {
		if (id === selectedVoice) {
			voiceMenuOpen = false;
			return;
		}
		if (hasMessages) {
			pendingVoice = id;
			voiceMenuOpen = false;
			return;
		}
		selectedVoice = id;
		voiceMenuOpen = false;
	}

	function confirmVoiceSwitch() {
		if (!pendingVoice) return;
		selectedVoice = pendingVoice;
		pendingVoice = null;
		messages = [];
		sessionId = null;
		sessionLocked = false;
		showWrapUp = false;
		takeaway = null;
		message = '';
	}

	function cancelVoiceSwitch() {
		pendingVoice = null;
	}

	function handleWindowClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (voiceMenuOpen && !target.closest('.voice-picker')) {
			voiceMenuOpen = false;
		}
	}

	const starters = [
		{ text: 'Jag behöver sortera mina tankar', icon: iconBrain },
		{ text: 'Jag vill reflektera över ett beslut', icon: iconMirror },
		{ text: 'Jag känner mig överväldigad', icon: iconFaceMelting },
		{ text: 'Jag vill förstå en känsla bättre', icon: iconMagnifyingGlass }
	];

	function handleSend() {
		if (!canSend) return;

		const content = message.trim();
		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'user',
			content,
			timestamp: new Date()
		};

		messages = [...messages, userMessage];
		message = '';
		scrollToBottom();
		streamResponse(content);
	}

	function handleStarter(starter: string) {
		message = starter;
		handleSend();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="chat-page" class:has-messages={hasMessages}>
	{#if !hasMessages}
		<div class="chat-welcome">
			<h1 class="chat-greeting">Vad vill du prata om?</h1>
			<p class="chat-lead">
				Berätta vad som ligger på hjärtat. Jag lyssnar, ställer frågor och hjälper dig
				sortera dina tankar — utan att döma.
			</p>

			<div class="starter-grid">
				{#each starters as starter}
					<button class="starter-card" onclick={() => handleStarter(starter.text)}>
						<img class="starter-icon" src={starter.icon} alt="" />
						{starter.text}
					</button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="chat-messages" bind:this={chatContainer}>
			{#each messages as msg (msg.id)}
				{#if msg.role === 'assistant' && !msg.content && isLoading}
					<div class="chat-bubble assistant">
						<div class="typing-indicator">
							<span></span><span></span><span></span>
						</div>
					</div>
				{:else}
					<div class="chat-bubble {msg.role}">
						<p class="chat-bubble-text">{msg.content}</p>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	{#if takeaway}
		<div class="takeaway-card">
			<div class="takeaway-header">
				<h3 class="takeaway-title">{formatLabels[takeaway.format] ?? 'Takeaway'}</h3>
			</div>
			<div class="takeaway-content">
				<p class="takeaway-text">{takeaway.content}</p>
			</div>
			<div class="takeaway-actions">
				<a href="/chat" class="btn btn-primary">Starta ny session</a>
			</div>
		</div>
	{:else if wrapUpEligible && !showWrapUp && !isLoading}
		<div class="wrapup-banner">
			<p class="wrapup-text">Vill du runda av och skapa en sammanfattning?</p>
			<div class="wrapup-actions">
				<button class="btn btn-ghost" onclick={() => showWrapUp = true}>Ja, runda av</button>
			</div>
		</div>
	{/if}

	{#if showWrapUp}
		<div class="wrapup-picker">
			<p class="wrapup-picker-label">Välj format:</p>
			<div class="wrapup-formats">
				{#each (['letter', 'realizations', 'next-steps'] as const) as fmt}
					<button
						class="wrapup-format-btn"
						class:selected={selectedFormat === fmt}
						onclick={() => selectedFormat = fmt}
					>
						{formatLabels[fmt]}
					</button>
				{/each}
			</div>
			<div class="wrapup-confirm">
				<button
					class="btn btn-primary"
					onclick={generateTakeaway}
					disabled={takeawayLoading}
				>
					{takeawayLoading ? 'Genererar...' : 'Skapa takeaway'}
				</button>
				<button class="btn btn-ghost" onclick={() => showWrapUp = false}>Avbryt</button>
			</div>
		</div>
	{/if}

	<div class="chat-input-bar">
		{#if sessionLocked}
			<div class="session-locked">
				<p class="session-locked-text">Sessionen har avslutats av säkerhetsskäl.</p>
				<a href="/chat" class="btn btn-primary">Starta ny session</a>
			</div>
		{:else}
			<div class="chat-input-inner">
				<textarea
					class="chat-input"
					bind:value={message}
					onkeydown={handleKeydown}
					placeholder="Skriv något..."
					rows="1"
				></textarea>
				<button
					class="btn btn-primary chat-send"
					onclick={handleSend}
					disabled={!canSend}
					aria-label="Skicka meddelande"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="22" y1="2" x2="11" y2="13" />
						<polygon points="22 2 15 22 11 13 2 9 22 2" />
					</svg>
				</button>
			</div>
		{/if}
		<div class="chat-input-footer">
			<p class="chat-disclaimer">AI kan göra misstag. Dubbelkolla viktig information.</p>
			<div class="voice-picker">
				<button
					class="voice-trigger"
					onclick={(e) => { e.stopPropagation(); voiceMenuOpen = !voiceMenuOpen; }}
					aria-expanded={voiceMenuOpen}
					aria-haspopup="listbox"
				>
					<img class="voice-trigger-icon" src={selectedVoiceData.icon} alt="" />
					<span class="voice-trigger-label">{selectedVoiceData.label}</span>
					<svg class="voice-trigger-chevron" class:open={voiceMenuOpen} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				{#if voiceMenuOpen}
					<div class="voice-menu" role="listbox" aria-label="Välj röst">
						{#each voices as voice}
							<button
								class="voice-option"
								class:selected={selectedVoice === voice.id}
								onclick={(e) => { e.stopPropagation(); selectVoice(voice.id); }}
								role="option"
								aria-selected={selectedVoice === voice.id}
							>
								<img class="voice-option-icon" src={voice.icon} alt="" />
								<div class="voice-option-text">
									<span class="voice-option-label">{voice.label}</span>
									<span class="voice-option-desc">{voice.description}</span>
								</div>
								{#if selectedVoice === voice.id}
									<svg class="voice-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if pendingVoice && pendingVoiceData}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="dialog-backdrop" onclick={cancelVoiceSwitch} role="presentation">
		<!-- svelte-ignore a11y_interactive_supports_focus a11y_click_events_have_key_events -->
		<div class="dialog" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="voice-switch-title">
			<div class="dialog-icon">
				<img src={pendingVoiceData.icon} alt="" width="32" height="32" />
			</div>
			<h2 class="dialog-title" id="voice-switch-title">Byta till {pendingVoiceData.label}?</h2>
			<p class="dialog-body">Det avslutar den pågående chatten och startar en ny session.</p>
			<div class="dialog-actions">
				<button class="btn btn-ghost" onclick={cancelVoiceSwitch}>Avbryt</button>
				<button class="btn btn-primary" onclick={confirmVoiceSwitch}>Byt röst</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.chat-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: calc(100dvh - 57px - 97px);
		padding: var(--space-2) var(--space-6);
		max-width: var(--page-width);
		margin-inline: auto;
		gap: var(--space-8);
	}

	.chat-page.has-messages {
		justify-content: flex-end;
		gap: 0;
	}

	/* --- Messages --- */
	.chat-messages {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
		max-width: var(--content-width);
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6) 0;
		scroll-behavior: smooth;
	}

	.chat-bubble {
		max-width: 80%;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		line-height: var(--leading-normal);
		font-size: var(--text-base);
	}

	.chat-bubble.user {
		align-self: flex-end;
		background-color: var(--color-interactive);
		color: var(--color-text-on-accent);
		border-bottom-right-radius: var(--radius-sm);
	}

	.chat-bubble.assistant {
		align-self: flex-start;
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		border-bottom-left-radius: var(--radius-sm);
	}

	.chat-bubble-text {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.typing-indicator {
		display: flex;
		gap: 4px;
		padding: var(--space-1) 0;
	}

	.typing-indicator span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--color-text-muted);
		animation: typing 1.2s ease-in-out infinite;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: 0.15s;
	}

	.typing-indicator span:nth-child(3) {
		animation-delay: 0.3s;
	}

	@keyframes typing {
		0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
		30% { opacity: 1; transform: translateY(-4px); }
	}

	.chat-welcome {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.chat-greeting {
		font-size: clamp(var(--text-2xl), 5vw, var(--text-3xl));
		margin-bottom: var(--space-4);
	}

	.chat-lead {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-width: min(520px, 100%);
		margin-bottom: var(--space-5);
		line-height: var(--leading-relaxed);
	}

	.starter-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-3);
		max-width: min(680px, 100%);
		width: 100%;
	}

	.starter-icon {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.starter-card {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);
	}

	.starter-card:hover {
		border-color: var(--color-interactive);
		box-shadow: inset 0 0 0 1px var(--color-interactive);
		color: var(--color-text);
		background-color: var(--accent-subtle);
	}

	/* --- Input footer --- */
	.chat-input-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--space-2);
	}

	.chat-disclaimer {
		font-size: var(--text-xs);
		color: var(--color-text-faint);
		line-height: 1;
	}

	/* --- Voice picker --- */
	.voice-picker {
		position: relative;
	}

	.voice-trigger {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		background-color: transparent;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.voice-trigger:hover {
		color: var(--color-text);
		background-color: var(--color-surface);
	}

	.voice-trigger-icon {
		width: 20px;
		height: 20px;
	}

	.voice-trigger-label {
		line-height: 1;
	}

	.voice-trigger-chevron {
		transition: transform var(--transition-fast);
	}

	.voice-trigger-chevron.open {
		transform: rotate(180deg);
	}

	.voice-menu {
		position: absolute;
		bottom: calc(100% + var(--space-2));
		right: 0;
		width: min(280px, calc(100vw - var(--space-8)));
		max-height: 420px;
		overflow-y: auto;
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		padding: var(--space-2);
		z-index: 50;
	}

	.voice-option {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		color: var(--color-text);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.voice-option:hover {
		background-color: var(--color-surface);
	}

	.voice-option.selected {
		background-color: var(--accent-subtle);
	}

	.voice-option-icon {
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.voice-option-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
		min-width: 0;
	}

	.voice-option-label {
		font-weight: var(--weight-medium);
		line-height: 1.2;
	}

	.voice-option-desc {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		line-height: 1.2;
	}

	.voice-check {
		flex-shrink: 0;
		color: var(--color-interactive);
	}

	/* --- Input bar --- */
	.chat-input-bar {
		width: 100%;
		max-width: var(--content-width);
	}

	.chat-input-inner {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition: border-color var(--transition-fast);
	}

	.chat-input-inner:focus-within {
		border-color: var(--color-interactive);
		box-shadow: 0 0 0 3px var(--color-focus-ring);
	}

	.chat-input {
		flex: 1;
		resize: none;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-base);
		font-family: var(--font-body);
		line-height: var(--leading-normal);
		color: var(--color-text);
		background: transparent;
		border: none;
	}

	.chat-input::placeholder {
		color: var(--color-text-faint);
	}

	.chat-input:focus {
		outline: none;
	}

	.chat-send {
		padding: var(--space-3);
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	/* --- Wrap-up banner --- */
	.wrapup-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		width: 100%;
		max-width: var(--content-width);
		padding: var(--space-3) var(--space-4);
		background-color: var(--accent-subtle);
		border: 1px solid var(--color-interactive);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-3);
	}

	.wrapup-text {
		font-size: var(--text-sm);
		color: var(--color-text);
		margin: 0;
	}

	.wrapup-actions {
		flex-shrink: 0;
	}

	/* --- Wrap-up format picker --- */
	.wrapup-picker {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 100%;
		max-width: var(--content-width);
		padding: var(--space-4);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-3);
	}

	.wrapup-picker-label {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		margin: 0;
	}

	.wrapup-formats {
		display: flex;
		gap: var(--space-2);
	}

	.wrapup-format-btn {
		padding: var(--space-2) var(--space-4);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: border-color var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);
	}

	.wrapup-format-btn:hover {
		border-color: var(--color-interactive);
		color: var(--color-text);
	}

	.wrapup-format-btn.selected {
		border-color: var(--color-interactive);
		background-color: var(--accent-subtle);
		color: var(--color-text);
	}

	.wrapup-confirm {
		display: flex;
		gap: var(--space-3);
	}

	/* --- Takeaway card --- */
	.takeaway-card {
		width: 100%;
		max-width: var(--content-width);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-interactive);
		border-radius: var(--radius-lg);
		overflow: hidden;
		margin-bottom: var(--space-3);
	}

	.takeaway-header {
		padding: var(--space-3) var(--space-4);
		background-color: var(--accent-subtle);
		border-bottom: 1px solid var(--color-border);
	}

	.takeaway-title {
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		margin: 0;
	}

	.takeaway-content {
		padding: var(--space-4);
	}

	.takeaway-text {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		line-height: var(--leading-relaxed);
		font-size: var(--text-base);
	}

	.takeaway-actions {
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border);
		display: flex;
		gap: var(--space-3);
	}

	/* --- Session locked --- */
	.session-locked {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		padding: var(--space-4);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.session-locked-text {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
	}

	/* --- Voice switch dialog --- */
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		animation: fade-in 150ms ease-out;
	}

	.dialog {
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 360px;
		width: calc(100% - var(--space-8));
		text-align: center;
		box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.2));
		animation: dialog-in 200ms ease-out;
	}

	.dialog-icon {
		margin-bottom: var(--space-3);
	}

	.dialog-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		margin: 0 0 var(--space-2);
	}

	.dialog-body {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-5);
		line-height: var(--leading-relaxed);
	}

	.dialog-actions {
		display: flex;
		gap: var(--space-3);
		justify-content: center;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes dialog-in {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	/* --- Responsive --- */
	@media (max-width: 768px) {
		.chat-page {
			padding: var(--space-4);
		}

		.starter-grid {
			grid-template-columns: 1fr;
		}

		.chat-bubble {
			max-width: 90%;
		}
	}

	@media (max-width: 480px) {
		.chat-page {
			padding: var(--space-3);
			gap: var(--space-6);
		}

		.chat-greeting {
			font-size: var(--text-2xl);
		}

		.chat-lead {
			font-size: var(--text-base);
		}

		.starter-card {
			padding: var(--space-3) var(--space-4);
		}

		.chat-input-footer {
			flex-direction: column-reverse;
			align-items: stretch;
			gap: var(--space-2);
		}

		.chat-disclaimer {
			text-align: center;
		}

		.wrapup-banner {
			flex-direction: column;
			text-align: center;
		}

		.wrapup-formats {
			flex-wrap: wrap;
		}
	}

	@media (orientation: landscape) and (max-height: 500px) {
		.chat-page {
			height: auto;
			min-height: calc(100dvh - 57px - 97px);
		}

		.chat-welcome {
			padding: var(--space-4) 0;
		}

		.chat-greeting {
			font-size: var(--text-xl);
			margin-bottom: var(--space-2);
		}

		.chat-lead {
			font-size: var(--text-sm);
			margin-bottom: var(--space-3);
		}

		.starter-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-2);
		}

		.starter-card {
			padding: var(--space-2) var(--space-3);
			font-size: var(--text-xs);
		}
	}
</style>
