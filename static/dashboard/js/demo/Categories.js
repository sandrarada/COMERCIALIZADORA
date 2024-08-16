let dataTable;
let dataTableIsInitialized = false;

const dataTableOptions = {
    columnDefs: [
        { className: "centered", targets: [0, 1, 2, 3] },
        { orderable: false, targets: [1,3] },
        { searchable: false, targets: [0] }
    ],
    pageLength: 4,
    destroy: true
};

const initDataTable = async () => {
    if (dataTableIsInitialized) {
        dataTable.destroy();
    }

    await listProgrammers();

    dataTable = $("#datatable-programmers").DataTable(dataTableOptions);

    dataTableIsInitialized = true;
};

const listProgrammers = async () => {
    try {
        const response = await fetch("/adminCustom/getCategories");
        const data = await response.json();

        let content = ``;
        data.categories.forEach((categories, index) => {
            content += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${categories.id}</td>
                    <td>${categories.name_categories}</td>
                    <td>
                        <button class='btn btn-sm btn-primary' onclick="updateCategories('Agregar Categoria',${categories.id},'${categories.name_categories}')"><i class='fa-solid fa-pencil'></i></button>
                        <button class='btn btn-sm btn-danger' onclick="deleteCategories('${categories.id}')"><i class='fa-solid fa-trash-can' ></i></button>
                    </td>
                </tr>`;
        });
        tableBody_programmers.innerHTML = content;
    } catch (ex) {
        alert(ex);
    }
};

window.addEventListener("load", async () => {
    await initDataTable();
});