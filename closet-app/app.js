const STORAGE_KEY = "closetmode-v1";

const categories = [
  "T-shirts",
  "Shirts",
  "Sweaters",
  "Hoodies",
  "Jackets",
  "Outerwear",
  "Pants",
  "Jeans",
  "Shorts",
  "Shoes",
  "Accessories",
];

const slotMap = {
  top: ["T-shirts", "Shirts", "Sweaters", "Hoodies"],
  layer: ["Jackets", "Outerwear", "Sweaters", "Hoodies"],
  bottom: ["Pants", "Jeans", "Shorts"],
  shoes: ["Shoes"],
  extras: ["Accessories"],
};

const fixedColorPairs = [
  ["black", "black"],
  ["black", "gray"],
  ["black", "beige"],
  ["white", "blue"],
  ["white", "black"],
  ["navy", "beige"],
  ["olive", "black"],
  ["gray", "blue"],
];

const fixedActivityBoost = {
  Work: ["Shirts", "Pants", "Jeans", "Jackets"],
  Casual: ["T-shirts", "Hoodies", "Jeans", "Sneakers"],
  Gym: ["T-shirts", "Shorts"],
  Date: ["Shirts", "Jeans", "Jackets"],
  Travel: ["Hoodies", "Pants", "Shoes"],
  Event: ["Shirts", "Outerwear", "Pants"],
  Home: ["Hoodies", "Sweaters", "T-shirts", "Shorts"],
};

const defaultTravelStops = [
  { city: "Gothenburg", country: "Sweden", days: 2 },
];

const defaultState = {
  items: [],
  wearLogs: [],
  customColorPairs: [],
  selectedForLog: { top: null, layer: null, bottom: null, shoes: null, extras: null },
  activity: "Work",
  manualTemp: "",
  weather: {
    tempF: null,
    lowF: null,
    highF: null,
    rainLikely: false,
    description: "Unknown",
    location: "Unknown",
  },
  draftItemCategory: "T-shirts",
  tripStartDate: "",
  travelStops: [],
};

const itemCategoryEl = document.getElementById("itemCategory");
const addItemFormEl = document.getElementById("addItemForm");
const wardrobeLibraryEl = document.getElementById("wardrobeLibrary");
const laundryBasketEl = document.getElementById("laundryBasket");
const doAllLaundryBtnEl = document.getElementById("doAllLaundryBtn");
const selectionGridEl = document.getElementById("selectionGrid");
const historyListEl = document.getElementById("historyList");
const rulesListEl = document.getElementById("rulesList");
const ruleFormEl = document.getElementById("ruleForm");
const suggestionGridEl = document.getElementById("suggestionGrid");
const suggestionSummaryEl = document.getElementById("suggestionSummary");
const tripStartDateEl = document.getElementById("tripStartDate");
const travelStopsEl = document.getElementById("travelStops");
const addTravelStopBtnEl = document.getElementById("addTravelStopBtn");
const generatePackingBtnEl = document.getElementById("generatePackingBtn");
const copyPackingBtnEl = document.getElementById("copyPackingBtn");
const packingSummaryEl = document.getElementById("packingSummary");
const packingGridEl = document.getElementById("packingGrid");
const weatherSummaryEl = document.getElementById("weatherSummary");
const locationSummaryEl = document.getElementById("locationSummary");
const activitySelectEl = document.getElementById("activitySelect");
const manualTempInputEl = document.getElementById("manualTempInput");
const wearDateEl = document.getElementById("wearDate");
const wearNotesEl = document.getElementById("wearNotes");
const saveLogBtnEl = document.getElementById("saveLogBtn");
const logSuggestedBtnEl = document.getElementById("logSuggestedBtn");
const reminderBannerEl = document.getElementById("reminderBanner");

