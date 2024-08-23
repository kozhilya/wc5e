import { readdirSync, statSync, copyFileSync, rmSync, mkdirSync, existsSync } from 'fs';

const sourceDir = 'D:\\BattleNet\\World of Warcraft\\_retail_\\BlizzardInterfaceArt\\Interface\\ICONS';
const targetDir = 'G:\\BlizzardIcons';
const MIN_GROUP = 5;
const EXT = '.blp';
const SEP = '_';

function buildFileMap() {
  function populate(obj, first, ...parts) {
    if (!(first in obj)) {
      obj[first] = {};
    }

    if (parts.length > 0) {
      obj[first] = populate(obj[first], ...parts);
    }

    return obj;
  }

  const files = readdirSync(sourceDir);
  let fileMap = {};
  let i = 0;

  for (const file of files) {
    const fullPath = sourceDir + '\\' + file;
    if (statSync(fullPath).isDirectory() || !file.endsWith(EXT)) continue;

    const fileName = file.toLowerCase().split(EXT)[0];
    const parts = fileName.split(SEP);

    fileMap = populate(fileMap, ... parts);
  }

  return fileMap;
}

function flattenStructure(structure, prefix = '') {
  let result = [];

  for (const file of structure.files) {
    result.push(prefix + file);
  }

  for (const folder of Object.keys(structure.folders)) {
    result = [...result, ...flattenStructure(structure.folders[folder], prefix + folder + SEP)];
  }

  return result;
}

function reduceFileMap(root, path = []) {
  if (Object.keys(root).length === 0) {
    return null;
  }

  let structure = {files: [], folders: {}, size:0};

  for (const key of Object.keys(root)) {
    const result = reduceFileMap(root[key], [ ...path, key ]);

    if (result === null) {
      structure.files.push(key);
      structure.size++;
    }
    else if (result.size < MIN_GROUP) {
      structure.files = [
        ...structure.files,
        ...flattenStructure(result, key + SEP)
      ];
      structure.size += result.size;
    }
    else {
      structure.folders[key] = result;
      structure.size += result.size;
    }
  }


  return structure;
}

function dumpStructure(root, depth = 0) {
  const p = '    '.repeat(depth);
  for (const folder of Object.keys(root.folders)) {
    console.log(`${p}[${folder}]{${root.folders[folder].size}}`);
    dumpStructure(root.folders[folder], depth + 1);
  }
  for (const file of root.files) {
    console.log(`${p}${file}`);
  }
}

function findFile(name, structure) {
  const parts = name.toLowerCase().split(SEP);

  let path = '';
  let current = structure;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part in current.folders) {

      path += part + '\\';
      current = current.folders[part];

      continue;
    }

    return path + parts.slice(i).join(SEP) + EXT;
  }

  return path + parts[parts.length - 1] + EXT;
}

function resetStructure(structure) {
  function mkStrucutre(current, prefix = '') {
    for (const folder of Object.keys(current.folders)) {
      const path = prefix + '\\' + folder;
      if (!existsSync(path)) {
        console.log('mkdir', path);
        mkdirSync(path);
      }
      mkStrucutre(current.folders[folder], path);
    }
  }

  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir);
  mkStrucutre(structure, targetDir);
}

function performCopy(structure) {
  const files = readdirSync(sourceDir);
  let i = 0;

  for (const file of files) {
    const fullPath = sourceDir + '\\' + file;
    if (statSync(fullPath).isDirectory() || !file.endsWith(EXT)) continue;

    const fileName = file.toLowerCase().split(EXT)[0];

    const targetSuffix = findFile(fileName, structure);

    console.log(file, '->', targetSuffix);

    copyFileSync(fullPath, targetDir + '\\' + targetSuffix);
  }
}

async function process() {
  const fileMap = buildFileMap();

  const fileStructure = reduceFileMap(fileMap);

  // dumpStructure(fileStructure);
  resetStructure(fileStructure);
  performCopy(fileStructure);
}

process();
