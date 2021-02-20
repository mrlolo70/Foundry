export default class LF54Item extends Item {
  chatTemplate = {
    "weapon": "systems/l5r4/templates/partials/weapon-card.hbs",
    "skill": "systems/l5r4/templates/partials/skill-card.hbs",
    "armor": "systems/l5r4/templates/partials/armor-card.hbs",
    "spell": "systems/l5r4/templates/partials/spell-card.hbs"
  };

  async roll() {
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker()
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id
    };

    chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);

    chatData.roll = true; //revise later

    return ChatMessage.create(chatData);
  }
}