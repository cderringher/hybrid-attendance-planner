const calendarEl = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
const inOfficeCountEl = document.getElementById("inOfficeCount");
const possibleDaysEl = document.getElementById("possibleDays");
const attendanceScoreEl = document.getElementById("attendanceScore");

let currentDate = new Date();

const STATES = ["office", "wfh", "pto", "wfa"];
const STATE_LABELS = {
  office: "In Office",
  wfh: "WFH",
  pto: "PTO",
  wfa: "WFA"
};

function getStorageKey(date) {
  return `attendance-${date.getFullYear()}-${date.getMonth()}`;
}

function loadData() {
  return JSON.parse(localStorage.getItem(getStorageKey(currentDate))) || {};
}

function saveData(data) {
  localStorage.setItem(getStorageKey(currentDate), JSON.stringify(data));
}

function renderCalendar() {
  calendarEl.innerHTML = "";
  const data = loadData();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthLabel.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  let inOffice = 0;
  let possibleDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month + 1}-${day}`;
    const state = data[dateStr];
    const dateObj = new Date(year, month, day);

    const div = document.createElement("div");
    div.className = "day";

    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
      div.classList.add("weekend");
    } else {
      possibleDays++;
    }

    if (state) {
      div.classList.add(state);
      div.innerHTML = `<strong>${day}</strong><label>${STATE_LABELS[state]}</label>`;

      if (state === "office") inOffice++;
      if (state === "pto" || state === "wfa") possibleDays--;
    } else {
      div.innerHTML = `<strong>${day}</strong>`;
    }

    div.onclick = () => {
      const currentIndex = STATES.indexOf(state);
      const nextState = STATES[(currentIndex + 1) % STATES.length];
      data[dateStr] = nextState;
      saveData(data);
      renderCalendar();
    };

    calendarEl.appendChild(div);
  }

  inOfficeCountEl.textContent = inOffice;
  possibleDaysEl.textContent = possibleDays;
  attendanceScoreEl.textContent =
    possibleDays > 0 ? ((inOffice / possibleDays) * 5).toFixed(2) : "0";
}

document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

renderCalendar();
