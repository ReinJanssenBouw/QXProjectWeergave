const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const pkg = JSON.parse(read('package.json'));
const html = read('QXProjectWeergave.html');
const main = read('main.js');

assert.equal(pkg.name, 'qxprojectweergave');
assert.equal(pkg.version, '1.0.0');
assert.equal(pkg.build.appId, 'com.qxprojectweergave.app');
assert.equal(pkg.build.productName, 'QXProjectWeergave');
assert.equal(pkg.build.publish[0].repo, 'QXProjectWeergave');

assert.match(main, /QXProjectWeergave\.html/);
assert.match(main, /devTools:\s*false/);
assert.match(main, /autoUpdater\.checkForUpdates\(\)/);
assert.match(main, /autoUpdater\.downloadUpdate\(\)/);
assert.match(main, /autoUpdater\.quitAndInstall\(false, true\)/);

assert.match(html, /const READ_ONLY = true;/);
assert.match(html, /let editMode = false;/);
assert.match(html, /class="app locked view-only"/);
assert.match(html, /<h1>QXProjectWeergave<\/h1>/);
assert.match(html, />Alleen lezen</);
assert.match(html, /<span class="cell-value">/);
assert.doesNotMatch(html, /\.upsert\s*\(/);
assert.doesNotMatch(html, /\.insert\s*\(/);
assert.doesNotMatch(html, /\.update\s*\(/);
assert.doesNotMatch(html, /\.delete\s*\(/);
assert.doesNotMatch(html, /\.track\s*\(/);
assert.match(html, /function queueLiveSave\(\)\{return false\}/);
assert.match(html, /async function pushLiveStateNow\(\)\{return false\}/);

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((code) => code.trim());
assert.equal(inlineScripts.length, 1);
new Function(inlineScripts[0]);

console.log('QXProjectWeergave: alleen-lezen controles geslaagd.');
