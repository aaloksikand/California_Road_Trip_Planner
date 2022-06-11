

var headers = $('#accordion .accordion-header');
var contentAreas = $('#accordion .ui-accordion-content ').hide();



headers.click(function() {
    var panel = $(this).next();
    var isOpen = panel.is(':visible');
    panel[isOpen? 'slideUp': 'slideDown']()
        .trigger(isOpen? 'hide': 'show');
    return false;
});


/*Carousel Related */
// $('.carousel').carousel();





