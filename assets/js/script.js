
// URLs y credenciales
const apiUrl = 'https://devmace.onrender.com/api/employees';
const authUrl = 'https://devmace.onrender.com/auth/login';

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

// URL de un endpoint protegido para verificar el acceso
const protectedUrl = "https://devmace.onrender.com/api/employees";

// Función para obtener el token almacenado
function getStoredToken() {
  return localStorage.getItem('authToken');
}

// Función para verificar si el token permite acceso a la API
async function checkAccess() {
  const token = getStoredToken();

  if (!token) {
    console.warn("⚠️ No hay token almacenado. Redirigiendo a login...");
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch(protectedUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.status === 401) {
      console.warn("🚨 Token inválido o expirado. Redirigiendo a login...");
      redirectToLogin();
    } else if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    } else {
      console.log("✅ Token válido. Acceso permitido.");
    }
  } catch (error) {
    console.error("🚨 Error al verificar el acceso:", error);
    redirectToLogin();
  }
}

// Función para redirigir al login y eliminar token inválido
function redirectToLogin() {
  localStorage.removeItem("authToken");
  window.location.href = "index.html";
}

// Ejecutar la validación al cargar la página
document.addEventListener("DOMContentLoaded", checkAccess);


//graficas

document.addEventListener("DOMContentLoaded", function () {
          const circles = document.querySelectorAll(".progress-circle");
          const texts = document.querySelectorAll(".circle-text");

          circles.forEach((circle, index) => {
              let percentage = circle.getAttribute("data-percentage");
              let offset = 314 - (314 * percentage) / 100;

              setTimeout(() => {
                  circle.style.transition = "stroke-dashoffset 2s ease-in-out";
                  circle.style.strokeDashoffset = offset;
              }, 500);

              // Animar el porcentaje de texto
              let currentPercentage = 0;
              let interval = setInterval(() => {
                  if (currentPercentage >= percentage) {
                      clearInterval(interval);
                  } else {
                      currentPercentage++;
                      texts[index].textContent = currentPercentage + "%";
                  }
              }, 20);
          });
      });

