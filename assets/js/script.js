// URLs y credenciales
const apiUrl = 'https://devmace.onrender.com/api/employees';
const authUrl = 'https://devmace.onrender.com/auth/login';

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
    localStorage.setItem('authToken', data.token);
    return data.token;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem('authToken');
}

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
async function fetchEmployees(page = 1, search = '', limit = 15) {
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
      <td>${employee.id_employee}</td>
      <td>${employee.employeeName}</td>
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
    alert("No tienes un token de autenticación válido.");
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
    alert('No se pudo obtener la información del empleado.');
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
async function createEmployee() {
  const token = getStoredToken() || await getAuthToken();
  if (!token) return;

  // Evento para cerrar el modal al hacer clic en "Cancelar"
  

  

  // Obtener datos del formulario (IDs deben coincidir con el HTML)
  const employeeData = {
    area: document.getElementById('createArea').value,
    employeeName: document.getElementById('createEmployeeName').value,
    lastName: document.getElementById('createLastName').value,
    secondLastName: document.getElementById('createSecondLastName').value,
    phoneNumber: document.getElementById('createPhoneNumber').value,
    phoneNumber2: document.getElementById('createPhoneNumber2').value,
    email: document.getElementById('createEmail').value
    // Si tu API requiere 'department' en vez de 'area', ajusta la clave:
    // department: document.getElementById('createArea').value,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });

    if (response.ok) {
      alert('Empleado creado correctamente');
      closeCreateModal();
      fetchEmployees();
    } else {
      const error = await response.json();
      alert(`Error al crear empleado: ${error.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error al crear empleado:', error);
  }
}


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

// Actualizar empleado
async function updateEmployee(employeeId) {
  const token = getStoredToken() || await getAuthToken();
  if (!token) return;

  const updatedData = {
    employeeName: document.getElementById('employeeName').value,
    email: document.getElementById('email').value,
    department: document.getElementById('department').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    address: document.getElementById('address').value
  };

  try {
    const response = await fetch(`${apiUrl}/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      alert('Empleado actualizado correctamente');
      closeCreateModal();
      fetchEmployees();
    } else {
      alert('Error al actualizar empleado');
    }
  } catch (error) {
    console.error(error);
  }
}

// Eliminar empleado
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
      alert('Empleado eliminado');
      fetchEmployees();
    } else {
      alert('Error al eliminar empleado');
    }
  } catch (error) {
    console.error(error);
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
function searchEmployees() {
  const searchQuery = document.getElementById('search').value;
  fetchEmployees(1, searchQuery);
}

// Inicializar
document.addEventListener('DOMContentLoaded', fetchEmployees);
const tableBody = document.getElementById("table-body");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search");
const departmentFilter = document.getElementById("department-filter");
const paginationContainer = document.getElementById("pagination-container");

let currentPage = 1;
const employeesPerPage = 15;
let employeesData = []; // Todos los empleados
let filteredData = []; // Empleados después de aplicar filtros





// Resaltar el botón de la página actual
function highlightCurrentPage() {
  const buttons = paginationContainer.querySelectorAll("button");
  buttons.forEach(button => {
    button.style.backgroundColor = ""; // Resetear el color de fondo de todos los botones
    button.style.fontWeight = "normal"; // Resetear el estilo
  });
  const currentButton = buttons[currentPage - 1];
  currentButton.style.backgroundColor = "#49B6E9"; // Resaltar el botón de la página actual
  currentButton.style.fontWeight = "bold"; // Resaltar el texto
}

function searchEmployees() {
  const searchQuery = document.getElementById('search').value.trim();
  
  if (!searchQuery) {
    // Si el campo de búsqueda está vacío, recargar toda la lista de empleados
    fetchEmployees();
    return;
  }

  // Si el usuario ingresa un número, hacer una búsqueda por ID
  if (!isNaN(searchQuery)) {
    fetchEmployeeById(searchQuery);
  } else {
    // Si no es un número, realizar la búsqueda como texto
    fetchEmployees(1, searchQuery);
  }
}

// Función para obtener un solo empleado por ID
async function fetchEmployeeById(id) {
  const token = getStoredToken();
  if (!token) {
    alert("No tienes un token de autenticación válido.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Empleado no encontrado');
    }

    const employee = await response.json();

    // Mostrar solo este empleado en la tabla
    renderEmployees([employee]);
  } catch (error) {
    console.error('Error al buscar empleado:', error);
    alert('No se encontró el empleado.');
  }
}

// Abrir el modal de filtros
document.getElementById('openFilterModal').addEventListener('click', function () {
  document.getElementById('filterModal').style.display = 'flex';
});

// Cerrar el modal de filtros
function closeFilterModal() {
  document.getElementById('filterModal').style.display = 'none';
}

// Aplicar los filtros del modal
function applyFilterModal() {
  const statusFilter = document.getElementById('filterStatus').value;
  const departmentFilter = document.getElementById('filterDepartment').value;

  // Llamar a fetchEmployees con los filtros aplicados
  fetchEmployees(1, 15, '', statusFilter, departmentFilter);

  // Cerrar el modal después de aplicar los filtros
  closeFilterModal();
}

let currentEmployeeId = null;
let qrEnabled = false;

// Función para abrir el modal con los datos del QR del empleado
async function editEmployee(employeeId) {
    currentEmployeeId = employeeId; // Guardar el ID del empleado

    const token = getStoredToken();
    if (!token) return alert("No tienes un token válido.");

    try {
        // Obtener datos del empleado (incluido el QR)
        const response = await fetch(`${apiUrl}/${employeeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al obtener datos del empleado');

        const employee = await response.json();

        // Asignar QR y estado
        document.getElementById('qrModalImage').src = generateQrCode(employee.id_employee);
        qrEnabled = employee.enabled ?? false; // Si no existe, por defecto es false

        // Actualizar el estado del toggle
        document.getElementById('qrToggleSwitch').checked = qrEnabled;

        // Mostrar el modal
        document.getElementById('qrModalContainer').style.display = 'flex';

    } catch (error) {
        console.error('Error al cargar el QR:', error);
    }
}

// Generar el QR (cambiar si tienes un endpoint para generarlo)
function generateQrCode(employeeId) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${employeeId}`;
}

// Función para cerrar el modal
function closeQrModal() {
    document.getElementById('qrModalContainer').style.display = 'none';
}

// Función para habilitar/deshabilitar el QR con el toggle
async function toggleQrState() {
    if (!currentEmployeeId) return;

    const token = getStoredToken();
    if (!token) return alert("No tienes un token válido.");

    // Obtener el estado actual del toggle
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

    } catch (error) {
        console.error('Error al cambiar estado del QR:', error);
    }
}
