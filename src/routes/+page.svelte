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

  const voices = [
    { id: 'classic', label: 'Klassisk', desc: 'Balanserad och empatisk', icon: iconScale },
    { id: 'friendly', label: 'Vänlig', desc: 'Mjuk, varm och tålmodig', icon: iconTeddyBear },
    { id: 'friend', label: 'Kompis', desc: 'Avslappnad och jordnära', icon: iconBeerMugs },
    { id: 'mentor', label: 'Mentor', desc: 'Lugn, erfaren och vis', icon: iconOwl },
    { id: 'lifecoach', label: 'Livscoach', desc: 'Energisk och framåtblickande', icon: iconWomanMeditating },
    { id: 'philosophical', label: 'Filosofisk', desc: 'Nyfiken och perspektivvidgande', icon: iconFaceThinking },
    { id: 'realistic', label: 'Realistisk', desc: 'Rak och osentimental', icon: iconCamera },
    { id: 'formal', label: 'Formell', desc: 'Distinguerad och exakt', icon: iconTopHat },
    { id: 'grandma', label: 'Mormor', desc: 'Jordnära och praktiskt vis', icon: iconOldWoman },
    { id: 'socratic', label: 'Sokratisk', desc: 'Nyfiken och frågande', icon: iconClassicalBuilding },
    { id: 'cynical', label: 'Cynisk', desc: 'Skarp och genomskådande', icon: iconFaceUnamused },
    { id: 'sarcastic', label: 'Sarkastisk', desc: 'Kvick och lekfullt vass', icon: iconFaceSmirking },
    { id: 'passive-aggressive', label: 'Passivt Aggressiv', desc: 'Avväpnande artig', icon: iconFaceUpsideDown },
    { id: 'chaotic', label: 'Kaotisk', desc: 'Oförutsägbar och briljant', icon: iconTornado },
    { id: 'british', label: 'Brittisk', desc: 'Stiff upper lip, dry humour', icon: iconFlagUk },
    { id: 'bureaucratic', label: 'Byråkratisk', desc: 'Absurt administrativ', icon: iconClipboard },
    { id: 'tinfoilhat', label: 'Foliehatt', desc: 'Underhållande paranoid', icon: iconFlyingSaucer },
    { id: 'ai-robot', label: 'AI-Robot', desc: 'Bokstavlig och lite glitchig', icon: iconRobot },
  ];
</script>

<section class="hero">
  <div class="container-narrow hero-inner">
    <h1 class="hero-title">Från tankekaos<br />till klarhet</h1>
    <p class="hero-subtitle">
      Sortify guidar dig genom en kort reflektion med AI — och ger dig
      en sammanfattning du faktiskt vill spara.
    </p>
    <div class="hero-actions">
      <a href="/chat" class="btn btn-primary btn-lg">Kom igång</a>
    </div>
    <p class="hero-disclaimer">
      Sortify är ett reflektionsverktyg — inte terapi eller krisinsats.
    </p>
  </div>
</section>

<section class="features">
  <div class="container">
    <h2 class="section-title">Så fungerar det</h2>

    <div class="steps-grid">
      <div class="step">
        <span class="step-number">1</span>
        <h3>Välj en röst</h3>
        <p>Över 18 röster — från empatisk mentor till sarkastisk kompis. Du bestämmer tonen.</p>
      </div>
      <div class="step">
        <span class="step-number">2</span>
        <h3>Reflektera</h3>
        <p>En kort, guidad konversation som hjälper dig sortera tankar och känslor.</p>
      </div>
      <div class="step">
        <span class="step-number">3</span>
        <h3>Få din insikt</h3>
        <p>AI:n sammanfattar det viktigaste — som ett brev, insikter eller nästa steg.</p>
      </div>
    </div>
  </div>
</section>

