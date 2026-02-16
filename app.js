const STORAGE_KEY = "credit-card-points-spend-v1";
const FEE_DUE_STORAGE_KEY = "credit-card-fee-due-dates-v1";
const SETTINGS_KEY = "credit-card-settings-v2";
const CARD_CONFIG_KEY = "credit-card-config-v2";

const categories = [
  { id: "dining", label: "Dining" },
  { id: "groceries", label: "Groceries" },
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "travel", label: "Other Travel" },
  { id: "gas", label: "Gas" },
  { id: "transit", label: "Transit" },
  { id: "office", label: "Office Supplies" },
  { id: "internet", label: "Phone/Internet" },
  { id: "shipping", label: "Shipping" },
  { id: "ads", label: "Advertising" },
  { id: "mortgage", label: "Mortgage" },
  { id: "other", label: "Everything Else" },
];

const cards = [
  {
    id: "amex-gold",
    name: "American Express Gold",
    program: "Membership Rewards",
    defaultAnnualFee: 325,
    multipliers: {
      dining: 4,
      groceries: 4,
      flights: 3,
      hotels: 1,
      travel: 1,
      gas: 1,
      transit: 1,
      office: 1,
      internet: 1,
      shipping: 1,
      ads: 1,
      mortgage: 1,
      other: 1,
    },
  },
  {
    id: "amex-platinum",
    name: "American Express Platinum",
    program: "Membership Rewards",
    defaultAnnualFee: 895,
    multipliers: {
      dining: 1,
      groceries: 1,
      flights: 5,
      hotels: 5,
      travel: 1,
      gas: 1,
      transit: 1,
      office: 1,
      internet: 1,
      shipping: 1,
      ads: 1,
      mortgage: 1,
      other: 1,
    },
  },
  {
    id: "bilt",
    name: "Bilt Palladium",
    program: "Bilt Points",
    defaultAnnualFee: 0,
    multipliers: {
      dining: 3,
      groceries: 1,
      flights: 2,
      hotels: 2,
      travel: 2,
      gas: 1,
      transit: 2,
      office: 1,
      internet: 1,
      shipping: 1,
      ads: 1,
      mortgage: 1,
      other: 1,
    },
  },
  {
    id: "citi-strata-elite",
    name: "Citi Strada Elite",
    program: "ThankYou Points",
    defaultAnnualFee: 595,
    multipliers: {
      dining: 3,
      groceries: 3,
      flights: 3,
      hotels: 3,
      travel: 3,
      gas: 1,
      transit: 1,
      office: 1,
      internet: 1,
      shipping: 1,
      ads: 1,
      mortgage: 1,
      other: 1,
    },
  },
  {
    id: "venture-x",
    name: "Capital One Venture X",
    program: "Capital One Miles",
    defaultAnnualFee: 395,
    multipliers: {
      dining: 2,
      groceries: 2,
      flights: 5,
      hotels: 10,
      travel: 2,
      gas: 2,
      transit: 2,
      office: 2,
      internet: 2,
      shipping: 2,
      ads: 2,
      mortgage: 2,
      other: 2,
    },
  },
  {
    id: "sapphire-preferred",
    name: "Chase Sapphire Preferred",
    program: "Ultimate Rewards",
    defaultAnnualFee: 95,
    multipliers: {
      dining: 3,
      groceries: 1,
      flights: 2,
      hotels: 2,
      travel: 2,
      gas: 1,
      transit: 2,
      office: 1,
      internet: 1,
      shipping: 1,
      ads: 1,
      mortgage: 1,
      other: 1,
    },
  },
  {
    id: "ink-cash",
    name: "Chase Ink Business Cash",
    program: "Ultimate Rewards",
    defaultAnnualFee: 0,
    multipliers: {
      dining: 2,
      groceries: 1,
      flights: 1,
      hotels: 1,
      travel: 1,
      gas: 2,
      transit: 1,
      office: 5,
      internet: 5,
      shipping: 1,
      ads: 1,
      mortgage: 1,
      other: 1,
    },
  },
  {
    id: "ink-unlimited",
    name: "Chase Ink Business Unlimited",
    program: "Ultimate Rewards",
    defaultAnnualFee: 0,
    multipliers: {
      dining: 1.5,
      groceries: 1.5,
      flights: 1.5,
      hotels: 1.5,
      travel: 1.5,
      gas: 1.5,
      transit: 1.5,
      office: 1.5,
      internet: 1.5,
      shipping: 1.5,
      ads: 1.5,
      mortgage: 1.5,
      other: 1.5,
    },
  },
  {
    id: "ink-preferred",
    name: "Chase Ink Business Preferred",
    program: "Ultimate Rewards",
    defaultAnnualFee: 95,
    multipliers: {
      dining: 1,
      groceries: 1,
      flights: 3,
      hotels: 3,
      travel: 3,
      gas: 1,
      transit: 3,
      office: 1,
      internet: 3,
      shipping: 3,
      ads: 3,
      mortgage: 1,
      other: 1,
    },
  },
  {
    id: "ink-premier",
    name: "Chase Ink Business Premier",
    program: "Cash Back",
    defaultAnnualFee: 195,
    multipliers: {
      dining: 2,
      groceries: 2,
      flights: 2,
      hotels: 2,
      travel: 2,
      gas: 2,
      transit: 2,
      office: 2,
      internet: 2,
      shipping: 2,
      ads: 2,
      mortgage: 2,
      other: 2,
    },
  },
];

