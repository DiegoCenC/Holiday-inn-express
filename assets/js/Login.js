document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    return;
  }

  try {
    // Enviar credenciales a la API
    const response = await fetch('https://devmace.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password: password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Guardar token en localStorage
      localStorage.setItem('authToken', data.token);

      // Redireccionar al usuario
      window.location.href = 'Inicio.html'; // Cambia esto a la página principal
    } else if (response.status === 401) {
      console.log('Credenciales incorrectas');
    } else {
      console.log('Error en el inicio de sesión');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
  }
});