// Obtener empleados
async function fetchEmployees(page = 1, search = '', limit = 10) {
  // Remover paginación anterior si existe
  const oldPagination = document.querySelector('.pagination');
  if (oldPagination) {
    oldPagination.remove();
  }

  // Crear nueva paginación
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination';
  paginationContainer.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 25px;
    font-family: Arial, sans-serif;
  `;

  const prevButton = document.createElement('button');
  prevButton.textContent = '← Anterior';
  prevButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    background-color: #0056b3;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
  `;
  prevButton.onmouseover = () => prevButton.style.backgroundColor = '#0056b3';
  prevButton.onmouseout = () => prevButton.style.backgroundColor = '#007bff';
  prevButton.onclick = () => {
    if (page > 1) fetchEmployees(page - 1, search, limit);
  };

  const pageText = document.createElement('span');
  pageText.textContent = `Página ${page}`;
  pageText.style.cssText = `
    font-size: 16px;
    font-weight: bold;
    color: #333;
    padding: 5px 10px;
    border-radius: 3px;
    background-color: #f8f9fa;
  `;

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Siguiente →';
  nextButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 5px;
    background-color: #0056b3;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
  `;
  nextButton.onmouseover = () => nextButton.style.backgroundColor = '#0056b3';
  nextButton.onmouseout = () => nextButton.style.backgroundColor = '#007bff';
  nextButton.onclick = () => fetchEmployees(page + 1, search, limit);

  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(pageText);
  paginationContainer.appendChild(nextButton);

  // Agregar después de la tabla
  const table = document.getElementById('employeeTable');
  if (table.nextSibling) {
    table.parentNode.insertBefore(paginationContainer, table.nextSibling);
  } else {
    table.parentNode.appendChild(paginationContainer);
  }
  const token = getStoredToken() || await getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}&searchTerm=${search}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al obtener empleados');
    const employees = await response.json();
    renderEmployees(employees);
  } catch (error) {
    console.error(error);
  }
}

// Renderizar empleados en la tabla
function renderEmployees(employees) {
  const tableBody = document.querySelector('#employeeTable tbody');
  tableBody.innerHTML = '';

  if (!employees || employees.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No hay empleados para mostrar</td></tr>';
    return;
  }

  employees.forEach(employee => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${employee.employeeName}</td>
      <td>${employee.id_employee}</td>
      <td>${employee.department}</td>
      <td>${employee.status || 'Activo'}</td>
      <td class="actions" style="display: flex;">
        <button class="action-btn" onclick="viewEmployee(${employee.id_employee})">
          <img src="assets/img/eye.svg" alt="Ver">
        </button>
        <button class="action-btn" onclick="editEmployee(${employee.id_employee})">
          <img src="assets/img/qr.svg" alt="Editar">
        </button>
        <button class="action-btn" onclick="deleteEmployee(${employee.id_employee})">
          <img src="assets/img/trash.svg" alt="Eliminar">
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function viewEmployee(id) {
  const token = getStoredToken();
  if (!token) {
    console.error("No tienes un token de autenticación válido.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener los datos del empleado');
    }

    const employee = await response.json();

    // Asegurar que los elementos existen antes de asignar valores
    const modalId = document.getElementById('modalId');
    const modalName = document.getElementById('modalName');
    const modalDepartment = document.getElementById('modalDepartment');
    const modalEmail = document.getElementById('modalEmail');
    const modalAddress = document.getElementById('modalAddress');
    const modalStatus = document.getElementById('modalStatus');

    if (modalId && modalName && modalDepartment && modalEmail && modalAddress && modalStatus) {
      modalId.innerText = employee.id_employee;
      modalName.innerText = employee.employeeName;
      modalDepartment.innerText = employee.department;
      modalEmail.innerText = employee.email;
      modalAddress.innerText = employee.address;
      modalStatus.innerText = employee.status || 'Activo';

      // Mostrar el modal
      document.getElementById('employeeModal').style.display = 'block';
    } else {
      console.error('No se encontraron los elementos del modal.');
    }

  } catch (error) {
    console.error('Error:', error);
    console.error('No se pudo obtener la información del empleado.');
  }
  
}
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById('employeeModal');
  const closeButton = document.querySelector(".close");
  const cancelButton = document.querySelector(".btn-cancel2");

  function closeModal() {
      modal.style.display = 'none';
  }

  if (closeButton) {
      closeButton.addEventListener("click", closeModal);
  }

  if (cancelButton) {
      cancelButton.addEventListener("click", closeModal);
  }
});

// Crear empleado
// Función para abrir el modal de creación de empleado
function openCreateModal() {
  document.getElementById('createEmployeeModal').style.display = 'flex';
}

// Función para cerrar el modal de creación de empleado
function closeCreateModal() {
  document.getElementById('createEmployeeModal').style.display = 'none';
}

// Obtener token de autenticación
async function getAuthToken() {
  const token = localStorage.getItem('authToken');
  if (token) return token;

  try {
    const response = await fetch('https://devmace.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "tu_correo@example.com", 
        password: "tu_contraseña_segura"
      })
    });

    if (!response.ok) throw new Error('Error al autenticar');

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data.token;
  } catch (error) {
    console.error('Error de autenticación:', error);
    return null;
  }
}

// Función para crear un nuevo empleado
async function createEmployee() {
  const token = await getAuthToken();
  if (!token) {
    console.error("Error al autenticar. Intenta nuevamente.");
    return;
  }

  // Obtener datos del formulario
  const employeeData = {
    id_employee: parseInt(document.getElementById('createEmployeeId').value), 
    employeeName: document.getElementById('createEmployeeName').value,
    email: document.getElementById('createEmail').value,
    department: document.getElementById('createDepartment').value,
    phoneNumber: document.getElementById('createPhoneNumber').value,
    address: document.getElementById('createAddress').value,
    horario_entrada: document.getElementById('createHorarioEntrada').value,
    horario_salida: document.getElementById('createHorarioSalida').value,
    tolerancia_entrada: parseInt(document.getElementById('createToleranciaEntrada').value),
    tolerancia_salida: parseInt(document.getElementById('createToleranciaSalida').value),
    dias_laborales: Array.from(document.querySelectorAll('input[name="diasLaborales"]:checked'))
                         .map(checkbox => checkbox.value)
  };

  try {
    const response = await fetch('https://devmace.onrender.com/api/employees', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    const result = await response.json();
    if (response.ok) {
      console.log(result.message || "Empleado creado exitosamente.");
      closeCreateModal();
      fetchEmployees(); // Recargar la lista de empleados
    } else {
      console.error(`Error: ${result.message || "No se pudo crear el empleado"}`);
    }
  } catch (error) {
    console.error("Error al crear el empleado:", error);
    console.error("Ocurrió un error al crear el empleado.");
  }
}

// Asociar eventos a los botones
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".btn-cancel").addEventListener("click", closeCreateModal);
  document.querySelector(".btn-save").addEventListener("click", createEmployee);
});


// Editar empleado
async function editEmployee(employeeId) {
  const token = getStoredToken() || await getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${apiUrl}/${employeeId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al cargar empleado');
    const employee = await response.json();

    // Rellenar el formulario
    document.getElementById('employeeName').value = employee.employeeName;
    document.getElementById('email').value = employee.email;
    document.getElementById('department').value = employee.department;
    document.getElementById('phoneNumber').value = employee.phoneNumber;
    document.getElementById('address').value = employee.address;

    // Cambiar el botón
    const saveButton = document.querySelector('#createEmployeeForm button');
    saveButton.textContent = 'Actualizar';
    saveButton.onclick = () => updateEmployee(employeeId);

    openCreateModal();
  } catch (error) {
    console.error(error);
  }
}

//crear
// Función para abrir el modal de creación de empleado
function openCreateModal() {
  document.getElementById('createEmployeeModal').style.display = 'flex';
}

// Función para cerrar el modal de creación de empleado
function closeCreateModal() {
  document.getElementById('createEmployeeModal').style.display = 'none';
    // Limpiar los campos del formulario después de cerrar el modal
    document.getElementById('createEmployeeForm').reset();
    
}

// Obtener token de autenticación
async function getAuthToken() {
  const token = localStorage.getItem('authToken');
  if (token) return token;

  try {
    const response = await fetch('https://devmace.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "tu_correo@example.com", 
        password: "tu_contraseña_segura"
      })
    });

    if (!response.ok) throw new Error('Error al autenticar');

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data.token;
  } catch (error) {
    console.error('Error de autenticación:', error);
    return null;
  }
}

// Eliminar empleado y recargar la vista completa
async function deleteEmployee(employeeId) {
  const token = getStoredToken() || await getAuthToken();
  if (!token) return;

  if (!confirm('¿Seguro que deseas eliminar este empleado?')) return;

  try {
    const response = await fetch(`${apiUrl}/${employeeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      console.log('Empleado eliminado exitosamente');
      // Recargar la página completa para refrescar todos los datos
      window.location.reload();
    } else {
      console.error('Error al eliminar empleado');
    }
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
  }
}

