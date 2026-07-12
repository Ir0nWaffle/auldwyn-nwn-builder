// Simple glyph icons for classes and skills, styled to sit in a beveled
// NWN-style icon slot (see IconSlot.jsx). These are original glyph choices,
// not extracted game art — chosen only to evoke each class/skill at a glance.

// Fallback icon per spell school — every spell resolves to at least this,
// even ones without a hand-picked icon in SPELL_ICONS below.
export const SCHOOL_ICONS = {
  Abjuration: '🛡️',
  Conjuration: '🌀',
  Divination: '🔮',
  Enchantment: '💫',
  Evocation: '🔥',
  Illusion: '🎭',
  Necromancy: '☠️',
  Transmutation: '🌗',
  Universal: '✨',
}

export const CLASS_ICONS = {
  barbarian: '🪓',
  bard: '🎵',
  cleric: '✝️',
  druid: '🌿',
  fighter: '⚔️',
  monk: '☯️',
  paladin: '🛡️',
  ranger: '🏹',
  rogue: '🗡️',
  sorcerer: '🔥',
  wizard: '📖',
  arcanearcher: '🏹',
  assassin: '🥷',
  blackguard: '💀',
  championoftorm: '⚜️',
  dwarvendefender: '🪨',
  harperscout: '🦅',
  palemaster: '☠️',
  purpledragonknight: '🐉',
  shadowdancer: '🌑',
  shifter: '🐺',
  weaponmaster: '⚔️',
  dragondisciple: '🐲',
}

export const SKILL_ICONS = {
  animalempathy: '🐾',
  appraise: '💰',
  bluff: '🎭',
  concentration: '🧘',
  craftarmor: '🧵',
  craftweapon: '⚒️',
  crafttrap: '🧰',
  diplomacy: '🤝',
  disable: '🧨',
  discipline: '💪',
  heal: '✚',
  hide: '🫥',
  intimidate: '😠',
  listen: '👂',
  lore: '📚',
  movesilently: '👣',
  openlocks: '🔓',
  parry: '🛡️',
  perform: '🎼',
  persuade: '💬',
  pickpocket: '🧤',
  search: '🔍',
  settrap: '🪤',
  spellcraft: '✨',
  spot: '👁️',
  taunt: '😤',
  tumble: '🤸',
  usemagicdevice: '🪄',
}

export const FEAT_ICONS = {
  // 1st-Level-Only
  luckofheroes: '🍀',
  snakeblood: '🐍',
  silverpalm: '🪙',
  strongsoul: '💫',
  courteousmagocracy: '🎩',
  artist: '🎨',
  blooded: '🩸',
  bullheaded: '🐂',

  // General
  alertness: '👀',
  ambidexterity: '🙌',
  armorproflight: '👕',
  armorprofmedium: '🧥',
  armorprofheavy: '🥋',
  blindfight: '🕶️',
  cleave: '🪓',
  deflectarrows: '🏹',
  dodge: '💨',
  expertise: '🧠',
  extrastunningattacks: '👊',
  extraturning: '☀️',
  greatcleave: '🪓',
  greatfortitude: '❤️',
  improvedcritical: '🎯',
  improvedinitiative: '⚡',
  improvedknockdown: '🤼',
  improvedtwowfighting: '🤺',
  improvedunarmedstrike: '👊',
  ironwill: '🧠',
  knockdown: '🤼',
  lightningflexes: '⚡',
  martialweaponprof: '⚔️',
  mobility: '🏃',
  pointblankshot: '🏹',
  powerattack: '💥',
  preciseshot: '🎯',
  rapidreload: '🔄',
  rapidshot: '🏹',
  shieldprof: '🛡️',
  simplewpnprof: '🔪',
  springattack: '🏃',
  stunningfist: '👊',
  toughness: '❤️',
  twowfighting: '🤺',
  weaponfinesse: '🤺',
  weaponfocus: '🎯',
  weaponfocuslongbow: '🏹',
  weaponspec: '💥',
  whirlwindattack: '🌀',
  scribescroll: '📜',

  // Skill Focus
  skillfocusdiscipline: '💪',
  skillfocushide: '🫥',
  skillfocuslisten: '👂',
  skillfocusspellcraft: '✨',
  skillfocusspot: '👁️',
  skillfocustumble: '🤸',
  skillfocuslore: '📚',
  skillfocuspersuade: '💬',

  // Metamagic
  empowerspell: '💪',
  extendspell: '⏳',
  maximizespell: '⬆️',
  quickenspell: '⏱️',
  silentspell: '🤫',
  stillspell: '🧍',

  // Spell Focus / Penetration
  spellfocusabj: '🛡️',
  spellfocuscon: '🌀',
  spellfocusdiv: '🔮',
  spellfocusenc: '💫',
  spellfocusevo: '🔥',
  spellfocusnec: '☠️',
  spellfocustrans: '🌗',
  spellfocusill: '🎭',
  spellpenetration: '🗡️',
  greaterspellpen: '🗡️',
}

