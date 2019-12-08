var recipient

$('#menu-toggle').click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$('#modal_msg').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    
    recipient = button.data('whatever');
    var modal = $(this)
    modal.find('.modal-body input').val(recipient);
    modal.find('.modal-body textarea').val($(button).next().text());
});

$('#modal_edit_personal_data').on('show.bs.modal', function (event) {
    var modal = $(this)

    modal.find('#data_user_name').val($('#nome').text());
    modal.find('#data_user_email').val($('#email').text());
    modal.find('#data_user_cf').val($('#c_f').text());
    if ($('#telefono').text() != "Non specificato"){
        modal.find('#data_user_telefono').val($('#telefono').text());
    }
    if ($('#indirizzo').text() != "Non specificato"){
        modal.find('#data_user_indirizzo').val($('#indirizzo').text());
    }
    if ($('#rag_sociale').text() != "Non specificato"){
        modal.find('#data_user_rs ').val($('#rag_sociale').text());
    }
});

$('#send_update_data_user').on('click', function () {
    if ($('#data_user_password').val() != "" || 
        ($('#data_user_telefono').val() != "" && $('#data_user_telefono').val() != $('#telefono').text()) || 
        ($('#data_user_indirizzo').val() != "" && $('#data_user_indirizzo').val() != $('#indirizzo').text()) || 
        ($('#data_user_rs').val() != "" && $('#data_user_rs').val() != $('#rag_sociale').text())) {

        var old_values_obj = {};
        old_values_obj.data_user_telefono = $('#telefono').text();
        old_values_obj.data_user_indirizzo = $('#indirizzo').text();
        old_values_obj.data_user_rs = $('#rag_sociale').text();

        var new_values_obj = {};
        new_values_obj.data_user_password = $('#data_user_password').val();
        new_values_obj.data_user_telefono = $('#data_user_telefono').val();
        new_values_obj.data_user_indirizzo = $('#data_user_indirizzo').val();
        new_values_obj.data_user_rs = $('#data_user_rs').val();

        $.ajax({
            url: "/update_data_user",
            type: "post",
            data: { new_values: new_values_obj, 
                    old_values: old_values_obj},
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
    }
    else {
        alert('Nessun dato modificato.');
    }
})