// RESERVATION TIME SLOTS

const timeLabels = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
  "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
  "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
  "8:30 PM", "9:00 PM"
];

function populateDateAndTime() {
  const startSelect = document.querySelector("#startTime");
  const endSelect = document.querySelector("#endTime");
  const dateInput = document.querySelector("#date");

  // Prevent manual typing
  dateInput.addEventListener("keydown", e => e.preventDefault());

  // Populate start time
  startSelect.innerHTML = `<option value="">-- Select --</option>`;
  timeLabels.forEach((label, index) => {
    startSelect.innerHTML += `<option value="${index}">${label}</option>`;
  });

  // When start time is selected, populate end time
  startSelect.addEventListener("change", () => {
    const startIndex = parseInt(startSelect.value);
    endSelect.innerHTML = `<option value="">-- Select --</option>`;

    if (!isNaN(startIndex)) {
      for (let i = startIndex + 1; i < timeLabels.length; i++) {
        endSelect.innerHTML += `<option value="${i}">${timeLabels[i]}</option>`;
      }
    }

    allowFields();
  });
}


// FORM VALIDATION

function allowFields() {
  const labSelect = document.querySelector("#lab");
  const dateInput = document.querySelector("#date");
  const startTime = document.querySelector("#startTime");
  const endTime = document.querySelector("#endTime");
  const searchBtn = document.querySelector("#submitSearch");

  const selectedLab = labSelect.value;
  const selectedDate = dateInput.value;
  const selectedStart = startTime.value;
  const selectedEnd = endTime.value;

  // Enable button if all fields filled
  if (selectedLab && selectedDate && selectedStart && selectedEnd) {
    searchBtn.disabled = false;
    searchBtn.classList.add("active");
  } else {
    searchBtn.disabled = true;
    searchBtn.classList.remove("active");
  }
}


// INIT ON PAGE LOAD

document.addEventListener("DOMContentLoaded", () => {
  populateDateAndTime();

  document.querySelector("#lab").addEventListener("change", allowFields);
  document.querySelector("#date").addEventListener("change", allowFields);
  document.querySelector("#endTime").addEventListener("change", allowFields);
});
