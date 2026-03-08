<section class="hero">
  <div class="container-narrow hero-inner">
    <h1 class="hero-title">Från tankekaos<br />till klarhet</h1>
    <p class="hero-subtitle">
      Sortify guidar dig genom en kort reflektion med AI — och ger dig 
      en sammanfattning du faktiskt vill spara.
    </p>
    <div class="hero-actions">
      <a href="/chat" class="btn btn-primary btn-lg">Kom igång</a>
      <button class="btn btn-ghost btn-lg">Läs mer</button>
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
        <p>Mild, jordad eller coach — du bestämmer tonen för samtalet.</p>
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
    <h2 class="section-title">Tre röster, en process</h2>

    <div class="voice-grid">
      <div class="card">
        <div class="card-inner">
          <span class="voice-icon">🌿</span>
          <h3>Mild</h3>
          <p>Lugn och varm. Lyssnar utan att döma, ställer mjuka frågor och speglar det du säger.</p>
        </div>
      </div>
      <div class="card">
        <div class="card-inner">
          <span class="voice-icon">🪨</span>
          <h3>Jordad</h3>
          <p>Rak och stabil. Hjälper dig hitta kärnan i det du känner utan att linda in det.</p>
        </div>
      </div>
      <div class="card">
        <div class="card-inner">
          <span class="voice-icon">⚡</span>
          <h3>Coach</h3>
          <p>Framåtlutad och energisk. Fokus på vad du kan göra härnäst, inte bara vad du känner.</p>
        </div>
      </div>
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
    </div>
  </div>
</section>

<section class="cta">
  <div class="container-narrow cta-inner">
    <h2>Redo att sortera tankarna?</h2>
    <a href="/chat" class="btn btn-primary btn-lg">Starta din första session</a>
  </div>
</section>

<footer class="site-footer">
  <div class="container-narrow">
    <div class="footer-content">
      <p>Sortify är inte terapi, rådgivning eller krisinsats.</p>
      <p>
        Behöver du prata med någon? 
        <a href="https://mind.se" target="_blank" rel="noopener">Mind självmordslinjen</a> · 
        <a href="tel:90101">90101</a>
      </p>
    </div>
  </div>
</footer>

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
    max-width: 520px;
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
    max-width: 300px;
  }

  /* --- Voices --- */
  .voice-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .card-inner h3 {
    margin-bottom: 0;
  }

  .voice-icon {
    font-size: var(--text-2xl);
  }

  .voices .card p {
    color: var(--color-text-muted);
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

  /* --- Footer --- */
  .site-footer {
    padding: var(--space-10) var(--space-6);
    border-top: 1px solid var(--color-border);
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    text-align: center;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .footer-content a {
    color: var(--color-interactive);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .footer-content a:hover {
    color: var(--color-interactive-hover);
  }

  /* --- Responsive --- */
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

    .steps-grid,
    .voice-grid {
      grid-template-columns: 1fr;
      gap: var(--space-8);
    }

    .section-title {
      margin-bottom: var(--space-8);
    }
  }
</style>
