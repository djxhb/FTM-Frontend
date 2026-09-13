const { calculatePoints } = require('../../utils/calculator');

const definitions = [
  { key: 'Age', title: '年龄', options: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25], unit: '岁', defaultIndex: 6 },
  { key: 'BMI', title: 'BMI', options: [18, 22, 26, 30, 34], defaultIndex: 2 },
  { key: 'Menstrual', title: '绝经状态', options: ['Postmenopausal', 'Premenopausal'], labels: ['绝经后', '绝经前'], defaultIndex: 0 },
  { key: 'Parity', title: '产次', options: [0, 1, 2, 3, 4, 5], defaultIndex: 1 },
  { key: 'Breastfeeding', title: '哺乳时长', options: [24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0], unit: '月', defaultIndex: 6 },
  { key: 'FamilyHistory', title: '家族史', options: ['None', 'Yes'], labels: ['无', '有'], defaultIndex: 0 },
  { key: 'TumorSize', title: '肿瘤大小', options: [0, 1, 2, 3, 4, 5, 6, 7, 8], unit: 'cm', defaultIndex: 2 },
  { key: 'Grade', title: '组织学分级', options: ['I', 'II', 'III'], defaultIndex: 0 },
  { key: 'ER', title: 'ER', options: [100, 70, 40, 10], unit: '%', defaultIndex: 1 },
  { key: 'Ki67', title: 'Ki-67', options: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90], unit: '%', defaultIndex: 2 },
  { key: 'LNs', title: '淋巴结转移数', options: ['0', '1~3', '>=4'], labels: ['0', '1–3', '≥4'], defaultIndex: 0 },
  { key: 'LVI', title: '脉管侵犯', options: ['None', 'Yes'], labels: ['无', '有'], defaultIndex: 0 }
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

function totalFor(fields) {
  const input = {};
  fields.forEach(field => { input[field.key] = field.options[field.selectedIndex]; });
  return calculatePoints(input).toFixed(1);
}

Page({
  data: { fields: [], totalPoints: '0.0' },

  onLoad() {
    const fields = makeFields();
    this.setData({ fields, totalPoints: totalFor(fields) });
  },

  onFieldChange(event) {
    const key = event.currentTarget.dataset.key;
    const index = Number(event.detail.value);
    const fields = this.data.fields.map(field =>
      field.key === key ? Object.assign({}, field, { selectedIndex: index }) : field
    );
    this.setData({ fields, totalPoints: totalFor(fields) });
  },

  onReset() {
    const fields = makeFields();
    this.setData({ fields, totalPoints: totalFor(fields) });
  }
});
