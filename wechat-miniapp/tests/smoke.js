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
const { calculatePoints: miniCalculate, riskFromPoints } = require('../utils/calculator');

for (const file of ['project.config.json', 'app.json', 'pages/index/index.json']) {
  JSON.parse(fs.readFileSync(path.join(root, 'wechat-miniapp', file), 'utf8'));
}

let pageDefinition;
global.Page = definition => { pageDefinition = definition; };
require('../pages/index/index');
const page = {
  data: { fields: [], riskPercent: '—' },
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
  assert.equal(page.data.riskPercent, riskFromPoints(webCalculate(data)));
}
checkCurrent();

assert.equal(riskFromPoints(59.9), '<10%');
assert.equal(riskFromPoints(60), '10.0%');
assert.equal(riskFromPoints(272), '80.0%');
assert.equal(riskFromPoints(272.1), '>80%');
for (const [points, percent] of [[108, 20], [140, 30], [166, 40], [190, 50], [215, 60], [241, 70]]) {
  assert.ok(Math.abs(parseFloat(riskFromPoints(points)) - percent) < 0.7);
}
const markup = fs.readFileSync(path.join(root, 'wechat-miniapp/pages/index/index.wxml'), 'utf8');
assert.match(markup, /Risk of Breast Cancer/);
assert.match(markup, /{{riskPercent}}/);
assert.doesNotMatch(markup, /Total Points|totalPoints|pts/);

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
console.log('Points match the web app on 503 changes; risk matches the chart ticks and boundaries.');