<section class="voices">
  <div class="container">
    <h2 class="section-title">Hitta din röst</h2>
    <p class="section-lead">Seriösa och lekfulla — välj den ton som passar dig just nu.</p>

    <div class="voice-grid">
      {#each voices as voice}
        <a href="/chat?voice={voice.id}" class="voice-card">
          <img class="voice-icon" src={voice.icon} alt="" />
          <div class="voice-text">
            <span class="voice-label">{voice.label}</span>
            <span class="voice-desc">{voice.desc}</span>
          </div>
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="what-you-get">
  <div class="container-narrow">
    <h2 class="section-title">Vad du får ut</h2>

    <div class="feature-list">
      <div class="feature-row">
        <span class="feature-label">Brev till dig själv</span>
        <p>En personlig text som sammanfattar det du kom fram till — skriven som om du skrev den till dig själv.</p>
      </div>
      <div class="feature-row">
        <span class="feature-label">Insikter</span>
        <p>De viktigaste insikterna från samtalet, samlade på ett ställe.</p>
      </div>
      <div class="feature-row">
        <span class="feature-label">Nästa steg</span>
        <p>Konkreta saker du kan göra framåt, baserat på vad du berättat.</p>
      </div>
      <div class="feature-row">
        <span class="feature-label">Bibliotek</span>
        <p>Alla dina sessioner och insikter sparas så du kan gå tillbaka och se mönster över tid.</p>
      </div>
    </div>
  </div>
</section>

<section class="cta">
  <div class="container-narrow cta-inner">
    <h2>Redo att sortera tankarna?</h2>
    <a href="/chat" class="btn btn-primary btn-lg">Starta din första session</a>
  </div>
</section>

<style>
  /* --- Hero --- */
  .hero {
    padding: var(--space-20) var(--space-6) var(--space-16);
    text-align: center;
  }

  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
  }

  .hero-title {
    font-size: clamp(var(--text-3xl), 6vw, var(--text-4xl));
    margin-bottom: 0;
  }

  .hero-subtitle {
    font-size: var(--text-lg);
    color: var(--color-text-muted);
    max-width: min(520px, 100%);
    text-align: center;
  }

  .hero-actions {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero-disclaimer {
    font-size: var(--text-sm);
    color: var(--color-text-faint);
  }

  /* --- Shared section spacing --- */
  .features,
  .voices,
  .what-you-get {
    padding: var(--space-16) var(--space-6);
  }

  .features {
    background-color: var(--color-surface);
  }

  .section-title {
    text-align: center;
    margin-bottom: var(--space-10);
  }

  /* --- Steps --- */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-10);
    text-align: center;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    background-color: var(--accent-subtle);
    color: var(--accent);
    font-weight: var(--weight-bold);
    font-size: var(--text-xl);
  }

  .step h3 {
    margin-bottom: 0;
  }

  .step p {
    color: var(--color-text-muted);
    max-width: min(300px, 100%);
  }

  .section-lead {
    text-align: center;
    color: var(--color-text-muted);
    margin-top: calc(-1 * var(--space-6));
    margin-bottom: var(--space-10);
  }

  /* --- Voices --- */
  .voice-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
  }

  .voice-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background-color var(--transition-fast), color var(--transition-fast);
  }

  .voice-card:hover {
    border-color: var(--color-interactive);
    box-shadow: inset 0 0 0 1px var(--color-interactive);
    background-color: var(--accent-subtle);
  }

  .voice-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .voice-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .voice-label {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--color-text);
    line-height: 1.2;
  }

  .voice-desc {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    line-height: 1.3;
  }

  /* --- What you get --- */
  .feature-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .feature-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-border);
  }

  .feature-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .feature-label {
    font-size: var(--text-lg);
    font-weight: var(--weight-medium);
    color: var(--accent);
  }

  .feature-row p {
    color: var(--color-text-muted);
  }

  /* --- CTA --- */
  .cta {
    padding: var(--space-16) var(--space-6);
    background-color: var(--color-surface);
  }

  .cta-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    text-align: center;
  }

  .cta h2 {
    margin-bottom: 0;
  }

  /* --- Responsive --- */
  @media (max-width: 1024px) {
    .steps-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-8);
    }
  }

  @media (max-width: 768px) {
    .hero {
      padding: var(--space-16) var(--space-4) var(--space-12);
    }

    .features,
    .voices,
    .what-you-get,
    .cta {
      padding: var(--space-12) var(--space-4);
    }

    .steps-grid {
      grid-template-columns: 1fr;
      gap: var(--space-8);
    }

    .voice-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .section-title {
      margin-bottom: var(--space-8);
    }
  }

  @media (max-width: 480px) {
    .hero {
      padding: var(--space-12) var(--space-4) var(--space-10);
    }

    .features,
    .voices,
    .what-you-get,
    .cta {
      padding: var(--space-10) var(--space-4);
    }

    .steps-grid {
      gap: var(--space-6);
    }

    .voice-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (orientation: landscape) and (max-height: 500px) {
    .hero {
      padding: var(--space-8) var(--space-4) var(--space-6);
    }

    .hero-inner {
      gap: var(--space-3);
    }

    .hero-title {
      font-size: var(--text-2xl);
    }

    .hero-subtitle {
      font-size: var(--text-base);
    }

    .features,
    .voices,
    .what-you-get,
    .cta {
      padding: var(--space-8) var(--space-4);
    }
  }
</style>
