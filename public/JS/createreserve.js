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
  const startSelect = document.querySelector("select.startTime");
  const endSelect = document.querySelector("select.endTime");
  const dateInput = document.getElementById("resDate");

  // only allow 7 days ahead
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  dateInput.setAttribute("min", minDate);
  dateInput.setAttribute("max", maxDate);

  // Prevent manual input
  dateInput.addEventListener('keydown', (e) => {
    e.preventDefault();
  });

  // start time options
  startSelect.innerHTML = `<option value="">-- None --</option>`;
  timeLabels.forEach((label, index) => {
      startSelect.innerHTML += `<option value="${index}">${label}</option>`;
  });

  // end time options only takes times >= start
  startSelect.addEventListener("change", () => {
      const startIndex = parseInt(startSelect.value);

      endSelect.innerHTML = `<option value="">-- None --</option>`;
      if (!isNaN(startIndex)) {
          for (let i = startIndex + 1; i < timeLabels.length; i++) {
              endSelect.innerHTML += `<option value="${i}">${timeLabels[i]}</option>`;
          }
      }
  });
}



// FORM VALIDATION
function allowFields() {
  const resDate = document.querySelector("#resDate");
  const startSelect = document.querySelector("select.startTime");
  const endSelect = document.querySelector("select.endTime");
  const labSelect = document.getElementById("labSelect");
  const slotIframe = document.getElementById("slotAreaContents");
  const confirmBtn = document.querySelector(".confirmRes");

  const dateFilled = resDate.value;
  const startFilled = startSelect.value;
  const endFilled = endSelect.value;
  const labFilled = labSelect.value;

  // Active start time
  if (dateFilled) {
    startSelect.disabled = false;
    startSelect.classList.add("active");
  } else {
    startSelect.disabled = true;
    startSelect.classList.remove("active");
    startSelect.value = "";
  }

  // Active end time
  if (startFilled) {
    endSelect.disabled = false;
    endSelect.classList.add("active");
  } else {
    endSelect.disabled = true;
    endSelect.classList.remove("active");
    endSelect.value = "";
  }

  // Active lab selection
  if (dateFilled && startFilled && endFilled) {
    labSelect.disabled = false;
    labSelect.classList.add("active");
  } else {
    labSelect.disabled = true;
    labSelect.classList.remove("active");
  }

  // Active seats iframe
  if (dateFilled && startFilled && endFilled && labFilled) {
    slotIframe.src = `/reserveiframe?date=${dateFilled}&start=${startFilled}&end=${endFilled}&lab=${labFilled}`;
  } else {
    slotIframe.src = "/unavailiframe";
  }

  confirmBtn.disabled = true;
  confirmBtn.classList.remove("active");
}


// DYNAMIC CHOSEN SLOT
window.addEventListener('message', (event) => {
  const labFilled = document.getElementById("labSelect").value;
  const chosenSlot = document.querySelector(".chosenSlot");
  const { seat } = event.data || {};

  const confirmBtn = document.querySelector(".confirmRes");

  if (seat) {
    chosenSlot.value = `Lab ${labFilled}, seat ${seat}`;
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  }
});



document.addEventListener("DOMContentLoaded", function () {
  // Disable fields whenever one is changed
  document.querySelector("#resDate").addEventListener("change", allowFields);
  document.querySelector(".startTime").addEventListener("change", allowFields);
  document.querySelector(".endTime").addEventListener("change", allowFields);
  document.getElementById("labSelect").addEventListener("change", allowFields);

  // populate time
  populateDateAndTime();

  // Success message when reservation is made
  const reservSuccess = document.getElementById("reservSuccess");
  if (reservSuccess) {
    setTimeout(() => {
      
      // disappearing message
      reservSuccess.remove();

    }, 3000);
  }
});