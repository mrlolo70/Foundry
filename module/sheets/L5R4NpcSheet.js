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
    const baseData = super.getData();

    let sheetData = {
      owner: this.actor.isOwner,
      editable: this.actor.isEditable,
      actor: baseData.actor,
      data: baseData.actor.data.data,
      config: CONFIG.l5r4,
      items: baseData.items
    }

    sheetData.skills = sheetData.items.filter(function (item) { return item.type == "skill" });

    return sheetData;
  }

  activateListeners(html) {
    //TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this)); 

    if (this.actor.isOwner) {
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".item-edit").click(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html.find(".inline-edit").change(this._onInlineItemEdit.bind(this));

      html.find(".attack1-roll").click(this._onAttackRoll.bind(this));
      html.find(".attack2-roll").click(this._onAttackRoll.bind(this));
      html.find(".damage1-roll").click(this._onDamageRoll.bind(this));
      html.find(".damage2-roll").click(this._onDamageRoll.bind(this));
      html.find(".simple-roll").click(this._onSimpleRoll.bind(this));
      html.find(".skill-roll").click(this._onSkillRoll.bind(this));
    }

    super.activateListeners(html);
  }

  _onSimpleRoll(event) {
    let diceRoll = event.currentTarget.dataset.roll;
    let diceKeep = event.currentTarget.dataset.keep;
    let rolltype = event.currentTarget.dataset.type;
    let trait = event.currentTarget.dataset.trait;
    let rollName = `${this.actor.name}: ${rolltype} ${trait}`;

    Dice.NpcRoll(
      {
        diceRoll: diceRoll,
        diceKeep: diceKeep,
        rollName: rollName
      }
    )
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

  async _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let elementType = element.dataset.type;
    let itemData = {};
    if (elementType == "equipment") {
      let equipmentOptions = await Chat.GetItemOptions(elementType);
      if (equipmentOptions.cancelled) { return; }
      itemData = {
        name: equipmentOptions.name,
        type: equipmentOptions.type
      }
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
    } else if (elementType == "spell") {
      let spellOptions = await Chat.GetItemOptions(elementType);
      if (spellOptions.cancelled) { return; }
      itemData = {
        name: spellOptions.name,
        type: spellOptions.type
      }
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
    } else {
      itemData = {
        name: game.i18n.localize("l5r4.sheet.new"),
        type: element.dataset.type
      }
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }
  }

  _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;

    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  _onInlineItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;


    if (element.type == "checkbox") {
      return item.update({ [field]: element.checked })
    }

    return item.update({ [field]: element.value })
  }

  _onSkillRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);
    let skillTrait = item.data.data.trait;
    let actorTrait = null;
    // some skills use the void ring as a trait
    if (skillTrait == 'void') {
      return ui.notifications.error(`NPCs don't have Void`);
    } else {
      actorTrait = this.actor.data.data.traits[skillTrait];
    }
    let skillRank = item.data.data.rank;
    let skillName = item.name;

    Dice.SkillRoll({
      actorTrait: actorTrait,
      skillRank: skillRank,
      skillName: skillName,
      askForOptions: event.shiftKey
    });
  }
}