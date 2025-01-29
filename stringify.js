import { readdir } from 'node:fs/promises';
const files = await readdir('./macros/js');
files.forEach(async (file) => {
  const fileData = Bun.file('./macros/js/' + file);
  if (!fileData) return;
  const fileText = await fileData.text();
  const txtFileName = file.replace('.js', '.txt');
  await Bun.write('./macros/txt/' + txtFileName, JSON.stringify(fileText));
});
