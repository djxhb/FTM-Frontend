const API_URL = "https://api.medlight.tech/calculate";

const fields = [
  { key: "Age", options: [80,75,70,65,60,55,50,45,40,35,30,25], defaultIndex: 6 },
  { key: "BMI", options: [18,22,26,30,34], defaultIndex: 2 },
  { key: "Menstrual", options: ["Postmenopausal", "Premenopausal"], defaultIndex: 0 },
  { key: "Parity", options: [0,1,2,3,4,5], defaultIndex: 1 },
  { key: "Breastfeeding", options: [24,22,20,18,16,14,12,10,8,6,4,2,0], defaultIndex: 6 },
  { key: "FamilyHistory", options: ["None", "Yes"], defaultIndex: 0 },
  { key: "TumorSize", options: [0,1,2,3,4,5,6,7,8], defaultIndex: 2 },
  { key: "Grade", options: ["I", "II", "III"], defaultIndex: 0 },
  { key: "ER", options: [100,70,40,10], defaultIndex: 1 },
  { key: "Ki67", options: [0,10,20,30,40,50,60,70,80,90], defaultIndex: 2 },
  { key: "LNs", options: ["0","1~3",">=4"], defaultIndex: 0 },
  { key: "LVI", options: ["None","Yes"], defaultIndex: 0 }
];

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

async function calculate() {
  const inputData = {};

  fields.forEach(field => {
    const value = document.getElementById(field.key).value;
    inputData[field.key] = isNaN(Number(value)) ? value : Number(value);
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(inputData)
    });

    const result = await res.json();

    document.getElementById("totalPoints").innerText =
      result.totalPoints + " pts";

  } catch (err) {
    document.getElementById("totalPoints").innerText = "后端未连接";
  }
}

function resetForm() {
  fields.forEach(field => {
    document.getElementById(field.key).selectedIndex = field.defaultIndex;
  });
  calculate();
}

initForm();