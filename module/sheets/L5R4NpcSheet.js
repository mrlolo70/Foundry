import * as Dice from "../dice.js";

export default class L5R4NpcSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions,{
      template: "systems/l5r4/templates/sheets/npc-sheet.hbs",
      classes: ["l5r4", "npc"],
      width: 650
    })
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.l5r4;
    return data;
  }

  activateListeners(html) {
    //TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this)); 

    if (this.actor.owner) {
      html.find(".attack1-roll").click(this._onAttackRoll.bind(this));
      html.find(".attack2-roll").click(this._onAttackRoll.bind(this));
      html.find(".damage1-roll").click(this._onDamageRoll.bind(this));
      html.find(".damage2-roll").click(this._onDamageRoll.bind(this));
    }

    super.activateListeners(html);
  }

  _onAttackRoll(event) {
    let diceRoll = event.currentTarget.dataset.roll;
    let diceKeep = event.currentTarget.dataset.keep;
    let rollName = `${this.actor.name}: ${game.i18n.localize("l5r4.mech.attackRoll")}`;
    let description = event.currentTarget.dataset.desc;

    Dice.NpcRoll(
      {
        diceRoll: diceRoll,
        diceKeep: diceKeep,
        rollName: rollName,
        description: description
      }
    )
  }

  _onDamageRoll(event) {
    let diceRoll = event.currentTarget.dataset.roll;
    let diceKeep = event.currentTarget.dataset.keep;
    let rollName = `${this.actor.name}: ${game.i18n.localize("l5r4.mech.damageRoll")}`;
    let description = event.currentTarget.dataset.desc;

    Dice.NpcRoll(
      {
        diceRoll: diceRoll,
        diceKeep: diceKeep,
        rollName: rollName,
        description: description
      }
    )
  }
}