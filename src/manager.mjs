import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const MANIFEST = '.ai-toolkit/manifest.json';
const SKILL_SOURCE = 'skills/code-review/SKILL.md';
const RULES_SOURCE = 'rules/CLAUDE.md';

// Both tools receive the same upstream skill content.
const SKILL_PATHS = [
  '.claude/skills/code-review/SKILL.md',
  '.github/skills/code-review/SKILL.md',
];
const RULES_PATHS = [
  'CLAUDE.md',
  '.github/copilot-instructions.md',
];
const BEGIN = '<!-- ai-toolkit:start -->';
const END = '<!-- ai-toolkit:end -->';
const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const resolve = (projectDir, relativePath) => path.join(projectDir, relativePath);
const readIfExists = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;

function loadManifest(file) {
  const text = readIfExists(file);
  if (text === null) return null;
  try {
    const manifest = JSON.parse(text);
    if (manifest.managedBy !== 'ai-toolkit') throw new Error('inny właściciel');
    if (manifest.schemaVersion === 2) {
      const skillPaths = manifest.skills?.map(({ path }) => path);
      const rulesPaths = manifest.rules?.map(({ path }) => path);
      if (JSON.stringify(skillPaths) !== JSON.stringify(SKILL_PATHS) ||
          JSON.stringify(rulesPaths) !== JSON.stringify(RULES_PATHS) ||
          manifest.skills.some(({ sha256: digest }) => typeof digest !== 'string') ||
          manifest.rules.some(({ sha256: digest }) => typeof digest !== 'string')) {
        throw new Error('niezgodne ścieżki lub sumy kontrolne');
      }
      return manifest;
    }
    // Manifest from 0.1.0: treat as managed Claude Code-only installation.
    if (manifest.skillPath === SKILL_PATHS[0] &&
        manifest.rulesPath === RULES_PATHS[0] &&
        typeof manifest.skillSha256 === 'string') {
      return {
        managedBy: 'ai-toolkit',
        schemaVersion: 1,
        skills: [{ path: SKILL_PATHS[0], sha256: manifest.skillSha256 }],
        rules: [{ path: RULES_PATHS[0], sha256: null }],
      };
    }
    throw new Error('nieznany format');
  } catch (error) {
    throw new Error(`Nieprawidłowy manifest ai-toolkit: ${error.message}`);
  }
}

function getManagedHash(manifest, key, relativePath) {
  return manifest?.[key]?.find((entry) => entry.path === relativePath)?.sha256 ?? null;
}

function locateBlock(text, relativePath) {
  const count = (marker) => text.split(marker).length - 1;
  if (count(BEGIN) !== count(END) || count(BEGIN) > 1) {
    throw new Error(`Uszkodzone lub zdublowane znaczniki ai-toolkit w ${relativePath}`);
  }
  if (count(BEGIN) === 0) return null;
  const a = text.indexOf(BEGIN);
  const b = text.indexOf(END);
  if (b < a) throw new Error(`Nieprawidłowa kolejność znaczników w ${relativePath}`);
  return { start: a, end: b + END.length, content: text.slice(a + BEGIN.length, b).trim() };
}

function appendBlock(current, rules) {
  const prefix = current && !current.endsWith('\n') ? '\n' : '';
  const separator = current ? '\n' : '';
  return `${current}${prefix}${separator}${BEGIN}\n${rules.trim()}\n${END}\n`;
}

function replaceBlock(current, found, rules) {
  if (!found) return appendBlock(current, rules);
  return `${current.slice(0, found.start)}${BEGIN}\n${rules.trim()}\n${END}${current.slice(found.end)}`;
}

function removeBlock(current, found) {
  const before = current.slice(0, found.start);
  const after = current.slice(found.end);
  const result = `${before}${after.replace(/^\n/, '')}`;
  return result.trim() ? result.replace(/\n+$/, '\n') : '';
}

function validateSkill(current, desired, knownHash, relativePath) {
  if (current === null || current === desired) return;
  if (knownHash === null || sha256(current) !== knownHash) {
    throw new Error(`Zmodyfikowany lub niezarządzany skill w ${relativePath}. Nie nadpisuję.`);
  }
}

