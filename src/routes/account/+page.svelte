<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	type Tab = 'profile' | 'history' | 'account';

	let activeTab = $state<Tab>('profile');

	/* --- Profile state --- */
	let avatarUrl = $state('');
	let avatarFile = $state<File | null>(null);
	let avatarPreview = $state('');
	let displayName = $state('');
	let birthDay = $state('');
	let birthMonth = $state('');
	let birthYear = $state('');
	let gender = $state('');
	let aboutMe = $state('');
	let profileLoading = $state(false);
	let profileMessage = $state('');
	let profileError = $state('');

	/* --- Account state --- */
	let email = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let accountLoading = $state(false);
	let accountMessage = $state('');
	let accountError = $state('');

	/* --- Session history state --- */
	// TODO: Replace with real data from Supabase sessions table
	interface Session {
		id: string;
		title: string;
		voice: 'gentle' | 'grounded' | 'coach';
		status: 'completed' | 'abandoned';
		turnCount: number;
		startedAt: string;
		hasTakeaway: boolean;
	}

	let sessions = $state<Session[]>([]);
	let historyLoading = $state(false);

	// Placeholder data — remove when wiring up real sessions
	const placeholderSessions: Session[] = [
		{
			id: '1',
			title: 'Stress inför deadline',
			voice: 'gentle',
			status: 'completed',
			turnCount: 8,
			startedAt: '2026-03-06T21:15:00',
			hasTakeaway: true
		},
		{
			id: '2',
			title: 'Relation med en vän',
			voice: 'grounded',
			status: 'completed',
			turnCount: 12,
			startedAt: '2026-03-04T14:30:00',
			hasTakeaway: true
		},
		{
			id: '3',
			title: 'Osäkerhet kring jobb',
			voice: 'coach',
			status: 'completed',
			turnCount: 6,
			startedAt: '2026-03-01T09:45:00',
			hasTakeaway: false
		},
		{
			id: '4',
			title: 'Session utan titel',
			voice: 'gentle',
			status: 'abandoned',
			turnCount: 2,
			startedAt: '2026-02-27T22:00:00',
			hasTakeaway: false
		}
	];

	const voiceLabels: Record<string, string> = {
		gentle: 'Mild',
		grounded: 'Jordad',
		coach: 'Coach'
	};

	const voiceEmojis: Record<string, string> = {
		gentle: '🌿',
		grounded: '🪨',
		coach: '⚡'
	};

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
	}

	// TODO: Replace with real data fetching
	async function loadSessions() {
		historyLoading = true;
		// const { data, error } = await supabase
		//   .from('sessions')
		//   .select('id, title, voice, status, turn_count, started_at, takeaways(id)')
		//   .eq('user_id', userId)
		//   .order('started_at', { ascending: false });
		//
		// if (data) {
		//   sessions = data.map(s => ({
		//     id: s.id,
		//     title: s.title || 'Session utan titel',
		//     voice: s.voice,
		//     status: s.status,
		//     turnCount: s.turn_count,
		//     startedAt: s.started_at,
		//     hasTakeaway: s.takeaways?.length > 0
		//   }));
		// }
		sessions = placeholderSessions;
		historyLoading = false;
	}

	/* --- Computed stats --- */
	let totalSessions = $derived(sessions.length);
	let completedSessions = $derived(sessions.filter(s => s.status === 'completed').length);
	let totalTurns = $derived(sessions.reduce((sum, s) => sum + s.turnCount, 0));
	let favoriteVoice = $derived(() => {
		if (sessions.length === 0) return null;
		const counts: Record<string, number> = {};
		for (const s of sessions) {
			counts[s.voice] = (counts[s.voice] || 0) + 1;
		}
		return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
	});

	/* --- Data --- */
	const months = [
		{ value: '01', label: 'Januari' },
		{ value: '02', label: 'Februari' },
		{ value: '03', label: 'Mars' },
		{ value: '04', label: 'April' },
		{ value: '05', label: 'Maj' },
		{ value: '06', label: 'Juni' },
		{ value: '07', label: 'Juli' },
		{ value: '08', label: 'Augusti' },
		{ value: '09', label: 'September' },
		{ value: '10', label: 'Oktober' },
		{ value: '11', label: 'November' },
		{ value: '12', label: 'December' }
	];

	const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

	const genderOptions = [
		{ value: '', label: 'Välj...' },
		{ value: 'woman', label: 'Kvinna' },
		{ value: 'man', label: 'Man' },
		{ value: 'nonbinary', label: 'Icke-binär' },
		{ value: 'other', label: 'Annat' },
		{ value: 'prefer_not', label: 'Vill inte ange' }
	];

	/* --- Load user data --- */
	if (browser) {
		supabase.auth.getUser().then(({ data }) => {
			if (!data.user) {
				goto('/login');
				return;
			}
			email = data.user.email ?? '';

			const meta = data.user.user_metadata ?? {};
			displayName = meta.display_name ?? '';
			gender = meta.gender ?? '';
			aboutMe = meta.about_me ?? '';
			avatarUrl = meta.avatar_url ?? '';

			if (meta.birthday) {
				const parts = (meta.birthday as string).split('-');
				if (parts.length === 3) {
					birthYear = parts[0];
					birthMonth = parts[1];
					birthDay = parts[2];
				}
			}
		});

		loadSessions();
	}

	/* --- Avatar handling --- */
	let fileInput: HTMLInputElement;

	function handleAvatarClick() {
		fileInput?.click();
	}

	function handleAvatarChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		avatarFile = file;
		const reader = new FileReader();
		reader.onload = () => {
			avatarPreview = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	/* --- Save profile --- */
	async function saveProfile(e: Event) {
		e.preventDefault();
		profileLoading = true;
		profileMessage = '';
		profileError = '';

		try {
			let newAvatarUrl = avatarUrl;

			if (avatarFile) {
				const { data: userData } = await supabase.auth.getUser();
				const userId = userData.user?.id;
				if (!userId) throw new Error('Inte inloggad');

				const fileExt = avatarFile.name.split('.').pop();
				const filePath = `${userId}/avatar.${fileExt}`;

				const { error: uploadErr } = await supabase.storage
					.from('avatars')
					.upload(filePath, avatarFile, { upsert: true });

				if (uploadErr) throw uploadErr;

				const { data: urlData } = supabase.storage
					.from('avatars')
					.getPublicUrl(filePath);

				newAvatarUrl = urlData.publicUrl;
			}

			const birthday =
				birthYear && birthMonth && birthDay
					? `${birthYear}-${birthMonth}-${birthDay}`
					: '';

			const { error: updateErr } = await supabase.auth.updateUser({
				data: {
					display_name: displayName,
					birthday,
					gender,
					about_me: aboutMe,
					avatar_url: newAvatarUrl
				}
			});

			if (updateErr) throw updateErr;

			avatarUrl = newAvatarUrl;
			avatarFile = null;
			profileMessage = 'Profilen har sparats.';
		} catch (err: any) {
			profileError = err.message || 'Något gick fel.';
		}

		profileLoading = false;
	}

	/* --- Change password --- */
	async function changePassword(e: Event) {
		e.preventDefault();
		accountLoading = true;
		accountMessage = '';
		accountError = '';

		if (newPassword !== confirmPassword) {
			accountError = 'Lösenorden matchar inte.';
			accountLoading = false;
			return;
		}

		if (newPassword.length < 8) {
			accountError = 'Lösenordet måste vara minst 8 tecken.';
			accountLoading = false;
			return;
		}

		try {
			const { error: err } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (err) throw err;

			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
			accountMessage = 'Lösenordet har ändrats.';
		} catch (err: any) {
			accountError = err.message || 'Något gick fel.';
		}

		accountLoading = false;
	}
</script>

<svelte:head>
	<title>Konto — Sortify</title>
</svelte:head>

<div class="account-page">
	<div class="account-container">
		<h1>{displayName ? `${displayName}s konto` : 'Mitt konto'}</h1>

		<!-- Tabs -->
		<div class="tabs">
			<button
				class="tab"
				class:active={activeTab === 'profile'}
				onclick={() => activeTab = 'profile'}
			>Min profil</button>
			<button
				class="tab"
				class:active={activeTab === 'history'}
				onclick={() => activeTab = 'history'}
			>Sessionshistorik</button>
			<button
				class="tab"
				class:active={activeTab === 'account'}
				onclick={() => activeTab = 'account'}
			>Inställningar</button>
		</div>

		<!-- Profile tab -->
		{#if activeTab === 'profile'}
			<form class="tab-content" onsubmit={saveProfile}>
				{#if profileError}
					<p class="feedback feedback-error">{profileError}</p>
				{/if}
				{#if profileMessage}
					<p class="feedback feedback-success">{profileMessage}</p>
				{/if}

				<!-- Avatar -->
				<div class="avatar-section">
					<button type="button" class="avatar-circle" onclick={handleAvatarClick}>
						{#if avatarPreview || avatarUrl}
							<img
								src={avatarPreview || avatarUrl}
								alt="Profilbild"
								class="avatar-img"
							/>
						{:else}
							<svg class="avatar-placeholder" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
								<circle cx="12" cy="7" r="4"/>
							</svg>
						{/if}
						<span class="avatar-overlay">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
								<circle cx="12" cy="13" r="4"/>
							</svg>
						</span>
					</button>
					<input
						bind:this={fileInput}
						type="file"
						accept="image/*"
						class="sr-only"
						onchange={handleAvatarChange}
					/>
					<p class="avatar-label">Profilbild</p>
				</div>

				<!-- Display name -->
				<div class="field">
					<label class="field-label" for="displayName">Visningsnamn</label>
					<input
						class="input"
						id="displayName"
						type="text"
						placeholder="Ditt namn"
						bind:value={displayName}
						autocomplete="name"
					/>
				</div>

				<!-- Birthday -->
				<fieldset class="field">
					<legend class="field-label">Födelsedag</legend>
					<div class="birthday-row">
						<div class="select-wrapper birthday-day">
							<select class="select" bind:value={birthDay} aria-label="Dag">
								<option value="">Dag</option>
								{#each days as d}
									<option value={d}>{parseInt(d)}</option>
								{/each}
							</select>
						</div>
						<div class="select-wrapper birthday-month">
							<select class="select" bind:value={birthMonth} aria-label="Månad">
								<option value="">Månad</option>
								{#each months as m}
									<option value={m.value}>{m.label}</option>
								{/each}
							</select>
						</div>
						<div class="select-wrapper birthday-year">
							<select class="select" bind:value={birthYear} aria-label="År">
								<option value="">År</option>
								{#each years as y}
									<option value={y}>{y}</option>
								{/each}
							</select>
						</div>
					</div>
				</fieldset>

				<!-- Gender -->
				<div class="field">
					<label class="field-label" for="gender">Kön</label>
					<div class="select-wrapper">
						<select class="select" id="gender" bind:value={gender}>
							{#each genderOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- About me -->
				<div class="field">
					<label class="field-label" for="aboutMe">Om mig</label>
					<textarea
						class="input textarea-noresize"
						id="aboutMe"
						placeholder="Berätta lite om dig själv..."
						bind:value={aboutMe}
						rows={4}
					></textarea>
				</div>

				<button class="btn btn-primary save-btn" type="submit" disabled={profileLoading}>
					{profileLoading ? 'Sparar...' : 'Spara profil'}
				</button>
			</form>
		{/if}

		<!-- Session history tab -->
		{#if activeTab === 'history'}
			<div class="tab-content">
				<!-- Stats overview -->
				<div class="stats-row">
					<div class="stat-card">
						<span class="stat-value">{totalSessions}</span>
						<span class="stat-label">Sessioner</span>
					</div>
					<div class="stat-card">
						<span class="stat-value">{completedSessions}</span>
						<span class="stat-label">Avslutade</span>
					</div>
					<div class="stat-card">
						<span class="stat-value">{totalTurns}</span>
						<span class="stat-label">Meddelanden</span>
					</div>
					<div class="stat-card">
						{#if favoriteVoice()}
							<span class="stat-value">{voiceEmojis[favoriteVoice()!]}</span>
							<span class="stat-label">{voiceLabels[favoriteVoice()!]}</span>
						{:else}
							<span class="stat-value">—</span>
							<span class="stat-label">Favoritröst</span>
						{/if}
					</div>
				</div>

				<!-- Session list -->
				{#if historyLoading}
					<div class="history-empty">
						<p class="text-muted">Laddar sessioner...</p>
					</div>
				{:else if sessions.length === 0}
					<div class="history-empty">
						<p class="history-empty-title">Inga sessioner ännu</p>
						<p class="text-muted">När du har haft din första reflektion dyker den upp här.</p>
					</div>
				{:else}
					<div class="session-list">
						{#each sessions as session (session.id)}
							<a href="/sessions/{session.id}" class="session-card card card-interactive">
								<div class="session-card-top">
									<span class="session-voice" title={voiceLabels[session.voice]}>{voiceEmojis[session.voice]}</span>
									<div class="session-info">
										<span class="session-title">{session.title}</span>
										<span class="session-meta">
											{formatDate(session.startedAt)} · {formatTime(session.startedAt)} · {session.turnCount} meddelanden
										</span>
									</div>
									{#if session.status === 'abandoned'}
										<span class="label label-danger">Avbruten</span>
									{:else if session.hasTakeaway}
										<span class="label label-accent">Insikt sparad</span>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Account tab -->
		{#if activeTab === 'account'}
			<div class="tab-content">
				{#if accountError}
					<p class="feedback feedback-error">{accountError}</p>
				{/if}
				{#if accountMessage}
					<p class="feedback feedback-success">{accountMessage}</p>
				{/if}

				<!-- Email (read-only) -->
				<div class="field">
					<label class="field-label" for="email">E-postadress</label>
					<input
						class="input input-disabled"
						id="email"
						type="email"
						value={email}
						disabled
					/>
					<p class="field-hint">Kontakta oss om du behöver ändra din e-postadress.</p>
				</div>

				<!-- Change password -->
				<div class="password-section">
					<h3>Ändra lösenord</h3>

					<form class="password-form" onsubmit={changePassword}>
						<div class="field">
							<label class="field-label" for="newPassword">Nytt lösenord</label>
							<input
								class="input"
								id="newPassword"
								type="password"
								placeholder="Minst 8 tecken"
								bind:value={newPassword}
								required
								minlength={8}
								autocomplete="new-password"
							/>
						</div>

						<div class="field">
							<label class="field-label" for="confirmPassword">Bekräfta nytt lösenord</label>
							<input
								class="input"
								id="confirmPassword"
								type="password"
								placeholder="Upprepa lösenordet"
								bind:value={confirmPassword}
								required
								minlength={8}
								autocomplete="new-password"
							/>
						</div>

						<button class="btn btn-primary save-btn" type="submit" disabled={accountLoading}>
							{accountLoading ? 'Sparar...' : 'Byt lösenord'}
						</button>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.account-page {
		display: flex;
		justify-content: center;
		padding: var(--space-10) var(--space-6) var(--space-16);
		min-height: calc(100dvh - 80px);
	}

	.account-container {
		width: 100%;
		max-width: 640px;
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.account-container h1 {
		margin-bottom: 0;
	}

	/* --- Tabs --- */
	.tabs {
		display: flex;
		border-bottom: 1px solid var(--color-border);
		gap: var(--space-1);
	}

	.tab {
		padding: var(--space-3) var(--space-5);
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		transition: color var(--transition-fast), border-color var(--transition-fast);
	}

	.tab:hover {
		color: var(--color-text);
	}

	.tab.active {
		color: var(--color-text);
		border-bottom-color: var(--color-interactive);
	}

	/* --- Tab content --- */
	.tab-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	/* --- Avatar --- */
	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.avatar-circle {
		position: relative;
		width: 128px;
		height: 128px;
		border-radius: var(--radius-full);
		border: 2px dashed var(--color-border-strong);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.avatar-circle:hover {
		border-color: var(--color-interactive);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		color: var(--color-text-faint);
	}

	.avatar-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: hsla(0, 0%, 0%, 0.45);
		color: white;
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.avatar-circle:hover .avatar-overlay {
		opacity: 1;
	}

	.avatar-label {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	/* --- Fields --- */
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		border: none;
		padding: 0;
	}

	.field-label {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--color-text-muted);
	}

	.field-hint {
		font-size: var(--text-xs);
		color: var(--color-text-faint);
	}

	/* --- Textarea no-resize --- */
	.textarea-noresize {
		resize: none;
	}

	/* --- Select --- */
	.select-wrapper {
		position: relative;
	}

	.select-wrapper::after {
		content: '';
		position: absolute;
		right: var(--space-4);
		top: 50%;
		transform: translateY(-50%);
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 5px solid var(--color-text-faint);
		pointer-events: none;
	}

	.select {
		width: 100%;
		padding: var(--space-3) var(--space-8) var(--space-3) var(--space-4);
		font-size: var(--text-base);
		line-height: var(--leading-normal);
		color: var(--color-text);
		background-color: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		appearance: none;
		-webkit-appearance: none;
		transition: border-color var(--transition-fast);
	}

	.select:hover {
		border-color: var(--color-border-strong);
	}

	.select:focus {
		outline: none;
		border-color: var(--color-interactive);
		box-shadow: 0 0 0 3px var(--color-focus-ring);
	}

	/* --- Birthday row --- */
	.birthday-row {
		display: flex;
		gap: var(--space-3);
	}

	.birthday-day {
		flex: 2;
	}

	.birthday-month {
		flex: 4;
	}

	.birthday-year {
		flex: 3;
	}

	/* --- Disabled input --- */
	.input-disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: var(--color-surface);
	}

	/* --- Password section --- */
	.password-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border);
	}

	.password-section h3 {
		margin-bottom: 0;
	}

	.password-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	/* --- Save button --- */
	.save-btn {
		align-self: flex-start;
		margin-top: var(--space-2);
	}

	/* --- Feedback messages --- */
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

	.feedback-success {
		background-color: hsl(140 60% 95%);
		color: hsl(140 50% 30%);
	}

	:global([data-theme='dark']) .feedback-success {
		background-color: hsl(140 30% 15%);
		color: hsl(140 60% 70%);
	}

	/* --- Stats row --- */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-4);
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-5) var(--space-3);
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.stat-value {
		font-size: var(--text-2xl);
		font-weight: var(--weight-bold);
		line-height: 1;
		color: var(--color-text);
	}

	.stat-label {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
		text-align: center;
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

	.session-voice {
		font-size: var(--text-xl);
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

	/* --- Empty state --- */
	.history-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-16) var(--space-6);
		text-align: center;
	}

	.history-empty-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-medium);
		color: var(--color-text);
	}

	/* --- Responsive --- */
	@media (max-width: 768px) {
		.account-page {
			padding: var(--space-8) var(--space-4) var(--space-12);
		}

		.birthday-row {
			flex-direction: column;
		}

		.birthday-day,
		.birthday-month,
		.birthday-year {
			flex: 1;
		}

		.tabs {
			gap: 0;
		}

		.tab {
			flex: 1;
			text-align: center;
			padding: var(--space-3) var(--space-3);
			font-size: var(--text-sm);
		}

		.stats-row {
			grid-template-columns: repeat(2, 1fr);
		}

		.session-card {
			padding: var(--space-4);
		}

		.session-card-top {
			gap: var(--space-3);
		}
	}
</style>
