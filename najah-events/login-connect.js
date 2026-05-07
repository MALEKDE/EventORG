const loginForm = document.querySelector('form');

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value.trim();
  const password = document.querySelector('input[type="password"]').value;

  try {
    const res = await fetch('backend/auth/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (!result.success) {
      alert(result.message);
      return;
    }

    localStorage.setItem('najah_user', JSON.stringify(result.data.user));
    window.location.href = result.data.redirect;

  } catch (error) {
    alert('Connection error. Make sure Apache and MySQL are running.');
  }
});