// Abrir modal
function openCreateModal() {
  document.getElementById('createEmployeeModal').style.display = 'flex';
}

// Cerrar modal
function closeCreateModal() {
  document.getElementById('createEmployeeModal').style.display = 'none';
}

document.querySelector(".btn-cancel").addEventListener("click", closeCreateModal);
document.querySelector(".btn-save").addEventListener("click", createEmployee);

// Buscar empleados
document.addEventListener("DOMContentLoaded", () => {
  fetchEmployees(); // Cargar empleados al inicio
  

  // Eventos de búsqueda y filtros
  
  document.getElementById("buscar").addEventListener("click", filterEmployees);
  document.getElementById("filterButton").addEventListener("click", toggleFilterDropdown);
  document.getElementById("applyFilters").addEventListener("click", applyFilters);
  document.addEventListener("click", closeFilterDropdownOnClickOutside);

  // Detectar Enter en el campo de búsqueda
  document.getElementById("search").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Evita recarga
      filterEmployees(); // Ejecutar búsqueda
    }
  });
});

// Abrir/cerrar el dropdown de filtros
function toggleFilterDropdown(event) {
  event.stopPropagation(); // Evita que se cierre al hacer clic en el botón
  const dropdown = document.getElementById("filterDropdown");
  dropdown.classList.toggle("hidden-filter");
}

// Cerrar el dropdown al hacer clic fuera de él
function closeFilterDropdownOnClickOutside(event) {
  const dropdown = document.getElementById("filterDropdown");
  if (!dropdown.contains(event.target) && !event.target.matches("#filterButton")) {
    dropdown.classList.add("hidden-filter");
  }
}

