// Run from the repository checkout with: node wechat-miniapp/tests/smoke.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const context = {};
vm.runInNewContext(source.replace(/initForm\(\);\s*$/, '') + '\nthis.reference = { fields, calculatePoints };', context);
const { fields: webFields, calculatePoints: webCalculate } = context.reference;
const { calculatePoints: miniCalculate } = require('../utils/calculator');

for (const file of ['project.config.json', 'app.json', 'pages/index/index.json']) {
  JSON.parse(fs.readFileSync(path.join(root, 'wechat-miniapp', file), 'utf8'));
}

let pageDefinition;
global.Page = definition => { pageDefinition = definition; };
require('../pages/index/index');
const page = {
  data: { fields: [], totalPoints: '0.0' },
  setData(value) { Object.assign(this.data, value); }
};
for (const [name, method] of Object.entries(pageDefinition)) {
  if (typeof method === 'function') page[name] = method.bind(page);
}
page.onLoad();
assert.deepEqual(page.data.fields.map(field => field.key), Array.from(webFields, field => field.key));
for (let i = 0; i < webFields.length; i++) {
  assert.deepEqual(Array.from(page.data.fields[i].options), Array.from(webFields[i].options));
  assert.equal(page.data.fields[i].selectedIndex, webFields[i].defaultIndex);
}

function checkCurrent() {
  const data = {};
  page.data.fields.forEach(field => { data[field.key] = field.options[field.selectedIndex]; });
  assert.equal(miniCalculate(data), webCalculate(data));
  assert.equal(page.data.totalPoints, webCalculate(data).toFixed(1));
}
checkCurrent();

let seed = 9073;
for (let i = 0; i < 503; i++) {
  const field = page.data.fields[i % page.data.fields.length];
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  page.onFieldChange({
    currentTarget: { dataset: { key: field.key } },
    detail: { value: String(seed % field.options.length) }
  });
  checkCurrent();
}
page.onReset();
checkCurrent();
assert.deepEqual(page.data.fields.map(field => field.selectedIndex), Array.from(webFields, field => field.defaultIndex));
console.log('Mini program and web calculator agree on defaults, 503 changes, and reset.');
