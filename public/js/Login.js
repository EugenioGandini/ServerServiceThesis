$('#form_login').on('submit', function(event) {
  event.preventDefault();

  $.ajax({
        url: "/do_login",
        type: "post",
        data: {"email": $('#email').val(), "password": $('#password').val()},
        statusCode: {
          200: function (response) {
            window.location.replace("/home_page_portal");
          },
          401: function(response){
            alert("Errore: " + response.responseText);
          },
          400: function(response){
            alert("Reinserire lo username e la password");
          }
        }
  });
});