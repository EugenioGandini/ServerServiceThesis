var user_id
var certificate_id

$('#modal_replay').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    user_id = $($(button).children()[1]).text();
    console.log(user_id)
    var recipient = button.data('whatever');
    var modal = $(this)
    modal.find('.modal-title').text('Invia messaggio a ' + recipient);
    modal.find('.modal-body input').val(recipient);
})

$('#modal_detail').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    certificate_id = $($(button).children()[0]).text();
    var modal = $(this)
    modal.find('.modal-title').text('Dettagli richiesta di certificato');

    $.ajax({
        url: "/detail_certificate",
        type: "post",
        data: {"certificate_request_id": certificate_id},
        success: function (data) {
            $('#recap_cert_req_date').text(data.date_request.substring(0, 10));
            $('#recap_cert_req_type').text(data.abbreviation_name);
            $('#recap_cert_req_status').text(data.status_request);
            $('#recap_cert_req_user').text(data.cognome + " " + data.nome);
            $('#recap_cert_req_c_f').text(data.codicefiscale);
            $('#recap_cert_req_reason').attr("data-content", data.reason_request);
            $("#recap_cert_req_reason").popover();
            if(data.payment == 1) {
                $('#recap_cert_req_payment').text('Pagato');
            }
            else {
                $('#recap_cert_req_payment').text('Pagamento pendente');
            }
            $('#recap_cert_req_payment').text(data.abbreviation_name);
        }
    });
})

$('#send_msg_user').on('click', function(){
    $.ajax({
        url: "/send_message",
        type: "post",
        data: { "user_id": user_id, "msg": $('#message-text').val() },
        statusCode: {
            200: function (response) {
                alert('Messaggio inviato.');
                $('.modal').modal('toggle');
            },
            401: function (response) {
                alert("Errore: " + response.responseText);
            },
            400: function (response) {
                alert("Reinserire lo username e la password");
            }
        }
    });
})

$('#recap_cert_req_copy_c_i').on('click', function () {
    window.open("/get_document_certificate_request?certificate_request_id=" + certificate_id + "&type=copy_ci");
});

$('#recap_cert_req_copy_c_f').on('click', function () {
    window.open("/get_document_certificate_request?certificate_request_id=" + certificate_id + "&type=copy_cf");
});

$('.delete_request').on('click', function(event) {
    event.preventDefault();

    $.ajax({
        url: "/delete_certificate_request",
        type: "post",
        data: { "certificate_request_id": $(event.target).prev().text()},
        statusCode: {
            200: function (response) {
                window.location.reload();
            },
            default: function(response){
                alert('Non è stato possibile eliminare la richiesta di certificato.')
            }
        }
    });
})

$('.select_status_request').on('change', function(event) {
    console.log($(event.target).prev().text() + " into " + $(event.target).children("option:selected").val() + " user " + $(event.target).prev().prev().text());

    var question = confirm('Sei sicuro di aggiornare lo stato della richiesta in ' + $(event.target).children("option:selected").val());
    if (question === true) {
        $.ajax({
            url: "/update_certificate_request",
            type: "post",
            data: { "certificate_request_id": $(event.target).prev().text(), "new_status": $(event.target).children("option:selected").val(), "user_request": $(event.target).prev().prev().text() },
            statusCode: {
                200: function (response) {
                    window.location.reload();
                },
                default: function (response) {
                    alert('Non è stato possibile eliminare la richiesta di certificato.')
                }
            }
        });
    } else {
        alert('Operazione annullata');
    }
})