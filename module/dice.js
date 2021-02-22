export async function SkillCheck({
  actorTrait = null,
  skillRank = null,
  skillName = null } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/simple-roll.hbs";
  let rollType = game.i18n.localize("l5r4.mech.skillRoll");
  let label = `${rollType}: ${skillName}`

  let skillPlussTrait = parseInt(actorTrait) + parseInt(skillRank);
  let rollFormula = `${skillPlussTrait}d10k${actorTrait}x10`;
  let rollResult = new Roll(rollFormula).roll();
  // 5d10k2r1x10 emphasis
  let renderedRoll = await rollResult.render({
    template: messageTemplate,
    flavor: label
  });

  let messageData = {
    speaker: ChatMessage.getSpeaker(),
    content: renderedRoll
  }
  rollResult.toMessage(messageData);

}

export async function RingRoll({
  ringRank = null,
  ringName = null } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/simple-roll.hbs";
  let rollType = game.i18n.localize("l5r4.mech.ringRoll");
  let label = `${rollType}: ${ringName}`

  let rollFormula = `${ringRank}d10k${ringRank}x10`;
  let rollResult = new Roll(rollFormula).roll();

  let renderedRoll = await rollResult.render({
    template: messageTemplate,
    flavor: label
  });

  let messageData = {
    speaker: ChatMessage.getSpeaker(),
    content: renderedRoll
  }

  rollResult.toMessage(messageData);
}

export async function TraitRoll({
  traitRank = null,
  traitName = null,
  askForOptions = true,
  unskilled = false } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/simple-roll.hbs";

  let optionsSettings = game.settings.get("l5r4", "showTraitRollOptions");

  if (askForOptions != optionsSettings) {
    let checkOptions = await GetTraitRollOptions(traitName);

    if (checkOptions.cancelled) {
      return;
    }

    unskilled = checkOptions.unskilled;
  }
  let rollType = game.i18n.localize("l5r4.mech.traitRoll");
  

  let rollFormula = `${traitRank}d10k${traitRank}x10`;
  let rollResult = new Roll(rollFormula).roll();
  if (unskilled) {
    rollFormula = `${traitRank}d10k${traitRank}`;
    rollResult = new Roll(rollFormula).roll();
    rollType = game.i18n.localize("l5r4.mech.unskilledRoll");
  } 

  let label = `${rollType}: ${traitName}`
  let renderedRoll = await rollResult.render({
    template: messageTemplate,
    flavor: label
  });

  let messageData = {
    speaker: ChatMessage.getSpeaker(),
    content: renderedRoll
  }

  rollResult.toMessage(messageData);
}

async function GetTraitRollOptions(traitType) {
  const template = "systems/l5r4/templates/chat/trait-roll-dialog.hbs"
  const html = await renderTemplate(template, {});

  return new Promise(resolve => {
    const data = {
      title: game.i18n.format("l5r4.mech.traitRoll", { type: traitType }),
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("l5r4.mech.roll"),
          callback: html => resolve(_processTraitRollOptions(html[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("l5r4.mech.cancel"),
          callback: html => resolve({ cancelled: true })
        }
      },
      default: "normal",
      close: () => resolve({ cancelled: true })
    };

    new Dialog(data, null).render(true);
  });
}

function _processTraitRollOptions(form) {
  return {
    unskilled: form.unskilled.checked
  }
}

export async function WeaponRoll({
  diceRoll = null,
  diceKeep = null,
  weaponName = null,
  description = null } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/weapon-chat.hbs";
  let rollType = game.i18n.localize("l5r4.mech.damageRoll");
  let label = `${rollType}: ${weaponName}`

  let rollFormula = `${diceRoll}d10k${diceKeep}x10`;
  let rollResult = new Roll(rollFormula).roll();

  let renderedRoll = await rollResult.render();

  let templateContext = {
    flavor: label,
    weapon: weaponName,
    description: description,
    roll: renderedRoll
  }

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    content: await renderTemplate(messageTemplate, templateContext),
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
  }

  ChatMessage.create(chatData);
}