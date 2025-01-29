const { dialogUtils, genericUtils, effectUtils, combatUtils, actorUtils } = chrisPremades.utils;
function deleteEffect(actor, id, useCPRFlag) {
  if (useCPRFlag) {
    return actor.appliedEffects.find((effect) => effect.flags['chris-premades'].info.identifier === id).delete();
  } else {
    return actor.appliedEffects.find((effect) => effect.name === id).delete();
  }
}

function deleteEffectIfPresent(actor, id, useCPRFlag) {
  if (effectUtils.getEffectByIdentifier(actor, id)) {
    deleteEffect(actor, id, useCPRFlag);
  }
}

if (!combatUtils.inCombat()) {
  genericUtils.notify('You are not in combat', 'warn');
  return;
}
if (!actorUtils.hasSpellSlots(workflow.actor)) {
  genericUtils.notify('You do not have any spell slots available', 'warn');
  return;
}
let validTypes = ['acid', 'cold', 'fire', 'lightning', 'thunder'];
let buttons = validTypes.map((i) => [
  CONFIG.DND5E.damageTypes[i].label,
  Object.keys(CONFIG.DND5E.damageTypes).find((j) => j === i),
]);
if (!buttons.length) return;
let selection = await dialogUtils.buttonDialog(workflow.item.name, 'CHRISPREMADES.Dialog.DamageType', buttons);
if (!selection) return;
let numDice = await dialogUtils.selectSpellSlot(
  workflow.actor,
  workflow.item.name,
  genericUtils.format('CHRISPREMADES.Dialog.Use', { itemName: item.name }),
  { no: true }
);
const hasImproved = workflow.actor.items.find((i) => i.name === 'Improved Energy Imbuement');
if (hasImproved) {
  numDice = numDice * 2;
}
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

let effectData = {
  name: workflow.item.name + ' (' + CONFIG.DND5E.damageTypes[selection].label + ')',
  img: workflow.item.img,
  origin: workflow.item.uuid,
  duration: {
    seconds: 60,
  },
  changes: [
    {
      key: 'flags.midi-qol.optional.energyImbuement.damage.mwak',
      mode: 2,
      value: `${numDice}d4[${selection}]`,
      priority: 20,
    },
    {
      key: 'flags.midi-qol.optional.energyImbuement.damage.rwak',
      mode: 2,
      value: `${numDice}d4[${selection}]`,
      priority: 20,
    },
    {
      key: 'flags.midi-qol.optional.energyImbuement.count',
      mode: 2,
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
deleteEffectIfPresent(workflow.actor, 'energyImbuement', true);
await effectUtils.createEffect(workflow.actor, effectData, { identifier: 'energyImbuement' });
while (combatUtils.inCombat()) {
  await genericUtils.sleep(60000);
}
deleteEffectIfPresent(workflow.actor, 'energyImbuement', true);
