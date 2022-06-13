/********CAROUSEL ***********/

$(document).bind('keyup', function(event) {

    if (event.which==39) {
        $('a.carousel-control.right').click;
    }   
  
    else if(event.which==37){
        $('a.carousel-control.left').click;
    }
  
  });





