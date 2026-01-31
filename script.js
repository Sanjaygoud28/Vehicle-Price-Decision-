const ageEl = document.getElementById("age");
const mileageEl = document.getElementById("mileage");
const fuelEl = document.getElementById("fuel");
const accidentEl = document.getElementById("accident");
const brandEl = document.getElementById("brand");
const modelEl = document.getElementById("model");
const outputEl = document.getElementById("output");
const evaluateBtn = document.getElementById("evaluateBtn");
const resultCardEl = document.getElementById("resultCard");
const loaderEl = document.getElementById("loader");
const alertEl = document.getElementById("alert");
const resetBtn = document.getElementById("resetBtn");
const resultCarImageEl = document.getElementById("resultCarImage");


const BASE_PRICE = 800000;
const MIN_PRICE = 150000;
const MAX_PRICE = 1200000;

const MODEL_SEGMENT = {
  swift: "hatchback",
  i20: "hatchback",
  nexon: "suv",
  creta: "suv",
};

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

// function-1
function getState() {
  const model = modelEl.value;

  return {
    age: Number(ageEl.value),
    mileage: Number(mileageEl.value),
    fuel: fuelEl.value,
    accident: accidentEl.value,
    brand: brandEl.value,
    segment: MODEL_SEGMENT[model],
  };
}

const FUEL_INDEX = {
  petrol: 1.0, // baseline
  diesel: 1.05, // longevity + resale demand
};

// rules
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
    reason: "Fuel type affects long-term ownership value",
    apply: (s) => BASE_PRICE * (FUEL_INDEX[s.fuel] - 1),
  },
  {
    name: "Market Demand Adjustment",
    reason: "Brand trust and segment demand affect resale",
    apply: (s) => {
      const brandImpact = BASE_PRICE * (BRAND_INDEX[s.brand] - 1);
      const segmentImpact = BASE_PRICE * (SEGMENT_INDEX[s.segment] - 1);
      return brandImpact + segmentImpact;
    },
  },
];


const MODEL_IMAGES = {
  swift: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  i20: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
  nexon: "https://images.unsplash.com/photo-1549924231-f129b911e442",
  creta: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c8"
};

//function-3





function render(price, breakdown) {
  console.log("called during render");

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
    if (!state.segment) {
      return "Please select a model";
    }
    return null; // means valid
  }

  function calucationlogic() {
  const state = getState();
  const error = validateInputs(state);

  if (error){
    alertEl.textContent=error
    alertEl.classList.remove("hidden")
    loaderEl.classList.add("hidden")
    return
  }

  alertEl.classList.add("hidden");


  if (MODEL_IMAGES[state.segment] || MODEL_IMAGES[modelEl.value]) {
    const imgUrl = MODEL_IMAGES[modelEl.value];
    resultCarImageEl.src = imgUrl + "?auto=format&fit=crop&w=800&q=80";
    resultCarImageEl.style.display = "block";
  } else {
    resultCarImageEl.style.display = "none";
  }


  let price = BASE_PRICE;
  const breakdown = [];

  RULES.forEach((rule) => {
    const impact = rule.apply(state);
    if (impact !== 0) {
      breakdown.push({ name: rule.name, reason: rule.reason, impact });
    }
    price += impact;
  });

  price = Math.min(MAX_PRICE, Math.max(MIN_PRICE, price));
  console.log(price);
  render(price, breakdown);
  loaderEl.classList.add("hidden");
  localStorage.setItem("vehiclePrice", price);
  localStorage.setItem("vehicleBreakdown", JSON.stringify(breakdown));
  localStorage.setItem("vehicleState", JSON.stringify(state));
}
// function 2
function evaluatePrice() {

  // if (ageEl.value=""){
  //   alert("please enter some values")
  // }
  resultCardEl.classList.remove("hidden"); // show card
  loaderEl.classList.remove("hidden");  // show loading symbol
  // outputEl.innerHTML = "",
    setTimeout(() => {
      calucationlogic();
    }, 800);
}
evaluateBtn.addEventListener("click", evaluatePrice);


function resetToInitialState() {
  // Hide UI
  resultCardEl.classList.add("hidden");
  loaderEl.classList.add("hidden");
  alertEl.classList.add("hidden");

  // Clear output
  outputEl.innerHTML = "";

  // Reset inputs (adjust defaults if needed)
  ageEl.value = "";
  mileageEl.value = "";
  fuelEl.value = "petrol";
  accidentEl.value = "no";
  brandEl.value = "";
  modelEl.value = "";

  // Optional: clear storage
  localStorage.removeItem("vehiclePrice");
  localStorage.removeItem("vehicleBreakdown");
  localStorage.removeItem("vehicleState");
}
resetBtn.addEventListener("click", resetToInitialState);



// function 4
function Loadfromstorage() {
  
  const price = localStorage.getItem("vehiclePrice");
  const breakdown = localStorage.getItem("vehicleBreakdown");
  // const one = JSON.parse(localStorage.getItem("vehicleState"));
  // console.log(one);
  resultCardEl.classList.remove("hidden"); 
  console.log("From storage:", price, breakdown);

  if (!price || !breakdown) return;
  render(Number(price), JSON.parse(breakdown));
}
Loadfromstorage();
