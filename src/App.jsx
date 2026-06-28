import { CharacterProvider } from './store/CharacterContext.jsx'
import CharacterBuilder from './components/CharacterBuilder.jsx'

export default function App() {
  return (
    <CharacterProvider>
      <div className="min-h-screen bg-auldwyn-dark">
        {/* Header */}
        <header className="border-b border-auldwyn-border bg-auldwyn-panel">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
            <div>
              <h1 className="text-auldwyn-gold text-2xl font-bold tracking-wide">
                Auldwyn Character Builder
              </h1>
              <p className="text-auldwyn-muted text-xs">
                Neverwinter Nights: Enhanced Edition · Persistent World
              </p>
            </div>
            <div className="ml-auto">
              <a
                href="https://auldwyn.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-auldwyn-muted hover:text-auldwyn-gold transition-colors"
              >
                auldwyn.net ↗
              </a>
            </div>
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