// Hand-picked icons for the most iconic/recognizable spells. Any spell key
// not listed here falls back to its school's icon via getSpellIcon() in
// data/spells.js — every spell still resolves to an icon either way.
export const SPELL_ICONS = {
  // Cantrips
  amplify: '📢', daze: '💤', detectundead: '👻', flare: '💡', ghostlyvisage: '👤',
  light: '🕯️', negenergyray: '➖', acidsplash: '🧪', electricjolt: '⚡',

  // Level 1
  burninghands: '🔥', charmperson: '💘', colorspray: '🌈', expeditiousretreat: '💨',
  grease: '🧴', identify: '🔎', magearmor: '🧥', magicmissile: '✨', shield: '🛡️',
  sleep: '😴', truestrike: '🎯', summoncreature1: '👹', nyborsmildreminder: '🤕',

  // Level 2
  bullsstrength: '💪', catsgrace: '🐈', eaglessplendor: '🦅', foxescunning: '🦊',
  owlswisdom: '🦉', endurance: '🫀', darknessspell: '🌑', flameweapon: '🔥',
  ghoultouch: '🧟', invisibilityspell: '👻', knock: '🚪', mirrorimage: '🪞',
  resistelements: '🌡️', melfsacidarrow: '🏹', holdperson: '🥶', summoncreature2: '👹',
  horrificappearance: '😱',

  // Level 3
  clairaudienceclairvoyance: '👁️', dispelmagic: '🚫', displacement: '🌫️', fireball: '💥',
  flamearrow: '🏹', hastespell: '⏩', lightningbolt: '⚡', slow: '🐌', suggestion: '🗣️',
  summoncreature3: '👹', vampirictouch: '🧛', keenedge: '🔪',

  // Level 4
  animatedead: '💀', bigbysinterposinghand: '✋', evardsblacktentacles: '🐙', fearspell: '😱',
  elementalshield: '🔆', improvedinvisibility: '👻', minorglobeofinvulnerability: '🔵',
  stoneskin: '🗿', summoncreature4: '👹', bigbysforcefulhand: '✋',
  greaterbullsstrength: '💪', greatercatsgrace: '🐈', greatereaglessplendor: '🦅',
  greaterfoxescunning: '🦊', greaterowlswisdom: '🦉', greaterendurance: '🫀',

  // Level 5
  coneofcold: '❄️', dominateperson: '🫡', feeblemind: '🌀', holdmonster: '🥶',
  isaacslessermissilestorm: '☄️', summoncreature5: '👹', wallofforce: '🧱',

  // Level 6
  acidfog: '🧪', antimagicfield: '⛔', chainlightning: '⚡', fleshtostone: '🗿',
  globeofinvulnerability: '🔵', tenserstransformation: '🥊', summoncreature6: '👹',
  lesserspellmantle: '🧥', bigbysgraspinghand: '✋', disintegrate: '💨',

  // Level 7
  banishment: '🌀', delayedblastfireball: '⏰', fingerofdeath: '☠️', summoncreature7: '👹',
  greaterspellmantle: '🧥',

  // Level 8
  bigbysclenchedfist: '👊', horridwilting: '🥀', incendiarycloud: '☁️', summoncreature8: '👹',

  // Level 9
  bigbyscrushinghand: '✊', energydrain: '🩸', gate: '🌀', summoncreature9: '👹',
  blackblade: '⚔️',

  // Divine — healing & harm
  curelightwounds: '➕', cureminorwounds: '➕', curemoderatewounds: '➕',
  cureseriouswounds: '➕', curecriticalwounds: '➕',
  inflictlightwounds: '☠️', inflictminorwounds: '☠️', inflictmoderatewounds: '☠️',
  inflictseriouswounds: '☠️', inflictcriticalwounds: '☠️', heal: '💚', harm: '💔',

  // Divine — buffs/debuffs
  bless: '🙏', bane: '😈', doom: '☔', aid: '🤝', endureelements: '🌡️',
  protectionfromalignment: '🛡️', divinefavor: '🌟', entangle: '🌿', faeriefire: '✨',
  virtue: '🍀', barkskin: '🌳', deathward: '⚰️', holdanimal: '🥶', removeparalysis: '🔓',
  resistenergy: '🌡️', silence: '🤐', soundburst: '📣', spikegrowth: '🌵', fogcloud: '🌫️',
  gustofwind: '💨', removeblindnessdeafness: '👀', removecurse: '🕊️', removedisease: '💊',
  contagion: '🦠', blindnessdeafness: '🙈', callLightning: '⛈️', magicvestment: '🧥',
  magicfang: '🦷', greatermagicfang: '🦷', prayer: '🙏', removefear: '😌', resistance: '🍀',
  bestowcurse: '🕯️',

  // Divine — high level
  discernlies: '🤥', dispelmagicgreater: '🚫', magiccircle: '⭕', neutralizepoison: '💊',
  poisonspell: '🐍', waterwalk: '🌊', divinepower: '⚡', freedomofmovement: '🏃',
  restorationlesser: '💫', blessweapon: '⚔️', glyphofwarding: '🔺', spellresistance: '🛡️',
  battletide: '🌊', commune: '🕊️', flamestrike: '🔥', insectplague: '🦗', wallofstonespell: '🧱',
  createundead: '💀', creategreaterundead: '💀', destruction: '💥', greaterrestoration: '💫',
  regenerate: '🩹', restoration: '💫', earthquake: '🌍', firestorm: '🔥', elementalswarm: '🌪️',
  implosion: '🌀', slay: '☠️', holyaura: '👼',

  // Druid-specific
  camouflage: '🍃', creepingdoom: '🐛', awaken: '🌟', drown: '🌊', giantvermin: '🐜',
  balefulpolymorph: '🐸', shambler: '🌿', stormofvengeance: '⛈️', whirlwindspell: '🌪️',
  sunburst: '☀️',

  // Bard-specific
  clarity: '💎', dominateanimal: '🐾', masshaste: '⏩', mindfog: '🌫️',

  // Paladin/Ranger
  auraofglory: '✨', auraofvitality: '💚', holysword: '⚔️',

  // Universal / utility
  see_invisible: '👁️', invisibilitypurge: '💡', invisibilitysphere: '👻',
  continualflame: '🕯️', dismissal: '🌀', confusion: '🌀',
}
