$('#menu-toggle').click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$('#modal_edit_personal_data').on('show.bs.modal', function (event) {
    var modal = $(this)

    modal.find('#data_username').val($($('span')[0]).text());
    modal.find('#data_user_name').val($($('span')[1]).text());
    modal.find('#data_user_surname').val($($('span')[2]).text());
});

$('#send_update_data_user').on('click', function () {
    if ($('#data_user_password').val() != ""){

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