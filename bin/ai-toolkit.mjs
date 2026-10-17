#!/usr/bin/env node
import { installTo, uninstallFrom } from '../src/manager.mjs';
const command = process.argv[2];
try {
  if (command === 'install') {
    const result = installTo();
    console.log(`Zainstalowano ai-toolkit w ${result}`);
  } else if (command === 'uninstall') {
    const result = uninstallFrom();
    console.log(`Odinstalowano ai-toolkit z ${result}`);
  } else {
    console.log('Użycie: ai-toolkit install | ai-toolkit uninstall');
    process.exitCode = command ? 1 : 0;
  }
} catch (err) {
  console.error(`Błąd ai-toolkit: ${err.message}`);
  process.exitCode = 1;
}
