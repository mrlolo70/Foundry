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
        const item = this.actor.items.get(element.data("item-id"));
        item.sheet.render(true);
      }
    },
    {
      name: game.i18n.localize("l5r4.mech.toChat"),
      icon: '<i class="fas fa-edit"></i>',
      callback: element => {
        let item = this.actor.items.get(element.data("item-id"));
        item.roll();
      }
    },
    {
      name: game.i18n.localize("l5r4.sheet.delete"),
      icon: '<i class="fas fa-trash"></i>',
      callback: element => {
        this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
      }
    }
  ];

  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/l5r4/templates/sheets/limited-pc-sheet.hbs";
    }
    return this.options.template;
  }

  getData() {
    // Retrieve the data structure from the base sheet.
    const baseData = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to base structure for easier access
    baseData.system = actorData.system;

    // Add config data to base sctructure
    baseData.config = CONFIG.l5r4;

    baseData.commonItems = baseData.items.filter(function (item) { return item.type == "commonItem" });
    baseData.weapons = baseData.items.filter(function (item) { return item.type == "weapon" });
    baseData.bows = baseData.items.filter(function (item) { return item.type == "bow" });
    baseData.armors = baseData.items.filter(function (item) { return item.type == "armor" });
    baseData.skills = baseData.items.filter(function (item) { return item.type == "skill" });
    baseData.techniques = baseData.items.filter(function (item) { return item.type == "technique" });
    baseData.advantages = baseData.items.filter(function (item) { return item.type == "advantage" });
    baseData.disadvantages = baseData.items.filter(function (item) { return item.type == "disadvantage" });
    baseData.spells = baseData.items.filter(function (item) { return item.type == "spell" });
    baseData.katas = baseData.items.filter(function (item) { return item.type == "kata" });
    baseData.kihos = baseData.items.filter(function (item) { return item.type == "kiho" });

    baseData.masteries = [];
    for (let skill of baseData.skills) {
      if (skill.system.mastery_3 != "" && skill.system.rank >= 3)
        baseData.masteries.push({ _id: skill._id, name: `${skill.name} 3`, mastery: skill.system.mastery_3 });
      if (skill.system.mastery_5 != "" && skill.system.rank >= 5)
        baseData.masteries.push({ _id: skill._id, name: `${skill.name} 5`, mastery: skill.system.mastery_5 });
      if (skill.system.mastery_7 != "" && skill.system.rank >= 7)
        baseData.masteries.push({ _id: skill._id, name: `${skill.name} 7`, mastery: skill.system.mastery_7 });
    }

    return baseData;
  }

  activateListeners(html) {
    //TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this)); 

    // only owners should edit and add things
    if (this.actor.isOwner) {
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".item-edit").click(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html.find(".inline-edit").change(this._onInlineItemEdit.bind(this));

      new ContextMenu(html, ".skill-item", this.itemContextMenu);
      new ContextMenu(html, ".commonItem-card", this.itemContextMenu);
      new ContextMenu(html, ".armor-card", this.itemContextMenu);
      new ContextMenu(html, ".weapon-card", this.itemContextMenu);
      new ContextMenu(html, ".spell-card", this.itemContextMenu);
      new ContextMenu(html, ".technique-card", this.itemContextMenu);
      new ContextMenu(html, ".advantage-card", this.itemContextMenu);
      new ContextMenu(html, ".disadvantage-card", this.itemContextMenu);
      new ContextMenu(html, ".kata-card", this.itemContextMenu);
      new ContextMenu(html, ".kiho-card", this.itemContextMenu);

      html.find(".item-roll").click(this._onItemRoll.bind(this));
      html.find(".weapon-roll").click(this._onWeaponRoll.bind(this));
      html.find(".skill-roll").click(this._onSkillRoll.bind(this));
      html.find(".ring-roll").click(this._onRingRoll.bind(this));
      html.find(".trait-roll").click(this._onTraitRoll.bind(this));
    }

    super.activateListeners(html);
  }

  _onRingRoll(event) {
    let ringRank = event.currentTarget.dataset.ringRank;
    let ringName = event.currentTarget.dataset.ringName;
    let schoolRank = this.actor.system.insight.rank;

    Dice.RingRoll(
      {
        woundPenalty: this.actor.system.woundPenalty,
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
        woundPenalty: this.actor.system.woundPenalty,
        traitRank: traitRank,
        traitName: traitName,
        askForOptions: event.shiftKey
      }
    );
  }

  _onWeaponRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);

    let weaponName = item.name;
    let rollData = item.getRollData();
    let actorTrait;
    let diceRoll;
    let diceKeep;
    if (item.type == 'weapon') {
      actorTrait = this.actor.system.traits.str;
      diceRoll = parseInt(actorTrait) + parseInt(item.system.damageRoll);
    } else if (item.data.type == 'bow') {
      diceRoll = rollData.damageRoll;
      diceKeep = rollData.damageKeep;
    } else {
      return ui.notifications.error(`y u do dis?`);
    }


    diceKeep = parseInt(item.system.damageKeep)
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
    const item = this.actor.items.get(itemID);
    let skillTrait = item.system.trait;
    let actorTrait = null;
    // some skills use the void ring as a trait
    if (skillTrait == 'void') {
      actorTrait = this.actor.system.rings.void.rank;
    } else {
      actorTrait = this.actor.system.traits[skillTrait];
    }
    let skillRank = item.system.rank;
    let skillName = item.name;

    Dice.SkillRoll({
      woundPenalty: this.actor.system.woundPenalty,
      actorTrait: actorTrait,
      skillRank: skillRank,
      skillName: skillName,
      askForOptions: event.shiftKey
    });
  }


  _onItemRoll(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemId);

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
}