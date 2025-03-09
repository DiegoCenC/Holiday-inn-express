document.querySelector('.save').addEventListener('click', async () => {
    try {
        // Datos del formulario
        const title = document.getElementById('title-report').value;
        const description = document.getElementById('description-report').value;
        const issueDate = document.querySelectorAll('input[type="date"]')[0].value;
        const expirationDate = document.querySelectorAll('input[type="date"]')[1].value;
        const department = document.getElementById('department').value;

        // Crear el objeto de datos con fechas en formato ISO
        const advertisementData = {
            title,
            description,
            issue_date: issueDate + "T00:00:00.000Z",
            expiration_date: expirationDate + "T00:00:00.000Z",
            departments: department,
            status: 'activo'
        };

        console.log('Datos a enviar:', advertisementData); // Log para debug

        // Enviar la solicitud al servidor
        const response = await fetch('https://devmace.onrender.com/api/advertisements', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(advertisementData)
        });

        const responseData = await response.json(); // Obtener la respuesta en formato JSON
        console.log('Respuesta del servidor:', responseData);

        if (response.ok) {
            // Si la respuesta es exitosa, mostrar el modal y redirigir
            showModal('Anuncio creado correctamente. Será redirigido en breve.', () => {
                // Forzar recarga completa de la página principal
                window.location.replace('../home.html');
            });
        } else {
            // Si hay error, mostrar el mensaje específico
            console.error('Error del servidor:', responseData);
            showModal('Error al crear el anuncio: ' + (responseData.error || 'Error desconocido'), () => {});
        }
    } catch (error) {
        // Manejo de errores durante la solicitud
        console.error('Error durante la solicitud:', error);
        showModal('Hubo un error al enviar la solicitud. Intente nuevamente.', () => {});
    }
});

// Función para mostrar el modal
function showModal(message, callback) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const modalOk = document.getElementById('modal-ok');

    modalMessage.textContent = message;
    modal.classList.remove('hidden');

    modalOk.onclick = () => {
        modal.classList.add('hidden');
        if (callback) callback();
    };
}
