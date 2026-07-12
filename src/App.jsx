import { CharacterProvider } from './store/CharacterContext.jsx'
import CharacterBuilder from './components/CharacterBuilder.jsx'

export default function App() {
  return (
    <CharacterProvider>
      <div className="min-h-screen">
        {/* Header — transparent so the smoky black backdrop shows through */}
        <header>
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center">
            <a
              href="https://auldwyn.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-85 transition-opacity"
              title="Visit Auldwyn"
            >
              <img
                src={`${import.meta.env.BASE_URL}logo-wordmark.png`}
                alt="Auldwyn"
                style={{
                  height: '80px',
                  objectFit: 'contain',
                  filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 0 14px rgba(216,144,67,0.45))',
                }}
              />
            </a>

            <div className="flex items-center gap-3 mt-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-auldwyn-gold/30" />
              <p className="text-xs uppercase font-serif" style={{ color: 'rgba(201,168,76,0.45)', letterSpacing: '0.2em' }}>
                Character Builder · Neverwinter Nights: Enhanced Edition
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-auldwyn-gold/30" />
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-auldwyn-gold/40 to-transparent" />
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
