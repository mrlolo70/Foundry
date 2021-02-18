import { l5r4 } from "./module/config.js";
import L5R4ItemSheet from "./module/sheets/L5R4ItemSheet.js";
import L5R4IPcSheet from "./module/sheets/L5R4PcSheet.js";
import L5R4INpcSheet from "./module/sheets/L5R4NpcSheet.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/l5r4/templates/partials/pc-honor-and-combat.hbs",
    "systems/l5r4/templates/partials/armor-card.hbs",
    "systems/l5r4/templates/partials/weapon-card.hbs",
    "systems/l5r4/templates/partials/pc-wounds.hbs",
    "systems/l5r4/templates/partials/pc-stats.hbs",
    "systems/l5r4/templates/partials/pc-skills.hbs",
    "systems/l5r4/templates/partials/pc-weapons.hbs"
  ];

  return loadTemplates(templatePaths);
};

Hooks.once("init", function () {
  console.log("l5r4 | Initialising Legend of Five rings 4th ed system");

  CONFIG.l5r4 = l5r4;

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("l5r4", L5R4ItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("l5r4", L5R4IPcSheet, { makeDefault: true });
  Actors.registerSheet("l5r4", L5R4INpcSheet, { makeDefault: false });

  preloadHandlebarsTemplates();

  Handlebars.registerHelper("times", function (n, content) {
    let result = "";
    for (let i = 0; i < n; ++i) {
      content.data.index = i + 1;
      result += content.fn(i);
    }

    return result;
  });


  Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue
    }[operator];
  });
});