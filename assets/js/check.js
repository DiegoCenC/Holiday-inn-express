// URLs y credenciales
const authUrl = 'https://devmace.onrender.com/auth/login';
const attendanceBaseUrl = 'https://devmace.onrender.com/api/securityBooth/attendance/summary';

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
// Obtener token de autenticación
async function getAuthToken() {
  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "TU_EMAIL_AQUI",
        password: "TU_PASSWORD_AQUI"
      })
    });

    if (!response.ok) throw new Error('Error al autenticar');

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data.token;
  } catch (error) {
    console.error("🚨 Error al obtener token:", error);
    return null;
  }
}

// Obtener token almacenado
function getStoredToken() {
  return localStorage.getItem('authToken');
}

// Función para obtener la fecha seleccionada o usar la actual
function getSelectedDate() {
  const dateInput = document.getElementById("dateFilter");
  return dateInput ? dateInput.value : new Date().toISOString().split("T")[0];
}

// Función para obtener los datos de asistencia
async function loadAttendanceData() {
  const tbody = document.querySelector("#employeeTable tbody");
  const selectedDate = getSelectedDate();
  const apiUrl = `${attendanceBaseUrl}?date=${selectedDate}`;

  let token = getStoredToken();
  if (!token) {
    token = await getAuthToken();
    if (!token) {
      console.error("🚨 No se pudo obtener el token.");
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
      console.error("🚨 Error en la API:", response.status);
      return;
    }

    const result = await response.json();
    console.log("📥 Datos recibidos:", result);

    // Limpiar la tabla antes de agregar nuevos datos
    tbody.innerHTML = "";

    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No hay registros para esta fecha</td></tr>`;
      return;
    }

    // Llenar la tabla con los datos recibidos
    result.data.forEach(record => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${record.id_employee}</td>
        <td>${record.employeename || "Desconocido"}</td>
        <td>${record.department || "Sin departamento"}</td>
        <td style="color: ${record.estado === 'A tiempo' ? 'green' : 'red'};">
          ${record.ultima_entrada || "No registrado"}
        </td>
        <td style="color: ${record.estado === 'A tiempo' ? 'green' : 'red'};">
          ${record.ultima_salida || "No registrado"}
        </td>
        <td>${new Date().toISOString().split('T')[0]}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (error) {
    console.error("🚨 Error en la solicitud:", error);
  }
}

// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  loadAttendanceData();

  // Evento para cambiar la fecha y actualizar la tabla
  document.getElementById("dateFilter").addEventListener("change", loadAttendanceData);
});
// Función para filtrar la tabla
function filterTable() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const rows = document.querySelectorAll("tbody tr");
  
  rows.forEach(row => {
    const id = row.cells[0].textContent.toLowerCase();
    const name = row.cells[1].textContent.toLowerCase();
    const dept = row.cells[2].textContent.toLowerCase();
    
    // Buscar en todas las columnas relevantes
    if (id.includes(searchTerm) || 
        name.includes(searchTerm) || 
        dept.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Agregar evento de escucha al campo de búsqueda existente
document.getElementById("search").addEventListener("input", filterTable);

// Agregar estilos al contenedor de filtros
const filterContainer = document.querySelector('.filter-container');
if (filterContainer) {
  filterContainer.style.marginTop = '20px';
  filterContainer.style.marginBottom = '20px';
  filterContainer.style.padding = '15px';
  filterContainer.style.backgroundColor = '#f8f9fa';
  filterContainer.style.borderRadius = '8px';
  filterContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
}

// Mejorar estilos del input de fecha
const dateFilter = document.getElementById('dateFilter');
if (dateFilter) {
  dateFilter.style.padding = '8px 12px';
  dateFilter.style.border = '1px solid #ced4da';
  dateFilter.style.borderRadius = '4px';
  dateFilter.style.fontSize = '14px';
  dateFilter.style.marginLeft = '10px';
}

// Mejorar estilos de la etiqueta
const dateLabel = document.querySelector('label[for="dateFilter"]');
if (dateLabel) {
  dateLabel.style.fontWeight = '500';
  dateLabel.style.color = '#495057';
}


// Mostrar/ocultar el menú de filtros
document.getElementById('filterButton').addEventListener('click', function() {
  document.getElementById('filterDropdown').classList.toggle('hidden-filter');
});

// Función para aplicar los filtros avanzados
function applyAdvancedFilters() {
  const department = document.getElementById('departmentFilter').value;
  const status = document.getElementById('statusFilter').value;
  const filterDate = document.getElementById('dateFilterDropdown').value;
  
  const rows = document.querySelectorAll("#employeeTable tbody tr");
  
  rows.forEach(row => {
    const deptValue = row.cells[2].textContent.trim();
    const entryTime = row.cells[3].textContent.trim();
    const dateValue = row.cells[5].textContent.trim();
    
    // Determinar el estado basado en la hora de entrada
    let currentStatus = "A tiempo";
    if (entryTime.includes("09:") || entryTime.includes("10:") || 
        entryTime.includes("11:") || entryTime.includes("12:")) {
      currentStatus = "Tarde";
    }
    
    let showRow = true;
    
    // Aplicar filtro de departamento
    if (department && deptValue.toLowerCase() !== department.toLowerCase()) {
      showRow = false;
    }
    
    // Aplicar filtro de estado
    if (status && currentStatus !== status) {
      showRow = false;
    }
    
    // Aplicar filtro de fecha
    if (filterDate && dateValue !== filterDate) {
      showRow = false;
    }
    
    row.style.display = showRow ? "" : "none";
  });
  
  // Ocultar el menú de filtros después de aplicar
  document.getElementById('filterDropdown').classList.add('hidden-filter');
}





