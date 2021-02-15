export default class L5R4ItemSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions,{
      template: "systems/l5r4/templates/sheets/pc-sheet.hbs",
      classes: ["l5r4"]
    })
  }
}