let state = loadState();
let latestSuggestion = null;
const sessionRejectedIds = [];
let latestPackingList = null;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...defaultState,
      ...parsed,
      items: (parsed.items || []).map((item) => ({
        ...item,
        isDirty: item.isDirty === true,
      })),
      selectedForLog: {
        ...defaultState.selectedForLog,
        ...(parsed.selectedForLog || {}),
      },
      weather: {
        ...defaultState.weather,
        ...(parsed.weather || {}),
      },
      travelStops:
        Array.isArray(parsed.travelStops) && parsed.travelStops.length
          ? parsed.travelStops.map((stop) => ({
              id: stop.id || crypto.randomUUID(),
              city: String(stop.city || "").trim(),
              country: String(stop.country || "").trim(),
              days: Math.max(1, Number(stop.days || 1)),
            }))
          : defaultTravelStops.map((stop) => ({ ...stop, id: crypto.randomUUID() })),
      tripStartDate:
        /^\d{4}-\d{2}-\d{2}$/.test(parsed.tripStartDate || "")
          ? parsed.tripStartDate
          : "",
    };
  } catch {
    return {
      ...structuredClone(defaultState),
      travelStops: defaultTravelStops.map((stop) => ({ ...stop, id: crypto.randomUUID() })),
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sanitizeTags(input) {
  return String(input || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseColor(value) {
  return String(value || "").trim().toLowerCase();
}

function parseWeatherDescription(code) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing Rain";
  if ([71, 73, 75, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunder";
  return "Unknown";
}

async function reverseGeocodeLocation(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    const data = await response.json();
    const city = data.city || data.locality || data.principalSubdivision || "";
    const state = data.principalSubdivision || "";
    const country = data.countryName || "";
    const parts = [city, state, country].filter(Boolean);
    if (parts.length) {
      return parts.join(", ");
    }
  } catch {
    // Fallback handled by caller.
  }

  return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

function addDays(isoDate, daysToAdd) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysFromToday(isoDate) {
  const today = new Date(todayISO());
  const target = new Date(isoDate);
  const diffMs = target - today;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function geocodeCityCountry(city, country) {
  const query = encodeURIComponent(`${city}, ${country}`);
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&format=json`,
  );
  const json = await response.json();
  const place = json?.results?.[0];
  if (!place) {
    return null;
  }

  const readable = await reverseGeocodeLocation(place.latitude, place.longitude);
  return {
    latitude: place.latitude,
    longitude: place.longitude,
    placeLabel: readable || [place.name, place.admin1, place.country].filter(Boolean).join(", "),
  };
}

function averageFromDailyMinMax(mins, maxes) {
  const means = mins
    .map((min, idx) => {
      const max = maxes[idx];
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return null;
      }
      return (min + max) / 2;
    })
    .filter((value) => value !== null);

  if (!means.length) {
    return null;
  }

  return means.reduce((sum, value) => sum + value, 0) / means.length;
}

async function fetchStopAverageTemp(latitude, longitude, startDateIso) {
  const futureOffset = startDateIso ? daysFromToday(startDateIso) : null;
  const canUseStartDateWindow =
    futureOffset !== null && futureOffset >= 0 && futureOffset <= 15;

  if (canUseStartDateWindow) {
    const endDateIso = addDays(startDateIso, 6);
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_min,temperature_2m_max&temperature_unit=fahrenheit&timezone=auto&start_date=${startDateIso}&end_date=${endDateIso}`,
    );
    const json = await response.json();
    const avg = averageFromDailyMinMax(
      json?.daily?.temperature_2m_min || [],
      json?.daily?.temperature_2m_max || [],
    );
    if (avg !== null) {
      return { averageTempF: avg, source: `forecast window ${startDateIso} to ${endDateIso}` };
    }
  }

  const fallbackResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_min,temperature_2m_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`,
  );
  const fallbackJson = await fallbackResponse.json();
  const fallbackAvg = averageFromDailyMinMax(
    fallbackJson?.daily?.temperature_2m_min || [],
    fallbackJson?.daily?.temperature_2m_max || [],
  );
  return { averageTempF: fallbackAvg, source: "next-7-days fallback" };
}

async function detectWeather() {
  if (!navigator.geolocation) {
    weatherSummaryEl.textContent = "Location unavailable";
    locationSummaryEl.textContent = "Browser does not support geolocation";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      locationSummaryEl.textContent = "Resolving location...";
      const resolvedLocation = await reverseGeocodeLocation(latitude, longitude);
      locationSummaryEl.textContent = resolvedLocation;

      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_min,temperature_2m_max,weather_code&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`,
        );
        const weatherJson = await weatherRes.json();
        const lowF = weatherJson?.daily?.temperature_2m_min?.[0];
        const highF = weatherJson?.daily?.temperature_2m_max?.[0];
        const weatherCode = weatherJson?.daily?.weather_code?.[0];
        const description = parseWeatherDescription(weatherCode);

        state.weather.lowF = Number.isFinite(lowF) ? lowF : null;
        state.weather.highF = Number.isFinite(highF) ? highF : null;
        state.weather.tempF = state.weather.highF ?? state.weather.lowF ?? null;
        state.weather.rainLikely = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode);
        state.weather.description = description;
        state.weather.location = resolvedLocation;

        if (state.weather.lowF !== null && state.weather.highF !== null) {
          weatherSummaryEl.textContent = `Low ${Math.round(state.weather.lowF)}F / High ${Math.round(state.weather.highF)}F`;
        } else {
          weatherSummaryEl.textContent = "Forecast unavailable";
        }

        saveState();
        renderAll();
      } catch {
        weatherSummaryEl.textContent = "Weather lookup failed";
      }
    },
    () => {
      weatherSummaryEl.textContent = "Weather blocked (allow location)";
      locationSummaryEl.textContent = "Permission denied";
    },
  );
}

function uploadFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

function getLastWornDays(itemId) {
  const logsWithItem = state.wearLogs
    .filter((entry) => entry.itemIds.includes(itemId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (logsWithItem.length === 0) {
    return 999;
  }

  const lastDate = new Date(logsWithItem[0].date);
  const now = new Date(todayISO());
  const diffMs = now - lastDate;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function tempTargetWarmth(tempF) {
  if (tempF === null) return 3;
  if (tempF >= 78) return 1;
  if (tempF >= 66) return 2;
  if (tempF >= 52) return 3;
  if (tempF >= 40) return 4;
  return 5;
}

function colorPairBonus(topColor, bottomColor) {
  const normalizedTop = parseColor(topColor);
  const normalizedBottom = parseColor(bottomColor);

  if (!normalizedTop || !normalizedBottom) {
    return 0;
  }

  const allPairs = [...fixedColorPairs, ...state.customColorPairs];
  const matches = allPairs.some(([a, b]) => {
    const aa = parseColor(a);
    const bb = parseColor(b);
    return (
      (aa === normalizedTop && bb === normalizedBottom) ||
      (aa === normalizedBottom && bb === normalizedTop)
    );
  });

  return matches ? 1 : 0;
}

function scoreItem(item, slot, context) {
  const { activity, tempF, rainLikely } = context;
  let score = 0;

  const activityTags = item.activityTags || [];
  const styleTags = item.styleTags || [];
  const activityFixedBoost = fixedActivityBoost[activity] || [];

  // Priority 1: activity
  if (activityTags.map((t) => t.toLowerCase()).includes(activity.toLowerCase())) {
    score += 50;
  } else if (
    activityFixedBoost
      .map((t) => t.toLowerCase())
      .includes(item.category.toLowerCase()) ||
    styleTags.map((t) => t.toLowerCase()).includes(activity.toLowerCase())
  ) {
    score += 35;
  } else {
    score += 15;
  }

  // Priority 2: weather
  const targetWarmth = tempTargetWarmth(tempF);
  const warmth = Number(item.warmth || 3);
  score += Math.max(0, 30 - Math.abs(targetWarmth - warmth) * 8);

  if (rainLikely && ["Shoes", "Outerwear", "Jackets"].includes(item.category)) {
    score += 8;
  }

  // Priority 3: avoid repeats (Softened penalties)
  const daysSince = getLastWornDays(item.id);
  if (daysSince <= 1) score -= 20; // Dropped from -30. Still discourages back-to-back days.
  else if (daysSince <= 3) score -= 10; // Dropped from -16.
  else if (daysSince <= 7) score -= 5; // Dropped from -8.
  else score += 10;

  // Priority 4: "I really like this" multiplier
  // We changed the multiplier from * 2 to * 5.
  // A 5/5 comfort item now adds +25 points to the score.
  score += Number(item.comfort || 3) * 5;

  if (slot === "layer" && tempF !== null && tempF >= 72) {
    score -= 12;
  }

  if (slot === "bottom" && tempF !== null && tempF >= 76 && item.category === "Shorts") {
    score += 9;
  }

  return score;
}

function pickBestForSlot(slot, context, selectedTop = null) {
  const allowedCategories = slotMap[slot];
  const candidates = state.items.filter(
    (item) =>
      allowedCategories.includes(item.category) &&
      item.isDirty !== true &&
      !sessionRejectedIds.includes(item.id),
  );

  if (candidates.length === 0) {
    return null;
  }

  const scored = candidates
    .map((item) => ({ item, score: scoreItem(item, slot, context) }))
    .sort((a, b) => b.score - a.score);

  if (slot === "bottom" && selectedTop) {
    for (const entry of scored) {
      entry.score += colorPairBonus(selectedTop.color, entry.item.color) * 10;
    }
    scored.sort((a, b) => b.score - a.score);
  }

  return scored[0].item;
}

function buildSuggestion() {
  const tempF = Number.isFinite(Number(state.manualTemp))
    ? Number(state.manualTemp)
    : state.weather.tempF;

  const context = {
    activity: state.activity,
    tempF,
    rainLikely: state.weather.rainLikely,
  };

  const top = pickBestForSlot("top", context);
  const bottom = pickBestForSlot("bottom", context, top);
  const layer = pickBestForSlot("layer", context, top);
  const shoes = pickBestForSlot("shoes", context);
  const extras = pickBestForSlot("extras", context);

  const items = [top, bottom, layer, shoes, extras].filter(Boolean);

  return {
    top,
    bottom,
    layer,
    shoes,
    extras,
    itemIds: items.map((item) => item.id),
    context,
  };
}

function scoreItemForPacking(item, targetWarmth, activity) {
  let score = 0;
  const warmth = Number(item.warmth || 3);
  const comfort = Number(item.comfort || 3);
  const activityTags = (item.activityTags || []).map((tag) => tag.toLowerCase());
  const styleTags = (item.styleTags || []).map((tag) => tag.toLowerCase());
  const activityLower = String(activity || "").toLowerCase();

  score += Math.max(0, 35 - Math.abs(targetWarmth - warmth) * 8);
  score += comfort * 5;

  if (activityTags.includes(activityLower) || styleTags.includes(activityLower)) {
    score += 16;
  }

  return score;
}

function pickPackingItems(allowedCategories, count, context, usedIds) {
  const candidates = state.items
    .filter((item) => allowedCategories.includes(item.category))
    .filter((item) => !usedIds.has(item.id));

  const scored = candidates
    .map((item) => ({
      item,
      score: scoreItemForPacking(item, context.targetWarmth, context.activity),
    }))
    .sort((a, b) => b.score - a.score);

  const chosen = [];
  for (const entry of scored) {
    if (chosen.length >= count) {
      break;
    }
    chosen.push(entry.item);
    usedIds.add(entry.item.id);
  }

  return chosen;
}

function renderPackingList() {
  if (!latestPackingList) {
    packingGridEl.innerHTML = `
      <article class="item-card">
        <h3>No packing list yet</h3>
        <p>Generate a list to see selected pieces.</p>
      </article>
    `;
    return;
  }

  const sections = [
    { label: "Layer / Outerwear", items: latestPackingList.layers },
    { label: "Tops", items: latestPackingList.tops },
    { label: "Bottoms", items: latestPackingList.bottoms },
    { label: "Shoes", items: latestPackingList.shoes },
  ];

  packingGridEl.innerHTML = sections
    .map(
      (section) => `
      <article class="item-card">
        <h3>${section.label} (${section.items.length})</h3>
        ${
          section.items.length
            ? section.items
                .map(
                  (item) =>
                    `<p><strong>${item.name}</strong>${item.brand ? ` (${item.brand})` : ""} - ${item.category}</p>`,
                )
                .join("")
            : "<p>No available items for this slot.</p>"
        }
      </article>
    `,
    )
    .join("");
}

function generatePackingList(averageTempF, days, activity) {
  const tripDays = Math.max(1, Number(days || 1));
  const counts = {
    layers: 1,
    tops: tripDays,
    bottoms: Math.max(1, Math.ceil(tripDays / 3)),
    shoes: Math.max(1, Math.ceil(tripDays / 3)),
  };

  const packingTemp = Number.isFinite(averageTempF) ? averageTempF : 65;
  const context = {
    targetWarmth: tempTargetWarmth(packingTemp),
    activity,
  };

  const usedIds = new Set();
  const layers = pickPackingItems(slotMap.layer, counts.layers, context, usedIds);
  const tops = pickPackingItems(slotMap.top, counts.tops, context, usedIds);
  const bottoms = pickPackingItems(slotMap.bottom, counts.bottoms, context, usedIds);
  const shoes = pickPackingItems(slotMap.shoes, counts.shoes, context, usedIds);

  return { layers, tops, bottoms, shoes, counts };
}

function formatPackingListText(packingList) {
  if (!packingList) {
    return "";
  }

  const sections = [
    { label: "Layers", items: packingList.layers || [] },
    { label: "Tops", items: packingList.tops || [] },
    { label: "Bottoms", items: packingList.bottoms || [] },
    { label: "Shoes", items: packingList.shoes || [] },
  ];

  return sections
    .map((section) => {
      const lines = section.items.length
        ? section.items.map((item, index) => {
            const detail = [item.category, item.color, item.brand].filter(Boolean).join(" | ");
            return `${index + 1}. ${item.name}${detail ? ` (${detail})` : ""}`;
          })
        : ["- None selected"];
      return `${section.label}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

function saveWearLog(itemIds, source = "manual") {
  if (!itemIds.length) {
    return;
  }

  const date = wearDateEl.value || todayISO();
  const notes = wearNotesEl.value.trim();
  const activity = state.activity;

  state.wearLogs.unshift({
    id: crypto.randomUUID(),
    date,
    itemIds,
    notes,
    activity,
    source,
  });

  const wornSet = new Set(itemIds);
  state.items = state.items.map((item) =>
    wornSet.has(item.id) ? { ...item, isDirty: true } : item,
  );

  // Keep history manageable.
  state.wearLogs = state.wearLogs.slice(0, 365);
  saveState();
}

function slotTitle(slot) {
  const lookup = {
    top: "Top",
    layer: "Layer",
    bottom: "Bottom",
    shoes: "Shoes",
    extras: "Extras",
  };
  return lookup[slot] || slot;
}

function renderCategoryOptions() {
  const selectedCategory = categories.includes(state.draftItemCategory)
    ? state.draftItemCategory
    : categories[0];
  itemCategoryEl.innerHTML = categories
    .map(
      (category) =>
        `<option value="${category}" ${category === selectedCategory ? "selected" : ""}>${category}</option>`,
    )
    .join("");
}

function renderSuggestion() {
  latestSuggestion = buildSuggestion();

  const tempText = Number.isFinite(latestSuggestion.context.tempF)
    ? `${Math.round(latestSuggestion.context.tempF)}F`
    : "unknown temp";

  suggestionSummaryEl.textContent =
    `Activity: ${latestSuggestion.context.activity} | Weather: ${tempText}, ${state.weather.description}. ` +
    "Ranking priority: activity, weather, recency, comfort.";

  const slots = ["top", "bottom", "layer", "shoes", "extras"];
  suggestionGridEl.innerHTML = slots
    .map((slot) => {
      const item = latestSuggestion[slot];
      if (!item) {
        return `<article class="suggestion-card"><h3>${slotTitle(slot)}</h3><p>No item in this category yet.</p></article>`;
      }

      const lastDays = getLastWornDays(item.id);
      const lastWorn = lastDays === 999 ? "Never worn" : `${lastDays} day(s) ago`;
      return `
        <article class="suggestion-card">
          <h3>${slotTitle(slot)}</h3>
          <strong>${item.name}</strong>
          <p>${item.category}${item.color ? ` | ${item.color}` : ""}</p>
          <p>${item.brand ? `Brand: ${item.brand}` : "Brand: Not set"}</p>
          <p>Comfort ${item.comfort || 3}/5 | Warmth ${item.warmth || 3}/5</p>
          <p>Last worn: ${lastWorn}</p>
          <button class="btn-secondary shuffle-item" data-slot="${slot}" type="button">Shuffle</button>
        </article>
      `;
    })
    .join("");
}

function renderSelectionGrid() {
  const slots = ["top", "layer", "bottom", "shoes", "extras"];

  selectionGridEl.innerHTML = slots
    .map((slot) => {
      const items = state.items.filter((item) => slotMap[slot].includes(item.category));
      return `
        <article class="slot-block">
          <h3>${slotTitle(slot)}</h3>
          <div>
            ${items
              .map((item) => {
                const active = state.selectedForLog[slot] === item.id ? "active" : "";
                return `<button type="button" class="item-chip ${active}" data-slot="${slot}" data-item-id="${item.id}">${item.name}</button>`;
              })
              .join("") || "<p class=\"hint\">No items yet.</p>"}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderWardrobeLibrary() {
  const groups = categories.map((category) => ({
    category,
    items: state.items.filter((item) => item.category === category),
  }));

  wardrobeLibraryEl.innerHTML = groups
    .map(
      (group) => `
      <article class="item-card">
        <h3>${group.category} (${group.items.length})</h3>
        ${group.items
          .map((item) => {
            return `
              <div>
                <strong>${item.name}</strong>
                <p>${item.color || "No color"} | Warmth ${item.warmth}/5 | Comfort ${item.comfort}/5</p>
                <p>${item.brand ? `Brand: ${item.brand}` : "Brand: Not set"}</p>
                <p>${(item.activityTags || []).join(", ") || "No activity tags"}</p>
                ${item.photo ? `<img class="item-photo" src="${item.photo}" alt="${item.name}" />` : ""}
                <button class="delete-btn" type="button" data-delete-item="${item.id}">Delete</button>
              </div>
            `;
          })
          .join("")}
      </article>
    `,
    )
    .join("");
}

function renderLaundryBasket() {
  const dirtyItems = state.items.filter((item) => item.isDirty === true);

  if (!dirtyItems.length) {
    laundryBasketEl.innerHTML = `
      <article class="item-card">
        <h3>All clean</h3>
        <p>No items in laundry basket.</p>
      </article>
    `;
    return;
  }

  laundryBasketEl.innerHTML = dirtyItems
    .map(
      (item) => `
      <article class="item-card">
        <h3>${item.name}</h3>
        <p>${item.category}${item.color ? ` | ${item.color}` : ""}</p>
        <p>${item.brand ? `Brand: ${item.brand}` : "Brand: Not set"}</p>
        <button class="btn-secondary" type="button" data-mark-clean="${item.id}">Mark as Clean</button>
      </article>
    `,
    )
    .join("");
}

function renderHistory() {
  historyListEl.innerHTML = state.wearLogs
    .slice(0, 30)
    .map((log) => {
      const names = log.itemIds
        .map((id) => state.items.find((item) => item.id === id)?.name)
        .filter(Boolean)
        .join(" + ");

      return `<li><strong>${log.date}</strong> (${log.activity}): ${names || "Missing items"}${log.notes ? ` | ${log.notes}` : ""}</li>`;
    })
    .join("");

  if (!state.wearLogs.length) {
    historyListEl.innerHTML = "<li>No outfits logged yet.</li>";
  }
}

function renderRules() {
  const rules = [...fixedColorPairs.map((pair) => ({ pair, fixed: true })), ...state.customColorPairs.map((pair) => ({ pair, fixed: false }))];

  rulesListEl.innerHTML = rules
    .map(({ pair, fixed }) => {
      const [a, b] = pair;
      return `<li>${a} + ${b}${fixed ? " (default)" : ""}</li>`;
    })
    .join("");
}

function renderWeather() {
  if (Number.isFinite(state.weather.lowF) && Number.isFinite(state.weather.highF)) {
    weatherSummaryEl.textContent = `Low ${Math.round(state.weather.lowF)}F / High ${Math.round(state.weather.highF)}F`;
  } else {
    weatherSummaryEl.textContent = "Forecast unavailable";
  }
  locationSummaryEl.textContent = state.weather.location;
}

function renderTravelStops() {
  if (!state.travelStops.length) {
    travelStopsEl.innerHTML = `
      <article class="item-card">
        <p>Add at least one city stop.</p>
      </article>
    `;
    return;
  }

  travelStopsEl.innerHTML = state.travelStops
    .map(
      (stop) => `
      <article class="item-card travel-stop-row">
        <label>
          City
          <input data-stop-id="${stop.id}" data-stop-field="city" value="${stop.city}" placeholder="City" />
        </label>
        <label>
          Country
          <input data-stop-id="${stop.id}" data-stop-field="country" value="${stop.country}" placeholder="Country" />
        </label>
        <label>
          Days
          <input data-stop-id="${stop.id}" data-stop-field="days" type="number" min="1" value="${Math.max(1, Number(stop.days || 1))}" />
        </label>
        <button class="delete-btn" type="button" data-remove-stop="${stop.id}">Remove</button>
      </article>
    `,
    )
    .join("");
}

function renderReminder() {
  const now = new Date();
  const hour = now.getHours();
  const hasTodayLog = state.wearLogs.some((log) => log.date === todayISO());

  if (hour >= 10 && !hasTodayLog) {
    reminderBannerEl.classList.remove("hidden");
    reminderBannerEl.textContent = "10:00 reminder: you have not logged an outfit today yet.";
  } else {
    reminderBannerEl.classList.add("hidden");
  }
}

function renderControls() {
  wearDateEl.value = wearDateEl.value || todayISO();
  activitySelectEl.value = state.activity;
  manualTempInputEl.value = state.manualTemp;
  tripStartDateEl.value = state.tripStartDate || "";
}

function renderAll() {
  renderControls();
  renderWeather();
  renderRules();
  renderSuggestion();
  renderSelectionGrid();
  renderTravelStops();
  renderPackingList();
  renderWardrobeLibrary();
  renderLaundryBasket();
  renderHistory();
  renderReminder();
}

addItemFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("itemName").value.trim();
  if (!name) {
    return;
  }

  const photoFile = document.getElementById("itemPhoto").files?.[0];
  let photo = "";

  if (photoFile) {
    try {
      photo = await uploadFileToDataUrl(photoFile);
    } catch {
      photo = "";
    }
  }

  const item = {
    id: crypto.randomUUID(),
    name,
    category: itemCategoryEl.value,
    color: document.getElementById("itemColor").value.trim(),
    brand: document.getElementById("itemBrand").value.trim(),
    isDirty: false,
    warmth: Math.max(1, Math.min(5, Number(document.getElementById("itemWarmth").value || 3))),
    comfort: Math.max(1, Math.min(5, Number(document.getElementById("itemComfort").value || 3))),
    activityTags: sanitizeTags(document.getElementById("itemActivities").value),
    styleTags: sanitizeTags(document.getElementById("itemStyles").value),
    photo,
  };

  state.items.push(item);
  saveState();
  const preservedCategory = itemCategoryEl.value;
  addItemFormEl.reset();
  state.draftItemCategory = categories.includes(preservedCategory)
    ? preservedCategory
    : categories[0];
  renderCategoryOptions();
  document.getElementById("itemWarmth").value = "3";
  document.getElementById("itemComfort").value = "3";
  renderAll();
});

laundryBasketEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const itemId = target.dataset.markClean;
  if (!itemId) {
    return;
  }

  state.items = state.items.map((item) =>
    item.id === itemId ? { ...item, isDirty: false } : item,
  );
  saveState();
  renderAll();
});

doAllLaundryBtnEl.addEventListener("click", () => {
  state.items = state.items.map((item) => ({ ...item, isDirty: false }));
  saveState();
  renderAll();
});

itemCategoryEl.addEventListener("change", () => {
  state.draftItemCategory = itemCategoryEl.value;
  saveState();
});

ruleFormEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const topColor = document.getElementById("ruleTopColor").value.trim();
  const bottomColor = document.getElementById("ruleBottomColor").value.trim();

  if (!topColor || !bottomColor) {
    return;
  }

  state.customColorPairs.push([topColor, bottomColor]);
  saveState();
  ruleFormEl.reset();
  renderAll();
});

selectionGridEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const slot = target.dataset.slot;
  const itemId = target.dataset.itemId;
  if (!slot || !itemId) {
    return;
  }

  state.selectedForLog[slot] = state.selectedForLog[slot] === itemId ? null : itemId;
  saveState();
  renderSelectionGrid();
});

suggestionGridEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  if (!target.classList.contains("shuffle-item")) {
    return;
  }

  const slot = target.dataset.slot;
  if (!slot || !latestSuggestion) {
    return;
  }

  const currentItem = latestSuggestion[slot];
  if (currentItem?.id) {
    sessionRejectedIds.push(currentItem.id);
  }

  const selectedTop =
    slot === "bottom" || slot === "layer" ? latestSuggestion.top : null;
  const replacement = pickBestForSlot(slot, latestSuggestion.context, selectedTop);
  latestSuggestion[slot] = replacement;
  latestSuggestion.itemIds = ["top", "bottom", "layer", "shoes", "extras"]
    .map((slotKey) => latestSuggestion[slotKey]?.id)
    .filter(Boolean);

  renderSuggestion();
});

wardrobeLibraryEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const id = target.dataset.deleteItem;
  if (!id) {
    return;
  }

  state.items = state.items.filter((item) => item.id !== id);

  for (const slot of Object.keys(state.selectedForLog)) {
    if (state.selectedForLog[slot] === id) {
      state.selectedForLog[slot] = null;
    }
  }

  saveState();
  renderAll();
});

