function lazyLoadBackground(timeout){
    timeout(function(){
        var backgroundImage = new Image();
        backgroundImage.onload = function(){
            $(document).ready(function(){
                var divHtml = '<div id="background-image-container"></div>';
                $(divHtml).hide().appendTo("body").fadeIn(3000);
                $("#background-image-container").css('background-image','url("/images/background.jpg")');


                var hDifference = screen.height - $("footer").height();

                $("#background-image-container").css('min-height',hDifference);
            });
        };
        backgroundImage.src = '/images/background.jpg';
    },2000);
}