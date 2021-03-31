import { l5r4 } from "./module/config.js";
import L5R4Actor from "./module/L5R4Actor.js";
import L5R4Item from "./module/L5R4Item.js";
import L5R4ItemSheet from "./module/sheets/L5R4ItemSheet.js";
import L5R4IPcSheet from "./module/sheets/L5R4PcSheet.js";
import L5R4INpcSheet from "./module/sheets/L5R4NpcSheet.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/l5r4/templates/partials/pc-honor-and-combat.hbs",
    "systems/l5r4/templates/partials/armor-card.hbs",
    "systems/l5r4/templates/partials/weapon-card.hbs",
    "systems/l5r4/templates/partials/spell-card.hbs",
    "systems/l5r4/templates/partials/skill-card.hbs",
    "systems/l5r4/templates/partials/technique-card.hbs",
    "systems/l5r4/templates/partials/pc-wounds.hbs",
    "systems/l5r4/templates/partials/pc-stats.hbs",
    "systems/l5r4/templates/partials/pc-skills.hbs",
    "systems/l5r4/templates/partials/pc-equipment.hbs",
    "systems/l5r4/templates/partials/pc-spells-techniques.hbs",
    "systems/l5r4/templates/partials/pc-armors.hbs",
    "systems/l5r4/templates/partials/pc-armor-tn.hbs",
    "systems/l5r4/templates/partials/npc-skills.hbs",
    "systems/l5r4/templates/partials/npc-wounds.hbs",
    "systems/l5r4/templates/partials/npc-stats.hbs",
    "systems/l5r4/templates/partials/npc-rings.hbs",
    "systems/l5r4/templates/chat/simple-roll.hbs",
    "systems/l5r4/templates/chat/weapon-chat.hbs",
    "templates/dice/roll.html"
  ];

  return loadTemplates(templatePaths);
};

function registerSystemSettings() {
  game.settings.register("l5r4", "showTraitRollOptions", {
    config: true,
    scope: "client",
    name: "SETTINGS.showTraitRollOptions.name",
    hint: "SETTINGS.showTraitRollOptions.label",
    type: Boolean,
    default: true
  });
  game.settings.register("l5r4", "showSpellRollOptions", {
    config: true,
    scope: "client",
    name: "SETTINGS.showSpellRollOptions.name",
    hint: "SETTINGS.showSpellRollOptions.label",
    type: Boolean,
    default: true
  });
  game.settings.register("l5r4", "showSkillRollOptions", {
    config: true,
    scope: "client",
    name: "SETTINGS.showSkillRollOptions.name",
    hint: "SETTINGS.showSkillRollOptions.label",
    type: Boolean,
    default: true
  });
}

Hooks.once("init", function () {
  console.log("l5r4 | Initialising Legend of Five rings 4th ed system");

  CONFIG.l5r4 = l5r4;
  CONFIG.Item.entityClass = L5R4Item;
  CONFIG.Actor.entityClass = L5R4Actor;

  // custom initiative
  Combat.prototype._getInitiativeFormula = function(combatant) {
    const actor = combatant.actor;
    const initRoll = actor.data.data.initiative.roll;
    const initKeep = actor.data.data.initiative.keep;
    if (actor.data.type == "npc") {
      return `${initRoll}d10k${initKeep}x10`;
    }
    const initMod = actor.data.data.initiative.total_mod;

    return `${initRoll}d10k${initKeep}x10+${initMod}`;
  }

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("l5r4", L5R4ItemSheet, { makeDefault: true });


  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("l5r4", L5R4IPcSheet, { types: ["pc"], makeDefault: true });
  Actors.registerSheet("l5r4", L5R4INpcSheet, { types: ["npc"], makeDefault: true });

  preloadHandlebarsTemplates();

  registerSystemSettings();

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

  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

});

Hooks.on("preCreateActor", (createData) => {

  console.log("preCreateActor", "createData", createData);

  if (!createData.token) {
    if (createData.type === "pc") {
      console.log("preCreateActor", "createData:PC");
      mergeObject(createData,
        {
          "token.bar1": { "attribute": "wounds" },                  // Default Bar 1 to "hp"
          "token.bar2": { "attribute": "suffered" },
          "token.displayName": CONST.TOKEN_DISPLAY_MODES.ALWAYS,    // Default display name to be on always
          "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER ,    // Default display bars to be on always
          "token.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,   // Default disposition to friendly
          "token.name": createData.name                             // Set token name to actor name
        })
      // Default characters to HasVision = true and Link Data = true
      createData.token.vision = true;
      createData.token.actorLink = true;
    } else {
      // NPC settings
      console.log("preCreateActor", "createData:NPC");
      mergeObject(createData,
        {
          "token.bar1": { "attribute": "wounds" },                        // Default Bar 1 to hp
          "token.bar2": { "attribute": "suffered" },
          "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER ,          // Default display name to be on always for owner
          "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER ,          // Default display bars to be on always for owner
          "token.disposition": CONST.TOKEN_DISPOSITIONS.HOSTILE,          // Default disposition to hostile
          "token.name": createData.name                                   // Set token name to actor name
        })

    }
  }
})

