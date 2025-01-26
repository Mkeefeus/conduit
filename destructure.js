const data = require('./TCP.json');
const fs = require('fs');

//https://wiki.tercept.net/en/Homebrew/TableOfReference

const TOP_FOLDERS = Object.keys(data).filter((key) => key !== '_meta' && key !== '$schema');

const SPELL_SCHOOLS = {
  A: 'Abjuration',
  C: 'Conjuration',
  D: 'Divination',
  E: 'Enchantment',
  I: 'Illusion',
  N: 'Necromancy',
  T: 'Transmutation',
  V: 'Evocation',
};

const ITEM_TYPES = {
  A: 'Ammunition',
  AF: 'Ammunition (futuristic)',
  AT: 'Artisan Tool',
  EM: 'Eldritch Machine',
  EXP: 'Explosive',
  G: 'Adventuring Gear',
  GS: 'Gaming Set',
  LA: 'Light Armor',
  INS: 'Instrument',
  M: 'Melee Weapon',
  MA: 'Medium Armor',
  MNT: 'Mount',
  GV: 'Generic Variant',
  P: 'Potion',
  R: 'Ranged Weapon',
  RD: 'Rod',
  RG: 'Ring',
  S: 'Shield',
  SC: 'Scroll',
  SCF: 'Spellcasting Focus',
  OTH: 'Other',
  T: 'Tool',
  TAH: 'Tack and Harness',
  TG: 'Trade Good',
  $: 'Treasure',
  VEH: 'Vehicle (land)',
  SHP: 'Vehicle (water)',
  AIR: 'Vehicle (air)',
  WD: 'Wand',
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[<>:"\/\\|?*]/g, '');
};

const writeToFile = (fileName, obj) => {
  const path = fileName.split('/');
  const sanitizedFileName = sanitizeFileName(path.pop());
  const sanitizedPath = path.join('/');
  const fileContent = JSON.stringify(obj, null, 4);

  fs.writeFile(`${sanitizedPath}/${sanitizedFileName}`, fileContent, (err) => {
    if (err) {
      console.log(`Error writing file ${sanitizedFileName}: ${err}`);
    }
  });
};

TOP_FOLDERS.forEach((key) => {
  fs.existsSync(`./${key}`) || fs.mkdirSync(`./${key}`);
  data[key].forEach((obj) => {
    let filepath;
    switch (key) {
      case 'reward':
        fs.existsSync(`./reward/${obj.type}`) || fs.mkdirSync(`./reward/${obj.type}`);
        filepath = `./reward/${obj.type}/${obj.name}.json`;
        break;

      case 'item':
        const type = ITEM_TYPES[obj.type] || 'Undefined';
        fs.existsSync(`./item/${type}`) || fs.mkdirSync(`./item/${type}`);
        filepath = `./item/${type}/${obj.name}.json`;
        break;

      case 'spell':
        fs.existsSync(`./spell/${obj.level}`) || fs.mkdirSync(`./spell/${obj.level}`);
        const school = SPELL_SCHOOLS[obj.school] || 'Other';
        fs.existsSync(`./spell/${obj.level}/${school}`) || fs.mkdirSync(`./spell/${obj.level}/${school}`);
        filepath = `./spell/${obj.level}/${school}/${obj.name}.json`;
        break;

      case 'subrace':
        fs.existsSync(`./subrace/${obj.raceName}`) || fs.mkdirSync(`./subrace/${obj.raceName}`);
        filepath = `./subrace/${obj.raceName}/${obj.name}.json`;
        break;

      case 'subclass':
        fs.existsSync(`./subclass/${obj.className}`) || fs.mkdirSync(`./subclass/${obj.className}`);
        filepath = `./subclass/${obj.className}/${obj.name}.json`;
        break;

      case 'subclassFeature':
        fs.existsSync(`./subclassFeature/${obj.subclassShortName}`) ||
          fs.mkdirSync(`./subclassFeature/${obj.subclassShortName}`);
        filepath = `./subclassFeature/${obj.subclassShortName}/${obj.level}. ${obj.name}.json`;
        break;
      case 'classFeature':
        fs.existsSync(`./classFeature/${obj.className}`) || fs.mkdirSync(`./classFeature/${obj.className}`);
        filepath = `./classFeature/${obj.className}/${obj.level}. ${obj.name}.json`;
        break;
      default:
        filepath = `./${key}/${obj.name}.json`;
        break;
    }
    writeToFile(filepath, obj);
  });
});
