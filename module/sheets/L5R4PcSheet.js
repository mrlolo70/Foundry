export default class L5R4PcSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions,{
      template: "systems/l5r4/templates/sheets/pc-sheet.hbs",
      classes: ["l5r4", "pc"]
    })
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.l5r4;
    
    data.weapons = data.items.filter(function(item) {return item.type == "weapon"});
    data.armor = data.items.filter(function(item) {return item.type == "armor"});
    data.skill = data.items.filter(function(item) {return item.type == "skill"});

    data.data.initiative.roll = parseInt(data.data.traits.ref + data.data.insight.rank);
    data.data.initiative.keep = data.data.traits.ref;

    return data;
  }

  activateListeners(html){
    //html.find(cssSelector).event(this._someCallBack.bind(this)); template

    html.find(".item-create").click(this._onItemCreate.bind(this));

    super.activateListeners(html);
  }

  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: game.i18n.localize("l5r4.sheet.addSkill"),
      type: element.dataset.type
    }

    return this.actor.createOwnedItem(itemData);
  }

}