const spendGridEl = document.getElementById("spendGrid");
const bestCardTableEl = document.getElementById("bestCardTable");
const cardTotalsTableEl = document.getElementById("cardTotalsTable");
const annualFeeTableEl = document.getElementById("annualFeeTable");
const feeWarningsEl = document.getElementById("feeWarnings");
const cardsListEl = document.getElementById("cardsList");
const pointValueInputEl = document.getElementById("pointValueInput");
const stradaWeekendDiningPctInputEl = document.getElementById("stradaWeekendDiningPctInput");
const resetSpendBtn = document.getElementById("resetSpendBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

const summarySpendEl = document.getElementById("summarySpend");
const summaryOptimizedPointsEl = document.getElementById("summaryOptimizedPoints");
const summaryOptimizedValueEl = document.getElementById("summaryOptimizedValue");
const summaryBestSingleCardEl = document.getElementById("summaryBestSingleCard");

let spend = loadSpend();
let settings = loadSettings();
let cardConfig = loadCardConfig();

function loadSpend() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const normalized = {};

    for (const category of categories) {
      normalized[category.id] = Number(parsed[category.id] || 0);
    }

    return normalized;
  } catch {
    return Object.fromEntries(categories.map((category) => [category.id, 0]));
  }
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const pointValueCents = Number(parsed.pointValueCents);

    return {
      pointValueCents: Number.isFinite(pointValueCents) && pointValueCents > 0 ? pointValueCents : 1.8,
      stradaWeekendDiningPct:
        Number.isFinite(Number(parsed.stradaWeekendDiningPct)) &&
        Number(parsed.stradaWeekendDiningPct) >= 0 &&
        Number(parsed.stradaWeekendDiningPct) <= 100
          ? Number(parsed.stradaWeekendDiningPct)
          : 28.6,
    };
  } catch {
    return { pointValueCents: 1.8, stradaWeekendDiningPct: 28.6 };
  }
}

function loadLegacyFeeDates() {
  try {
    return JSON.parse(localStorage.getItem(FEE_DUE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function loadCardConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CARD_CONFIG_KEY) || "{}");
    const legacyFeeDates = loadLegacyFeeDates();
    const normalized = {};

    for (const card of cards) {
      const config = parsed[card.id] || {};
      const dueDateRaw = String(config.dueDate || legacyFeeDates[card.id] || "");
      normalized[card.id] = {
        enabled: config.enabled !== false,
        annualFee:
          Number.isFinite(Number(config.annualFee)) && Number(config.annualFee) >= 0
            ? Number(config.annualFee)
            : card.defaultAnnualFee,
        dueDate: /^\d{4}-\d{2}-\d{2}$/.test(dueDateRaw) ? dueDateRaw : "",
      };
    }

    return normalized;
  } catch {
    return Object.fromEntries(
      cards.map((card) => [
        card.id,
        { enabled: true, annualFee: card.defaultAnnualFee, dueDate: "" },
      ]),
    );
  }
}

