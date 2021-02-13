import { l5r4 } from "./module/config.js";
import L5R4ItemSheet from "./module/sheets/L5R4ItemSheet.js";

Hooks.once("init", function(){
    console.log("l5r4 | Initialising Legend of Five rings 4th ed system");

    CONFIG.l5r4 = l5r4;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("l5r4", L5R4ItemSheet, {makeDefault: true});
});