export default class L5R4ItemSheet extends ItemSheet {
    get template() {
        return `systems/l5r4/templates/sheets/${this.item.data.type}-sheet.html`;
    }
}