// This test version performs the original Flask calculation locally.
// No patient inputs are sent to a server.
const fields = [
  { key: "Age", options: [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25], defaultIndex: 6 },
  { key: "BMI", options: [18, 22, 26, 30, 34], defaultIndex: 2 },
  { key: "Menstrual", options: ["Postmenopausal", "Premenopausal"], defaultIndex: 0 },
  { key: "Parity", options: [0, 1, 2, 3, 4, 5], defaultIndex: 1 },
  { key: "Breastfeeding", options: [24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0], defaultIndex: 6 },
  { key: "FamilyHistory", options: ["None", "Yes"], defaultIndex: 0 },
  { key: "TumorSize", options: [0, 1, 2, 3, 4, 5, 6, 7, 8], defaultIndex: 2 },
  { key: "Grade", options: ["I", "II", "III"], defaultIndex: 0 },
  { key: "ER", options: [100, 70, 40, 10], defaultIndex: 1 },
  { key: "Ki67", options: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90], defaultIndex: 2 },
  { key: "LNs", options: ["0", "1~3", ">=4"], defaultIndex: 0 },
  { key: "LVI", options: ["None", "Yes"], defaultIndex: 0 }
];

const ranges = {
  Age: [25, 80], BMI: [18, 34], Parity: [0, 5],
  Breastfeeding: [0, 24], TumorSize: [0, 8], ER: [10, 100], Ki67: [0, 90]
};

const wMajor = 1.3;
const wMinor = 0.9;
const betas = {
  Age: (Math.log(1.738) / (30 - 70)) * wMinor,
  BMI: (Math.log(1.127) / (30 - 18)) * wMinor,
  Parity: (Math.log(1.197) / (0 - 3)) * wMinor,
  Breastfeeding: (Math.log(1.522) / (0 - 12)) * wMinor,
  TumorSize: (Math.log(1.336) / (5 - 0)) * wMinor,
  ER: (Math.log(1.162) / (10 - 100)) * wMinor,
  Ki67: (Math.log(2.096) / (80 - 5)) * wMajor,
  MenstrualPremenopausal: Math.log(1.233) * wMinor,
  FamilyHistoryYes: Math.log(1.229) * wMinor,
  GradeII: Math.log(1.174) * wMinor,
  GradeIII: Math.log(1.246) * wMinor,
  LNs1to3: Math.log(2.738) * wMajor,
  LNsge4: Math.log(3.652) * wMajor,
  LVIYes: Math.log(1.656) * wMinor
};

const rawMax = Math.max(
  ...Object.entries(ranges).map(([key, [min, max]]) => Math.abs(betas[key]) * (max - min)),
  Math.abs(betas.MenstrualPremenopausal),
  Math.abs(betas.FamilyHistoryYes),
  Math.abs(betas.GradeII), Math.abs(betas.GradeIII),
  Math.abs(betas.LNs1to3), Math.abs(betas.LNsge4),
  Math.abs(betas.LVIYes)
);

// Python's round() uses ties-to-even, unlike JavaScript's Math.round().
function roundHalfEven(value) {
  const lower = Math.floor(value);
  const fraction = value - lower;
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(value)) * 2;
  if (Math.abs(fraction - 0.5) <= tolerance) {
    return lower % 2 === 0 ? lower : lower + 1;
  }
  return Math.round(value);
}

function rawContinuous(key, value) {
  const [min, max] = ranges[key];
  const beta = betas[key];
  return Math.abs(beta) * (beta >= 0 ? value - min : max - value);
}

function calculatePoints(data) {
  const raw = [
    rawContinuous("Age", data.Age),
    rawContinuous("BMI", data.BMI),
    data.Menstrual === "Premenopausal" ? Math.abs(betas.MenstrualPremenopausal) : 0,
    rawContinuous("Parity", data.Parity),
    rawContinuous("Breastfeeding", data.Breastfeeding),
    data.FamilyHistory === "Yes" ? Math.abs(betas.FamilyHistoryYes) : 0,
    rawContinuous("TumorSize", data.TumorSize),
    data.Grade === "II" ? Math.abs(betas.GradeII) : data.Grade === "III" ? Math.abs(betas.GradeIII) : 0,
    rawContinuous("ER", data.ER),
    rawContinuous("Ki67", data.Ki67),
    data.LNs === "1~3" ? Math.abs(betas.LNs1to3) : data.LNs === ">=4" ? Math.abs(betas.LNsge4) : 0,
    data.LVI === "Yes" ? Math.abs(betas.LVIYes) : 0
  ];

  // Flask: round((raw / raw_max) * 1000) / 10 for each variable,
  // then round(sum(points.values()), 1).
  const points = raw.map(value => roundHalfEven((value / rawMax) * 1000) / 10);
  return roundHalfEven(points.reduce((sum, value) => sum + value, 0) * 10) / 10;
}

function initForm() {
  const form = document.getElementById("form");
  form.innerHTML = "";

  fields.forEach(field => {
    const row = document.createElement("div");
    row.className = "row";

    const label = document.createElement("div");
    label.className = "label";
    label.innerText = field.key;

    const select = document.createElement("select");
    select.id = field.key;

    field.options.forEach((option, index) => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      if (index === field.defaultIndex) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener("change", calculate);
    row.appendChild(label);
    row.appendChild(select);
    form.appendChild(row);
  });

  calculate();
}

function calculate() {
  const inputData = {};
  fields.forEach(field => {
    const value = document.getElementById(field.key).value;
    inputData[field.key] = isNaN(Number(value)) ? value : Number(value);
  });
  document.getElementById("totalPoints").innerText = calculatePoints(inputData).toFixed(1) + " pts";
}

function resetForm() {
  fields.forEach(field => {
    document.getElementById(field.key).selectedIndex = field.defaultIndex;
  });
  calculate();
}

initForm();
