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

$('.prezzo').on('click', function(e) {
    var col = $(e.target).parent().children().index($(e.target));
    var row = $(e.target).parent().parent().children().index($(e.target).parent());

    var new_price = prompt('Inserisci il nuovo prezzo (€):');
    var type_price = "";
    switch(col) {
        case(3): {
            type_price = "nonautentica_nonurgente";
            break;
        }
        case (4): {
            type_price = "nonautentica_urgente";
            break;
        }
        case (5): {
            type_price = "autentica_nonurgente";
            break;
        }
        case (6): {
            type_price = "autentica_urgente";
            break;
        }
    }
    if(new_price != null) {
        $.ajax({
            url: "/edit_prices_copy_document",
            type: "post",
            data: {
                "oid": $($('tr')[row + 1].children[0]).text(),
                "type": type_price,
                "new_price": new_price
            },
            statusCode: {
                200: function (response) {
                    window.location.reload();
                },
                default: function (response) {
                    alert('Non è stato possibile cambiare il prezzo.');
                }
            }
        });

        console.log('Oid: ' + $($('tr')[row + 1].children[0]).text() + " type : " + type_price + " new_price: " + new_price)
    }
});

$('.delete_copy_price').on('click', function (e) {
    console.log('eleimino')
    var oid = $(".delete_copy_price").parent().parent().children().first().text();
    $.ajax({
        url: "/edit_prices_copy_document",
        type: "post",
        data: {
            "oid": oid,
            "delete_price": true
        },
        statusCode: {
            200: function (response) {
                window.location.reload();
            },
            default: function (response) {
                alert('Non è stato possibile cambiare il prezzo.');
            }
        }
    });
});

$('.delete_copy_price').on('click', function (e) {
    var oid = $(".delete_copy_price").parent().parent().children().first().text();
    $.ajax({
        url: "/edit_prices_copy_document",
        type: "post",
        data: {
            "oid": oid,
            "delete_price": true
        },
        statusCode: {
            200: function (response) {
                window.location.reload();
            },
            default: function (response) {
                alert('Non è stato possibile cambiare il prezzo.');
            }
        }
    });
});

$('#send_insert_new_price').on('click', function(e) {
    var form_data = $('#form_new_prices').serialize();
    if ($('#range_min').val() != "" && $('#range_max').val() != "" &&
        $('#autentica_urgente').val() != "" && $('#autentica_nonurgente').val() != "" &&
        $('#nonautentica_urgente').val() != "" && $('#nonautentica_nonurgente').val() != "") {
        $.ajax({
            url: "/add_prices_copy_document",
            type: "post",
            data: {
                range_min: $('#range_min').val(), range_max: $('#range_max').val(), autentica_urgente: $('#autentica_urgente').val(),
                autentica_nonurgente: $('#autentica_nonurgente').val(), nonautentica_urgente: $('#nonautentica_urgente').val(), nonautentica_nonurgente: $('#nonautentica_nonurgente').val(),
            },
            statusCode: {
                200: function (response) {
                    window.location.reload();
                },
                default: function (response) {
                    alert('Non è stato possibile aggiungere la nuova voce dei prezzi.');
                }
            }
        });
    } else {
        alert("E' necessario riempire tutti i campi per poter inserire una nuova voce dei prezzi.")
    }
})