saveLogBtnEl.addEventListener("click", () => {
  const selectedIds = Object.values(state.selectedForLog).filter(Boolean);
  saveWearLog(selectedIds, "manual");
  renderAll();
});

logSuggestedBtnEl.addEventListener("click", () => {
  if (!latestSuggestion || !latestSuggestion.itemIds.length) {
    return;
  }

  saveWearLog(latestSuggestion.itemIds, "suggested");
  renderAll();
});

activitySelectEl.addEventListener("change", () => {
  state.activity = activitySelectEl.value;
  saveState();
  renderAll();
});

manualTempInputEl.addEventListener("input", () => {
  state.manualTemp = manualTempInputEl.value;
  saveState();
  renderAll();
});

tripStartDateEl.addEventListener("change", () => {
  state.tripStartDate = tripStartDateEl.value || "";
  saveState();
});

addTravelStopBtnEl.addEventListener("click", () => {
  state.travelStops.push({
    id: crypto.randomUUID(),
    city: "",
    country: "",
    days: 1,
  });
  saveState();
  renderTravelStops();
});

travelStopsEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const stopId = target.dataset.stopId;
  const field = target.dataset.stopField;
  if (!stopId || !field) {
    return;
  }

  state.travelStops = state.travelStops.map((stop) => {
    if (stop.id !== stopId) {
      return stop;
    }

    if (field === "days") {
      return { ...stop, days: Math.max(1, Number(target.value || 1)) };
    }

    if (field === "city") {
      return { ...stop, city: target.value };
    }

    if (field === "country") {
      return { ...stop, country: target.value };
    }

    return stop;
  });

  saveState();
});

travelStopsEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const stopId = target.dataset.removeStop;
  if (!stopId) {
    return;
  }

  state.travelStops = state.travelStops.filter((stop) => stop.id !== stopId);
  saveState();
  renderTravelStops();
});

generatePackingBtnEl.addEventListener("click", async () => {
  const validStops = state.travelStops
    .map((stop) => ({
      ...stop,
      city: String(stop.city || "").trim(),
      country: String(stop.country || "").trim(),
      days: Math.max(1, Number(stop.days || 1)),
    }))
    .filter((stop) => stop.city && stop.country);

  if (!validStops.length) {
    packingSummaryEl.textContent = "Add at least one valid city and country stop.";
    copyPackingBtnEl.classList.add("hidden");
    return;
  }

  packingSummaryEl.textContent = "Fetching multi-city forecasts...";

  try {
    const startDate = state.tripStartDate || todayISO();
    let dayOffset = 0;
    const stopForecasts = [];

    for (const stop of validStops) {
      const geo = await geocodeCityCountry(stop.city, stop.country);
      if (!geo) {
        continue;
      }

      const stopStart = addDays(startDate, dayOffset);
      const tempData = await fetchStopAverageTemp(geo.latitude, geo.longitude, stopStart);
      stopForecasts.push({
        ...stop,
        placeLabel: geo.placeLabel,
        stopStart,
        averageTempF: tempData.averageTempF,
        source: tempData.source,
      });
      dayOffset += stop.days;
    }

    if (!stopForecasts.length) {
      packingSummaryEl.textContent = "Could not resolve any stop weather.";
      copyPackingBtnEl.classList.add("hidden");
      return;
    }

    const totalDays = stopForecasts.reduce((sum, stop) => sum + stop.days, 0);
    const weightedTemp =
      stopForecasts.reduce((sum, stop) => {
        const avg = Number.isFinite(stop.averageTempF) ? stop.averageTempF : 65;
        return sum + avg * stop.days;
      }, 0) / Math.max(1, totalDays);

    latestPackingList = generatePackingList(weightedTemp, totalDays, state.activity);

    const stopsText = stopForecasts
      .map(
        (stop) =>
          `${stop.placeLabel} (${stop.days}d, avg ${Number.isFinite(stop.averageTempF) ? `${Math.round(stop.averageTempF)}F` : "unknown"})`,
      )
      .join(" -> ");

    packingSummaryEl.textContent =
      `Trip starts ${startDate}. Stops: ${stopsText}. ` +
      `Capsule: 1 Layer, ${totalDays} Tops, ${Math.max(1, Math.ceil(totalDays / 3))} Bottoms, ${Math.max(1, Math.ceil(totalDays / 3))} Shoes. ` +
      "Packing ignores dirty/recent-wear rules by design.";

    copyPackingBtnEl.classList.remove("hidden");
    renderPackingList();
  } catch {
    packingSummaryEl.textContent = "Failed to fetch travel weather. Try again.";
    copyPackingBtnEl.classList.add("hidden");
  }
});

copyPackingBtnEl.addEventListener("click", async () => {
  if (!latestPackingList) {
    return;
  }

  const formatted = formatPackingListText(latestPackingList);
  if (!formatted) {
    return;
  }

  try {
    await navigator.clipboard.writeText(formatted);
    const originalLabel = "Copy to Clipboard";
    copyPackingBtnEl.textContent = "Copied!";
    setTimeout(() => {
      copyPackingBtnEl.textContent = originalLabel;
    }, 2000);
  } catch {
    packingSummaryEl.textContent = "Could not copy packing list to clipboard.";
  }
});

wearDateEl.addEventListener("change", () => {
  renderReminder();
});

renderCategoryOptions();
detectWeather();
renderAll();
