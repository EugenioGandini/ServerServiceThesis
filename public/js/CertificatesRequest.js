var dataToSend;

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