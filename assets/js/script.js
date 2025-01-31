// URLs y credenciales
const apiUrl = 'https://hie-3f29.onrender.com/api/employees';
const authUrl = 'https://hie-3f29.onrender.com/auth/login';

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

// Obtener empleados
async function fetchEmployees(page = 1, search = '', limit = 10) {
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
      <td style="display: flex;">
        <button class="action-btn" onclick="viewEmployee(${employee.id_employee})">
          <img src="assets/img/eye.svg" alt="Ver">
        </button>
        <button class="action-btn" onclick="editEmployee(${employee.id_employee})">
          <img src="assets/img/calendar.svg" alt="Editar">
        </button>
        <button class="action-btn" onclick="deleteEmployee(${employee.id_employee})">
          <img src="assets/img/trash.svg" alt="Eliminar">
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}


// Crear empleado
async function createEmployee() {
  const token = getStoredToken() || await getAuthToken();
  if (!token) return;

  // Obtener datos del formulario
  const employeeData = {
    employeeName: document.getElementById('employeeName').value,
    email: document.getElementById('email').value,
    department: document.getElementById('department').value,
    phoneNumber: document.getElementById('phoneNumber').value,
    address: document.getElementById('address').value
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

// Función para cargar los empleados desde el archivo JSON
async function loadEmployees() {
  try {
    const response = await fetch('employees.json'); // Asegúrate de que este archivo esté disponible
    const employees = await response.json();
    employeesData = employees; // Guardamos todos los empleados
    filteredData = employeesData; // Inicializamos los empleados filtrados con todos los datos
    updatePagination(); // Actualizamos la paginación
    displayEmployees(getEmployeesForPage(currentPage)); // Mostramos la primera página de empleados
  } catch (error) {
    console.error('Error al cargar los datos:', error);
  }
}

// Función para obtener empleados para la página actual
function getEmployeesForPage(page) {
  const startIndex = (page - 1) * employeesPerPage;
  const endIndex = page * employeesPerPage;
  return filteredData.slice(startIndex, endIndex); // Devolver empleados filtrados por la página actual
}

// Función para mostrar los empleados en la tabla
function displayEmployees(employees) {
  tableBody.innerHTML = ""; // Limpiar la tabla
  employees.forEach(employee => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${employee.id_employee}</td>
      <td>${employee.name}</td>
      <td>${employee.department}</td>
      <td>${employee.check_in_time}</td>
      <td>${employee.check_out_time}</td>
      <td>${employee.date}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Función para actualizar los botones de paginación
function updatePagination() {
  const totalPages = Math.ceil(filteredData.length / employeesPerPage);
  paginationContainer.innerHTML = ""; // Limpiar los botones existentes

  // Crear los botones de paginación
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.addEventListener("click", () => changePage(i));
    paginationContainer.appendChild(button);
  }
}

// Función para cambiar de página
function changePage(page) {
  currentPage = page;
  displayEmployees(getEmployeesForPage(page)); // Mostrar empleados de la nueva página
  highlightCurrentPage(); // Resaltar la página actual
}

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

// Filtrar empleados por ID
function filterById() {
  const searchValue = searchInput.value.toLowerCase();
  filteredData = employeesData.filter(employee => 
    employee.id_employee.toLowerCase().includes(searchValue)
  );
  currentPage = 1; // Resetear a la primera página después de un filtro
  updatePagination(); // Actualizar paginación con los empleados filtrados
  displayEmployees(getEmployeesForPage(currentPage)); // Mostrar empleados de la primera página
}

// Filtrar empleados por departamento
function filterByDepartment() {
  const department = departmentFilter.value.toLowerCase();
  filteredData = employeesData.filter(employee => 
    department ? employee.department.toLowerCase() === department : true
  );
  currentPage = 1; // Resetear a la primera página después de un filtro
  updatePagination(); // Actualizar paginación con los empleados filtrados
  displayEmployees(getEmployeesForPage(currentPage)); // Mostrar empleados de la primera página
}

// Evento para la búsqueda
searchButton.addEventListener("click", filterById);

// Evento para el filtro de departamento
departmentFilter.addEventListener("change", filterByDepartment);

// Cargar los empleados y configurar la paginación al principio
loadEmployees();
