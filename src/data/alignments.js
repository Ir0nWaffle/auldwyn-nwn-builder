// Shared alignment display labels — single source of truth so every screen
// (Alignment step, Summary, Print Sheet, exports) formats the same way
// instead of showing the raw internal key (e.g. 'neutralgood').

export const ALIGNMENT_LABELS = {
  lawfulgood: 'Lawful Good',
  neutralgood: 'Neutral Good',
  chaoticgood: 'Chaotic Good',
  lawfulneutral: 'Lawful Neutral',
  trueneutral: 'True Neutral',
  chaoticneutral: 'Chaotic Neutral',
  lawfulevil: 'Lawful Evil',
  neutralevil: 'Neutral Evil',
  chaoticevil: 'Chaotic Evil',
}

export function alignmentLabel(key) {
  return ALIGNMENT_LABELS[key] ?? key ?? 'Unknown'
}
