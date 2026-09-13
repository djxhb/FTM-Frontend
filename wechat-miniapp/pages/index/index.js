const { calculatePoints, riskFromPoints } = require('../../utils/calculator');

const definitions = [
  { key: 'Age', title: 'Age', options: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25], unit: ' years', defaultIndex: 6 },
  { key: 'BMI', title: 'BMI', options: [18, 22, 26, 30, 34], defaultIndex: 2 },
  { key: 'Menstrual', title: 'Menstrual Status', options: ['Postmenopausal', 'Premenopausal'], labels: ['Postmenopausal', 'Premenopausal'], defaultIndex: 0 },
  { key: 'Parity', title: 'Parity', options: [0, 1, 2, 3, 4, 5], defaultIndex: 1 },
  { key: 'Breastfeeding', title: 'Breastfeeding', options: [24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0], unit: ' months', defaultIndex: 6 },
  { key: 'FamilyHistory', title: 'Family History', options: ['None', 'Yes'], labels: ['No', 'Yes'], defaultIndex: 0 },
  { key: 'TumorSize', title: 'Tumor Size', options: [0, 1, 2, 3, 4, 5, 6, 7, 8], unit: ' cm', defaultIndex: 2 },
  { key: 'Grade', title: 'Grade', options: ['I', 'II', 'III'], defaultIndex: 0 },
  { key: 'ER', title: 'ER', options: [100, 70, 40, 10], unit: '%', defaultIndex: 1 },
  { key: 'Ki67', title: 'Ki-67', options: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90], unit: '%', defaultIndex: 2 },
  { key: 'LNs', title: 'Positive LNs', options: ['0', '1~3', '>=4'], labels: ['0', '1–3', '≥4'], defaultIndex: 0 },
  { key: 'LVI', title: 'LVI', options: ['None', 'Yes'], labels: ['No', 'Yes'], defaultIndex: 0 }
];

function makeFields() {
  return definitions.map(({ key, title, options, labels, unit, defaultIndex }) => ({
    key,
    title,
    options,
    labels: labels || options.map(option => `${option}${unit || ''}`),
    selectedIndex: defaultIndex
  }));
}

function riskFor(fields) {
  const input = {};
  fields.forEach(field => { input[field.key] = field.options[field.selectedIndex]; });
  return riskFromPoints(calculatePoints(input));
}

Page({
  data: { fields: [], riskPercent: '—' },

  onLoad() {
    const fields = makeFields();
    this.setData({ fields, riskPercent: riskFor(fields) });
  },

  onFieldChange(event) {
    const key = event.currentTarget.dataset.key;
    const index = Number(event.detail.value);
    const fields = this.data.fields.map(field =>
      field.key === key ? Object.assign({}, field, { selectedIndex: index }) : field
    );
    this.setData({ fields, riskPercent: riskFor(fields) });
  },

  onReset() {
    const fields = makeFields();
    this.setData({ fields, riskPercent: riskFor(fields) });
  }
});
