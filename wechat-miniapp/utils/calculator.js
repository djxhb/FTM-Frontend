// Kept numerically identical to the standalone web test's calculatePoints().
// Inputs and results stay on the device; there are no HTTP requests.
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

// Python round() uses ties-to-even; Math.round() does not.
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

  const points = raw.map(value => roundHalfEven((value / rawMax) * 1000) / 10);
  return roundHalfEven(points.reduce((sum, value) => sum + value, 0) * 10) / 10;
}

module.exports = { calculatePoints };
