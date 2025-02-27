document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    alert('Por favor, complete todos los campos.');
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
      alert('Inicio de sesión exitoso. Redirigiendo...');
      window.location.href = 'inicio.html'; // Cambia esto a la página principal
    } else if (response.status === 401) {
      alert('Credenciales incorrectas. Intente de nuevo.');
    } else {
      alert('Hubo un problema con el inicio de sesión. Inténtelo más tarde.');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    alert('Error de conexión. Inténtelo más tarde.');
  }
});
