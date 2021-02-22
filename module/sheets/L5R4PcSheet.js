import * as Dice from "../dice.js";

export default class L5R4PcSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/l5r4/templates/sheets/pc-sheet.hbs",
      classes: ["l5r4", "pc"]
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
      name: game.i18n.localize("l5r4.sheet.delete"),
      icon: '<i class="fas fa-trash"></i>',
      callback: element => {
        this.actor.deleteOwnedItem(element.data("item-id"));
      }
    }
  ];

  getData() {
    const data = super.getData();
    data.config = CONFIG.l5r4;

    data.weapons = data.items.filter(function (item) { return item.type == "weapon" });
    data.armors = data.items.filter(function (item) { return item.type == "armor" });
    data.skills = data.items.filter(function (item) { return item.type == "skill" });
    data.spells = data.items.filter(function (item) { return item.type == "spell" });
    data.bows = data.items.filter(function (item) { return item.type == "bow" });

    return data;
  }

  activateListeners(html) {
    //TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this)); 

    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".inline-edit").change(this._onSkillEdit.bind(this));

    new ContextMenu(html, ".armor-card", this.itemContextMenu);
    new ContextMenu(html, ".weapon-card", this.itemContextMenu);
    new ContextMenu(html, ".spell-card", this.itemContextMenu);

    if (this.actor.owner) {
      html.find(".item-roll").click(this._onItemRoll.bind(this));
      html.find(".weapon-roll").click(this._onWeaponRoll.bind(this));
      html.find(".skill-check").click(this._onSkillCheck.bind(this));
      html.find(".ring-roll").click(this._onRingRoll.bind(this));
      html.find(".trait-roll").click(this._onTraitRoll.bind(this));
    }

    super.activateListeners(html);
  }

  _onRingRoll(event) {
    let ringRank = event.currentTarget.dataset.ringRank;
    let ringName = event.currentTarget.dataset.ringName;

    Dice.RingRoll(
      {
        ringRank: ringRank,
        ringName: ringName
      }
    );
  }

  _onTraitRoll(event) {
    let traitRank = event.currentTarget.dataset.traitRank;
    let traitName = event.currentTarget.dataset.traitName;

    Dice.TraitRoll(
      {
        traitRank: traitRank,
        traitName: traitName
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
        description: rollData.description
      }
    )

  }

  _onSkillCheck(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemID);
    let skillTrait = item.data.data.trait;
    let actorTrait = this.actor.data.data.traits[skillTrait];
    let skillRank = item.data.data.rank;
    let skillName = item.name;

    Dice.SkillCheck({
      actorTrait: actorTrait,
      skillRank: skillRank,
      skillName: skillName
    });
  }


  _onItemRoll(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    let item = this.actor.getOwnedItem(itemId);

    item.roll();
  }

  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let elementType = element.dataset.type;

    if (elementType == "weapon") {
      let createWeapon = `<form autocomplete="off">
        <div class="form-group">
            <label> Name</label>
            <div class="form-fields">
                <input id="name" type="text" name="name" placeholder="New Item">
            </div>
        </div>
    
        <div class="form-group">
            <label>Type</label>
            <div class="form-fields">
                <select id="type" name="type">
                    <option value="weapon" selected="">weapon</option><option value="bow">bow</option>
                </select>
            </div>
        </div>
    
    </form>`;

      let confirmed = false;
      new Dialog({
        title: `New Weapon`,
        content: createWeapon,
        buttons: {
          ok: { label: "ok", callback: () => confirmed = true },
          cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
          if (confirmed) {
            let weponType = html.find('#type').val();
            let weaponName = html.find('#name').val();
            
            let itemData = {
              name: weaponName,
              type: weponType
            }
            console.log(itemData)
            return this.actor.createOwnedItem(itemData);
          }
        }
      }).render(true);
    } else {
      let itemData = {
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

  _onSkillEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest(".item").dataset.itemId;
    let item = this.actor.getOwnedItem(itemId);
    let field = element.dataset.field;

    return item.update({ [field]: element.value })
  }

}