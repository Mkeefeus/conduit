const prompt = require('prompt');
const fs = require('fs');

const EXCLUDED_FOLDERS = ['node_modules', '.git', '.vscode', 'macros'];

const FOLDERS = fs
  .readdirSync('./')
  .filter((file) => fs.lstatSync(file).isDirectory() && !EXCLUDED_FOLDERS.includes(file));

const getSort = (folder) => {
  switch (folder) {
    case 'subclass':
      return (a, b) => {
        return a.className.localeCompare(b.className) || a.name.localeCompare(b.name);
      };
    case 'subclassFeature':
      return (a, b) => {
        return (
          a.className.localeCompare(b.className) ||
          a.subclassShortName.localeCompare(b.subclassShortName) ||
          a.level - b.level
        );
      };
    case 'classFeature':
      return (a, b) => {
        return a.className.localeCompare(b.className) || a.level - b.level;
      };
    default:
      return (a, b) => {
        return a.name.localeCompare(b.name);
      };
  }
};

prompt.start();

prompt.get(
  {
    properties: {
      version: {
        description: 'Enter new version number',
        type: 'string',
        pattern: /^\d+\.\d+\.\d+$/,
        message: 'Version must be in the format x.y.z where x, y, and z are numbers',
        required: true,
      },
    },
  },
  (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const version = result.version;
    const newJson = {
      $schema: 'https://raw.githubusercontent.com/TheGiddyLimit/5etools-utils/master/schema/brew-fast/homebrew.json',
    };
    const time = Date.now();
    const _meta = {
      sources: [
        {
          json: 'TCP',
          abbreviation: 'TCP',
          full: 'The Conduit Package',
          authors: ['Malcolm Keefe', 'Scott', 'Ril'],
          convertedBy: ['Malcolm Keefe'],
          dateReleased: new Date(time).toISOString().split('T')[0],
          version: version,
          color: '0bdbe2',
        },
      ],
      edition: 'classic',
      dateAdded: 1737935647,
      dateLastModified: Math.round(time / 1000),
      status: 'wip',
      optionalFeatureTypes: {
        'FS:C': 'Fighting Style: Conduit',
        'E:BW': 'Emblem: Branded Warrior',
      },
    };
    newJson['_meta'] = _meta;
    FOLDERS.forEach((folder) => {
      newJson[folder] = newJson[folder] || [];
      const jsonFiles = fs.readdirSync(`./${folder}`, { recursive: true }).filter((file) => file.endsWith('.json'));
      jsonFiles.forEach((file) => {
        const fileContent = fs.readFileSync(`./${folder}/${file}`);
        const obj = JSON.parse(fileContent);
        newJson[folder].push(obj);
      });
      newJson[folder].sort(getSort(folder));
    });
    const newJsonContent = JSON.stringify(newJson, null, 4);
    fs.writeFile('./TCP.json', newJsonContent, (err) => {
      if (err) {
        console.error(`Error writing file TCP.json: ${err}`);
      } else {
        console.log(`File TCP.json created successfully.`);
      }
    });
  }
);
