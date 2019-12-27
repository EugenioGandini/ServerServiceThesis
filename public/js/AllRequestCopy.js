var user_id
var copy_request_id
var previous_value_select;
var max_num_pages;
var costo_per_pagina_documento_completo;
var prezzo_attuale;
var num_pagine_selezionate_selezionate;
var prezzo_per_pagina;

$("#sidebar").mCustomScrollbar({
    theme: "minimal"
});

$('#dismiss, .overlay').on('click', function () {
    $('#sidebar').removeClass('active');
    $('.overlay').removeClass('active');
});

$('#sidebarCollapse').on('click', function () {
    $('#sidebar').addClass('active');
    $('.overlay').addClass('active');
    $('.collapse.in').toggleClass('in');
    $('a[aria-expanded=true]').attr('aria-expanded', 'false');
});

$('.popup').hover(function () {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
});


$('#modal_replay').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    user_id = $($(button).children()[1]).text();
    var recipient = button.data('whatever');
    var modal = $(this)
    modal.find('.modal-title').text('Invia messaggio a ' + recipient);
    modal.find('.modal-body input').val(recipient);
})

$('#send_msg_user').on('click', function () {
    $.ajax({
        url: "/send_message",
        type: "post",
        data: { "user_id": user_id, "msg": $('#message-text').val() },
        statusCode: {
            200: function (response) {
                alert('Messaggio inviato.');
                $('#modal_replay').modal('hide');
            },
            401: function (response) {
                alert("Errore: " + response.responseText);
            }
        }
    });
})

$('#modal_detail').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    copy_request_id = $($(button).children()[0]).text();
    var modal = $(this)
    modal.find('.modal-title').text('Dettagli richiesta di copia atto');

    $.ajax({
        url: "/detail_copy_document",
        type: "post",
        data: { "copy_document_request_id": copy_request_id },
        success: function (data_result) {
            $('#recap_req_data').text(data_result.data.substring(0, 10));
            $('#recap_req_status').text(data_result.status_request);
            $('#recap_req_nome_atto').text(data_result.nome_atto_giudiziario);
            if (data_result.autentica == 0) {
                $('#recap_req_autentica').text("No");
            }
            else {
                $('#recap_req_autentica').text("Si");
            }
            if (data_result.urgente == 0) {
                $('#recap_req_urgente').text("No");
            } 
            else {
                $('#recap_req_urgente').text("Si");
            }
            $('#recap_req_user').text(data_result.cognome + " " + data_result.nome);
            $('#recap_req_c_f').text(data_result.codicefiscale);

            if (data_result.payment == 1) {
                $('#recap_req_payment').prop("disabled", false);
                $('#recap_req_payment').text('Pagato');
                $('#recap_req_payment').attr("data-content", data_result.prezzo_totale + "€");
                $("#recap_req_payment").popover();

                $('#detail_request_copy').show();
                $('#recap_detail_copy').attr("data-content", 
                    "Numero copie: " + data_result.num_copie + "<br>"+
                    "Da pagina: " + data_result.pag_inizio + " " +
                    "a pagina: " + data_result.pag_fine);
                $('#recap_detail_copy').popover();
            }
            else {
                $('#recap_req_payment').text('Pagamento pendente');
            }

            if(data.other_doc != undefined) {
                $('.object-request').show();
            }
        }
    });
})

$('#modal_detail').on('hidden.bs.modal', function (e) {
    $('.object-request').hide();
    $('#recap_req_data').text('');
    $('#recap_req_status').text('');
    $('#recap_req_nome_atto').text('');
    $('#recap_req_autentica').text('');
    $('#recap_req_c_f').text('');
    $('#recap_req_urgente').text('');
    $('#recap_req_payment').text('');
    $('#recap_req_payment').prop("disabled", true);
    $('#detail_request_copy').hide();
});

$('#modal_payment').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    copy_request_id = $($(button).children()[0]).text();

    $.ajax({
        url: "/num_pages_document_request",
        type: "post",
        data: { "copy_document_request_id": copy_request_id },
        success: function (data) {
            max_num_pages = data.num_pagine_totali;
            num_pagine_selezionate = max_num_pages;
            $('label[for=radio_whole_doc1]').text("Si (" + max_num_pages + " pagine)");
            $('#finish_page').attr('max', max_num_pages);
            $('#finish_page').attr('value', max_num_pages);

            prezzo_per_pagina = data.prezzo_per_pagina;
            costo_per_pagina_documento_completo = data.prezzo_per_pagina;
            prezzo_attuale = data.prezzo_per_pagina * data.num_pagine_totali * parseInt($('#number_copy').val());;

            $('.totale_prezzo').text(prezzo_attuale + "€ (" + prezzo_per_pagina + "€/pag)");
        }
    })
})

