$(document).ready(function(){
    tablaPersonas = $("#tablaPersonas").DataTable({


    "language": {
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "No se encontraron resultados",
            "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
            "infoFiltered": "(filtrado de un total de _MAX_ registros)",
            "sSearch": "Buscar:",
            "oPaginate": {
                "sFirst": "Primero",
                "sLast":"Último",
                "sNext":"Siguiente",
                "sPrevious": "Anterior"
             },
             "sProcessing":"Procesando...",
        },
        responsive: "true",
        dom: 'Bfrtilp',
        buttons: ['copy', 'excel', 'pdf', 'colvis']
    });

$("#btnNuevo").click(function(){
    $("#formPersonas").trigger("reset");
    $(".modal-header").css("background-color", "#1cc88a");
    $(".modal-header").css("color", "white");
    $(".modal-title").text("Nuevo Usuario");
    $("#modalCRUD").modal("show");
    idusuario=null;
    opcion = 1; //alta
});

var fila; //capturar la fila para editar o borrar el registro

//botón EDITAR
$(document).on("click", ".btnEditar", function(){
    fila = $(this).closest("tr");
    idusuario = parseInt(fila.find('td:eq(0)').text());
    nombre = fila.find('td:eq(1)').text();
    ficha = fila.find('td:eq(2)').text();
    correo = fila.find('td:eq(3)').text();
    rol = fila.find('td:eq(4)').text();
    pertenencia = fila.find('td:eq(5)').text();

    $("#nombre").val(nombre);
    $("#ficha").val(ficha);
    $("#correo").val(correo);
    $("#rol").val(rol);
    $("#pertenencia").val(pertenencia);
    opcion = 2; //editar

    $(".modal-header").css("background-color", "#4e73df");
    $(".modal-header").css("color", "white");
    $(".modal-title").text("Editar Usuario");
    $("#modalCRUD").modal("show");

});

//botón BORRAR
$(document).on("click", ".btnBorrar", function(){
    fila = $(this);
    idusuario = parseInt($(this).closest("tr").find('td:eq(0)').text());
    opcion = 3 //borrar
    var respuesta = confirm("¿Está seguro de eliminar el registro: "+idusuario+"?");
    if(respuesta){
        $.ajax({
            url: "bd/crud.php",
            type: "POST",
            dataType: "json",
            data: {opcion:opcion, idusuario:idusuario},
            success: function(){
                tablaPersonas.row(fila.parents('tr')).remove().draw();
            }
        });
    }
});

$("#formPersonas").submit(function(e){
    e.preventDefault();
    nombre = $.trim($("#nombre").val());
    ficha = $.trim($("#ficha").val());
    correo = $.trim($("#correo").val());
    rol = $.trim($("#rol").val());
    pertenencia = $.trim($("#pertenencia").val());
    $.ajax({
        url: "bd/crud.php",
        type: "POST",
        dataType: "json",
        data: {nombre:nombre, ficha:ficha, correo:correo, rol:rol, pertenencia:pertenencia, idusuario:idusuario, opcion:opcion},
        success: function(data){
            console.log(data);
            idusuario = data[0].idusuario;
            nombre = data[0].nombre;
            ficha = data[0].ficha;
            correo = data[0].correo;
            rol = data[0].rol;
            pertenencia = data[0].pertenencia;
            if(opcion == 1){tablaPersonas.row.add([idusuario,nombre,ficha,correo,rol,pertenencia]).draw();}
            else{tablaPersonas.row(fila).data([idusuario,nombre,ficha,correo,rol,pertenencia]).draw();}
        }
    });
    $("#modalCRUD").modal("hide");

});

});
