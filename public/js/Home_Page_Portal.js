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
})