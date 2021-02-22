export default class L5R4ItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 340,
      classes: ["l5r4", "sheet", "item"]
    });
  }

  get template() {
    return `systems/l5r4/templates/sheets/${this.item.data.type}-sheet.hbs`;
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.l5r4;


    return data;
  }
}