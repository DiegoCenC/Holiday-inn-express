document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "https://devmace.onrender.com/api/advertisements";
    const adId = localStorage.getItem("selectedAdId");
    const editButton = document.querySelector(".edit"); // Botón de editar

    if (!adId) {
        alert("No se encontró el anuncio seleccionado.");
        window.location.href = "../home.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${adId}`);
        const ad = await response.json();

        // Formatear las fechas
        const fechaInicio = new Date(ad.issue_date);
        const fechaFin = new Date(ad.expiration_date);
        const fechaInicioFormateada = fechaInicio.toISOString().split('T')[0];
        const fechaFinFormateada = fechaFin.toISOString().split('T')[0];

        document.getElementById("adTitle").textContent = ad.title || "Sin título";
        document.getElementById("adDescription").textContent = ad.description || "Sin descripción";
        document.getElementById("adStatus").textContent = ad.status || "Sin estado";
        document.getElementById("adIssueDate").textContent = fechaInicioFormateada || "Sin fecha";
        document.getElementById("adExpirationDate").textContent = fechaFinFormateada || "Sin fecha";
        document.getElementById("adDepartment").textContent = ad.departments || "Sin departamento";

        if (ad.status && ad.status.toLowerCase() === "inactivo") {
            editButton.disabled = true;
            editButton.style.backgroundColor = "var(--color-muted)";
            editButton.style.cursor = "not-allowed";
            editButton.textContent = "Editar"; 
        }
    } catch (error) {
        console.error("Error al cargar el anuncio:", error);
        alert("Ocurrió un error al cargar el anuncio.");
    }
});
