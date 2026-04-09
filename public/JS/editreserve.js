
function loadIframe() {
  const lab = document.getElementById("labSelect").value;
  const date = document.getElementById("resDate").value;
  const start = document.querySelector("select[name='startTime']").value;
  const end = document.querySelector("select[name='endTime']").value;

  if (!lab || !date || !start || !end) return;

  const iframe = document.getElementById("slotAreaContents");
  iframe.src = `/reserveiframe?lab=${lab}&date=${date}&start=${start}&end=${end}`;
}

function populateDateAndTime() {
  const timeLabels = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
    "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
    "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
    "8:30 PM", "9:00 PM"
  ];

  const startTimeSelect = document.querySelector("select.startTime");
  const endTimeSelect = document.querySelector("select.endTime");
  const dateInput = document.getElementById("resDate");

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  dateInput.setAttribute("min", minDate);
  dateInput.setAttribute("max", maxDate);

  dateInput.addEventListener('change', renderTimeOptions);

  function renderTimeOptions() {
    const selectedDate = new Date(dateInput.value);
    const now = new Date();

    // Prefill selected values
    const startIndex = document.documentElement.dataset.start;
    const endIndex = document.documentElement.dataset.end;
    if (startIndex) startTimeSelect.value = startIndex;
    if (endIndex) endTimeSelect.value = endIndex;

    startTimeSelect.disabled = false;
    endTimeSelect.disabled = false;

    allowFields();
  }

  renderTimeOptions();
}

function allowFields() {
  const resDate = document.querySelector("#resDate");
  const startTime = document.querySelector(".startTime");
  const endTime = document.querySelector(".endTime");
  const labSelect = document.getElementById("labSelect");
  const slotIframe = document.getElementById("slotAreaContents");
  const confirmBtn = document.querySelector(".confirmRes");

  const dateFilled = resDate.value;
  const startFilled = startTime.value;
  const endFilled = endTime.value;
  const labFilled = labSelect.value;

  //[lab, date, start, end].forEach(input => {
  [labSelect, resDate, startTime, endTime].forEach(input => {
    input.addEventListener("change", loadIframe);
  });

  // Load once on page load if values already exist
  loadIframe();

  // Validate time order
  if (startFilled && endFilled && parseInt(endFilled) <= parseInt(startFilled)) {
    confirmBtn.disabled = true;
    confirmBtn.classList.remove("active");
    return;
  }

  labSelect.disabled = !(dateFilled && startFilled && endFilled);

  if (dateFilled && startFilled && endFilled && labFilled) {
    slotIframe.src = `/reserveiframe?date=${resDate.value}&start=${startFilled}&end=${endFilled}&lab=${labFilled}`;
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  } else {
    slotIframe.src = "/unavailiframe";
    confirmBtn.disabled = true;
    confirmBtn.classList.remove("active");
  }
}

window.addEventListener('message', (event) => {
  const labSelect = document.getElementById("labSelect");
  const chosenSlot = document.querySelector(".chosenSlot");
  const { seat } = event.data || {};
  const confirmBtn = document.querySelector(".confirmRes");

  if (seat) {
    const selectedOption = labSelect.options[labSelect.selectedIndex];
    const labName = selectedOption ? selectedOption.text : `Lab ${labSelect.value}`;
    chosenSlot.value = `${labName}, seat ${seat}`;
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#resDate").addEventListener("change", allowFields);
  document.querySelector(".startTime").addEventListener("change", allowFields);
  document.querySelector(".endTime").addEventListener("change", allowFields);
  document.querySelector(".labSelect").addEventListener("change", allowFields);

  populateDateAndTime();

  const reservSuccess = document.getElementById("reservSuccess");
  if (reservSuccess) {
    setTimeout(() => reservSuccess.remove(), 3000);
  }
});
