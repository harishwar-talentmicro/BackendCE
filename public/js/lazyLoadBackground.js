function lazyLoadBackground(timeout){
    console.log(' I am executing');
    timeout(function(){
        var backgroundImage = new Image();
        backgroundImage.onload = function(){
            $(document).ready(function(){
                console.log($("body").css('background-image'));
                $("body").css('background-size',"cover");
                $("body").css('background-position',"0px 0px 0px 0px");
                var divHtml = '<div id="background-image-container"></div>';
                $(divHtml).hide().appendTo("body").fadeIn(1000);
                $("#background-image-container").css('background-image','url("/images/background.jpg")');
            });
        };
        backgroundImage.src = '/images/background.jpg';
    },2000);


}