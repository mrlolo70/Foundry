import { l5r4 } from "./module/config.js";
import L5R4Actor from "./module/L5R4Actor.js";
import L5R4Item from "./module/L5R4Item.js";
import L5R4ItemSheet from "./module/sheets/L5R4ItemSheet.js";
import L5R4IPcSheet from "./module/sheets/L5R4PcSheet.js";
import L5R4INpcSheet from "./module/sheets/L5R4NpcSheet.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/l5r4/templates/partials/pc-honor-and-combat.hbs",
    "systems/l5r4/templates/partials/commonItem-card.hbs",
    "systems/l5r4/templates/partials/armor-card.hbs",
    "systems/l5r4/templates/partials/weapon-card.hbs",
    "systems/l5r4/templates/partials/spell-card.hbs",
    "systems/l5r4/templates/partials/skill-card.hbs",
    "systems/l5r4/templates/partials/technique-card.hbs",
    "systems/l5r4/templates/partials/advantage-card.hbs",
    "systems/l5r4/templates/partials/disadvantage-card.hbs",
    "systems/l5r4/templates/partials/kata-card.hbs",
    "systems/l5r4/templates/partials/kiho-card.hbs",
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
  CONFIG.Item.documentClass = L5R4Item;
  CONFIG.Actor.documentClass = L5R4Actor;

  // custom initiative
  Combatant.prototype._getInitiativeFormula = function() {
    const actor = this.actor;
    const initRoll = actor.system.initiative.roll;
    const initKeep = actor.system.initiative.keep;
    if (actor.type == "npc") {
      return `${initRoll}d10k${initKeep}x10`;
    }
    const initMod = actor.system.initiative.total_mod;

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

/**
 * Drag and drop of characters, items and journals entry on the hot bar
 */
Hooks.on('hotbarDrop', async (bar, data, slot) => {

	const elementsTypes = {
		'Actor' : {
			'collection' : 'actors',
			'defaultImg' : "icons/svg/cowled.svg"
		},
		'Item' : {
			'collection' : 'items',
			'defaultImg' : "icons/svg/coins.svg"
		},
		'JournalEntry' : {
			'collection' : 'journal',
			'defaultImg' : "icons/svg/book.svg"
		}
	};

	// With the workaround, some elements dont have their type set
	if(!elementsTypes[data.type]) {
		for(let type in elementsTypes)
			if(game[elementsTypes[type].collection].get(data.id))
				data.type = type;
		if(!elementsTypes[data.type])
			return;
	}

	const collection = elementsTypes[data.type].collection;
	const defaultImg = elementsTypes[data.type].defaultImg;

	const command = `
		(function () {
			const element = game.${collection}.get('${data.id}');
			if (element?.sheet.rendered) {
				element.sheet.close();
			} else {
				element.sheet.render(true);
			}
		})();
	`.trim();
	const element = game[collection].get(data.id);
	const name = element.name;
	const img = element.img ? element.img : defaultImg;

	let macro = game.macros.find(macro => {
		let found = macro.data.name === name && macro.data.command === command
		return found;
	});

	if (!macro) {
		macro = await Macro.create({
			name: name,
			type: 'script',
			img: img,
			command: command
		}, {renderSheet: false});
	}

	game.user.assignHotbarMacro(macro, slot);
	return false;
});

/**
 * Work around to enable drag&drop of the journal entries for the non GM/Assistant player
 */
Hooks.on('renderJournalDirectory', async (journalDirectory, html, data) => {
	const role = game.users.get(game.userId).role
	if(role == CONST.USER_ROLES.ASSISTANT || role == CONST.USER_ROLES.GAMEMASTER)
		return;

	const journalElements = html.find('li.journal.flexrow');
	journalElements.each((index, element) => {
		const journalId = element.dataset.documentId;
		if(!journalId)
			return;
		element.draggable = true;
		element.ondragstart = journalDirectory._onDragStart;
	});
});

/**
 * Work around to enable drag&drop of the actors for user that dont have the right to create tokens
 */
Hooks.on('renderActorDirectory', async (actorDirectory, html, data) => {
	if(TokenDocument.canUserCreate(game.user))
		return;

	const actorElements = html.find('li.actor.flexrow');
	actorElements.each((index, element) => {
		const actorId = element.dataset.documentId;
		if(!actorId)
			return;
		element.draggable = true;
		element.ondragstart = actorDirectory._onDragStart;
	});
});
