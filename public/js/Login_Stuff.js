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