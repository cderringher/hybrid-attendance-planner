
alert("✅ script.js is running");

const calendarEl = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
const inOfficeCountEl = document.getElementById("inOfficeCount");
const possibleDaysEl = document.getElementById("possibleDays");
const attendanceScoreEl = document.getElementById("attendanceScore");
const daysNeededEl = document.getElementById("daysNeeded");

let currentDate = new Date();

// Hybrid policy assumptions
const WEEKLY_TARGET = 3;

// Labels for UI
const LABELS = {
  office: "In Office",
  home: "Home",
  pto: "PTO",
  wfa: "WFA"
};

// Storage key per month.
// If you had older versions with different values (like "wfh"),
// consider changing this to attendance-v2-... OR clear localStorage once.
function storageKey() {
  return `attendance-${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  // return `attendance-v2-${currentDate.getFullYear()}-${currentDate.getMonth()}`; // optional
}

function loadData() {
  return JSON.parse(localStorage.getItem(storageKey())) || {};
}

function saveData(data) {
  localStorage.setItem(storageKey(), JSON.stringify(data));
}

function renderCalendar() {
  calendarEl.innerHTML = "";
  const data = loadData();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Counts used for calculations
  let inOffice = 0;
  let weekdayCount = 0;
  let ptoCount = 0;
  let wfaCount = 0;

  // Spacer cells before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = `${year}-${month + 1}-${day}`; // simple key; no leading zeros needed
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    const div = document.createElement("div");
    div.className = "day";

    // Weekends: display only
    if (isWeekend) {
      div.classList.add("weekend");
      div.innerHTML = `<strong>${day}</strong>`;
      calendarEl.appendChild(div);
      continue;
    }

    // Weekday
    weekdayCount++;

    // Default state = Home (white)
    // Also handle legacy "wfh" values if they exist in storage
    let state = data[dateKey] || "home";
    if (state === "wfh") state = "home"; // legacy migration safeguard

    // Count categories
    if (state === "office") inOffice++;
