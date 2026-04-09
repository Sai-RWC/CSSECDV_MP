// FORM VALIDATION
document.addEventListener("DOMContentLoaded", function () {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const roleSelect = document.getElementById("role");
  const submitBtn = document.getElementById("submitBtn");
  const passwordMismatchMsg = document.getElementById("passwordMismatch");

  function isValidForm() {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = roleSelect.value;

    return (
      name &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword &&
      (role === "student" || role === "professor")
    );
  }

  // CHECKING FOR MATCHING PASSWORDS
  function checkInputs() {
    const passwordsMatch =
      passwordInput.value === confirmPasswordInput.value;

    if (
      !passwordsMatch &&
      passwordInput.value.length > 0 &&
      confirmPasswordInput.value.length > 0
    ) {
      passwordMismatchMsg.classList.remove("hidden");
    } else {
      passwordMismatchMsg.classList.add("hidden");
    }

    if (isValidForm()) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("bg-gray-400", "cursor-not-allowed");
      submitBtn.classList.add("bg-emerald-700", "cursor-pointer");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add("bg-gray-400", "cursor-not-allowed");
      submitBtn.classList.remove("bg-emerald-700", "cursor-pointer");
    }
  }

  [nameInput, emailInput, passwordInput, confirmPasswordInput, roleSelect].forEach((input) => {
    input.addEventListener("input", checkInputs);
  });

  submitBtn.addEventListener("click", () => {
    if (isValidForm()) {
      window.location.href = "LoginPage.html";
    }
  });

  checkInputs();
});

// PASSWORD VISIBILITY
function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);

  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    toggle.textContent = isHidden ? "‿" : "👁"; // simple icons
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggle("password", "togglePassword");
  setupPasswordToggle("confirmPassword", "toggleConfirmPassword");
});
