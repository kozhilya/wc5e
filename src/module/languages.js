function initLang(name, font, isStandard = true, rng = 'default') {
  const key = name.replace(/\W/g, '').toLowerCase();
  const label = 'WC5E.Languages.' + key;
  return {
    key,
    isStandard,
    dnd: label,
    polyglot: { label, font, rng }
  };
}

export const LANG_SCRIPTS = {
  common: 'Thorass',
  darnassian: 'Thassilonian',
  eredic: 'Elthrin',
  dwarvish: 'Dethek',
  mogu: 'Oriental',
  taurahe: 'Barazhad',
  zandali: 'Daedra',
  celestial: 'Celestial',
  draconic: 'Ar Ciela',
  kalimag: 'Olde Thorass',
  other: 'Espruar',
}

export const LANGUAGES = [
  initLang('Common', LANG_SCRIPTS.common),
  initLang('Darnassian', LANG_SCRIPTS.darnassian),
  initLang('Draenei', LANG_SCRIPTS.eredic),
  initLang('Dwarven', LANG_SCRIPTS.dwarvish),
  initLang('Goblin', LANG_SCRIPTS.common),
  initLang('Gnomish', LANG_SCRIPTS.common),
  initLang('Gutterspeak', LANG_SCRIPTS.other),
  initLang('Mogu', LANG_SCRIPTS.mogu),
  initLang('Orcish', LANG_SCRIPTS.common),
  initLang('Shalassian', LANG_SCRIPTS.darnassian),
  initLang('Taur-ahe', LANG_SCRIPTS.taurahe),
  initLang('Thalassian', LANG_SCRIPTS.darnassian),
  initLang('Zandali', LANG_SCRIPTS.zandali),

  initLang('Celestial', LANG_SCRIPTS.celestial, false),
  initLang('Draconic', LANG_SCRIPTS.draconic, false),
  initLang('Eredun', LANG_SCRIPTS.eredic, false),
  initLang('Giant', LANG_SCRIPTS.other, false),
  initLang('Kalimag', LANG_SCRIPTS.kalimag, false),
  initLang('Low Common', LANG_SCRIPTS.common, false),
];

export function dndLanguageSetup() {
  delete CONFIG.DND5E.languages.druidic;
  delete CONFIG.DND5E.languages.cant;
  for (const key in CONFIG.DND5E.languages.standard.children) {
    delete CONFIG.DND5E.languages.standard.children[key];
  }
  for (const key in CONFIG.DND5E.languages.exotic.children) {
    delete CONFIG.DND5E.languages.exotic.children[key];
  }

  for (const lang of LANGUAGES) {
    CONFIG.DND5E.languages[lang.isStandard ? 'standard' : 'exotic'].children[lang.key] = game.i18n.localize(lang.dnd);
  }
}

export function polyglotSetup(LanguageProvider) {
  class WC5ELanguageProvider extends LanguageProvider {
    languages = {};

    async getLanguages() {
      const langs = {};

      for (const lang of LANGUAGES) {
        lang.polyglot.label = game.i18n.localize(lang.polyglot.label);
        langs[lang.key] = lang.polyglot;
      }

      this.languages = langs;
    }

    getUserLanguages(actor) {
      let known_languages = new Set();
      let literate_languages = new Set();
      for (let lang of actor.system.attributes.languages.value) {
        known_languages.add(lang);
      }
      return [known_languages, literate_languages];
    }
  }

  game.polyglot.api.registerModule('wc5e', WC5ELanguageProvider);
}
