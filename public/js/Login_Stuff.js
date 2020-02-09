$('form').on('submit', function (event) {
    event.preventDefault();

    $.ajax({
        url: "/do_login_stuff",
        type: "post",
        data: $('form').serialize(),
        statusCode: {
            200: function (response) {
                window.location.replace("/home_page_portal");
            },
            401: function (response) {
                alert("Errore: " + response.responseText);
            }
        }
    });
});

$('.link_esterno').on('click', function (event) {

    var question = confirm('Verrai rediretto sul sito ufficiale del Tribunale di Brescia');
    if (question === false) {
        event.preventDefault()
    }
})