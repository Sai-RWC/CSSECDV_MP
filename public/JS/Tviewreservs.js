const Reservations = require("../../models/Reservations");

//for edit
document.addEventListener("DOMContentLoaded", function () {
  const resDate = document.getElementById("resDate");
  const confirmBtn = document.querySelector(".confirmRes");

  const today = new Date();
  const reservationDate = new Date(resDate.value);

  const notExpired = reservationDate.setHours(0,0,0,0) >= today.setHours(0,0,0,0);

  // Continue original setup
  document.querySelector("#resDate").addEventListener("change", allowFields);
  document.querySelector(".timeSlot").addEventListener("change", allowFields);
  document.querySelector(".labSelect").addEventListener("change", allowFields);
  populateDateAndTime();

  const reservSuccess = document.getElementById("reservSuccess");
  if (reservSuccess) {
    setTimeout(() => {
      reservSuccess.remove();
    }, 3000);
  }
});