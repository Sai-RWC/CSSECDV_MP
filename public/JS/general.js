function openSidebar() {
  document.getElementById("sidebar").classList.add("active");
  document.addEventListener("click", handleOutsideClick);
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("active");
  document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(event) {
  const sidebar = document.getElementById("sidebar");
  const openButton = document.querySelector("button[onclick='openSidebar()']");

  if (!sidebar.contains(event.target) && !openButton.contains(event.target)) {
    closeSidebar();
  }
}

function goBack() {
  window.history.back();
}