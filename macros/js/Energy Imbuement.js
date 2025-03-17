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
let buttons = validTypes.map((i) => [
  CONFIG.DND5E.damageTypes[i].label,
  Object.keys(CONFIG.DND5E.damageTypes).find((j) => j === i),
]);
if (!buttons.length) {
  genericUtils.notify('Energy Imbuement Macro | No valid damage types found', 'warn');
  return;
}
let selection = await dialogUtils.buttonDialog(workflow.item.name, 'CHRISPREMADES.Dialog.DamageType', buttons);
if (!selection) return;
let numDice = await dialogUtils.selectSpellSlot(
  workflow.actor,
  workflow.item.name,
  genericUtils.format('CHRISPREMADES.Dialog.Use', { itemName: item.name }),
  { no: true }
);
if (numDice === 'pact') {
  await genericUtils.update(workflow.actor, {
    'system.spells.pact.value': workflow.actor.system.spells.pact.value - 1,
  });
  numDice = workflow.actor.system.spells.pact.level;
} else {
  await genericUtils.update(workflow.actor, {
    ['system.spells.spell' + numDice + '.value']: workflow.actor.system.spells['spell' + numDice].value - 1,
  });
}

const hasImproved = workflow.actor.items.find((i) => i.name === 'Improved Energy Imbuement');
if (hasImproved) {
  numDice = numDice * 2;
}

const randomString = generateRandomString(8);

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
      value: `${numDice}d4[${selection}]`,
      priority: 20,
    },
    {
      key: `flags.midi-qol.optional.energyImbuement_${randomString}.damage.rwak`,
      mode: 5,
      value: `${numDice}d4[${selection}]`,
      priority: 20,
    },
    {
      key: `flags.midi-qol.optional.energyImbuement_${randomString}.count`,
      mode: 5,
      value: 'each-turn',
      priority: 20,
    },
  ],
  flags: {
    dae: {
      disableIncapacitated: true,
    },
  },
};
deleteEffectIfPresent(workflow.item, 'energyImbuement', true);
await effectUtils.createEffect(workflow.item, effectData, { identifier: 'energyImbuement' });
while (combatUtils.inCombat()) {
  console.log('Energy Imbuement Macro | Waiting for combat to end');
  await genericUtils.sleep(20000);
}
console.log('Energy Imbuement Macro | Combat has ended, removing effect');
deleteEffectIfPresent(workflow.item, 'energyImbuement', true);
