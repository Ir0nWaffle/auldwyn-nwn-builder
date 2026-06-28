# Auldwyn Character Builder

An unofficial, fan-made character creation tool for the **Auldwyn** persistent world, running on *Neverwinter Nights: Enhanced Edition*.

> **Live Tool:** [ir0nwaffle.github.io/auldwyn-nwn-builder](https://ir0nwaffle.github.io/auldwyn-nwn-builder/)
> **Auldwyn Website:** [auldwyn.net](https://auldwyn.net/)

---

## Overview

The Auldwyn Character Builder is a browser-based planning tool that lets players design and validate characters before logging into the server. It enforces NWN:EE rules and Auldwyn-specific settings — such as the level 20 cap and max HP per level — so you can arrive with a legal, fully thought-out build.

No installation required. Open the link, build your character, and print or export when you're done.

---

## Features

- **Step-by-step wizard** — guided flow through every stage of character creation
- **All 7 NWN:EE races** with correct ability modifiers and racial traits
- **11 base classes and 11 prestige classes** with hit dice, BAB, saving throw progressions, and skill lists
- **Prestige class prerequisite enforcement** — BAB, feats, skills, race, and alignment all checked live
- **30-point ability score buy** using NWN's point cost table
- **Full skill allocation** — class vs. cross-class costs, rank caps, and skill totals calculated automatically
- **50+ feats** with prerequisite validation (ability scores, BAB, required feats)
- **Auldwyn server rules applied automatically:**
  - Level cap: 20
  - HP: maximum per level
- **Character summary** with full stat block and validation report
- **Printable character sheet** — clean black-and-white layout, works with browser Print → Save as PDF
- **Export to .txt** for quick reference

---

## Using the Builder

1. Open the [live tool](https://ir0nwaffle.github.io/auldwyn-nwn-builder/)
2. Work through each step: Name & Race → Alignment → Class & Levels → Abilities → Skills → Feats
3. Review the Summary page — any rule violations are listed clearly
4. Click **Print Sheet** to generate a printable character sheet, or **Export .txt** for a plain-text summary

---

## Disclaimer

This is an **unofficial, fan-made project** and is not affiliated with, endorsed by, or maintained by the Auldwyn team or Beamdog. It is provided as a free community resource for Auldwyn players.

NWN:EE rules and game data are the property of Beamdog. Auldwyn branding is used with permission from the Auldwyn team.

If server rules change, character builds should always be verified against the current Auldwyn ruleset before play.

---

## For Server Administrators

The rule data is centralized in a small set of plain JavaScript files, making updates straightforward:

| What changed | File to edit |
|---|---|
| Level cap | `src/data/classes.js` → `SERVER_SETTINGS.maxLevel` |
| Ban or allow a class | `src/data/classes.js` → `SERVER_SETTINGS.allowedClasses` |
| Add or modify a class / PrC | `src/data/classes.js` |
| Add or modify a feat | `src/data/feats.js` |
| Racial stat changes | `src/data/races.js` |
| Add a skill | `src/data/skills.js` |

After editing, commit and push to `master` — GitHub Actions redeploys the site automatically within about a minute.

---

## Local Development

Requires [Node.js](https://nodejs.org/) 18 or later.

```bash
# Install dependencies
npm install

# Start local dev server (hot reload)
npm run dev

# Build for production
npm run build
```

---

## Contributing

Bug reports and suggestions are welcome via [GitHub Issues](https://github.com/Ir0nWaffle/auldwyn-nwn-builder/issues). Pull requests are open — please keep changes focused and test locally before submitting.
