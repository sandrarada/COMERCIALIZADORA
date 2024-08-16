let dataTableProducts;
let dataTableProductsIsInitialized = false;




/**
 * Función para listar las categorias
 */
const listProducts = async () => {
    try {
        const response = await fetch("/adminCustom/getProducts");
        const data = await response.json();
        console.log(data);
        let content = ``;
        data.products.forEach((product, index) => {
            content += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${product.Product}</td>
                    <td>${product.category__name_categories}</td>
                    <td>${product.description}</td>
                    <td>${product.price}</td>
                    <td>                        
                        <button class='btn btn-sm btn-outline-success' onclick="viewImageProduct('/media/${product.image}')"><i class="fa-regular fa-eye"></i></button>
                    </td>
                    <td>
                        <button class='btn btn-sm btn-outline-primary' onclick="updateProducts(
                            ${product.id},
                            '${product.Product}',
                            '${product.category__name_categories}',
                            '${product.description}',
                            '${product.price}',
                            '${product.image}'
                            )"><i class='fa-solid fa-pencil'></i></button>
                        <button class='btn btn-sm btn-outline-danger' onclick="deleteProducts('${product.id}')"><i class='fa-solid fa-trash-can' ></i></button>
                    </td>
                </tr>`;
        });
        //Un id se puede referenciar solamenete con su nombre de id 
        tableBody_products.innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};

/**
 * Función para mostrar imagen del producto
 */
const viewImageProduct = async (url) => {
    swal.fire({
        title: 'Imagen del Producto',
        imageUrl: url,
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Custom image',
    });
}



/**
 * initDataTable
 * @description Función para inicializar el DataTable
 * @param {*} tabla 
 * @param {*} tableOptions 
 * @param {*} executeFunction 
 */
const initDataTableProducts = async (tabla,tableOptions,executeFunction) => {
    if (dataTableProductsIsInitialized) {
        dataTableProducts.destroy();
    }
    await executeFunction();

    dataTableProducts = $(tabla).DataTable(tableOptions);

    dataTableProductsIsInitialized = true;
};


/**
 * Función para mostrar la tabla de categorias
 */
const viewListProducts = async () => {

    const dataTableOptions = {
        columnDefs: [
            { className: "centered", targets: [0, 1, 2,3,4,5,6] },//centrar contenido de las columnas
            { orderable: false, targets: [5,6] },//no se puede ordenar por acciones
            { searchable: false, targets: [0,5,6 ] }//no se puede buscar por el id
        ],
        pageLength: 4,
        destroy: true,
        language: {
            info: 'Mostrando página _PAGE_ de _PAGES_',
            infoEmpty: 'No hay registros disponibles',
            infoFiltered: '(filtrado de _MAX_ registros totales)',
            lengthMenu: 'Mostrar  _MENU_  registros por página',
            zeroRecords: 'No se encontraron resultados - lo siento',
            paginate: {
                first: 'Primero',
                last: 'Último',
                previous: 'Anterior',
                next: 'Siguiente'
            },
            
            search: 'Buscar:',
            processing: "Procesando...",
            buttons: [
                {
                    extend: 'excel',
                    text: 'Exportar a Excel',
                    className: 'btn btn-success', // Clase CSS para el botón
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4] // Índices de las columnas que quieres exportar
                    }
                }
            ]
        }
            
    }; //opciones de la tabla
    
    //inicializamos la tabla Y enviamos la función para listar las categorias y las opciones de la tabla
    await initDataTableProducts("#datatable-products",dataTableOptions,listProducts);
    
};


/**
 * Función para editar una categoria
 */
const updateProducts = async (id,nombre,categoria,descripcion,precio,imagen) => {
    const response = await fetch("/adminCustom/getCategories");

    if (response.ok) {
        const data = await response.json();

        if (data && data.categories && Array.isArray(data.categories)) {
            const options = data.categories.map(category => `<option value="${category.id}">${category.name_categories}</option>`);

            // Construir el contenido HTML del formulario
            const formHtml = `
                <form id="formProducto">
                    <div class="form-group">
                        <label for="nombreCategoria">Nombre del Producto</label>
                        <input type="text" class="form-control" id="nombreProducto"
                        value="${nombre}">

                        <label for="nombreCategoria">Categoría</label>
                        <select class="form-control" id="categoriaProducto">
                            <option value="">${categoria}</option>
                            ${options.join('')}
                        </select>

                        <label for="nombreCategoria">Descripcion</label>
                        <input type="text" class="form-control" id="descripcion" value="${descripcion}">

                        <label for="nombreCategoria">Precio</label>
                        <input type="text" class="form-control" id="precio" value="${precio}">

                        <label for="nombreCategoria">Imagen</label>
                        <input type="file" class="form-control" id="imagen" value="${imagen}">
                    </div>
                </form>`;

            const { value: formValues, isConfirmed } = await Swal.fire({
                title: 'Editar Producto',
                html: formHtml,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Agregar',
            });
            
        if (isConfirmed ) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            //guardamos los datos en un objeto formData
            const nombreProducto = document.getElementById("nombreProducto").value;
            const categoriaProducto = document.getElementById("categoriaProducto").value;
            const descripcion = document.getElementById("descripcion").value;
            const precio = document.getElementById("precio").value;
            const imagen = document.getElementById("imagen").files[0];

            const formData = new FormData();

            formData.append('nombre_producto', nombreProducto);
            formData.append('categoria_producto', categoriaProducto);
            formData.append('descripcion', descripcion);
            formData.append('precio', precio);
            formData.append('imagen', imagen, imagen.name);
            
            try {
                const response = await fetch(`/adminCustom/updateProducts/${id}/`, {
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
                    title: "Producto Actualizado",
                    text: "EL producto se ha actualizado con exito.",
                    showConfirmButton: false,
                    timer: 1500
                    });
                viewListProducts();
                }

                
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ups... Algo salió mal',
                    text: 'No tienes Conexión con el servidor',
                });
            }
            }
        }
    }
    
    };

/**
 * Función para agregar una categoria
 */
const createProducts = async () => {
    const response = await fetch("/adminCustom/getCategories");

    if (response.ok) {
        const data = await response.json();

        if (data && data.categories && Array.isArray(data.categories)) {
            const options = data.categories.map(category => `<option value="${category.id}">${category.name_categories}</option>`);

            // Construir el contenido HTML del formulario
            const formHtml = `
                <form id="formProducto">
                    <div class="form-group">
                        <label for="nombreCategoria">Nombre del Producto</label>
                        <input type="text" class="form-control" id="nombreProducto">

                        <label for="nombreCategoria">Categoría</label>
                        <select class="form-control" id="categoriaProducto">
                            <option value="">Seleccione una categoría</option>
                            ${options.join('')}
                        </select>

                        <label for="nombreCategoria">Descripcion</label>
                        <input type="text" class="form-control" id="descripcion">

                        <label for="nombreCategoria">Precio</label>
                        <input type="text" class="form-control" id="precio">

                        <label for="nombreCategoria">Imagen</label>
                        <input type="file" class="form-control" id="imagen">
                    </div>
                </form>`;

            const { value: formValues, isConfirmed } = await Swal.fire({
                title: 'Agregar Producto',
                html: formHtml,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Agregar',
            });
            
        if (isConfirmed ) {
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            //guardamos los datos en un objeto formData
            const nombreProducto = document.getElementById("nombreProducto").value;
            const categoriaProducto = document.getElementById("categoriaProducto").value;
            const descripcion = document.getElementById("descripcion").value;
            const precio = document.getElementById("precio").value;
            const imagen = document.getElementById("imagen").files[0];

            const formData = new FormData();

            formData.append('nombre_producto', nombreProducto);
            formData.append('categoria_producto', categoriaProducto);
            formData.append('descripcion', descripcion);
            formData.append('precio', precio);
            formData.append('imagen', imagen, imagen.name);
            
            try {
                const response = await fetch(`/adminCustom/createProducts/`, {
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
                        title: "Producto Agregada",
                        text: "El producto ha sido agregado correctamente.",
                        showConfirmButton: false,
                        timer: 1500
                        });
                viewListProducts();
                }

                
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ups... Algo salió mal',
                    text: 'No tienes Conexión con el servidor',
                });
            }
            }
        }
    }
    };

/** */
const deleteProducts = async (id) => {

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
            const response = await fetch(`/adminCustom/deleteProducts/${id}/`, {
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
                    title: "Producto Eliminado",
                    text: "El producto ha sido eliminado correctamente.",
                    showConfirmButton: false,
                    timer: 1500
                    });
                viewListProducts();
            }
        }
        })
    
}

function exportToExcel(idTabla) {
    var table = $(idTabla).DataTable();
                table.button('.buttons-excel').trigger();
}



window.addEventListener("load", async () => {
    viewListProducts();
});