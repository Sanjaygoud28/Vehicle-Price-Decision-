
const ageEl = document.getElementById("age");
const mileageEl = document.getElementById("mileage");
const fuelEl = document.getElementById("fuel");
const accidentEl = document.getElementById("accident");
const brandEl = document.getElementById("brand");
const modelEl = document.getElementById("model");

const outputEl = document.getElementById("output");
const evaluateBtn = document.getElementById("evaluateBtn");
const resetBtn = document.getElementById("resetBtn");

const resultCardEl = document.getElementById("resultCard");
const loaderEl = document.getElementById("loader");
const alertEl = document.getElementById("alert");

const resultCarImageEl = document.getElementById("resultCarImage");

// ===============================
// PRICE CONSTANTS
// ===============================
const BASE_PRICE = 800000;
const MIN_PRICE = 150000;
const MAX_PRICE = 1200000;

// ===============================
// MODEL SEGMENTS
// ===============================
const MODEL_SEGMENT = {
  swift: "hatchback",
  i20: "hatchback",
  nexon: "suv",
  creta: "suv",
};

// ===============================
// MARKET INDEX VALUES
// ===============================
const BRAND_INDEX = {
  maruti: 1.08,
  hyundai: 1.05,
  tata: 1.03,
  mahindra: 1.04,
};

const SEGMENT_INDEX = {
  hatchback: 0.95,
  sedan: 1.0,
  suv: 1.07,
};

const FUEL_INDEX = {
  petrol: 1.0,
  diesel: 1.05,
};

// ===============================
// MODEL IMAGES
// ===============================
const MODEL_IMAGES = {
  swift: "./images/swift.png",
  i20: "./images/i10.avif",
  nexon: "./images/nexon.avif",
  creta: "./images/creta.avif",
};

// ===============================
// GET FORM STATE
// ===============================
function getState() {
  const model = modelEl.value;

  return {
    age: Number(ageEl.value),
    mileage: Number(mileageEl.value),
    fuel: fuelEl.value,
    accident: accidentEl.value,
    brand: brandEl.value,
    model: model,
    segment: MODEL_SEGMENT[model],
  };
}

// ===============================
// RULE ENGINE
// ===============================
const RULES = [
  {
    name: "Age Depreciation",
    reason: "Vehicles lose value as they age",
    apply: (s) => s.age * -30000,
  },
  {
    name: "High Mileage Penalty",
    reason: "High usage increases wear",
    apply: (s) => (s.mileage > 50000 ? -50000 : 0),
  },
  {
    name: "Accident Penalty",
    reason: "Accidents reduce resale trust",
    apply: (s) => (s.accident === "yes" ? -100000 : 0),
  },
  {
    name: "Fuel Market Adjustment",
    reason: "Fuel type affects ownership value",
    apply: (s) => BASE_PRICE * (FUEL_INDEX[s.fuel] - 1),
  },
  {
    name: "Market Demand Adjustment",
    reason: "Brand + Segment demand affects resale",
    apply: (s) => {
      const brandImpact = BASE_PRICE * (BRAND_INDEX[s.brand] - 1);
      const segmentImpact = BASE_PRICE * (SEGMENT_INDEX[s.segment] - 1);
      return brandImpact + segmentImpact;
    },
  },
];

// ===============================
// VALIDATION
// ===============================
function validateInputs(state) {
  if (!state.age || state.age <= 0) {
    return "Please enter a valid vehicle age";
  }

  if (state.mileage < 0) {
    return "Mileage cannot be negative";
  }

  if (!state.brand) {
    return "Please select a brand";
  }

  if (!state.model) {
    return "Please select a model";
  }

  return null;
}

// ===============================
// RENDER RESULT
// ===============================
function render(price, breakdown) {
  outputEl.innerHTML = `
    <h2>Estimated Price</h2>
    <p class="price">₹${price.toLocaleString()}</p>

    <h3>Decision Breakdown</h3>
    <ul>
      ${breakdown
        .map(
          (b) => `
        <li>
          <strong>${b.name}</strong>: ₹${b.impact.toLocaleString()}
          <br/>
          <small>${b.reason}</small>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

// ===============================
// MAIN CALCULATION LOGIC
// ===============================
function calculationLogic() {
  const state = getState();
  const error = validateInputs(state);

  // ❌ Stop if invalid
  if (error) {
    alertEl.textContent = error;
    alertEl.classList.remove("hidden");
    loaderEl.classList.add("hidden");
    return;
  }

  alertEl.classList.add("hidden");

  // ✅ Show car image
  const imgUrl = MODEL_IMAGES[state.model];

  if (imgUrl) {
    resultCarImageEl.src = imgUrl;
    resultCarImageEl.style.display = "block";
  } else {
    resultCarImageEl.style.display = "none";
  }

  // ✅ Calculate price
  let price = BASE_PRICE;
  const breakdown = [];

  RULES.forEach((rule) => {
    const impact = rule.apply(state);

    if (impact !== 0) {
      breakdown.push({
        name: rule.name,
        reason: rule.reason,
        impact,
      });
    }

    price += impact;
  });

  // Clamp price
  price = Math.min(MAX_PRICE, Math.max(MIN_PRICE, price));

  // Render UI
  render(price, breakdown);

  loaderEl.classList.add("hidden");

  // ✅ Store in LocalStorage
  localStorage.setItem("vehiclePrice", price);
  localStorage.setItem("vehicleBreakdown", JSON.stringify(breakdown));
  localStorage.setItem("vehicleState", JSON.stringify(state));
  localStorage.setItem("vehicleImage", imgUrl);
}

// ===============================
// EVALUATE BUTTON CLICK
// ===============================
function evaluatePrice() {
  resultCardEl.classList.remove("hidden"); // show card
  loaderEl.classList.remove("hidden"); // show loader
  outputEl.innerHTML = "";

  setTimeout(() => {
    calculationLogic();
  }, 800);
}

evaluateBtn.addEventListener("click", evaluatePrice);

// ===============================
// RESET BUTTON CLICK
// ===============================
function resetToInitialState() {
  resultCardEl.classList.add("hidden");
  loaderEl.classList.add("hidden");
  alertEl.classList.add("hidden");

  outputEl.innerHTML = "";
  resultCarImageEl.style.display = "none";

  // Reset inputs
  ageEl.value = "";
  mileageEl.value = "";
  fuelEl.value = "petrol";
  accidentEl.value = "no";
  brandEl.value = "";
  modelEl.value = "";

  // Clear localStorage
  localStorage.clear();
}

resetBtn.addEventListener("click", resetToInitialState);

// ===============================
// PAGE LOAD (Card stays hidden)
// ===============================
function loadFromStorage() {
  const price = localStorage.getItem("vehiclePrice");
  const breakdown = localStorage.getItem("vehicleBreakdown");
  const imgUrl = localStorage.getItem("vehicleImage");

  // If no saved data, do nothing
  if (!price || !breakdown) return;

  // ✅ Open card automatically
  resultCardEl.classList.remove("hidden");

  // ✅ Restore image
  if (imgUrl) {
    resultCarImageEl.src = imgUrl;
    resultCarImageEl.style.display = "block";
  }

  // ✅ Restore breakdown + price
  render(Number(price), JSON.parse(breakdown));

  console.log("Restored evaluation from localStorage!");
}

loadFromStorage();

