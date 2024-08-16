let dataTable;
let dataTableIsInitialized = false;


/**
 * Función para listar las categorias
 */
const listCategories = async () => {
    try {
        const response = await fetch("/adminCustom/getCategories");
        const data = await response.json();
        console.log(data);
        let content = ``;
        data.categories.forEach((categories, index) => {
            content += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${categories.id}</td>
                    <td>${categories.name_categories}</td>
                    <td>
                        <button class='btn btn-sm btn-outline-primary' onclick="updateCategories('Agregar Categoria',${categories.id},'${categories.name_categories}')"><i class='fa-solid fa-pencil'></i></button>
                        <button class='btn btn-sm btn-outline-danger' onclick="deleteCategories('${categories.id}')"><i class='fa-solid fa-trash-can' ></i></button>
                    </td>
                </tr>`;
        });
        //Un id se puede referenciar solamenete con su nombre de id 
        tableBody_categories.innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};



/**
 * initDataTable
 * @description Función para inicializar el DataTable
 * @param {*} tabla 
 * @param {*} tableOptions 
 * @param {*} executeFunction 
 */
const initDataTable = async (tabla,tableOptions,executeFunction) => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }
    await executeFunction();

    dataTable = $(tabla).DataTable(tableOptions);

    dataTableIsInitialized = true;
};


/**
 * Función para mostrar la tabla de categorias
 */



const viewListCategories = async () => {

    const dataTableOptions = {
        columnDefs: [
            { className: "centered", targets: [0, 1, 2,3] },//centrar contenido de las columnas
            { orderable: false, targets: [1,3] },//no se puede ordenar por acciones
            { searchable: false, targets: [0, ] }//no se puede buscar por el id
        ],
        pageLength: 4,
        destroy: true,
        language: {
            info: 'Mostrando página _PAGE_ de _PAGES_',
            infoEmpty: 'No hay registros disponibles',
            infoFiltered: '(filtrado de _MAX_ registros totales)',
            lengthMenu: 'Mostrar _MENU_ registros por página',
            zeroRecords: 'No se encontraron resultados - lo siento',
            paginate: {
                first: 'Primero',
                last: 'Último',
                previous: 'Anterior',
                next: 'Siguiente'
            },
            search: 'Buscar:',
        }
            
    }; //opciones de la tabla
    
    //inicializamos la tabla Y enviamos la función para listar las categorias y las opciones de la tabla
    await initDataTable("#datatable-categories",dataTableOptions,listCategories);
    
};
    

/**
 * Función para editar una categoria
 */
const updateCategories = async (title,id,name) => {
    
    const { value: nombreCategoria, isConfirmed } = await Swal.fire({
        title: title,
        html:
        `<form id="formCategoria">
        <div class="form-group">
            <label for="nombreCategoria">Nombre de Categoría</label>
            <input type="text" class="form-control" id="nombreCategoria" value="${name}">
        </div>
    </form>`,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Actualizar',
        });
        
    if (isConfirmed ) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        //guardamos los datos en un objeto formData
        const nombreCategoria = document.getElementById("nombreCategoria").value;
        const formData = new FormData();

        formData.append('nombre_categoria', nombreCategoria);
        
        const response = await fetch(`/adminCustom/updateCategories/${id}/`, {
            method: "POST",
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken,
            },
        });
        
        const data = await response.json();

        if (data.error) {
            Swal.fire({
                icon: 'error',
                title: 'Ups... Algo salió mal',
                text: data.error,
            });
            return;
        }else{
            // Aquí puedes hacer algo con el nombre de la categoría ingresado
        
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Categoría Actualizada",
                text: "La  categoría ha sido actualizada correctamente.",
                showConfirmButton: false,
                timer: 1500
                });
        viewListCategories();
        }
        
        }
    };

/**
 * Función para agregar una categoria
 */
const createCategories = async () => {
    const { value: nombreCategoria, isConfirmed } = await Swal.fire({
        title: 'Agregar Categoría',
        html:
        `<form id="formCategoria">
        <div class="form-group">
            <label for="nombreCategoria">Nombre de Categoría</label>
            <input type="text" class="form-control" id="nombreCategoria">
        </div>
    </form>`,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Agregar',
        });
        
    if (isConfirmed ) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        //guardamos los datos en un objeto formData
        const nombreCategoria = document.getElementById("nombreCategoria").value;
        const formData = new FormData();

        formData.append('nombre_categoria', nombreCategoria);
        
        try {
            const response = await fetch(`/adminCustom/createCategories/`, {
                method: "POST",
                body: formData,
                headers: {
                    'X-CSRFToken': csrftoken,
                },
            });
            //obtenemos la respuesta del servidor
            const data = await response.json();
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: data.error,
                    text: data.error,
                });
            }else{
                // Aquí puedes hacer algo con el nombre de la categoría ingresado
            
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Categoría Agregada",
                    text: "La  categoría ha sido agregada correctamente.",
                    showConfirmButton: false,
                    timer: 1500
                    });
            viewListCategories();
            }

            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Ups... Algo salió mal',
                text: 'No tienes Conexión con el servidor',
            });
        }
        }
    };

/** */
const deleteCategories = async (id) => {

    Swal.fire({
        title: '¿Estás seguro de eliminar esta categoría?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        cancelButtonText:'Cancelar',
        confirmButtonText: 'Sí, eliminar'
      }).then(async (result) => {
        if (result.isConfirmed) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            const response = await fetch(`/adminCustom/deleteCategories/${id}/`, {
                method: "DELETE",
                headers: {
                    'X-CSRFToken': csrftoken,
                },
            });
            const data = await response.json();
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ups... Algo salió mal',
                    text: data.error,
                });
            }else{
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Categoría Eliminada",
                    text: "La  categoría ha sido eliminada correctamente.",
                    showConfirmButton: false,
                    timer: 1500
                    });
                viewListCategories();
            }
        }
      })
    
}



window.addEventListener("load", async () => {
    viewListCategories();
});