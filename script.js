// If you don't see this in the Console, script.js is not loading
console.log("✅ script.js loaded");

const calendarEl = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
const inOfficeCountEl = document.getElementById("inOfficeCount");
const possibleDaysEl = document.getElementById("possibleDays");
const attendanceScoreEl = document.getElementById("attendanceScore");
const daysNeededEl = document.getElementById("daysNeeded");

let currentDate = new Date();
const WEEKLY_TARGET = 3;

function storageKey() {
  // Bump version if you want a clean slate:
  // return `attendance-v2-${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  return `attendance-${currentDate.getFullYear()}-${currentDate.getMonth()}`;
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

  let inOffice = 0;
  let weekdayCount = 0;
  let ptoCount = 0;
  let wfaCount = 0;

  // Spacer cells before the first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = `${year}-${month + 1}-${day}`;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    const div = document.createElement("div");
    div.className = "day";

    if (isWeekend) {
      div.classList.add("weekend");
      div.innerHTML = `<strong>${day}</strong>`;
      calendarEl.appendChild(div);
      continue;
    }

    weekdayCount++;

    // Default is Home
    let state = data[dateKey] || "home";
    if (state === "wfh") state = "home"; // legacy safeguard

    if (state === "office") inOffice++;
    if (state === "pto") ptoCount++;
    if (state === "wfa") wfaCount++;

    if (state !== "home") div.classList.add(state);

    const select = document.createElement("select");
    select.innerHTML = `
      <option value="office">In Office</option>
      <option value="home">Home</option>
      <option value="pto">PTO</option>
      <option value="wfa">WFA</option>
    `;
    select.value = state;

    select.addEventListener("change", () => {
      data[dateKey] = select.value;
      saveData(data);
      renderCalendar();
    });

    div.innerHTML = `<strong>${day}</strong>`;
    div.appendChild(select);
    calendarEl.appendChild(div);
  }

  // Possible days exclude PTO + WFA
  const possibleDays = Math.max(weekdayCount - ptoCount - wfaCount, 0);

  // Target rounds UP
  const monthlyTargetDays = Math.ceil((possibleDays / 5) * WEEKLY_TARGET);
  const daysNeeded = Math.max(monthlyTargetDays - inOffice, 0);

  const attendanceScore =
    possibleDays > 0 ? ((inOffice / possibleDays) * 5).toFixed(2) : "0.00";

  inOfficeCountEl.textContent = inOffice;
  possibleDaysEl.textContent = possibleDays;
  daysNeededEl.textContent = daysNeeded;
  attendanceScoreEl.textContent = attendanceScore;
}

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
``
