import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function readJSON(relativeFilePath) {
  const filePath = fileURLToPath(import.meta.url);
  const resolvedPath = path.resolve(path.dirname(filePath), relativeFilePath);
  const json = JSON.parse(await fs.readFileSync(resolvedPath, 'utf-8'));
  return json;
}