// Aplicar filtros desde el dropdown
function applyFilters() {
  filterEmployees(); // Aplica los filtros a la tabla
  document.getElementById("filterDropdown").classList.add("hidden-filter"); // Cierra el dropdown
}

// Filtrar empleados en la tabla
function filterEmployees() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const selectedDepartment = document.getElementById("departmentFilter").value.toLowerCase();
  const selectedStatus = document.getElementById("statusFilter").value.toLowerCase();

  const rows = document.querySelectorAll("#employeeTable tbody tr");

  rows.forEach(row => {
    const idEmpleado = row.children[0].textContent.toLowerCase();
    const nombre = row.children[1].textContent.toLowerCase();
    const departamento = row.children[2].textContent.toLowerCase();
    const estado = row.children[3].textContent.toLowerCase();

    // Condiciones de filtrado
    const matchSearch = idEmpleado.includes(searchTerm) || nombre.includes(searchTerm);
    const matchDepartment = selectedDepartment === "" || departamento.includes(selectedDepartment);
    const matchStatus = selectedStatus === "" || estado.includes(selectedStatus);

    if (matchSearch && matchDepartment && matchStatus) {
      row.style.display = ""; // Mostrar si cumple los filtros
    } else {
      row.style.display = "none"; // Ocultar si no cumple los filtros
    }
  });
}



let currentEmployeeId = null;
let qrEnabled = false; // Estado actual del QR

// ✅ Función para abrir el modal y cargar el estado correcto del QR
async function editEmployee(employeeId) {
    currentEmployeeId = employeeId;

    const token = getStoredToken();
    if (!token) {
      console.error("No tienes un token válido.");
      return;
    }

    try {
        // 🔄 Obtener los datos actualizados del empleado
        const response = await fetch(`${apiUrl}/${employeeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al obtener datos del empleado');

        const data = await response.json();
        const employee = data.data;

        if (!employee) throw new Error('No se encontraron datos del empleado');

        // 🔄 Asignar imagen del QR
        document.getElementById('qrModalImage').src = generateQrCode(employee.id_employee);

        // 🔄 Obtener estado actual desde la API o del localStorage
        qrEnabled = localStorage.getItem(`qrEnabled_${employeeId}`) !== null ?
                    JSON.parse(localStorage.getItem(`qrEnabled_${employeeId}`)) :
                    employee.enabled ?? false;

        document.getElementById('qrToggleSwitch').checked = qrEnabled;

        // 🟢 Guardar el estado en localStorage para evitar que se sobrescriba
        localStorage.setItem(`qrEnabled_${employeeId}`, JSON.stringify(qrEnabled));

        // ✅ Mostrar el modal
        document.getElementById('qrModalContainer').style.display = 'flex';

    } catch (error) {
        console.error('Error al cargar el QR:', error);
        console.error("No se pudo obtener el estado del QR.");
    }
}

// ✅ Función para generar la imagen QR
function generateQrCode(employeeId) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${employeeId}`;
}

// ✅ Función para cerrar el modal
function closeQrModal() {
    document.getElementById('qrModalContainer').style.display = 'none';
}

// ✅ Función para habilitar/deshabilitar el QR con persistencia
async function toggleQrState() {
    if (!currentEmployeeId) {
      console.error("No se encontró un empleado para actualizar.");
      return;
    }

    const token = getStoredToken();
    if (!token) {
      console.error("No tienes un token válido.");
      return;
    }

    // 🔄 Obtener el estado actual del switch
    qrEnabled = document.getElementById('qrToggleSwitch').checked;

    try {
        const response = await fetch(`${apiUrl}/${currentEmployeeId}/qr-state`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ enabled: qrEnabled })
        });

        if (!response.ok) throw new Error('Error al actualizar estado del QR');

        // ✅ Guardar el estado en localStorage para evitar que se sobrescriba
        localStorage.setItem(`qrEnabled_${currentEmployeeId}`, JSON.stringify(qrEnabled));

        // ✅ Verificar el estado en la API después de actualizar
        setTimeout(async () => {
            await verifyQrStateInAPI();
        }, 2000); // Esperar 2 segundos antes de verificar

        // 🟢 Mostrar mensaje de éxito
        console.log(`El código QR ha sido ${qrEnabled ? "habilitado" : "deshabilitado"} correctamente.`);

    } catch (error) {
        console.error('Error al cambiar estado del QR:', error);
        console.error("No se pudo actualizar el estado del QR.");
    }
}

