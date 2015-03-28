function lazyLoadBackground(timeout){
    timeout(function(){
        var backgroundImage = new Image();
        backgroundImage.onload = function(){
            $(document).ready(function(){
                $("#background-image-container").css('background-image','url("/images/background.jpg")');
            });
        };
        backgroundImage.src = '/images/background.jpg';
    },2000);
}