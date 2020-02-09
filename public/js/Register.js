$('#form_register').on('submit', function (event) {
    event.preventDefault();

    dataToSend = $('#form_register').serialize();

    if ($('#codice_fiscale').val().length != 16){
        alert("Il codice fiscale deve essere almeno di 16 caratteri.")
    }
    else if ($('#password').val() != $('#password_repeat').val()){
        alert("La password ripetuta è diversa da quella inserita.");
    }
    else if ($('#telefono').val().length > 11){
        alert("Il telefono inserito non è valido.");
    }
    else {
        $.ajax({
            url: "/do_register",
            type: "post",
            data: dataToSend,
            statusCode: {
                200: function (response) {
                    window.location.replace("/home_page_portal");
                },
                401: function (response) {
                    alert("Errore: " + response.responseText);
                },
                400: function (response) {
                    alert("Errore");
                }
            }
        });
    }
});

$('.link_esterno').on('click', function (event) {

    var question = confirm('Verrai rediretto sul sito ufficiale del Tribunale di Brescia');
    if (question === false) {
        event.preventDefault()
    }
})