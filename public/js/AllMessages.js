var oid_sender_msg

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

$('#modal_msg').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);

    oid_sender_msg = $(button.parent().parent().children()[2]).text();
    var replayable = $(button.parent().parent().children()[3]).text();

    recipient = button.data('whatever');
    var modal = $(this);
    $('#recipient-name').val($(button.parent().parent().children()[5]).text());
    $('#message-text').text($(button.parent().parent().children()[1]).text());

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
