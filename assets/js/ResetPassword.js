// URL de la API para la solicitud de recuperación de contraseña
const resetPasswordUrl = 'https://2acf-189-203-87-207.ngrok-free.app/auth/request-password-reset';

// Manejo del formulario
document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que la página se recargue

  const email = document.getElementById('email').value.trim();

  if (!email) {
    alert('Por favor, ingrese un correo electrónico válido.');
    return;
  }

  try {
    const response = await fetch(resetPasswordUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email }) // Cuerpo de la solicitud con el correo
    });

    if (response.ok) {
      alert('Correo de recuperación enviado. Por favor revisa tu bandeja de entrada.');
      document.getElementById('reset-password-form').reset();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'No se pudo procesar la solicitud.'}`);
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
    alert('Error al enviar la solicitud. Inténtalo de nuevo más tarde.');
  }
});
