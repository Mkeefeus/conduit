const { dialogUtils, genericUtils, effectUtils, combatUtils, actorUtils } = chrisPremades.utils;

function deleteEffectIfPresent(actor, id, useCPRFlag) {
  console.log(`Energy Imbuement Macro | Checking for effect ${id} on ${actor.name}`);
  let effect = null;
  if (useCPRFlag) {
    effect = actor.effects.find((effect) => effect.flags['chris-premades'].info.identifier === id);
  } else {
    effect = actor.effects.find((effect) => effect.name === id);
  }
  if (!effect) {
    return;
  }
  console.log(`Energy Imbuement Macro | Deleting effect ${id} from ${actor.name}`);
  effect.delete();
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

if (!combatUtils.inCombat()) {
  genericUtils.notify('Energy Imbuement Macro | You are not in combat', 'warn');
  return;
}
if (!actorUtils.hasSpellSlots(workflow.actor)) {
  genericUtils.notify('Energy Imbuement Macro | You do not have any spell slots available', 'warn');
  return;
}
let validTypes = ['acid', 'cold', 'fire', 'lightning', 'thunder'];
let die = ['d4', 'd6', 'd8', 'd10', 'd12'];
let buttons = validTypes.map((i) => [
  CONFIG.DND5E.damageTypes[i].label,
  Object.keys(CONFIG.DND5E.damageTypes).find((j) => j === i),
]);
if (!buttons.length) {
  genericUtils.notify('Energy Imbuement Macro | No valid damage types found', 'warn');
  return;
}
let selection = await dialogUtils.buttonDialog(workflow.item.name, 'Select a damage type to imbue', buttons);
if (!selection) return;
const hasLevelSeven = workflow.actor.classes.conduit.system.levels >= 7;
let drSelection;
if (hasLevelSeven) {
  drSelection = await dialogUtils.buttonDialog(workflow.item.name, 'Select a damage type to resist', buttons);
  if (!drSelection) return;
}
let slotUsed = await dialogUtils.selectSpellSlot(
  workflow.actor,
  workflow.item.name,
  genericUtils.format('CHRISPREMADES.Dialog.Use', { itemName: item.name }),
  { no: true }
);
if (slotUsed === 'pact') {
  await genericUtils.update(workflow.actor, {
    'system.spells.pact.value': workflow.actor.system.spells.pact.value - 1,
  });
  slotUsed = workflow.actor.system.spells.pact.level;
} else {
  await genericUtils.update(workflow.actor, {
    ['system.spells.spell' + slotUsed + '.value']: workflow.actor.system.spells['spell' + slotUsed].value - 1,
  });
}

const randomString = generateRandomString(8);
const damageDie = die[slotUsed - 1];

let effectData = {
  name: workflow.item.name + ' (' + CONFIG.DND5E.damageTypes[selection].label + ')',
  img: workflow.item.img,
  origin: workflow.item.uuid,
  duration: {
    seconds: 60,
  },
  changes: [
    {
      key: `flags.midi-qol.optional.energyImbuement_${randomString}.damage.mwak`,
      mode: 5,
      value: `1${damageDie}[${selection}]`,
      priority: 20,
    },
    {
      key: `flags.midi-qol.optional.energyImbuement_${randomString}.damage.rwak`,
      mode: 5,
      value: `1${damageDie}[${selection}]`,
      priority: 20,
    },
    {
      key: `flags.midi-qol.optional.energyImbuement_${randomString}.criticalDamage`,
      mode: 5,
      value: `1${damageDie}[${selection}]`,
      priority: 20,
    },
    {
      key: `flags.midi-qol.optional.energyImbuement_${randomString}.count`,
      mode: 5,
      value: 'every',
      priority: 20,
    },
  ],
  flags: {
    dae: {
      disableIncapacitated: true,
    },
  },
};

if (hasLevelSeven) {
  effectData.changes.push({
    key: `system.traits.dr.value`,
    mode: 2,
    value: `${drSelection}`,
    priority: 20,
  });
}

deleteEffectIfPresent(workflow.item, 'energyImbuement', true);
await effectUtils.createEffect(workflow.item, effectData, { identifier: 'energyImbuement' });
while (combatUtils.inCombat()) {
  await genericUtils.sleep(20000);
}
console.log('Energy Imbuement Macro | Combat has ended, removing effect');
deleteEffectIfPresent(workflow.item, 'energyImbuement', true);
