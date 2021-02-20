export function SkillCheck({
  actorTrait = null,
  skillRank = null} = {}) {

  let skillPlussTrait = parseInt(actorTrait) + parseInt(skillRank);
  let rollFormula = `${skillPlussTrait}d10k${actorTrait}x10`;

  let messageData = {
    speaker: ChatMessage.getSpeaker()
  }
  new Roll(rollFormula).roll().toMessage(messageData);
}

export function RingRoll({
  ringRank = null} = {}){

  let rollFormula = `${ringRank}d10k${ringRank}x10`;
  let messageData = {
    speaker: ChatMessage.getSpeaker()
  }
  new Roll(rollFormula).roll().toMessage(messageData);
}