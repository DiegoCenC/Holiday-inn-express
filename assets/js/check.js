// URLs y credenciales
const authUrl = 'https://devmace.onrender.com/auth/login';
const attendanceBaseUrl = 'https://devmace.onrender.com/api/securityBooth/attendance/daily';

document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '=')) {
      event.preventDefault();
      console.warn("⚠️ Zoom bloqueado.");
    }
  });
  document.addEventListener("wheel", function(event) {
    if (event.ctrlKey) {
      event.preventDefault();
      console.warn("⚠️ Zoom con scroll bloqueado.");
    }
  }, { passive: false });
  
// Credenciales del usuario (reemplázalas con credenciales reales)
const userCredentials = {
  email: "TU_EMAIL_AQUI", // Reemplázalo con tu email
  password: "TU_CONTRASEÑA_AQUI" // Reemplázalo con tu contraseña
};

// Obtener token de autenticación
async function getAuthToken() {
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userCredentials)
    });

    if (!response.ok) throw new Error('Error al autenticar');

    const data = await response.json();
    localStorage.setItem('authToken', data.token); // Guardar token en localStorage
    return data.token;
  } catch (error) {
    console.error("Error al obtener token:", error);
    return null;
  }
}

// Obtener token almacenado
function getStoredToken() {
  return localStorage.getItem('authToken');
}

// Función para obtener la asistencia diaria y actualizar la tabla
async function loadAttendanceData() {
    const tbody = document.querySelector("#employeeTable tbody");

    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const apiUrl = `${attendanceBaseUrl}/${formattedDate}`;

    let token = getStoredToken();
    if (!token) {
        token = await getAuthToken(); // Si no hay token, obtenerlo
        if (!token) {
            console.error("No se pudo obtener el token de autenticación.");
            return;
        }
    }

    try {
        const response = await fetch(apiUrl, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Error en la respuesta de la API:", response.status);
            return;
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            console.error("El formato de respuesta no es válido:", result);
            return;
        }

        tbody.innerHTML = ""; // Limpiar contenido previo en la tabla

        result.data.forEach(record => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.id_empleado}</td>
                <td>${record.employeename || "Desconocido"}</td>
                <td>${record.id_registro}</td>
                <td style="color: ${record.estado === 'A tiempo' ? 'green' : 'red'};">
                    ${record.hora_entrada || "No registrado"}
                </td>
                <td style="color: ${record.estado === 'A tiempo' ? 'green' : 'red'};">
                    ${record.hora_salida || "No registrado"}
                </td>

                <td>${record.fecha_registro ? record.fecha_registro.split("T")[0] : "No registrado"}</td>
                <td>${record.estado}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error al obtener los datos de asistencia:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAttendanceData();
    
    // Eventos para búsqueda y filtros
    document.getElementById("buscar").addEventListener("click", filterTable);
    document.getElementById("filterButton").addEventListener("click", toggleFilterDropdown);
    document.getElementById("applyFilters").addEventListener("click", applyFilters);
    document.addEventListener("click", closeFilterDropdownOnClickOutside);
  
    // Detectar Enter en el campo de búsqueda
    document.getElementById("search").addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Evita recarga
        filterTable(); // Ejecutar búsqueda
      }
    });
  });
  
  // Función para abrir/cerrar el dropdown de filtros
  function toggleFilterDropdown(event) {
    event.stopPropagation(); // Evita que se cierre al hacer clic en el botón
    const dropdown = document.getElementById("filterDropdown");
    dropdown.classList.toggle("hidden-filter");
  }
  
  // Función para cerrar el dropdown al hacer clic fuera de él
  function closeFilterDropdownOnClickOutside(event) {
    const dropdown = document.getElementById("filterDropdown");
    if (!dropdown.contains(event.target) && !event.target.matches("#filterButton")) {
      dropdown.classList.add("hidden-filter");
    }
  }
  
  // Aplicar filtros desde el dropdown
  function applyFilters() {
    filterTable(); // Aplica los filtros a la tabla
    document.getElementById("filterDropdown").classList.add("hidden-filter"); // Cierra el dropdown
  }
  
  // Función para filtrar la tabla
  function filterTable() {
    const searchTerm = document.getElementById("search").value.toLowerCase();
    const selectedDepartment = document.getElementById("departmentFilter").value.toLowerCase();
    const selectedStatus = document.getElementById("statusFilter").value.toLowerCase();
    const selectedDate = document.getElementById("dateFilter").value; // YYYY-MM-DD
  
    const rows = document.querySelectorAll("#employeeTable tbody tr");
  
    rows.forEach(row => {
      const idEmpleado = row.children[0].textContent.toLowerCase(); // Número de empleado
      const nombre = row.children[1].textContent.toLowerCase(); // Nombre
      const departamento = row.children[2].textContent.toLowerCase(); // Departamento
      const fechaRegistro = row.children[5].textContent; // Fecha (YYYY-MM-DD)
      const estado = row.children[6].textContent.toLowerCase(); // Estado (A tiempo, tarde, etc.)
  
      // Condiciones de filtrado
      const matchSearch = idEmpleado.includes(searchTerm) || nombre.includes(searchTerm);
      const matchDepartment = selectedDepartment === "" || departamento.includes(selectedDepartment);
      const matchStatus = selectedStatus === "" || estado.includes(selectedStatus);
      const matchDate = selectedDate === "" || fechaRegistro === selectedDate;
  
      if (matchSearch && matchDepartment && matchStatus && matchDate) {
        row.style.display = ""; // Mostrar si cumple los filtros
      } else {
        row.style.display = "none"; // Ocultar si no cumple los filtros
      }
    });
  }
  