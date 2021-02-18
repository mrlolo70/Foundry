export default class L5R4PcSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions,{
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
    
    data.weapons = data.items.filter(function(item) {return item.type == "weapon"});
    data.armors = data.items.filter(function(item) {return item.type == "armor"});
    data.skills = data.items.filter(function(item) {return item.type == "skill"});

    data.data.initiative.roll = parseInt(data.data.traits.ref + data.data.insight.rank);
    data.data.initiative.keep = data.data.traits.ref;

    return data;
  }

  activateListeners(html){
    //TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this)); 

    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".inline-edit").change(this._onSkillEdit.bind(this));

    new ContextMenu(html, ".armor-card", this.itemContextMenu);
    new ContextMenu(html, ".weapon-card", this.itemContextMenu);

    super.activateListeners(html);
  }

  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: game.i18n.localize("l5r4.sheet.new"),
      type: element.dataset.type
    }

    return this.actor.createOwnedItem(itemData);
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

    return item.update({ [field]: element.value})
  }

}