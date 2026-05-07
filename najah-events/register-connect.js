const registerForm = document.querySelector('form');

registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData.entries());

  if (!data.full_name && data.fullName) {
    data.full_name = data.fullName;
  }

  if (!data.organization_name && data.organizationName) {
    data.organization_name = data.organizationName;
  }

  try {
    const res = await fetch('backend/auth/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
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
