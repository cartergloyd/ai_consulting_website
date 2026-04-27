const calendarDays = document.querySelector("#calendar-days");
const calendarMonth = document.querySelector("#calendar-month");
const previousMonth = document.querySelector("#prev-month");
const nextMonth = document.querySelector("#next-month");
const timeSlots = document.querySelector("#time-slots");
const selectionSummary = document.querySelector("#selection-summary");
const meetingDate = document.querySelector("#meeting-date");
const meetingTime = document.querySelector("#meeting-time");

const state = {
  weekStart: startOfWeek(new Date()),
  date: null,
  time: null
};

function startOfWeek(date) {
  const day = startOfDay(date);
  day.setDate(day.getDate() - day.getDay());
  return day;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDate(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function formatTime(hour, minute) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2026, 0, 1, hour, minute));
}

function availableTimes() {
  const slots = [];

  for (let hour = 8; hour <= 17; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 17 && minute === 30) {
        continue;
      }

      slots.push(formatTime(hour, minute));
    }
  }

  return slots;
}

function updateSummary() {
  if (!state.date || !state.time) {
    selectionSummary.textContent = "Select a date and time.";
    meetingDate.value = "";
    meetingTime.value = "";
    return;
  }

  selectionSummary.textContent = `${formatDate(state.date)} at ${state.time}`;
  meetingDate.value = formatDate(state.date);
  meetingTime.value = state.time;
}

function selectDate(date) {
  state.date = date;
  state.time = null;
  state.weekStart = startOfWeek(date);
  renderCalendar();
  renderTimes();
  updateSummary();
}

function renderCalendar() {
  calendarDays.replaceChildren();
  const rangeEnd = new Date(state.weekStart);
  rangeEnd.setDate(rangeEnd.getDate() + 20);
  calendarMonth.textContent = `${formatMonth(state.weekStart)} – ${formatMonth(rangeEnd)}`;

  const today = startOfDay(new Date());
  const totalCells = 21;

  for (let index = 0; index < totalCells; index += 1) {
    const date = new Date(state.weekStart);
    date.setDate(date.getDate() + index);
    const isPast = startOfDay(date) < today;

    const button = document.createElement("button");
    button.className = "date-button";
    button.type = "button";
    button.disabled = isPast;

    const dayNumber = document.createElement("span");
    dayNumber.className = "day-number";
    dayNumber.textContent = String(date.getDate());

    const status = document.createElement("span");
    status.className = "day-status";
    status.textContent = !isPast ? "Open" : "";

    button.append(dayNumber, status);

    if (sameDate(date, state.date)) {
      button.classList.add("selected");
    }

    if (!button.disabled) {
      button.setAttribute("aria-label", formatDate(date));
      button.addEventListener("click", () => selectDate(date));
    }

    calendarDays.append(button);
  }
}

function renderTimes() {
  timeSlots.replaceChildren();

  availableTimes().forEach((time) => {
    const button = document.createElement("button");
    button.className = "time-button";
    button.type = "button";
    button.textContent = time;

    if (time === state.time) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      state.time = time;
      document.querySelectorAll(".time-button").forEach((node) => node.classList.toggle("selected", node === button));
      updateSummary();
    });

    timeSlots.append(button);
  });
}

previousMonth.addEventListener("click", () => {
  state.weekStart.setDate(state.weekStart.getDate() - 21);
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  state.weekStart.setDate(state.weekStart.getDate() + 21);
  renderCalendar();
});

selectDate(startOfDay(new Date()));
