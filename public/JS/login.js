document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const rememberCheckbox = form.querySelector('input[name="rememberMe"]');
  const emailInput = form.querySelector('input[name="email"]');

  // On page load, pre-fill email if cookie exists
  const rememberedEmail = getCookie('rememberedEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberCheckbox.checked = true;
  }

  form.addEventListener('submit', (e) => {
    const email = emailInput.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      e.preventDefault();
      alert('Please enter both email and password.');
      return;
    }

    // Handle "Remember Me"
    if (rememberCheckbox.checked) {
      setCookie('rememberedEmail', email, 3); // store for 3 days
    } else {
      deleteCookie('rememberedEmail');
    }
  });

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
});
