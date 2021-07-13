export default class L5R4Actor extends Actor {

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (this.data.type === "pc") { 
      // pc token settings
      this.data.token.update(
        {
          bar1: { "attribute": "wounds" },
          bar2: { "attribute": "suffered" },
          displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
          displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
          disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
          name: this.data.name,
          vision: true,
          actorLink: true,
        });
    } else {
      // npc token settings
      this.data.token.update(
        {
          bar1: { "attribute": "wounds" },
          bar2: { "attribute": "suffered" },
          displayName: CONST.TOKEN_DISPLAY_MODES.OWNER,
          displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
          disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
          name: this.data.name,
        });
    }

  }

  prepareData() {
    super.prepareData();

    let actorData = this.data;
    let data = actorData.data;

    // data for pcs
    if (actorData.type == "pc") {
      let skills = this.items.filter(function (item) { return item.type == "skill" });
      let armors = this.items.filter(function (item) { return item.type == "armor" });

      // calculate rings
      data.rings.air = Math.min(data.traits.ref, data.traits.awa);
      data.rings.earth = Math.min(data.traits.sta, data.traits.wil);
      data.rings.fire = Math.min(data.traits.agi, data.traits.int);
      data.rings.water = Math.min(data.traits.str, data.traits.per);

      // calculate initiative
      data.initiative.roll = parseInt(data.insight.rank) + parseInt(data.traits.ref) + parseInt(data.initiative.roll_mod);
      data.initiative.keep = data.traits.ref + data.initiative.keep_mod;

      // calculate wounds level values
      let previousLevel = 0;
      for (const [lvl, lvlData] of Object.entries(data.wound_lvl)) {
        if (lvl == "healthy") {
          lvlData.value = parseInt(data.rings.earth) * 5 + parseInt(data.woundsMod);
          previousLevel = parseInt(lvlData.value);
        } else {
          lvlData.value = parseInt(data.rings.earth) * 2 + previousLevel + parseInt(data.woundsMod);
          previousLevel = parseInt(lvlData.value);
        }
      }
      // calculate heal rate
      data.wounds.heal_rate = parseInt((data.traits.sta * 2)) + parseInt(data.insight.rank) + parseInt(data.wounds.mod);

      // calculate armor tn
      data.armor_tn.base = parseInt((data.traits.ref * 5)) + 5;
      data.armor_tn.bonus = 0;



      let armorData = {};
      let armorBonus = 0;
      armors.forEach(armor => {
        armorData = armor.getRollData();
        if (armorData.equiped) {
          if (parseInt(armorData.bonus) > armorBonus) {
            armorBonus = parseInt(armorData.bonus);
          }
        }
      });
      data.armor_tn.bonus = armorBonus;
      data.armor_tn.current = data.armor_tn.base + parseInt(data.armor_tn.mod) + data.armor_tn.bonus;


      // calculate current "hp"
      data.wounds.max = data.wound_lvl.out.value;
      data.wounds.value = parseInt(data.wounds.max) - parseInt(data.suffered);


      // calculate current would level
      let prev = { value: -1 };
      for (const [lvl, lvlData] of Object.entries(data.wound_lvl)) {
        if (data.suffered <= lvlData.value && data.suffered > prev.value) {
          lvlData.current = true;
        } else {
          lvlData.current = false;
        }
        prev = lvlData
      }

      // calculate insight points
      let insightRings = ((data.rings.air + data.rings.earth + data.rings.fire + data.rings.water + data.rings.void.rank) * 10);
      let insighSkills = 0;
      for (const [skill, skillData] of Object.entries(skills)) {
        insighSkills += parseInt(skillData.data.data.rank);
      }
      data.insight.points = insightRings + insighSkills;

    }

    if (actorData.type == "npc") {
      // calculate current "hp"
      data.wounds.value = parseInt(data.wounds.max) - parseInt(data.suffered);
      //console.log("nr wond levels before:", data.nrWoundLvls)
      // calculate nr of wound lvls
      let nrWoundLvls = parseInt(data.nrWoundLvls);

      //console.log("nr wond levels:", nrWoundLvls)
      data.woundLvlsUsed = Object.fromEntries(
        Object.entries(data.wound_lvl).slice(0, nrWoundLvls));

      // calculate current would level
      for (const [lvl, lvlData] of Object.entries(data.wound_lvl)) {
        if (data.suffered >= lvlData.value) {
          lvlData.current = true;
        } else {
          lvlData.current = false;
        }
      }

    }
  }
}