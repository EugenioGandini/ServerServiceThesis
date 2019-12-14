$('#modal_edit_personal_data').on('show.bs.modal', function (event) {
    var modal = $(this)

    modal.find('#data_username').val($($('span')[0]).text());
    modal.find('#data_user_name').val($($('span')[1]).text());
    modal.find('#data_user_surname').val($($('span')[2]).text());
});

$('#send_update_data_user').on('click', function () {
    if ($('#data_user_password').val() != "") {

        var new_values_obj = {};
        new_values_obj.data_user_password = $('#data_user_password').val();
        new_values_obj.data_user_telefono = "";
        new_values_obj.data_user_indirizzo = "";
        new_values_obj.data_user_rs = "";

        $.ajax({
            url: "/update_data_user",
            type: "post",
            data: {
                new_values: new_values_obj
            },
            statusCode: {
                200: function (response) {
                    alert('Dati personali aggiornati');
                    window.location.reload();
                },
                401: function (response) {
                    alert("Errore: " + response.responseText);
                },
                400: function (response) {
                    alert("Reinserire lo username e la password");
                }
            }
        });
    } else {
        alert('Nessun dato modificato.');
    }
})

$('.delete_request').on('click', function (e) {
    var oid_user = $(this).parent().parent().children().first().text();

    $.ajax({
        url: "/remove_user",
        type: "post",
        data: {
            "user": oid_user
        },
        statusCode: {
            200: function (response) {
                alert('Utente eliminato');
                window.location.reload();
            },
            401: function (response) {
                alert("Errore: " + response.responseText);
            },
            400: function (response) {
                alert("Non è stato possibile eliminare l'utente selezionato.");
            }
        }
    });
})

$('#send_add_new_user').on('click', function(e) {
    var data_new_user = {}
    data_new_user.username = $('#add_user_username').val();
    data_new_user.name = $('#add_user_name').val();
    data_new_user.surname = $('#add_user_surname').val();
    data_new_user.password = $('#add_user_password').val();
    data_new_user.type_user = $('select option:selected').val();

    if ($('#add_user_username').val() == ""){
        alert("Inserisci un username per il nuovo utente.");
        return;
    } else if ($('#add_user_name').val() == "") {
        alert("Inserisci il nome del nuovo utente.");
        return;
    } else if ($('#add_user_surname').val() == "") {
        alert("Inserisci il cognome del nuovo utente.");
        return;
    } else if ($('#add_user_password').val() == "") {
        alert("Va fornita necessariamente una password.");
        return;
    } else if (data_new_user.type_user == '-') {
        alert("Seleziona una categoria per il nuovo utente.");
        return;
    } else  {
        $.ajax({
            url: "/add_new_user",
            type: "post",
            data: data_new_user,
            statusCode: {
                200: function (response) {
                    alert('Utente aggiunto con successo!');
                    window.location.reload();
                },
                401: function (response) {
                    alert("Errore: " + response.responseText);
                },
                400: function (response) {
                    alert("Non è stato possibile aggiungere l'utente.");
                }
            }
        });
    }
})