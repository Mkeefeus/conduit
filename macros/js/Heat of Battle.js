const { genericUtils } = chrisPremades.utils;
genericUtils.update(workflow.actor, {
  'system.resources.primary': {
    label: 'Heat of Battle',
  },
});
console.log(workflow);
