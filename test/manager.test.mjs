import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { installTo, uninstallFrom } from '../src/manager.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ai-toolkit-'));
const skill = (dir) => path.join(dir, '.claude/skills/code-review/SKILL.md');

test('instalacja, idempotencja i czysta deinstalacja', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Moje reguły\n');
  installTo(dir);
  const first = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  installTo(dir);
  const second = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.equal(second, first);
  assert.ok(fs.existsSync(skill(dir)));
  assert.ok(second.includes('Moje reguły'));
  uninstallFrom(dir);
  assert.ok(!fs.existsSync(skill(dir)));
  assert.ok(fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8').includes('Moje reguły'));
  assert.ok(!fs.existsSync(path.join(dir, '.ai-toolkit/manifest.json')));
});

test('zmodyfikowany skill nigdy nie zostaje nadpisany ani usunięty', () => {
  const dir = tmp();
  installTo(dir);
  fs.appendFileSync(skill(dir), '\nMoja edycja');
  assert.throws(() => installTo(dir), /niezarządzany skill/);
  assert.throws(() => uninstallFrom(dir), /zmodyfikowano ręcznie/);
  assert.match(fs.readFileSync(skill(dir), 'utf8'), /Moja edycja/);
});
