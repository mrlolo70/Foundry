export default class L5R4NpcSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions,{
      template: "systems/l5r4/templates/sheets/npc-sheet.hbs",
      classes: ["l5r4", "npc"]
    })
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.l5r4;
    //data.weapons = data.items.filter(function(item) {return item.type == "weapon"});
    //data.armor = data.items.filter(function(item) {return item.type == "armor"});
    return data;
  }
}