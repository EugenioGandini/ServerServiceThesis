var dataToSend;

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

$('select').change(function () {
    if ($('select option:selected').val() == "-"){
        $("#placeholder_form").html("");
    }
    else {
        sendAjaxForm();
    }
});

function sendAjaxForm() {
    $.ajax({
        method: "POST",
        url: "/obtain_form_certificate",
        data: { "typecertificate": $('select option:selected').val() },
        success: function (result) {
            $("#placeholder_form").html(result);
        }
    })
}

$('.link_esterno').on('click', function (event) {

    var question = confirm('Verrai rediretto sul sito ufficiale del Tribunale di Brescia');
    if (question === false) {
        event.preventDefault()
    }
})