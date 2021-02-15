import { l5r4 } from "./module/config.js";
import L5R4ItemSheet from "./module/sheets/L5R4ItemSheet.js";
import L5R4IPcSheet from "./module/sheets/L5R4PcSheet.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
      "systems/l5r4/templates/partials/pc-honor-and-combat.hbs",
  ];
};

Hooks.once("init", function(){
  console.log("l5r4 | Initialising Legend of Five rings 4th ed system");

  CONFIG.l5r4 = l5r4;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("l5r4", L5R4ItemSheet, {makeDefault: true});

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("l5r4", L5R4IPcSheet, {makeDefault: true});

  preloadHandlebarsTemplates();
});