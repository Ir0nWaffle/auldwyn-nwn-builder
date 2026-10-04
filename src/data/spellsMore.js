// Additional NWN:EE spells, added so every class's spell list matches the wiki.
//
// What is verified vs. approximate:
//   - name and SCHOOL come from the wiki's spell-school pages (Abjuration,
//     Conjuration, ... Transmutation) and which classes get them from each
//     class's own page (see SPELL_LISTS in spells.js).
//   - RANGE, SAVE, and SPELL RESISTANCE are approximations written from
//     general knowledge of the spells, not checked page-by-page.
//   - DESCRIPTIONS are short original summaries, not game or wiki text.
//
// Row shape: [key, name, school, range, save, spellResistance, description]

const ROWS = [
  // ── Cantrips / 1st ──
  ['rayoffrost', 'Ray of Frost', 'Conjuration', 'Short', 'None', true, 'A thin beam of cold chills a single target for minor damage.'],
  ['horizikaulsboom', "Horizikaul's Boom", 'Evocation', 'Medium', 'Will (partial)', true, 'A sonic blast that damages and may deafen a single target.'],
  ['icedagger', 'Ice Dagger', 'Evocation', 'Medium', 'None', true, 'Hurls a shard of ice that deals cold damage.'],
  ['ironguts', 'Ironguts', 'Abjuration', 'Touch', 'None', false, 'Fortifies the target against poison and disease.'],
  ['magicweapon', 'Magic Weapon', 'Transmutation', 'Touch', 'None', false, 'Gives a weapon a temporary +1 enhancement bonus.'],
  ['rayofenfeeblement', 'Ray of Enfeeblement', 'Necromancy', 'Short', 'None', true, 'A ray that saps the strength of its target.'],
  ['scare', 'Scare', 'Necromancy', 'Short', 'Will', true, 'Frightens weak creatures so they flee in panic.'],
  ['shelgarnspersistentblade', "Shelgarn's Persistent Blade", 'Evocation', 'Short', 'None', false, 'Conjures a spectral blade that fights beside the caster.'],
  ['entropicshield', 'Entropic Shield', 'Abjuration', 'Personal', 'None', false, 'Makes ranged attacks against the caster miss more often.'],
  ['sanctuary', 'Sanctuary', 'Abjuration', 'Personal', 'Will', false, 'Hides the caster from enemies until they take hostile action.'],
  ['shieldoffaith', 'Shield of Faith', 'Abjuration', 'Touch', 'None', false, 'Grants a deflection bonus to Armor Class.'],
  ['deafeningclang', 'Deafening Clang', 'Transmutation', 'Touch', 'None', false, 'A weapon rings with sound, adding damage and risking deafness.'],

  // ── 2nd ──
  ['balagarnsironhorn', "Balagarn's Iron Horn", 'Enchantment', 'Personal', 'Fortitude', false, 'A horn blast that knocks nearby creatures down.'],
  ['cloudofbewilderment', 'Cloud of Bewilderment', 'Evocation', 'Medium', 'Fortitude', false, 'A stinking cloud that leaves those inside confused and ill.'],
  ['combust', 'Combust', 'Evocation', 'Medium', 'Reflex', true, 'Sets a target alight, burning it for several rounds.'],
  ['deatharmor', 'Death Armor', 'Necromancy', 'Personal', 'None', false, 'Surrounds the caster with energy that harms those who strike.'],
  ['gedleeselectricloop', "Gedlee's Electric Loop", 'Evocation', 'Short', 'Reflex', true, 'Arcs of electricity lash a nearby target.'],
  ['lesserdispel', 'Lesser Dispel', 'Abjuration', 'Medium', 'None', false, 'Removes a weaker magical effect from a creature or area.'],
  ['stonebones', 'Stone Bones', 'Transmutation', 'Touch', 'None', false, 'Hardens the bones of an undead creature.'],
  ['tashashideouslaughter', "Tasha's Hideous Laughter", 'Enchantment', 'Short', 'Will', true, 'Convulses a target with laughter so it cannot act.'],
  ['ultravision', 'Ultravision', 'Transmutation', 'Touch', 'None', false, 'Lets the target see in the dark and in dim conditions.'],
  ['web', 'Web', 'Conjuration', 'Medium', 'Reflex', false, 'Sticky strands entangle creatures in the area.'],
  ['bloodfrenzy', 'Blood Frenzy', 'Transmutation', 'Personal', 'None', false, 'A battle fury boosts strength and constitution briefly.'],
  ['charmpersonoranimal', 'Charm Person or Animal', 'Enchantment', 'Short', 'Will', true, 'Makes a person or beast regard the caster as a friend.'],
  ['flamelash', 'Flame Lash', 'Evocation', 'Short', 'Reflex', true, 'A whip of fire strikes a nearby target.'],
  ['onewiththeland', 'One with the Land', 'Transmutation', 'Personal', 'None', false, 'Improves stealth and awareness in the wild.'],
  ['lesserrestoration', 'Lesser Restoration', 'Conjuration', 'Touch', 'None', false, 'Cures ability damage or a negative effect.'],

  // ── 3rd ──
  ['findtraps', 'Find Traps', 'Divination', 'Personal', 'None', false, 'Reveals traps nearby.'],
  ['greatermagicweapon', 'Greater Magic Weapon', 'Transmutation', 'Touch', 'None', false, 'Gives a weapon a stronger temporary enhancement bonus.'],
  ['mestilsacidbreath', "Mestil's Acid Breath", 'Conjuration', 'Short', 'Reflex', true, 'A cone of acid sprays from the caster.'],
  ['negativeenergyburst', 'Negative Energy Burst', 'Necromancy', 'Short', 'Fortitude', true, 'A burst of necrotic energy harms the living and heals undead.'],
  ['protectionfromelements', 'Protection from Elements', 'Abjuration', 'Touch', 'None', false, 'Absorbs a chosen amount of damage from one energy type.'],
  ['scintillatingsphere', 'Scintillating Sphere', 'Evocation', 'Medium', 'Reflex', true, 'A bursting sphere of electricity damages those nearby.'],
  ['stinkingcloud', 'Stinking Cloud', 'Conjuration', 'Medium', 'Fortitude', false, 'A foul cloud sickens creatures that breathe it.'],
  ['bladethirst', 'Blade Thirst', 'Transmutation', 'Touch', 'None', false, 'Empowers a weapon so it bypasses damage reduction.'],
  ['darkfire', 'Darkfire', 'Evocation', 'Touch', 'None', false, 'Wreathes weapons in black flame that adds fire damage.'],
  ['healingsting', 'Healing Sting', 'Necromancy', 'Touch', 'None', false, 'Poisonous venom blunts the target and mends the caster.'],
  ['infestationofmaggots', 'Infestation of Maggots', 'Necromancy', 'Short', 'Fortitude', true, 'Maggots eat at the target, dealing damage and weakness.'],
  ['woundingwhispers', 'Wounding Whispers', 'Abjuration', 'Personal', 'None', false, 'Whispering shields of sound injure creatures that strike the caster.'],
  ['negativeenergyprotection', 'Negative Energy Protection', 'Abjuration', 'Touch', 'None', false, 'Grants resistance to negative energy and level drain.'],
  ['quillfire', 'Quillfire', 'Transmutation', 'Short', 'Reflex', true, 'Launches a volley of quills at a target.'],
  ['searinglight', 'Searing Light', 'Evocation', 'Medium', 'None', true, 'A ray of light that burns, especially undead.'],

  // ── 4th ──
  ['charmmonster', 'Charm Monster', 'Enchantment', 'Short', 'Will', true, 'Makes a creature of any type regard the caster as a friend.'],
  ['enervation', 'Enervation', 'Necromancy', 'Short', 'None', true, 'Drains life force, bestowing negative levels.'],
  ['icestorm', 'Ice Storm', 'Evocation', 'Long', 'None', true, 'Hail and cold batter everything in the area.'],
  ['lesserspellbreach', 'Lesser Spell Breach', 'Abjuration', 'Medium', 'None', false, 'Strips several protective spells from a target.'],
  ['phantasmalkiller', 'Phantasmal Killer', 'Illusion', 'Medium', 'Will', true, 'A nightmare image that can frighten or kill its target.'],
  ['polymorphself', 'Polymorph Self', 'Transmutation', 'Personal', 'None', false, 'Transforms the caster into another creature.'],
  ['shadowconjuration', 'Shadow Conjuration', 'Illusion', 'Short', 'None', false, 'Mimics a weaker summoning or conjuration from shadow.'],
  ['walloffire', 'Wall of Fire', 'Evocation', 'Medium', 'None', true, 'A curtain of flame burns those who cross it.'],
  ['masscamouflage', 'Mass Camouflage', 'Transmutation', 'Medium', 'None', false, 'Blends the caster and allies into natural surroundings.'],
  ['warcry', 'War Cry', 'Enchantment', 'Personal', 'None', false, 'A rallying shout frightens enemies and inspires allies.'],
  ['hammerofthegods', 'Hammer of the Gods', 'Evocation', 'Medium', 'Will (partial)', true, 'Divine force batters foes and may knock them down.'],

  // ── 5th ──
  ['balllightning', 'Ball Lightning', 'Evocation', 'Medium', 'Reflex', true, 'Orbs of electricity strike enemies in the area.'],
  ['cloudkill', 'Cloudkill', 'Conjuration', 'Medium', 'Fortitude', false, 'A poisonous fog that can kill weak creatures outright.'],
  ['energybuffer', 'Energy Buffer', 'Abjuration', 'Touch', 'None', false, 'Absorbs a large amount of damage from all energy types.'],
  ['firebrand', 'Firebrand', 'Evocation', 'Medium', 'None', true, 'Bolts of flame seek out multiple targets.'],
  ['greatershadowconjuration', 'Greater Shadow Conjuration', 'Illusion', 'Medium', 'None', false, 'Mimics a stronger conjuration spell from shadow.'],
  ['lessermindblank', 'Lesser Mind Blank', 'Abjuration', 'Touch', 'None', false, 'Protects the mind from many mental effects.'],
  ['lesserplanarbinding', 'Lesser Planar Binding', 'Conjuration', 'Short', 'Will', false, 'Calls and binds a lesser outsider to the caster.'],
  ['mestilsacidsheath', "Mestil's Acid Sheath", 'Conjuration', 'Personal', 'None', false, 'Cloaks the caster in acid that burns attackers.'],
  ['circleofdoom', 'Circle of Doom', 'Necromancy', 'Personal', 'None', false, 'Negative energy ripples outward, harming nearby enemies.'],
  ['healingcircle', 'Healing Circle', 'Conjuration', 'Personal', 'None', false, 'Positive energy heals nearby allies.'],
  ['monstrousregeneration', 'Monstrous Regeneration', 'Conjuration', 'Touch', 'None', false, 'The target regenerates hit points rapidly.'],
  ['raisedead', 'Raise Dead', 'Conjuration', 'Touch', 'None', false, 'Returns a dead character to life.'],
  ['inferno', 'Inferno', 'Transmutation', 'Short', 'None', true, 'A sustained jet of flame burns a single target.'],
  ['owlsinsight', "Owl's Insight", 'Transmutation', 'Touch', 'None', false, 'Grants a large boost to wisdom.'],
  ['vinemine', 'Vine Mine', 'Conjuration', 'Medium', 'None', false, 'Calls up entangling vines with several effects.'],
  ['battletide', 'Battletide', 'Transmutation', 'Personal', 'None', false, 'Enemies near the caster suffer attack and damage penalties.'],

  // ── 6th ──
  ['circleofdeath', 'Circle of Death', 'Necromancy', 'Medium', 'Fortitude', true, 'A wave of death magic that can kill weak creatures.'],
  ['etherealvisage', 'Ethereal Visage', 'Illusion', 'Personal', 'None', false, 'Makes the caster partly ethereal and hard to hit.'],
  ['greaterspellbreach', 'Greater Spell Breach', 'Abjuration', 'Medium', 'None', false, 'Strips many protective spells from a target.'],
  ['greaterstoneskin', 'Greater Stoneskin', 'Transmutation', 'Touch', 'None', false, 'Grants strong damage resistance that wears away as it absorbs.'],
  ['isaacsgreatermissilestorm', "Isaac's Greater Missile Storm", 'Evocation', 'Long', 'None', true, 'A barrage of magical missiles strikes many targets.'],
  ['legendlore', 'Legend Lore', 'Divination', 'Personal', 'None', false, 'Reveals the lore of an item, creature, or place.'],
  ['planarbinding', 'Planar Binding', 'Conjuration', 'Short', 'Will', false, 'Calls and binds an outsider to serve the caster.'],
  ['shades', 'Shades', 'Illusion', 'Medium', 'None', false, 'Mimics a strong spell by drawing on shadow.'],
  ['stonetoflesh', 'Stone to Flesh', 'Transmutation', 'Touch', 'None', false, 'Restores a petrified creature to flesh.'],
  ['truesight', 'True Seeing', 'Divination', 'Touch', 'None', false, 'Lets the target see through illusions and invisibility.'],
  ['undeathtodeath', 'Undeath to Death', 'Necromancy', 'Medium', 'Will', true, 'Destroys weak undead in an area.'],
  ['bladebarrier', 'Blade Barrier', 'Evocation', 'Medium', 'Reflex', false, 'A whirling wall of blades slices those who enter it.'],
  ['planarally', 'Planar Ally', 'Conjuration', 'Short', 'None', false, 'Calls a powerful outsider to aid the caster.'],
  ['stonehold', 'Stonehold', 'Conjuration', 'Medium', 'Reflex', false, 'Hands of stone seize creatures in the area.'],
  ['crumble', 'Crumble', 'Transmutation', 'Short', 'Fortitude', true, 'Reduces a construct or stone creature to rubble.'],
  ['dirge', 'Dirge', 'Evocation', 'Medium', 'None', false, 'A mournful song weakens enemies in the area.'],

  // ── 7th ──
  ['controlundead', 'Control Undead', 'Necromancy', 'Medium', 'Will', true, 'Bends an undead creature to the caster’s will.'],
  ['greatthunderclap', 'Great Thunderclap', 'Evocation', 'Long', 'Fortitude', true, 'A thunderous blast that stuns and deafens.'],
  ['mordenkainenssword', "Mordenkainen's Sword", 'Transmutation', 'Short', 'None', false, 'A floating blade of force fights for the caster.'],
  ['powerwordstun', 'Power Word, Stun', 'Divination', 'Medium', 'None', true, 'A spoken word stuns a creature with few hit points.'],
  ['prismaticspray', 'Prismatic Spray', 'Evocation', 'Short', 'Varies', true, 'A fan of colored rays with a different effect each.'],
  ['protectionfromspells', 'Protection from Spells', 'Enchantment', 'Touch', 'None', false, 'Grants a large bonus on saves against spells.'],
  ['shadowshield', 'Shadow Shield', 'Illusion', 'Personal', 'None', false, 'Shadow armors the caster with resistances and protection.'],
  ['spellmantle', 'Spell Mantle', 'Abjuration', 'Personal', 'None', false, 'Absorbs several incoming spells entirely.'],
  ['wordoffaith', 'Word of Faith', 'Evocation', 'Medium', 'None', false, 'Divine words cast out and slay enemies of differing alignment.'],
  ['resurrection', 'Resurrection', 'Conjuration', 'Touch', 'None', false, 'Restores the dead to life with full health.'],
  ['auraofvitality', 'Aura of Vitality', 'Transmutation', 'Personal', 'None', false, 'Boosts strength, dexterity, and constitution.'],

  // ── 8th ──
  ['blackstaff', 'Blackstaff', 'Transmutation', 'Touch', 'None', false, 'Imbues a staff with dispelling negative energy.'],
  ['greaterplanarbinding', 'Greater Planar Binding', 'Conjuration', 'Short', 'Will', false, 'Calls and binds a powerful outsider.'],
  ['greatersanctuary', 'Greater Sanctuary', 'Transmutation', 'Personal', 'None', false, 'A stronger version of Sanctuary that protects the caster.'],
  ['massblindnessdeafness', 'Mass Blindness/Deafness', 'Illusion', 'Medium', 'Fortitude', true, 'Blinds or deafens many creatures at once.'],
  ['masscharm', 'Mass Charm', 'Enchantment', 'Medium', 'Will', true, 'Charms many creatures in an area.'],
  ['mindblank', 'Mind Blank', 'Abjuration', 'Touch', 'None', false, 'Grants full protection against mental effects.'],
  ['premonition', 'Premonition', 'Divination', 'Touch', 'None', false, 'Foresight grants damage resistance against the next blows.'],
  ['massheal', 'Mass Heal', 'Conjuration', 'Medium', 'None', false, 'Heals every ally in the area.'],
  ['sunbeam', 'Sunbeam', 'Evocation', 'Long', 'Reflex', true, 'A blinding beam of sunlight burns and blinds foes.'],
  ['bombardment', 'Bombardment', 'Conjuration', 'Long', 'Reflex', true, 'Boulders rain down on the area.'],
  ['naturesbalance', "Nature's Balance", 'Transmutation', 'Personal', 'None', false, 'Draws on the natural world to protect and empower the caster.'],

  // ── 9th ──
  ['dominatemonster', 'Dominate Monster', 'Enchantment', 'Medium', 'Will', true, 'Seizes control of any creature’s mind.'],
  ['meteorswarm', 'Meteor Swarm', 'Evocation', 'Long', 'Reflex', true, 'Meteors crash down, dealing enormous damage.'],
  ['mordenkainensdisjunction', "Mordenkainen's Disjunction", 'Abjuration', 'Medium', 'None', false, 'Unravels magic in the area, including items.'],
  ['powerwordkill', 'Power Word, Kill', 'Divination', 'Medium', 'None', true, 'A spoken word kills a creature with few hit points.'],
  ['shapechange', 'Shapechange', 'Transmutation', 'Personal', 'None', false, 'Transforms the caster into a powerful creature.'],
  ['timestop', 'Time Stop', 'Transmutation', 'Personal', 'None', false, 'The caster acts freely while time stands still.'],
  ['wailofthebanshee', 'Wail of the Banshee', 'Necromancy', 'Medium', 'Fortitude', true, 'A deathly scream that can slay many creatures.'],
  ['weird', 'Weird', 'Illusion', 'Medium', 'Will', true, 'A nightmare vision that can kill or terrify.'],
  ['undeathseternalfoe', "Undeath's Eternal Foe", 'Abjuration', 'Personal', 'None', false, 'Grants protection against negative energy and undead.'],
]

export const MORE_SPELLS = Object.fromEntries(
  ROWS.map(([key, name, school, range, save, spellResistance, description]) =>
    [key, { name, school, range, save, spellResistance, description }])
)