function validateRules(current, desired, knownHash, relativePath) {
  const block = locateBlock(current ?? '', relativePath);
  if (!block) return null;
  const currentHash = sha256(block.content);
  if (knownHash === null && block.content !== desired.trim()) {
    // Includes safe handling of old (v0.1.0) manifest without rule digest.
    throw new Error(`Niezarządzane lub ręcznie zmodyfikowane reguły w ${relativePath}. Nie nadpisuję.`);
  }
  if (knownHash !== null && currentHash !== knownHash) {
    throw new Error(`Zmodyfikowane reguły w ${relativePath}. Nie nadpisuję.`);
  }
  return block;
}

export function installTo(projectDir = process.cwd()) {
  const manifestPath = resolve(projectDir, MANIFEST);
  const old = loadManifest(manifestPath);
  const skill = fs.readFileSync(resolve(packageRoot, SKILL_SOURCE), 'utf8');
  const rules = fs.readFileSync(resolve(packageRoot, RULES_SOURCE), 'utf8');
  const skillFiles = SKILL_PATHS.map((relativePath) => {
    const absolutePath = resolve(projectDir, relativePath);
    validateSkill(readIfExists(absolutePath), skill, getManagedHash(old, 'skills', relativePath), relativePath);
    return { path: relativePath, absolutePath, sha256: sha256(skill) };
  });
  const ruleFiles = RULES_PATHS.map((relativePath) => {
    const absolutePath = resolve(projectDir, relativePath);
    const current = readIfExists(absolutePath) ?? '';
    const block = validateRules(current, rules, getManagedHash(old, 'rules', relativePath), relativePath);
    return { path: relativePath, absolutePath, content: replaceBlock(current, block, rules), sha256: sha256(rules.trim()) };
  });

  // No changes are made until *all* target files pass the safety checks.
  for (const file of [...skillFiles, ...ruleFiles]) {
    fs.mkdirSync(path.dirname(file.absolutePath), { recursive: true });
    fs.writeFileSync(file.absolutePath, file.content ?? skill);
  }
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify({
    managedBy: 'ai-toolkit', schemaVersion: 2,
    skills: skillFiles.map(({ path, sha256: digest }) => ({ path, sha256: digest })),
    rules: ruleFiles.map(({ path, sha256: digest }) => ({ path, sha256: digest })),
  }, null, 2) + '\n');
  return projectDir;
}

export function uninstallFrom(projectDir = process.cwd()) {
  const manifestPath = resolve(projectDir, MANIFEST);
  const manifest = loadManifest(manifestPath);
  if (!manifest) throw new Error('Brak manifestu ai-toolkit — nie usuwam plików.');

  const skills = manifest.skills.map(({ path: relativePath, sha256: expected }) => {
    const absolutePath = resolve(projectDir, relativePath);
    const content = readIfExists(absolutePath);
    if (content !== null && sha256(content) !== expected) {
      throw new Error(`Skill zmodyfikowano ręcznie w ${relativePath}. Nie usuwam niczego.`);
    }
    return { absolutePath, content };
  });
  const rules = manifest.rules.map(({ path: relativePath, sha256: expected }) => {
    const absolutePath = resolve(projectDir, relativePath);
    const content = readIfExists(absolutePath);
    if (content === null) throw new Error(`Brak ${relativePath} — nie usuwam niczego.`);
    const block = locateBlock(content, relativePath);
    if (!block) throw new Error(`Brak bloku ai-toolkit w ${relativePath} — nie usuwam niczego.`);
    const expectedHash = expected ?? sha256(fs.readFileSync(resolve(packageRoot, RULES_SOURCE), 'utf8').trim());
    if (sha256(block.content) !== expectedHash) {
      throw new Error(`Reguły w ${relativePath} zmodyfikowano ręcznie. Nie usuwam niczego.`);
    }
    return { absolutePath, content: removeBlock(content, block) };
  });
  // Every managed file has been validated before any destructive changes.
  for (const file of skills) if (file.content !== null) fs.unlinkSync(file.absolutePath);
  for (const file of rules) {
    if (file.content.trim()) fs.writeFileSync(file.absolutePath, file.content);
    else fs.unlinkSync(file.absolutePath);
  }
  fs.unlinkSync(manifestPath);
  return projectDir;
}