function saveSpend() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spend));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function saveCardConfig() {
  localStorage.setItem(CARD_CONFIG_KEY, JSON.stringify(cardConfig));
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function number(value, maxFractionDigits = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: maxFractionDigits }).format(value);
}

function parseLocalDate(dateString) {
  if (!dateString) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function daysUntilDate(dateString) {
  const dueDate = parseLocalDate(dateString);
  if (!dueDate) {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round((due - today) / millisecondsPerDay);
}

function getActiveCards() {
  return cards.filter((card) => cardConfig[card.id]?.enabled !== false);
}

function getEffectiveMultiplier(card, categoryId) {
  const baseMultiplier = Number(card.multipliers[categoryId] || 1);

  if (card.id === "citi-strata-elite" && categoryId === "dining") {
    const weekendShare = Math.max(0, Math.min(100, Number(settings.stradaWeekendDiningPct || 0))) / 100;
    return baseMultiplier * (1 - weekendShare) + 6 * weekendShare;
  }

  return baseMultiplier;
}

function calculateMonthlyPointsForCard(card) {
  let points = 0;

  for (const category of categories) {
    points += Number(spend[category.id] || 0) * getEffectiveMultiplier(card, category.id);
  }

  return points;
}

function calculateBestCardByCategory() {
  const activeCards = getActiveCards();

  return categories.map((category) => {
    const categorySpend = Number(spend[category.id] || 0);

    if (activeCards.length === 0) {
      return {
        category,
        spend: categorySpend,
        winner: null,
        bestMultiplier: 0,
        points: 0,
      };
    }

    let winner = activeCards[0];
    let bestMultiplier = getEffectiveMultiplier(activeCards[0], category.id);

    for (const card of activeCards) {
      const multiplier = getEffectiveMultiplier(card, category.id);
      if (multiplier > bestMultiplier) {
        bestMultiplier = multiplier;
        winner = card;
      }
    }

    return {
      category,
      spend: categorySpend,
      winner,
      bestMultiplier,
      points: categorySpend * bestMultiplier,
    };
  });
}

function calculateCardPerformance() {
  const activeCards = getActiveCards();

  return activeCards
    .map((card) => {
      const monthlyPoints = calculateMonthlyPointsForCard(card);
      const annualPoints = monthlyPoints * 12;
      const annualValue = (annualPoints * settings.pointValueCents) / 100;
      const annualFee = Number(cardConfig[card.id].annualFee || 0);

      return {
        card,
        monthlyPoints,
        annualPoints,
        annualValue,
        annualFee,
        annualNetValue: annualValue - annualFee,
      };
    })
    .sort((a, b) => b.annualNetValue - a.annualNetValue);
}

function calculateSummary() {
  const totalMonthlySpend = categories.reduce(
    (sum, category) => sum + Number(spend[category.id] || 0),
    0,
  );
  const bestByCategory = calculateBestCardByCategory();
  const optimizedMonthlyPoints = bestByCategory.reduce((sum, row) => sum + row.points, 0);
  const optimizedAnnualValue = (optimizedMonthlyPoints * 12 * settings.pointValueCents) / 100;
  const performance = calculateCardPerformance();

  return {
    totalMonthlySpend,
    optimizedMonthlyPoints,
    optimizedAnnualValue,
    bestSingleCard: performance[0] || null,
  };
}

function getAnnualFeeStatuses() {
  return cards.map((card) => {
    const config = cardConfig[card.id];
    const daysUntil = daysUntilDate(config.dueDate);
    let statusLabel = "Not set";
    let statusClass = "status-neutral";

    if (daysUntil !== null) {
      if (daysUntil < 0) {
        statusLabel = `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"}`;
        statusClass = "status-overdue";
      } else if (daysUntil === 0) {
        statusLabel = "Due today";
        statusClass = "status-overdue";
      } else if (daysUntil <= 30) {
        statusLabel = `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
        statusClass = "status-warn";
      } else {
        statusLabel = `Due in ${daysUntil} days`;
      }
    }

    return {
      card,
      enabled: config.enabled,
      annualFee: Number(config.annualFee || 0),
      dueDate: config.dueDate,
      daysUntil,
      statusLabel,
      statusClass,
      isWarning: config.enabled && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30,
    };
  });
}

function renderSpendInputs() {
  spendGridEl.innerHTML = "";

  for (const category of categories) {
    const wrap = document.createElement("div");
    wrap.className = "spend-item";

    const label = document.createElement("label");
    label.setAttribute("for", `spend-${category.id}`);
    label.textContent = category.label;

    const input = document.createElement("input");
    input.id = `spend-${category.id}`;
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.value = String(spend[category.id] || 0);

    input.addEventListener("input", () => {
      const next = Math.max(0, Number(input.value || 0));
      spend[category.id] = Number.isFinite(next) ? next : 0;
      saveSpend();
      renderAll();
    });

    wrap.append(label, input);
    spendGridEl.append(wrap);
  }
}

function renderSummary() {
  const summary = calculateSummary();

  summarySpendEl.textContent = money(summary.totalMonthlySpend);
  summaryOptimizedPointsEl.textContent = number(summary.optimizedMonthlyPoints, 0);
  summaryOptimizedValueEl.textContent = money(summary.optimizedAnnualValue);

  if (!summary.bestSingleCard) {
    summaryBestSingleCardEl.textContent = "No active cards";
    return;
  }

  summaryBestSingleCardEl.textContent = `${summary.bestSingleCard.card.name} (${money(summary.bestSingleCard.annualNetValue)})`;
}

function renderBestCardTable() {
  const rows = calculateBestCardByCategory()
    .map(({ category, spend: categorySpend, winner, bestMultiplier, points }) => {
      if (!winner) {
        return `
          <tr>
            <td>${category.label}</td>
            <td>${money(categorySpend)}</td>
            <td colspan="4">No active cards selected</td>
          </tr>
        `;
      }

      const monthlyValue = (points * settings.pointValueCents) / 100;

      return `
        <tr>
          <td>${category.label}</td>
          <td>${money(categorySpend)}</td>
          <td><strong>${winner.name}</strong></td>
          <td>${number(bestMultiplier)}x</td>
          <td>${number(points, 0)}</td>
          <td>${money(monthlyValue)}</td>
        </tr>
      `;
    })
    .join("");

  bestCardTableEl.innerHTML = rows;
}

function renderCardTotalsTable() {
  const performance = calculateCardPerformance();

  if (performance.length === 0) {
    cardTotalsTableEl.innerHTML = `
      <tr>
        <td colspan="6">Enable at least one card in the Annual Fee Tracker to see performance.</td>
      </tr>
    `;
    return;
  }

  cardTotalsTableEl.innerHTML = performance
    .map(({ card, monthlyPoints, annualPoints, annualValue, annualFee, annualNetValue }) => {
      const netClass = annualNetValue >= 0 ? "net-positive" : "net-negative";
      return `
        <tr>
          <td>${card.name}</td>
          <td>${number(monthlyPoints, 0)}</td>
          <td>${number(annualPoints, 0)}</td>
          <td>${money(annualValue)}</td>
          <td>${money(annualFee)}</td>
          <td class="${netClass}">${money(annualNetValue)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderAnnualFeeTable() {
  annualFeeTableEl.innerHTML = getAnnualFeeStatuses()
    .map(({ card, enabled, annualFee, dueDate, statusLabel, statusClass }) => {
      return `
        <tr>
          <td class="toggle-cell">
            <input data-card-id="${card.id}" data-field="enabled" type="checkbox" ${enabled ? "checked" : ""} />
          </td>
          <td>${card.name}</td>
          <td>
            <input
              data-card-id="${card.id}"
              data-field="annualFee"
              type="number"
              min="0"
              step="1"
              value="${annualFee}"
            />
          </td>
          <td>
            <input
              data-card-id="${card.id}"
              data-field="dueDate"
              type="date"
              value="${dueDate}"
            />
          </td>
          <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderFeeWarnings() {
  const warnings = getAnnualFeeStatuses()
    .filter((entry) => entry.isWarning)
    .sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0));

  if (warnings.length === 0) {
    feeWarningsEl.innerHTML = "<li>No active-card annual fees due in the next 30 days.</li>";
    return;
  }

  feeWarningsEl.innerHTML = warnings
    .map(({ card, daysUntil, annualFee }) => {
      const dueText = daysUntil === 0 ? "today" : `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
      return `<li><strong>${card.name}</strong>: ${money(annualFee)} due ${dueText}.</li>`;
    })
    .join("");
}

function renderCardsList() {
  cardsListEl.innerHTML = cards
    .map((card) => {
      const highlights = categories
        .filter((category) => Number(card.multipliers[category.id] || 1) > 1)
        .sort((a, b) => Number(card.multipliers[b.id]) - Number(card.multipliers[a.id]))
        .map((category) => {
          if (card.id === "citi-strata-elite" && category.id === "dining") {
            return `<li>${category.label}: 3x base, up to 6x on Fri/Sat</li>`;
          }

          return `<li>${category.label}: ${number(card.multipliers[category.id])}x</li>`;
        })
        .join("");

      return `
        <article class="card-item">
          <h3>${card.name}</h3>
          <p class="note">${card.program}</p>
          <ul>${highlights || "<li>General spend only</li>"}</ul>
        </article>
      `;
    })
    .join("");
}

function renderSettings() {
  pointValueInputEl.value = String(settings.pointValueCents);
  stradaWeekendDiningPctInputEl.value = String(settings.stradaWeekendDiningPct);
}

function renderAll() {
  renderSummary();
  renderBestCardTable();
  renderCardTotalsTable();
  renderAnnualFeeTable();
  renderFeeWarnings();
  renderCardsList();
  renderSettings();
}

annualFeeTableEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const cardId = target.dataset.cardId;
  const field = target.dataset.field;
  if (!cardId || !field || !cardConfig[cardId]) {
    return;
  }

  if (field === "annualFee") {
    cardConfig[cardId].annualFee = Math.max(0, Number(target.value || 0));
  }

  if (field === "dueDate") {
    cardConfig[cardId].dueDate = target.value || "";
  }

  saveCardConfig();
  renderAll();
});

annualFeeTableEl.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const cardId = target.dataset.cardId;
  const field = target.dataset.field;
  if (!cardId || field !== "enabled" || !cardConfig[cardId]) {
    return;
  }

  cardConfig[cardId].enabled = target.checked;
  saveCardConfig();
  renderAll();
});

pointValueInputEl.addEventListener("input", () => {
  const value = Number(pointValueInputEl.value || 0);
  if (!Number.isFinite(value) || value <= 0) {
    return;
  }

  settings.pointValueCents = value;
  saveSettings();
  renderAll();
});

stradaWeekendDiningPctInputEl.addEventListener("input", () => {
  const value = Number(stradaWeekendDiningPctInputEl.value || 0);
  if (!Number.isFinite(value)) {
    return;
  }

  settings.stradaWeekendDiningPct = Math.max(0, Math.min(100, value));
  saveSettings();
  renderAll();
});

resetSpendBtn.addEventListener("click", () => {
  spend = Object.fromEntries(categories.map((category) => [category.id, 0]));
  saveSpend();
  renderSpendInputs();
  renderAll();
});

resetAllBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(CARD_CONFIG_KEY);
  localStorage.removeItem(FEE_DUE_STORAGE_KEY);

  spend = loadSpend();
  settings = loadSettings();
  cardConfig = loadCardConfig();

  renderSpendInputs();
  renderAll();
});

renderSpendInputs();
renderAll();