$('#recap_req_copy_c_i').on('click', function () {
    window.open("/get_document_copy_request?copy_request_id=" + copy_request_id + "&type=copy_ci");
});

$('#recap_req_copy_c_f').on('click', function () {
    window.open("/get_document_copy_request?copy_request_id=" + copy_request_id + "&type=copy_cf");
});

$('#recap_req_copy_doc_agg').on('click', function () {
    if ($('.object-request').is(":visible")) {
        window.open("/get_document_copy_request?copy_request_id=" + copy_request_id + "&type=other_doc");
    }
});

$('.delete_request').on('click', function (event) {
    event.preventDefault();

    $.ajax({
        url: "/delete_copy_document_request",
        type: "post",
        data: { "copy_request_id": $(event.target).prev().text() },
        statusCode: {
            200: function (response) {
                window.location.reload();
            },
            default: function (response) {
                alert('Non è stato possibile eliminare la richiesta di copia.')
            }
        }
    });
})

$('.select_status_request').on('focus', function(){
    previous_value_select = this.value;
}).on('change', function (event) {
    var num_pagine = 0;
    if ($(event.target).children("option:selected").val() == "ATTESA PAGAMENTO") {
        num_pagine = prompt("Inserisci il numero di pagine dell'atto notorio:", "");
        if (num_pagine == null || num_pagine == "" || num_pagine < 0) {
            alert('Devi fornire il numero di pagine totali dell\'atto per il calcolo automatico dei costi al cittadino.');
            $(this).val(previous_value_select);
            return;
        }
    }
    var question = confirm('Sei sicuro di aggiornare lo stato della richiesta in ' + $(event.target).children("option:selected").val());
    if (question === true) {
        $.ajax({
            url: "/update_copy_document_request",
            type: "post",
            data: { "copy_request_id": $(event.target).prev().text(), "new_status": $(event.target).children("option:selected").val(), "user_request": $(event.target).prev().prev().text(), "num_pagine": num_pagine },
            statusCode: {
                200: function (response) {
                    window.location.reload();
                },
                default: function (response) {
                    alert('Non è stato possibile cambiare lo stato della richiesta di copia.')
                }
            }
        });
    } else {
        alert('Operazione annullata');
        $(this).val(previous_value_select);
    }
});

$('input[name=radio_whole_doc]').on('change', function(event) {
    if($(event.target).val() == "some_pages"){
        num_pagine_selezionate = $('#finish_page').val() - $('#start_page').val() + 1; 
        prezzo_attuale = prezzo_per_pagina * num_pagine_selezionate * parseInt($('#number_copy').val());
        $('.page_range').show();
        $('.totale_prezzo').text(prezzo_attuale + "€ (" + prezzo_per_pagina + "€/pag)");
    }
    else {
        $('.page_range').hide();
        num_pagine_selezionate = max_num_pages;
        prezzo_attuale = costo_per_pagina_documento_completo * num_pagine_selezionate * parseInt($('#number_copy').val());
        $('.totale_prezzo').text(prezzo_attuale + "€ (" + costo_per_pagina_documento_completo + "€/pag)");
    }
});

$('#pagamento').on('click', function (event) {
    $(this).hide();
    $('.lds-roller').show();
    setTimeout(function () {
        $('.lds-roller').hide();
        $('#payment_succeded').show();
        $('#send_payment').prop("disabled", false);
    }, 3000);
})

$('#send_payment').on('click', function() {
    $.ajax({
        url: "/pay_copy_document_request",
        type: "post",
        data: { "copy_document_request_id": copy_request_id, "num_pages": num_pagine_selezionate, "total_pages": max_num_pages, "num_copies": $('#number_copy').val(), "start_page": $('#start_page').val(), "finish_page": $('#finish_page').val()},
        statusCode: {
            200: function (response) {
                alert('Pagamento effettuato.');
                window.location.reload();
            },
            401: function (response) {
                alert("Errore: " + response.responseText);
            }
        }
    })
})

$('.page_range').on('change', function(){
    num_pagine_selezionate = $('#finish_page').val() - $('#start_page').val() + 1; 
    $.ajax({
        url: "/num_pages_document_request",
        type: "post",
        data: { "copy_document_request_id": copy_request_id, "num_pages": num_pagine_selezionate },
        success: function (data) {
            prezzo_per_pagina = data.prezzo_per_pagina;
            prezzo_attuale = data.prezzo_per_pagina * num_pagine_selezionate * parseInt($('#number_copy').val());
            $('.totale_prezzo').text(prezzo_attuale + "€ (" + prezzo_per_pagina + "€/pag)");
        }
    })
})

$('#number_copy').on('change', function(){
    prezzo_attuale = prezzo_per_pagina * num_pagine_selezionate * parseInt($('#number_copy').val());
    $('.totale_prezzo').text(prezzo_attuale + "€ (" + prezzo_per_pagina + "€/pag)");
})