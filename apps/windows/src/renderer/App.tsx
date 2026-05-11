import { colors, spacing, typography } from "@orbi/design-system";

declare global {
  interface Window {
    orbiDesktop?: {
      platform: string;
      versions: {
        chrome: string;
        electron: string;
        node: string;
      };
    };
  }
}

export function App() {
  const desktopInfo = window.orbiDesktop;

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">Orbi Windows</p>
        <h1>Desktop shell is ready</h1>
        <p className="body">
          This is the new Electron host for Orbi. Next step is wiring your existing
          web routes and shared state into this renderer.
        </p>

        <div className="meta">
          <span>Platform: {desktopInfo?.platform ?? "unknown"}</span>
          <span>Electron: {desktopInfo?.versions.electron ?? "n/a"}</span>
          <span>Node: {desktopInfo?.versions.node ?? "n/a"}</span>
        </div>
      </section>

      <style>{`
        :root {
          color-scheme: dark;
        }
        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: ${spacing.xl}px;
          background: radial-gradient(circle at top right, #23214f 0%, ${colors.bg.primary} 45%);
          font-family: ${typography.fonts.body};
          color: ${colors.text.primary};
        }
        .card {
          max-width: 760px;
          width: 100%;
          border: 1px solid ${colors.border};
          background: rgba(26, 25, 53, 0.88);
          border-radius: 16px;
          padding: ${spacing.xl}px;
          box-shadow: 0 24px 80px rgba(8, 7, 25, 0.45);
        }
        .eyebrow {
          margin: 0 0 ${spacing.sm}px;
          color: ${colors.brand.tertiary};
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: ${typography.size.sm}px;
          font-weight: ${typography.weight.semibold};
        }
        h1 {
          margin: 0 0 ${spacing.md}px;
          font-size: ${typography.size["3xl"]}px;
          line-height: ${typography.lineHeight.tight};
        }
        .body {
          margin: 0;
          color: ${colors.text.secondary};
          font-size: ${typography.size.base}px;
          line-height: ${typography.lineHeight.normal};
        }
        .meta {
          margin-top: ${spacing.lg}px;
          display: flex;
          flex-wrap: wrap;
          gap: ${spacing.sm}px;
        }
        .meta span {
          border: 1px solid ${colors.border};
          border-radius: 999px;
          padding: 6px 12px;
          font-size: ${typography.size.sm}px;
          color: ${colors.text.secondary};
          background: rgba(37, 33, 64, 0.55);
        }
      `}</style>
    </main>
  );
}