// ✅ Función para verificar que la API realmente guardó el cambio
async function verifyQrStateInAPI() {
    const token = getStoredToken();
    if (!token) return;

    try {
        const response = await fetch(`${apiUrl}/${currentEmployeeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al verificar datos actualizados del empleado');

        const data = await response.json();
        const employee = data.data;

        if (!employee) throw new Error('No se encontraron datos del empleado');

        // 🔄 Actualizar el estado del switch con los datos más recientes de la API
        qrEnabled = employee.enabled ?? false;
        document.getElementById('qrToggleSwitch').checked = qrEnabled;

        // ✅ Guardar en localStorage para evitar cambios inesperados
        localStorage.setItem(`qrEnabled_${currentEmployeeId}`, JSON.stringify(qrEnabled));

    } catch (error) {
        console.error('Error al verificar estado actualizado del QR:', error);
    }
}


async function viewEmployee(id) {
  const token = getStoredToken();
  if (!token) {
      console.error("No tienes un token de autenticación válido.");
      return;
  }

  try {
      console.log(`🔍 Buscando empleado con ID: ${id}`);

      const response = await fetch(`${apiUrl}/${id}`, {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      });

      if (!response.ok) {
          throw new Error('Error al obtener los datos del empleado');
      }

      const data = await response.json();
      console.log("📌 Respuesta de la API:", data);

      if (data.success && data.data) {
          const employee = data.data;

          // Asignamos los valores al modal
          document.getElementById('modalId').textContent = employee.id_employee || "No disponible";
          document.getElementById('modalName').textContent = employee.employeeName || "No disponible";
          document.getElementById('modalDepartment').textContent = employee.department || "No disponible";
          document.getElementById('modalSubdepartment').textContent = employee.subdepartment || "No disponible";
          document.getElementById('modalEmail').textContent = employee.email || "No disponible";
          document.getElementById('modalPhoneNumber').textContent = employee.phoneNumber || "No disponible";
          document.getElementById('modalAddress').textContent = employee.address || "No disponible";
          document.getElementById('modalStatus').textContent = employee.status || "Activo";
          document.getElementById('modalRole').textContent = employee.role || "No disponible";
          document.getElementById('modalCreatedAt').textContent = formatDateTime(employee.created_at);
          document.getElementById('modalUpdatedAt').textContent = formatDateTime(employee.updated_at);

          // Si el empleado está en "baja", mostrar advertencia
          if (employee.status.toLowerCase() === "baja") {
              document.getElementById('modalStatus').style.color = "red";
          } else {
              document.getElementById('modalStatus').style.color = "green";
          }

          // Llamar a la función para obtener los horarios y agregarlos en la lista
          renderEmployeeSchedules(employee.horarios);

          // Mostramos el modal
          document.getElementById('employeeModal').style.display = 'block';
      } else {
          console.error(`No se encontraron detalles del empleado con ID ${id}.`);
      }

  } catch (error) {
      console.error('🚨 Error:', error);
      console.error('No se pudo obtener la información del empleado.');
  }
}

// Función para mostrar los horarios dentro de la misma sección del modal
function renderEmployeeSchedules(horarios) {
  const horariosList = document.getElementById("modalHorariosList");
  horariosList.innerHTML = ""; // Limpiar la lista antes de agregar nuevos datos

  if (horarios && horarios.length > 0) {
      horarios.forEach(horario => {
          const listItem = document.createElement("li");
          listItem.innerHTML = `<strong>${horario.fecha}:</strong> Entrada: ${horario.hora_entrada}, Salida: ${horario.hora_salida}`;
          horariosList.appendChild(listItem);
      });
  } else {
      horariosList.innerHTML = "<li>No hay horarios disponibles</li>";
  }
}

// Función para formatear fechas en formato legible
function formatDateTime(dateTime) {
  if (!dateTime) return "No disponible";
  const date = new Date(dateTime);
  return date.toLocaleString(); // Convierte la fecha en un formato legible
}

// Función para cerrar el modal
function closeEmployeeModal() {
  document.getElementById('employeeModal').style.display = 'none';
}

// Asignar evento al botón de cierre del modal
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".btn-cancel2").addEventListener("click", closeEmployeeModal);
});
