import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const MANIFEST = '.ai-toolkit/manifest.json';
const SKILL_TARGET = '.claude/skills/code-review/SKILL.md';
const RULES_TARGET = 'CLAUDE.md';
const BEGIN = '<!-- ai-toolkit:start -->';
const END = '<!-- ai-toolkit:end -->';

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const readIfExists = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
const loadManifest = (target) => {
  const data = readIfExists(target);
  return data === null ? null : JSON.parse(data);
};
function replaceBlock(existing, newText) {
  const a = existing.indexOf(BEGIN), b = existing.indexOf(END);
  if ((a < 0) !== (b < 0)) throw new Error('CLAUDE.md ma uszkodzone znaczniki ai-toolkit');
  if (a < 0) return `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}\n${BEGIN}\n${newText.trim()}\n${END}\n`;
  if (b < a) throw new Error('Nieprawidłowa kolejność znaczników ai-toolkit');
  return existing.slice(0, a) + `${BEGIN}\n${newText.trim()}\n${END}` + existing.slice(b + END.length);
}
function removeBlock(existing) {
  const a = existing.indexOf(BEGIN), b = existing.indexOf(END);
  if (a < 0 || b < a) throw new Error('Brak albo uszkodzone znaczniki ai-toolkit');
  const before = existing.slice(0, a).replace(/\n?$/, '');
  const after = existing.slice(b + END.length).replace(/^\n?/, '');
  return [before, after].filter(Boolean).join('\n').trimEnd();
}
export function installTo(projectDir = process.cwd()) {
  const manifestPath = path.join(projectDir, MANIFEST);
  const old = loadManifest(manifestPath);
  const skillPath = path.join(projectDir, SKILL_TARGET);
  const rulesPath = path.join(projectDir, RULES_TARGET);
  const skill = fs.readFileSync(path.join(packageRoot, 'skills/code-review/SKILL.md'), 'utf8');
  const rules = fs.readFileSync(path.join(packageRoot, 'rules/CLAUDE.md'), 'utf8');
  const currentSkill = readIfExists(skillPath);
  if (currentSkill !== null && currentSkill !== skill && (!old || sha256(currentSkill) !== old.skillSha256)) {
    throw new Error('Znaleziono zmodyfikowany albo niezarządzany skill. Nie nadpisuję go.');
  }
  const newRules = replaceBlock(readIfExists(rulesPath) ?? '', rules);
  // Operacje na plikach dopiero po przejściu walidacji.
  fs.mkdirSync(path.dirname(skillPath), { recursive: true });
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(skillPath, skill);
  fs.writeFileSync(rulesPath, newRules);
  fs.writeFileSync(manifestPath, JSON.stringify({managedBy:'ai-toolkit', skillPath:SKILL_TARGET, skillSha256:sha256(skill), rulesPath:RULES_TARGET}, null, 2)+'\n');
  return projectDir;
}
export function uninstallFrom(projectDir = process.cwd()) {
  const manifestPath = path.join(projectDir, MANIFEST);
  const manifest = loadManifest(manifestPath);
  if (!manifest || manifest.managedBy !== 'ai-toolkit' || manifest.skillPath !== SKILL_TARGET || manifest.rulesPath !== RULES_TARGET) {
    throw new Error('Brak poprawnego manifestu. Nie usuwam żadnych plików.');
  }
  const skillPath = path.join(projectDir, SKILL_TARGET);
  const rulesPath = path.join(projectDir, RULES_TARGET);
  const existingSkill = readIfExists(skillPath);
  if (existingSkill !== null && sha256(existingSkill) !== manifest.skillSha256) {
    throw new Error('Skill zmodyfikowano ręcznie, więc nie zostanie usunięty.');
  }
  const existingRules = readIfExists(rulesPath);
  if (existingRules === null) throw new Error('Brak CLAUDE.md, przerwano deinstalację.');
  const cleanRules = removeBlock(existingRules);
  if (existingSkill !== null) fs.unlinkSync(skillPath);
  if (cleanRules) fs.writeFileSync(rulesPath, cleanRules+'\n');
  else fs.unlinkSync(rulesPath);
  fs.unlinkSync(manifestPath);
  return projectDir;
}
