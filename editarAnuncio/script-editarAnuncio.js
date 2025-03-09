const API_URL = "https://devmace.onrender.com/api/advertisements";

// Obtener el ID del anuncio desde el localStorage
const adId = localStorage.getItem("selectedAdId");

// Referencias a los elementos del formulario
const titleInput = document.getElementById("title-report");
const descriptionInput = document.getElementById("description-report");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const departmentSelect = document.getElementById("department");
const statusSelect = document.getElementById("status");

// Función para cargar los datos del anuncio en el formulario
async function loadAdData() {
    if (!adId) {
        showModal("No se encontró un anuncio seleccionado.", () => {
            window.location.href = "../home.html";
        });
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${adId}`);
        if (!response.ok) {
            throw new Error("Error al obtener los datos del anuncio.");
        }
        const adData = await response.json();

        // Formatear las fechas para los inputs
        const fechaInicio = new Date(adData.issue_date);
        const fechaFin = new Date(adData.expiration_date);
        const fechaInicioFormateada = fechaInicio.toISOString().split('T')[0];
        const fechaFinFormateada = fechaFin.toISOString().split('T')[0];

        // Precargar los datos en los campos del formulario
        titleInput.value = adData.title || "";
        descriptionInput.value = adData.description || "";
        startDateInput.value = fechaInicioFormateada || "";
        endDateInput.value = fechaFinFormateada || "";
        departmentSelect.value = adData.departments || "All";
        statusSelect.value = adData.status || "activo";
    } catch (error) {
        console.error(error.message);
        showModal("Ocurrió un error al cargar los datos. Por favor, intente de nuevo.");
    }
}

// Función para guardar los cambios del anuncio
async function saveAdData() {
    // Enviar las fechas en formato YYYY-MM-DD
    const updatedAdData = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        issue_date: startDateInput.value + "T00:00:00.000Z",
        expiration_date: endDateInput.value + "T00:00:00.000Z",
        departments: departmentSelect.value,
        status: statusSelect.value
    };

    console.log("Datos a enviar:", updatedAdData); // Para debug

    try {
        const response = await fetch(`${API_URL}/${adId}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(updatedAdData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log("Respuesta del servidor:", errorText); // Para debug
            throw new Error(`Error al actualizar el anuncio: ${errorText}`);
        }

        // Mostrar mensaje de éxito y redirigir
        showModal("Anuncio actualizado correctamente.", () => {
            window.location.href = "../home.html";
        });
    } catch (error) {
        console.error(error.message);
        showModal("Ocurrió un error al guardar los cambios. Por favor, intente de nuevo.");
    }
}

// Función para mostrar el modal
function showModal(message, callback) {
    const modal = document.getElementById("modal");
    const modalMessage = document.getElementById("modal-message");
    const modalOk = document.getElementById("modal-ok");

    modalMessage.textContent = message;
    modal.classList.remove("hidden");

    modalOk.onclick = () => {
        modal.classList.add("hidden");
        if (callback) callback();
    };
}

// Evento al hacer clic en el botón "Guardar"
document.querySelector(".save").addEventListener("click", saveAdData);

// Cargar los datos del anuncio al abrir la página
window.addEventListener("DOMContentLoaded", loadAdData);
