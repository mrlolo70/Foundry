export async function GetWeaponOptions() {
  const template = "systems/l5r4/templates/chat/create-weapon-dialog.hbs"
  const html = await renderTemplate(template, {});

  return new Promise(resolve => {
    const data = {
      title: game.i18n.localize("l5r4.sheet.addWeapon"),
      content: html,
      buttons: {
        ok: {
          label: game.i18n.localize("l5r4.mech.ok"),
          callback: html => resolve(_processWeaponOptions(html[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("l5r4.mech.cancel"),
          callback: html => resolve({ cancelled: true })
        }
      },
      default: "ok",
      close: () => resolve({ cancelled: true })
    };

    new Dialog(data, null).render(true);
  });
}

function _processWeaponOptions(form) {
  return {
    name: form.weaponName.value,
    type: form.weaponType.value
  }
}