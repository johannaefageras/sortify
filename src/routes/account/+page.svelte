<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{ data: PageData; form: ActionData }>();
	let avatarInput: HTMLInputElement | null = null;
	let avatarPreviewUrl = $state<string | null>(null);
	const resolvedDisplayName = $derived.by(() => {
		const rawDisplayName =
			form?.mode === 'profile' &&
			form &&
			'displayName' in form &&
			typeof form.displayName === 'string'
				? form.displayName
				: data.profile.displayName;

		return rawDisplayName.trim();
	});

	function openAvatarPicker() {
		avatarInput?.click();
	}

	function handleAvatarChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (avatarPreviewUrl) {
			URL.revokeObjectURL(avatarPreviewUrl);
		}

		avatarPreviewUrl = URL.createObjectURL(file);
	}

	onDestroy(() => {
		if (avatarPreviewUrl) {
			URL.revokeObjectURL(avatarPreviewUrl);
		}
	});
</script>

<main class="account-page">
	<section class="account-card">
		<form method="POST" action="?/profile" enctype="multipart/form-data">
			<div class="profile-header">
				<input
					id="avatar"
					name="avatar"
					type="file"
					accept="image/png,image/jpeg,image/webp,image/gif"
					class="avatar-file-input"
					bind:this={avatarInput}
					onchange={handleAvatarChange}
				/>
				<button
					type="button"
					class="avatar-btn"
					onclick={openAvatarPicker}
				>
					{#if avatarPreviewUrl ?? data.profile.avatarUrl}
						<img
							src={avatarPreviewUrl ?? data.profile.avatarUrl}
							alt="Profilbild"
							class="avatar-img"
						/>
					{:else}
						<span class="avatar-placeholder">Lägg till foto</span>
					{/if}
					<span class="avatar-overlay">Ändra</span>
				</button>
				<div>
					{#if resolvedDisplayName}
						<h1 class="profile-name">{resolvedDisplayName}s profil</h1>
					{:else}
						<h1 class="profile-name">Min profil</h1>
					{/if}
					<p class="profile-hint">Hantera din avatar, profiluppgifter och lösenord.</p>
				</div>
			</div>

		{#if data.loadError}
			<p class="account-warning">{data.loadError}</p>
		{/if}

		{#if form?.success}
			{#if form.mode === 'profile'}
				<div class="account-success">
					<p>Profilen har uppdaterats.</p>
				</div>
			{:else if form.mode === 'password'}
				<div class="account-success">
					<p>Lösenordet har ändrats.</p>
				</div>
			{/if}
		{/if}

		{#if form?.error}
			<p class="account-warning">{form.error}</p>
		{/if}

			<div class="profile-fields">
				<div class="field">
					<label class="ui-label" for="displayName">Visningsnamn</label>
					<input
						id="displayName"
						name="displayName"
						type="text"
						maxlength="80"
						placeholder="Hur ditt namn visas i Sortify"
						value={form?.mode === 'profile' ? form?.displayName ?? '' : data.profile.displayName}
						class="field-input"
					/>
				</div>

				<div class="field">
					<label class="ui-label" for="email">E-postadress</label>
					<textarea
						id="email"
						rows="1"
						readonly
						class="field-input field-readonly"
					>{data.email}</textarea>
				</div>

				<div class="field">
					<label class="ui-label" for="aboutMe">Om mig</label>
					<textarea
						id="aboutMe"
						name="aboutMe"
						rows="5"
						maxlength="800"
						placeholder="Berätta lite om dig själv."
						class="field-input field-textarea"
					>{form?.mode === 'profile' ? form?.aboutMe ?? '' : data.profile.aboutMe}</textarea>
				</div>
			</div>

			<button type="submit" class="btn btn-primary profile-save">Spara profil</button>
		</form>

		<section class="security-section">
			<p class="ui-label">Säkerhet</p>
			<h2 class="security-title">Byt lösenord</h2>
			<p class="security-hint">Ange ett nytt lösenord för det här kontot.</p>

			<form method="POST" action="?/password" class="password-form">
				<div class="field">
					<label class="ui-label" for="newPassword">Nytt lösenord</label>
					<input
						id="newPassword"
						name="newPassword"
						type="password"
						required
						minlength="8"
						maxlength="128"
						autocomplete="new-password"
						class="field-input"
					/>
				</div>
				<div class="field">
					<label class="ui-label" for="confirmPassword">Bekräfta nytt lösenord</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						minlength="8"
						maxlength="128"
						autocomplete="new-password"
						class="field-input"
					/>
				</div>
				<button type="submit" class="btn btn-secondary">Uppdatera lösenord</button>
			</form>
		</section>
	</section>
</main>

<style>
	.account-page {
		max-width: 640px;
		margin: 0 auto;
	}

	.account-card {
		padding: 1.5rem;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 1.25rem;
	}

	.avatar-file-input {
		display: none;
	}

	.avatar-btn {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 5rem;
		height: 5rem;
		flex-shrink: 0;
		overflow: hidden;
		border-radius: 50%;
		border: 1px solid var(--color-border-strong);
		background: var(--color-neutral);
		cursor: pointer;
		transition: transform 0.15s ease;
	}

	.avatar-btn:hover {
		transform: scale(1.02);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.avatar-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-xs);
		color: #fff;
		background: rgb(0 0 0 / 0.35);
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.avatar-btn:hover .avatar-overlay {
		opacity: 1;
	}

	.profile-name {
		font-size: var(--text-2xl);
		font-weight: var(--weight-medium);
		font-stretch: 105%;
		letter-spacing: var(--tracking-tight);
		color: var(--color-text);
	}

	.profile-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0.25rem 0 0 0;
	}

	.account-warning {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid #fecdd3;
		background: var(--color-danger-soft);
		color: var(--color-danger);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.account-success {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: #f7fcfe;
	}

	.account-success p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.profile-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		font-family: var(--font-primary);
		font-size: var(--text-base);
		font-weight: var(--weight-regular);
		color: var(--color-text);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.field-input::placeholder {
		color: #7c959d;
		font-weight: var(--weight-light);
	}

	.field-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px rgb(14 116 144 / 0.1);
	}

	.field-readonly {
		resize: none;
		color: var(--color-text-muted);
		background: var(--color-neutral);
		font-size: var(--text-sm);
	}

	.field-textarea {
		resize: none;
	}

	.profile-save {
		margin-top: 1.5rem;
	}

	.security-section {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-border);
	}

	.security-title {
		font-size: var(--text-xl);
		font-weight: var(--weight-medium);
		color: var(--color-text);
		margin-top: 0.25rem;
	}

	.security-hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0.5rem 0 0 0;
	}

	.password-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}
</style>
