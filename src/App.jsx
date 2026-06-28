import { CharacterProvider } from './store/CharacterContext.jsx'
import CharacterBuilder from './components/CharacterBuilder.jsx'

export default function App() {
  return (
    <CharacterProvider>
      <div className="min-h-screen bg-auldwyn-dark">
        {/* Header */}
        <header className="border-b border-auldwyn-border/60 bg-auldwyn-panel relative overflow-hidden">
          {/* Subtle vignette gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%)',
            }}
          />
          <div className="relative max-w-6xl mx-auto px-6 py-5 flex flex-col items-center gap-1">
            <a
              href="https://auldwyn.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-opacity hover:opacity-80"
              title="Visit Auldwyn"
            >
              <img
                src="/logo-wordmark.png"
                alt="Auldwyn"
                className="h-16 object-contain"
                style={{
                  filter:
                    'drop-shadow(0 2px 12px rgba(201,168,76,0.35)) drop-shadow(0 0 4px rgba(201,168,76,0.15))',
                }}
              />
            </a>
            <p
              className="text-xs tracking-[0.25em] uppercase font-serif"
              style={{ color: 'rgba(201,168,76,0.55)', letterSpacing: '0.3em' }}
            >
              Character Builder &nbsp;·&nbsp; Neverwinter Nights: Enhanced Edition
            </p>
          </div>
        </header>

        <main>
          <CharacterBuilder />
        </main>

        <footer className="border-t border-auldwyn-border mt-8 py-4">
          <p className="text-center text-xs text-auldwyn-muted/50">
            Auldwyn Character Builder · NWN:EE rules · Level cap: 20 · Not affiliated with Beamdog
          </p>
        </footer>
      </div>
    </CharacterProvider>
  )
}
