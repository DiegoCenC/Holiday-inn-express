document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("tbody");
    const filterButton = document.querySelector(".search-bar_filter");
    const deleteModal = document.getElementById("deleteModal");
    const modalCancelBtn = document.querySelector(".modal-buttons_cancel");
    const modalDeleteBtn = document.querySelector(".modal-buttons_delete");
    const API_URL = "https://devmace.onrender.com/api/advertisements";
    let adToDelete = null;

    // Variables para paginación
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const pageInfo = document.getElementById("pageInfo");
    let currentPage = 1;
    const itemsPerPage = 4;
    let advertisements = [];
    let sortedAdvertisements = [];

    // Variables del modal de alerta para el filtro
    const filterAlertModal = document.getElementById("filterAlertModal");
    const closeFilterAlertModal = document.getElementById("closeFilterAlertModal");

    // Función para mostrar el modal del filtro
    const showFilterAlertModal = () => {
        filterAlertModal.style.display = "flex";
    };

    // Evento para cerrar el modal del filtro
    closeFilterAlertModal.addEventListener("click", () => {
        filterAlertModal.style.display = "none";
    });


    // Función para cargar anuncios
    const loadAdvertisements = async () => {
        try {
            // Añadir timestamp para evitar caché
            const timestamp = new Date().getTime();
            const response = await fetch(`${API_URL}?_=${timestamp}`);
            const data = await response.json();
            advertisements = data;
            sortedAdvertisements = [...advertisements]; // Copia para ordenamiento
            updatePaginationControls();
            displayPage(currentPage);
        } catch (error) {
            console.error("Error al cargar anuncios:", error);
        }
    };

    // Función para mostrar una página
    const displayPage = (page) => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = sortedAdvertisements.slice(start, end);

        populateTable(paginatedItems);
        updatePaginationControls();
    };

    // Actualizar controles de paginación
    const updatePaginationControls = () => {
        const totalPages = Math.ceil(advertisements.length / itemsPerPage);
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    };

    // Eventos de paginación
    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                displayPage(currentPage);
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(advertisements.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayPage(currentPage);
            }
        });
    }

    // Rellenar la tabla con los anuncios
    const populateTable = (advertisements) => {
        tableBody.innerHTML = ""; // Limpiar tabla
        advertisements.forEach((ad) => {
            // Formatear la fecha
            const fecha = new Date(ad.issue_date);
            const fechaFormateada = fecha.toISOString().split('T')[0];
            
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${ad.id_advertisements}</td>
                <td class="title-column">${ad.title}</td>
                <td>${fechaFormateada}</td>
                <td class="description-column">${ad.description}</td>
                <td>${ad.status}</td>
                <td>${ad.departments}</td>
                <td>
                    <button class="view" onclick="viewAd(${ad.id_advertisements})">
                        <img src="icons-global/eye.svg" alt="Ver" class="icon">
                    </button>
                    <button class="delete" data-id="${ad.id_advertisements}">
                        <img src="icons-global/trash.svg" alt="Eliminar" class="icon">
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        attachDeleteEventListeners();
    };

    // Ordenar los anuncios
    const attachSorting = () => {
        document.querySelectorAll("th[data-column]").forEach((header) => {
            header.addEventListener("click", () => {
                const column = header.getAttribute("data-column");
                const order = header.getAttribute("data-order");
                const newOrder = order === "asc" ? "desc" : "asc";

                // Ordenar anuncios
                sortedAdvertisements.sort((a, b) => {
                    if (a[column] < b[column]) return order === "asc" ? -1 : 1;
                    if (a[column] > b[column]) return order === "asc" ? 1 : -1;
                    return 0;
                });

                // Actualizar dirección de orden
                header.setAttribute("data-order", newOrder);

                // Mostrar primera página con el nuevo orden
                currentPage = 1;
                displayPage(currentPage);
            });
        });
    };

    // Filtro
    if (filterButton) {
        filterButton.addEventListener("click", () => {
            let filterForm = document.getElementById("filter-form");
    
            // Si ya existe el formulario, lo eliminamos
            if (filterForm) {
                filterForm.remove();
            }
    
            // Crear el formulario con las opciones de filtro
            const filterOptions = `
                <div id="filter-form">
                    <select id="filterOption">
                        <option value="" disabled selected>Seleccione filtro</option>
                        <option value="departments">Departamento</option>
                        <option value="status">Estado</option>
                    </select>
                    <select id="filterValue" disabled>
                        <option value="" disabled selected>Seleccione una opción</option>
                    </select>
                    <button id="applyFilter" disabled>Aplicar</button>
                </div>
            `;
            
            document.querySelector('.search-bar').insertAdjacentHTML('beforeend', filterOptions);

            const filterOption = document.getElementById("filterOption");
            const filterValue = document.getElementById("filterValue");
            const applyFilterButton = document.getElementById("applyFilter");

            filterOption.addEventListener("change", () => {
                const type = filterOption.value;
                filterValue.disabled = false;
                filterValue.innerHTML = `
                    <option value="" disabled selected>Seleccione una opción</option>
                `; // Limpiar opciones previas

                if (type === "departments") {
                    filterValue.innerHTML += `
                        <option value="All">Todos</option>
                        <option value="Cocina">Cocina</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Seguridad">Seguridad</option>
                        <option value="Almacen">Almacén</option>
                    `;
                } else if (type === "status") {
                    filterValue.innerHTML += `
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="programado">Programado</option>
                    `;
                }

                applyFilterButton.disabled = false;
            });

            applyFilterButton.addEventListener("click", async () => {
                const type = filterOption.value;
                const value = filterValue.value;

                if (!value || value === "Seleccione una opción") {
                    showFilterAlertModal(); // Mostrar modal del filtro
                    return;
                }

                try {
                    const response = await fetch(API_URL);
                    const data = await response.json();
                    const filteredData = data.filter((ad) => 
                        value === "All" || ad[type] === value
                    );
                    sortedAdvertisements = filteredData; // Filtrar datos
                    currentPage = 1; // Reiniciar a la primera página
                    displayPage(currentPage);
                } catch (error) {
                    console.error("Error al aplicar filtro:", error);
                }
            });
        });
    }

    // Confirmar eliminación
    const attachDeleteEventListeners = () => {
        document.querySelectorAll(".delete").forEach((button) => {
            button.addEventListener("click", (event) => {
                adToDelete = event.target.closest("button").dataset.id;
                deleteModal.style.display = "flex"; // Mostrar modal centrado
            });
        });
    };

    modalCancelBtn.onclick = () => {
        deleteModal.style.display = "none";
        adToDelete = null;  // Restablecer la variable de anuncio a eliminar
    };

    modalDeleteBtn.onclick = async () => {
        if (adToDelete) {
            await deleteAd(adToDelete);
            deleteModal.style.display = "none";
            adToDelete = null;  // Restablecer la variable de anuncio a eliminar
        }
    };

    // Eliminar anuncio
    const deleteAd = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                loadAdvertisements();
            }
        } catch (error) {
            console.error("Error al eliminar anuncio:", error);
        }
    };

    // Redirigir para ver anuncio
    window.viewAd = (id) => {
        localStorage.setItem("selectedAdId", id);
        window.location.href = "verAnuncio/verAnuncio.html";
    };

    // Cargar anuncios al iniciar y cuando la página se hace visible
    loadAdvertisements();
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            loadAdvertisements();
        }
    });
    attachSorting(); // Inicializar ordenamiento
});
