// JavaScript Document

$(window).ready(function () {
    var browserheight = $(window).height() - 76;
    $("#wrapper").css("min-height", browserheight);
});
$(window).resize(function () {
    var browserheight = $(window).height() - 76;
    $("#wrapper").css("min-height", browserheight);
});

$(document).ready(function (e) {

    $('.sales-icon').click(function () {
        $('#Email_popup').show();
    })
    $('.cancelEnq').click(function () {
        $('#Email_popup').hide();
    })
});

$(document).ready(function (e) {

    $('.Advanced-show').click(function () {
        $('#Advanced_Section').slideDown();
        $('.Advanced-show').hide();
        $('.Advanced-hide').show();
    })
    $('.Advanced-hide').click(function () {
        $('#Advanced_Section').slideUp();
        $('.Advanced-hide').hide();
        $('.Advanced-show').show();
    })

    $('.ads-colum img:last-child').css('margin-bottom', '0px');
    $('section.ads-colum-btm img:last-child').css('margin-right', '0px');

    $('#createLocation').click(function () {
        $('#CreatePrimaryLocation').slideDown();
    })
    $('.closeLocation').click(function () {
        $('#CreatePrimaryLocation').slideUp();
    })

    $('#addLocation').click(function () {
        $('#AddNewLocation').slideDown();
    })
    $('.closeNewLocation').click(function () {
        $('#AddNewLocation').slideUp();
    })

    $('#addPhotoOtherLoc').click(function () {
        $('.addPhoto_Colum').slideDown();
        $('.primary_details').slideUp();
    })
    $('#addPhoto').click(function () {
        $('.addPhoto_Colum').slideDown();
        $('.primary_details').slideUp();
    })
    $('.close_add_pic').click(function () {
        $('#select-photo').slideUp();
        $('.primary_details').slideDown();
    })

    $('.pick-location').click(function () {
        $('.select-map').toggle();
    })

    $('.add-photo').click(function () {
        $('#select-photo').slideDown();
    })

    $('.pick-otherLocation').click(function () {
        $('.openMapForAddNewLoc').toggle();
    })
    $('.check').click(function () {
        $('.checkvalues').show();
    })
    $('#Business').click(function () {
        $('.business_information').show();
        $('.Individual_information').hide();
    })
    $('#Individual').click(function () {
        $('.business_information').hide();
        $('.Individual_information').show();
    })
    $('#Group').click(function () {
        $('.business_information').hide();
    })
    $('.ezeidinp-radio').click(function () {
        $('.ezeidinp').show();
        $('.keywordsinp').hide();
    })

    $('.keywordsinp-radio').click(function () {
        $('.ezeidinp').hide();
        $('.keywordsinp').show();
    })

    $('span.closelink').click(function () {
        $('#Maping_popup').slideUp();
    })

    $('.inbox-icons a').click(function () {
        $('.inbox-icons a').removeClass("active");
        $(this).addClass("active");
    });
});


