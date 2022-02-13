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
        this.actor.deleteEmbeddedDocuments("Item",[element.data("item-id")]);
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
    const baseData = {
      ...super.getData(),
      items: this.actor.items.map(item => item.data)
    };
    let sheetData = {
      owner: this.actor.isOwner,
      editable: this.actor.isEditable,
      actor: baseData.actor,
      data: baseData.actor.data.data,
      config: CONFIG.l5r4,
      items: baseData.items
    }

    sheetData.commonItems = sheetData.items.filter(function (item) { return item.type == "commonItem" });
    sheetData.weapons = sheetData.items.filter(function (item) { return item.type == "weapon" });
    sheetData.bows = sheetData.items.filter(function (item) { return item.type == "bow" });
    sheetData.armors = sheetData.items.filter(function (item) { return item.type == "armor" });
    sheetData.skills = sheetData.items.filter(function (item) { return item.type == "skill" });
    sheetData.techniques = sheetData.items.filter(function (item) { return item.type == "technique" });
    sheetData.advantages = sheetData.items.filter(function (item) { return item.type == "advantage" });
    sheetData.disadvantages = sheetData.items.filter(function (item) { return item.type == "disadvantage" });
    sheetData.spells = sheetData.items.filter(function (item) { return item.type == "spell" });
    sheetData.katas = sheetData.items.filter(function (item) { return item.type == "kata" });
    sheetData.kihos = sheetData.items.filter(function (item) { return item.type == "kiho" });

    return sheetData;
  }

  activateListeners(html) {
    //TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this)); 

    // only owners should edit and add things
    if (this.actor.isOwner) {
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".item-edit").click(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html.find(".inline-edit").change(this._onInlineItemEdit.bind(this));

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
    const item = this.actor.items.get(itemID);

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
    const item = this.actor.items.get(itemID);
    let skillTrait = item.data.data.trait;
    let actorTrait = null;
    // some skills use the void ring as a trait
    if (skillTrait == 'void') {
      actorTrait = this.actor.data.data.rings.void.rank;
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