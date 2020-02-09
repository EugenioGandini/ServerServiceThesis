var recipient
var oid_sender_msg

$('#modal_msg').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    
    var replayable = $(button.parent().parent().children()[0]).text();
    oid_sender_msg = $(button.parent().parent().children()[1]).text();

    recipient = button.data('whatever');
    var modal = $(this)
    modal.find('.modal-body input').val(recipient);
    $('#message-text').text($(button).next().text());

    if(replayable == 1) {
        $('#message-text-replay').prop('disabled', false)
        $('.msg-replay').show();
        $('#btn-replay-msg').show();
    }
});

$('#modal_msg').on('hidden.bs.modal', function (e) {
    $('.msg-replay').hide();
    $('#btn-replay-msg').hide();
    $('#message-text-replay').val('');
})

$('#btn-replay-msg').on('click', function(e) {

    $.ajax({
        url: "/send_message",
        type: "post",
        data: { "user_id": oid_sender_msg, "msg": $('#message-text-replay').val() },
        statusCode: {
            200: function (response) {
                alert('Messaggio inviato.');
                $('#modal_msg').modal('hide');
            },
            401: function (response) {
                alert("Errore: " + response.responseText);
            },
            400: function (response) {
                alert("Errore nell'inviare il messaggio.");
            }
        }
    });
})

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

$('.link_esterno').on('click', function (event) {

    var question = confirm('Verrai rediretto sul sito ufficiale del Tribunale di Brescia');
    if (question === false) {
        event.preventDefault()
    }
})