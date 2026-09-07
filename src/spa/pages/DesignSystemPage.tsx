import './DesignSystemPage.css';

const SWATCHES = [
  { name: 'Base',    varName: '--orbi-base',      fallback: '#f5f2ec', role: 'Ground. Warm off-white — reads like aged paper. Cuts glare without dark-mode eye strain.' },
  { name: 'Surface', varName: '--orbi-surface',   fallback: '#ffffff', role: 'Cards and panels. Clean white lifts content off the base.' },
  { name: 'Surface 2', varName: '--orbi-surface-2', fallback: '#ece9e2', role: 'Inputs, chips, secondary backgrounds. One step deeper than surface.' },
  { name: 'Primary',  varName: '--orbi-primary',  fallback: '#4a6fa5', role: 'Slate Blue. Primary action. Low-saturation — the calming hue. WCAG AA ≈ 5:1.' },
  { name: 'Secondary', varName: '--orbi-secondary', fallback: '#5a8a72', role: 'Sage. Completion and done states. Muted green-teal — grounding, not excitable.' },
  { name: 'Text',    varName: '--orbi-text',      fallback: '#2a2520', role: 'Ink. Warm near-black — less harsh than #000, still WCAG AA on base and surface.' },
] as const;

export function DesignSystemPage() {
  return (
    <div className="ds-root">
      <div className="ds-wrap">

        {/* Hero */}
        <section className="ds-hero">
          <div className="ds-eyebrow">Orbi — Visual system</div>
          <h1 className="ds-hero-title">Calm.</h1>
          <p className="ds-hero-tagline">
            Designed for people whose attention is their most finite resource. Low stimulation,
            high clarity — nothing on screen competes with the one thing the app is trying to protect.
          </p>
        </section>

        {/* Live Orbi demo */}
        <div className="ds-demo" role="img" aria-label="Orbi Calm theme preview">
          <div className="ds-demo-bar">
            <span className="ds-demo-wordmark">Orbi</span>
            <span className="ds-demo-date">Tuesday, 9 September</span>
          </div>
          <div className="ds-demo-body">
            <div className="ds-demo-tasks-col">
              <div className="ds-col-label">Today's focus</div>
              <div className="ds-tasks">
                <div className="ds-task done">
                  <span className="ds-t-icon">✓</span>
                  <span className="ds-t-name">Morning walk</span>
                  <span className="ds-t-tag">30 min</span>
                </div>
                <div className="ds-task active">
                  <span className="ds-t-icon">◎</span>
                  <span className="ds-t-name">Read for 20 minutes</span>
                  <span className="ds-t-tag">In progress</span>
                </div>
                <div className="ds-task todo">
                  <span className="ds-t-icon">○</span>
                  <span className="ds-t-name">Evening journal</span>
                  <span className="ds-t-tag">Not started</span>
                </div>
              </div>
            </div>
            <div className="ds-demo-side">
              <div>
                <div className="ds-timer-lbl">Focus timer</div>
                <div className="ds-timer-val">23:47</div>
                <div className="ds-timer-task">Read for 20 minutes</div>
                <button className="ds-timer-btn" type="button" tabIndex={-1}>Pause</button>
              </div>
              <div className="ds-streak">
                <div className="ds-streak-num">7</div>
                <div className="ds-streak-lbl">Day streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter 01 — Color */}
        <section className="ds-chapter" id="ds-color">
          <span className="ds-ch-num" aria-hidden="true">01</span>
          <div className="ds-ch-label">Color system</div>
          <h2>Six tokens.<br />Nothing borrowed.</h2>

          <div className="ds-swatches">
            {SWATCHES.map(sw => (
              <div key={sw.name} className="ds-swatch">
                <div className="ds-sw-color" style={{ background: `var(${sw.varName}, ${sw.fallback})` }} />
                <div className="ds-sw-info">
                  <span className="ds-sw-name">{sw.name}</span>
                  <span className="ds-sw-hex">{sw.varName}</span>
                  <span className="ds-sw-role">{sw.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chapter 02 — Typography */}
        <section className="ds-chapter" id="ds-type">
          <span className="ds-ch-num" aria-hidden="true">02</span>
          <div className="ds-ch-label">Typography</div>
          <h2>Two faces.<br />Distinct roles.</h2>

          <div className="ds-type-rows">
            <div className="ds-type-row">
              <div className="ds-type-meta">
                <span className="ds-type-lbl">Display</span>
                <span className="ds-type-sz">4–7.5 rem</span>
                <span className="ds-type-face">DM Serif Display</span>
              </div>
              <div style={{ fontFamily: 'var(--orbi-display-family, "DM Serif Display", serif)', fontSize: 'clamp(2.6rem,7vw,4.5rem)', lineHeight: 1, color: 'var(--orbi-text)', letterSpacing: '-0.02em' }}>
                Attention is finite.
              </div>
            </div>
            <div className="ds-type-row">
              <div className="ds-type-meta">
                <span className="ds-type-lbl">Heading</span>
                <span className="ds-type-sz">1.9–2.8 rem</span>
                <span className="ds-type-face">DM Serif Display</span>
              </div>
              <div style={{ fontFamily: 'var(--orbi-display-family, "DM Serif Display", serif)', fontSize: '2rem', lineHeight: 1.15, color: 'var(--orbi-text)' }}>
                Today's focus
              </div>
            </div>
            <div className="ds-type-row">
              <div className="ds-type-meta">
                <span className="ds-type-lbl">Body</span>
                <span className="ds-type-sz">1 rem / 17 px</span>
                <span className="ds-type-face">Atkinson Hyperlegible</span>
              </div>
              <div style={{ fontSize: '1rem', lineHeight: 1.65, color: 'var(--orbi-text-muted)', maxWidth: '52ch' }}>
                Orbi is built for people whose attention slips away. Every design choice — spacing,
                color, motion — is judged against one question: does this make it easier to stay?
              </div>
            </div>
            <div className="ds-type-row">
              <div className="ds-type-meta">
                <span className="ds-type-lbl">Caption</span>
                <span className="ds-type-sz">0.7 rem</span>
                <span className="ds-type-face">Atkinson Hyperlegible</span>
              </div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--orbi-text-muted)' }}>
                30 min · completed
              </div>
            </div>
          </div>
        </section>

        {/* Chapter 03 — ADHD principles */}
        <section className="ds-chapter" id="ds-principles">
          <span className="ds-ch-num" aria-hidden="true">03</span>
          <div className="ds-ch-label">ADHD-friendly design</div>
          <h2>Principles<br />in practice.</h2>

          <div className="ds-principles">

            <div className="ds-principle">
              <div className="ds-p-n">1</div>
              <div className="ds-p-c">
                <h3>Kill unsolicited motion</h3>
                <p>
                  Any animation the user didn't trigger can sever the thread of attention mid-task.
                  One media query — applied globally — collapses every transition and animation to
                  near-zero when the OS requests it.
                </p>
                <div className="ds-p-demo">
                  <code className="ds-code-block">{`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:  0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`}</code>
                </div>
              </div>
            </div>

            <div className="ds-principle">
              <div className="ds-p-n">2</div>
              <div className="ds-p-c">
                <h3>Cap reading width at 65 characters</h3>
                <p>
                  Lines longer than ~75 characters require ADHD readers to actively hunt for the next
                  line start. A <code className="ds-code-inline">max-width: 65ch</code> on prose
                  elements is the cheapest readability upgrade in the system.
                </p>
                <div className="ds-p-demo">
                  <p className="ds-reading-line">
                    This paragraph is intentionally capped at sixty-five characters. Notice how the eye
                    never has to travel far — the return to the start of the next line is predictable.
                  </p>
                </div>
              </div>
            </div>

            <div className="ds-principle">
              <div className="ds-p-n">3</div>
              <div className="ds-p-c">
                <h3>Make focus states impossible to miss</h3>
                <p>
                  The browser default <code className="ds-code-inline">:focus</code> outline is
                  invisible on most backgrounds. Calm applies{' '}
                  <code className="ds-code-inline">:focus-visible</code> globally — shown here in its
                  always-on state, exactly as it appears under keyboard navigation.
                </p>
                <div className="ds-p-demo">
                  <button type="button" className="ds-focus-btn" tabIndex={-1}>Complete task</button>
                  <p className="ds-focus-note">3px solid var(--orbi-primary) · offset 3px · :focus-visible</p>
                </div>
              </div>
            </div>

            <div className="ds-principle">
              <div className="ds-p-n">4</div>
              <div className="ds-p-c">
                <h3>Use exactly two accent colors</h3>
                <p>
                  Every additional color the eye has to decode is cognitive overhead. Calm reserves
                  Primary for actions, Secondary for completion. Everything else is an
                  opacity-modified neutral.
                </p>
                <div className="ds-p-demo">
                  <div className="ds-noise-demo">
                    <div className="ds-noise-row">
                      <div className="ds-noise-dot" style={{ background: 'var(--orbi-border)', border: '1px solid var(--orbi-text-muted)' }} />
                      <span className="ds-noise-text">Border — opacity-modified neutral — separation, no weight</span>
                    </div>
                    <div className="ds-noise-row">
                      <div className="ds-noise-dot" style={{ background: 'var(--orbi-primary)' }} />
                      <span className="ds-noise-text">Primary (Slate Blue) — action only</span>
                    </div>
                    <div className="ds-noise-row">
                      <div className="ds-noise-dot" style={{ background: 'var(--orbi-secondary)' }} />
                      <span className="ds-noise-text">Secondary (Sage) — completion and done states only</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ds-principle">
              <div className="ds-p-n">5</div>
              <div className="ds-p-c">
                <h3>Encode state in form, not just text</h3>
                <p>
                  The left-border treatment lets the brain read state before reading a word. The color
                  strip arrives first; the label confirms it. Done is sage. Active is slate blue.
                  Pending is the absence of both.
                </p>
                <div className="ds-p-demo">
                  <div className="ds-state-demo">
                    <div className="ds-st-card done"><span className="ds-st-icon">✓</span><span className="ds-st-name">Morning walk</span><span className="ds-st-badge">Done</span></div>
                    <div className="ds-st-card active"><span className="ds-st-icon">◎</span><span className="ds-st-name">Read for 20 minutes</span><span className="ds-st-badge">Active</span></div>
                    <div className="ds-st-card todo"><span className="ds-st-icon">○</span><span className="ds-st-name">Evening journal</span><span className="ds-st-badge">Pending</span></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Chapter 04 — Components */}
        <section className="ds-chapter" id="ds-components">
          <span className="ds-ch-num" aria-hidden="true">04</span>
          <div className="ds-ch-label">Component library</div>
          <h2>Ready to build.</h2>

          <div className="ds-component-groups">
            <div>
              <div className="ds-cg-label">Actions</div>
              <div className="ds-btn-row">
                <button type="button" className="ds-btn ds-btn-primary" tabIndex={-1}>Complete task</button>
                <button type="button" className="ds-btn ds-btn-secondary" tabIndex={-1}>Mark done</button>
                <button type="button" className="ds-btn ds-btn-ghost" tabIndex={-1}>Cancel</button>
              </div>
            </div>
            <div>
              <div className="ds-cg-label">Text input</div>
              <div className="ds-input-group">
                <label className="ds-input-lbl" htmlFor="ds-demo-input">Task name</label>
                <input className="ds-input-demo" id="ds-demo-input" type="text" placeholder="What needs to happen today?" readOnly />
              </div>
            </div>
            <div>
              <div className="ds-cg-label">Task states</div>
              <div className="ds-state-demo">
                <div className="ds-st-card done"><span className="ds-st-icon">✓</span><span className="ds-st-name">Morning walk — 30 min</span><span className="ds-st-badge">Done</span></div>
                <div className="ds-st-card active"><span className="ds-st-icon">◎</span><span className="ds-st-name">Read for 20 minutes</span><span className="ds-st-badge">Active</span></div>
                <div className="ds-st-card todo"><span className="ds-st-icon">○</span><span className="ds-st-name">Evening journal</span><span className="ds-st-badge">Pending</span></div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <footer className="ds-footer">
        <div className="ds-wrap">
          <div className="ds-footer-inner">
            <span className="ds-footer-copy">Orbi · Calm visual system</span>
            <span className="ds-footer-sig">Less, but better.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
