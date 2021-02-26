import * as Dice from "../dice.js";
import * as Chat from "../chat.js";

export default class L5R4PcSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/l5r4/templates/sheets/pc-sheet.hbs",
      classes: ["l5r4", "pc"],
      width: 879
    })
  }

  itemContextMenu = [
    {
      name: game.i18n.localize("l5r4.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        const item = this.actor.getOwnedItem(element.data("item-id"));
        item.sheet.render(true);
      }
    },
    {
      name: game.i18n.localize("l5r4.mech.toChat"),
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        let item = this.actor.getOwnedItem(element.data("item-id"));
        item.roll();
      }
    },
    {
      name: game.i18n.localize("l5r4.sheet.delete"),
      icon: '<i class="fas fa-trash"></i>',
      callback: element => {
        this.actor.deleteOwnedItem(element.data("item-id"));
      }
    }
  ];

  getData() {
    //const data = super.getData();
    const data = {
      ...super.getData(),
      items: this.actor.items.map(item => item.data)
    };
    data.config = CONFIG.l5r4;


    data.weapons = data.items.filter(function (item) { return item.type == "weapon" });
    data.armors = data.items.filter(function (item) { return item.type == "armor" });
    data.skills = data.items.filter(function (item) { return item.type == "skill" });
    data.spells = data.items.filter(function (item) { return item.type == "spell" });
    data.techniques = data.items.filter(function (item) { return item.type == "technique" });
    data.bows = data.items.filter(function (item) { return item.type == "bow" });



    return data;
  }

  activateListeners(html) {
    //TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this)); 

    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".inline-edit").change(this._onInlineItemEdit.bind(this));

    new ContextMenu(html, ".armor-card", this.itemContextMenu);
    new ContextMenu(html, ".weapon-card", this.itemContextMenu);
    new ContextMenu(html, ".spell-card", this.itemContextMenu);
    new ContextMenu(html, ".technique-card", this.itemContextMenu);

    if (this.actor.owner) {
      html.find(".item-roll").click(this._onItemRoll.bind(this));
      html.find(".weapon-roll").click(this._onWeaponRoll.bind(this));
      html.find(".skill-check").click(this._onSkillRoll.bind(this));
      html.find(".ring-roll").click(this._onRingRoll.bind(this));
      html.find(".trait-roll").click(this._onTraitRoll.bind(this));
    }

    super.activateListeners(html);
  }

  _onRingRoll(event) {
    let ringRank = event.currentTarget.dataset.ringRank;
    let ringName = event.currentTarget.dataset.ringName;
    let schoolRank = this.actor.data.data.insight.rank;

    Dice.RingRoll(
      {
        ringRank: ringRank,
        ringName: ringName,
        schoolRank: schoolRank,
        askForOptions: event.shiftKey
      }
    );
  }

  _onTraitRoll(event) {
    let traitRank = event.currentTarget.dataset.traitRank;
    let traitName = event.currentTarget.dataset.traitName;

    Dice.TraitRoll(
      {
        traitRank: traitRank,
        traitName: traitName,
        askForOptions: event.shiftKey
      }
    );
  }

  _onWeaponRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemID);

    let weaponName = item.name;
    let rollData = item.getRollData();
    let actorTrait;
    let diceRoll;
    let diceKeep;
    if (item.data.type == 'weapon') {
      actorTrait = this.actor.data.data.traits.str;
      diceRoll = parseInt(actorTrait) + parseInt(item.data.data.damageRoll);
    } else if (item.data.type == 'bow') {
      diceRoll = rollData.damageRoll;
      diceKeep = rollData.damageKeep;
    } else {
      return ui.notifications.error(`y u do dis?`);
    }


    diceKeep = parseInt(item.data.data.damageKeep)
    Dice.WeaponRoll(
      {
        diceRoll: diceRoll,
        diceKeep: diceKeep,
        weaponName: weaponName,
        description: rollData.description,
        askForOptions: event.shiftKey
      }
    )

  }

  _onSkillRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemID);
    let skillTrait = item.data.data.trait;
    let actorTrait = this.actor.data.data.traits[skillTrait];
    let skillRank = item.data.data.rank;
    let skillName = item.name;

    Dice.SkillRoll({
      actorTrait: actorTrait,
      skillRank: skillRank,
      skillName: skillName,
      askForOptions: event.shiftKey
    });
  }


  _onItemRoll(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.getOwnedItem(itemId);

    item.roll();
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
      return this.actor.createOwnedItem(itemData);
    } else if (elementType == "spell") {
      let spellOptions = await Chat.GetItemOptions(elementType);
      if (spellOptions.cancelled) { return; }
      itemData = {
        name: spellOptions.name,
        type: spellOptions.type
      }
      return this.actor.createOwnedItem(itemData);
    } else {
      itemData = {
        name: game.i18n.localize("l5r4.sheet.new"),
        type: element.dataset.type
      }
      return this.actor.createOwnedItem(itemData);
    }
  }

  _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.getOwnedItem(itemId);

    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;

    return this.actor.deleteOwnedItem(itemId);
  }

  _onInlineItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.getOwnedItem(itemId);
    let field = element.dataset.field;


    if (element.type == "checkbox") {
      return item.update({ [field]: element.checked })
    }

    return item.update({ [field]: element.value })
  }
}