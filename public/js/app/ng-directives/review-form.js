/**
 * Directive responsible for loading the form to make a review
 *
 * @author: Sandeep Gantait
 * @since: 201507
 * @usedIn: Detailed page
 * @usage: <review-form
 *              ng-trans-type="1"
 *              ng-trans-id= transaId
 *              ng-resource-id= resourceId
 *              ng-to-ezeid=toEzeid > </review-form>
 */
(function(){
    angular.module('ezeidApp')
        .directive('reviewForm', ['$compile','$templateCache',function ($compile,$templateCache) {

        /* All A-C-T-I-O-N starts here */

        /* main return function of the directive goes here */
        return {
            restrict: 'E',//@usage: <review-form> </review-form>
            replace:true,
            templateUrl: '../../../html/review-form.html',
            scope:{//here we define all the parameters used in this template
                ngTransType:'@',//1:Reservation, 2:Outbox, 3:Sales, 4:Home-Delivery
                ngTransId:'=',
                ngResourceId:'=',
                ngToEzeid :'='
            },
            controller : function($rootScope,$scope,$http,GURL,MsgDelay){
                $scope.starArray = [];
                deactivateStars();
                $scope.starCount = 1;
                $scope.commentError = "";
                /* status to validate comments mandatory or not */
                var commentMandatory = false;

                /* click event of the stars */
                $scope.clickStarRating = function(starId)
                {
                    deactivateStars();
                    for(var i = 0;i <= starId; i++)
                    {
                        $scope.starArray[i] = true;
                    }

                    /* change the count */
                    $scope.starCount = starId + 1;
                }

                /* make all the stars as deactivate */
                function deactivateStars()
                {
                    $scope.starArray = [true,false,false,false,false];
                    $scope.starCount = 1;
                }

                /* remove the error messages */
                $scope.removeErrorMessage = function()
                {
                    $scope.commentError = '';
                }

                /* save the reviews */
                $scope.saveReviews = function()
                {
                    var review = $scope.review;

                    if(commentMandatory && typeof(review) ===  'undefined')
                    {
                        $scope.commentError = "review can't be empty";
                        return;
                    }

                    if(commentMandatory && parseInt(review.length) < 5)
                    {
                        $scope.commentError = 'your reviews must be more then 4 characters long!';
                        return;
                    }


                    /* save the review */
                    $scope.$emit('$preLoaderStart');
                    $http({
                        url : GURL + 'feedback',
                        method : "POST",
                        data :{
                            ezeid:$rootScope._userInfo.ezeid,
                            rating:$scope.starCount,
                            comments:review,
                            trans_type:$scope.ngTransType,
                            trans_id:$scope.ngTransId,
                            resourceid:$scope.ngResourceId,
                            toEzeid :$scope.ngToEzeid
                        }
                    }).success(function(resp){
                        $scope.$emit('$preLoaderStop');
                        if(resp.status){
                            Notification.success({ message: "Thank you for giving your valuable feedback", delay: MsgDelay });
                            $scope.$emit('$preLoaderStop');
                        }
                        else
                        {
                            Notification.error({ message: "Failed to add your valuable review, please try again later", delay: MsgDelay});
                            $scope.$emit('$preLoaderStop');
                        }
                    }).error(function(err,status){
                        $scope.$emit('$preLoaderStop');
                        var message = 'An error occured ! Please try again';
                        if(status === 400){
                            message = 'Slot is not available';
                        }

                        Notification.error({ message: message, delay: MsgDelay });
                    });
                }
            }
        }

    }]);
})();