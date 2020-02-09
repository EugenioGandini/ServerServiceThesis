var recap = false;

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

$('.form_copie').on('submit', function (event) {
    if (recap == false) {
        event.preventDefault();

        if (!$('#carta_identita').val().toLowerCase().endsWith('.jpg') &&
            !$('#carta_identita').val().toLowerCase().endsWith('.png') &&
            !$('#carta_identita').val().toLowerCase().endsWith('.pdf')) {
            alert('La copia del documento di identità deve essere un documento (PDF) oppure un\'immagine (JPEG o PNG)');
            return;
        } else if (!$('#codice_fiscale').val().toLowerCase().endsWith('.jpg') &&
                !$('#codice_fiscale').val().toLowerCase().endsWith('.png') &&
                !$('#codice_fiscale').val().toLowerCase().endsWith('.pdf')) {
            alert('La copia del codice fiscale deve essere un documento (PDF) oppure un\'immagine (JPEG o PNG)');
        } else if (!$('#doc_aggiuntivo').val() != "" || 
            $('#doc_aggiuntivo').val().toLowerCase().endsWith('.jpg') ||
            $('#doc_aggiuntivo').val().toLowerCase().endsWith('.png') ||
            $('#doc_aggiuntivo').val().toLowerCase().endsWith('.pdf')) {

            $('.form_copie').hide();
            $('#riepilogo').show();
            $('.breadcrumb_fase_richiesta_certificato').append('<span>&nbsp;>&nbsp;</span><a href="#">Revisione dati inseriti</a>')

            var file_c_i = $('#carta_identita').val().split("\\");
            var file_c_f = $('#codice_fiscale').val().split("\\");
            $('#recap_c_i').text(file_c_i[file_c_i.length - 1]);
            $('#recap_c_f').text(file_c_f[file_c_f.length - 1]);

            if ($('input[name=autentica]:checked').val() == 'TRUE') {
                $('#recap_autentica').text('Si');
            }
            if ($('input[name=urgente]:checked').val() == 'TRUE') {
                $('#recap_urgente').text('Si');
            }
            if ($('#doc_aggiuntivo').val() != "") {
                $('.doc_aggiuntivo_nascosto').show();
                var file_doc_agg = $('#doc_aggiuntivo').val().split("\\");
                $('#recap_doc_agg').text(file_doc_agg[file_doc_agg.length - 1]);
            }

            if ($('#nome_atto').val() == '') {
                $('#nome_atto').val('Non specificato')
            }

            $('#recap_nome_atto').text($('#nome_atto').val());
            $('#recap_numero_atto').text($('#numero_atto').val());

            recap = true;
        }
        else {
            alert('Il documento aggiuntivo deve essere un documento (PDF) oppure un\'immagine (JPEG o PNG)');
        }
    }
})

$('#carta_identita').on("change", function () {
    var file_c_i = $('#carta_identita').val().split("\\");
    $("label[for='carta_identita']").text(file_c_i[file_c_i.length - 1]);
});

$('#codice_fiscale').on("change", function () {
    var file_c_f = $('#codice_fiscale').val().split("\\");
    $("label[for='codice_fiscale']").text(file_c_f[file_c_f.length - 1]);
});

$('#doc_aggiuntivo').on("change", function () {
    var file_doc_agg = $('#doc_aggiuntivo').val().split("\\");
    var file_doc_agg = $('#doc_aggiuntivo').val().split("\\");
    $("label[for='doc_aggiuntivo']").text(file_doc_agg[file_doc_agg.length - 1]);
});

$('#send_request').on('click', function () {
    $('.form_copie').submit();
    alert('Richiesta di copia atto inviata');
})

$('.link_esterno').on('click', function (event) {

    var question = confirm('Verrai rediretto sul sito ufficiale del Tribunale di Brescia');
    if (question === false) {
        event.preventDefault()
    }
})