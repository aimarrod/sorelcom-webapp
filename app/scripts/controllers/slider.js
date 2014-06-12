angular.module('sorelcomApp')
  .controller('SliderCtrl', function ($scope) {

    $scope.isCurrentSlide = function(index){
      return $scope.currentIndex === index;
    };

    $scope.nextSlide = function(){
      ($scope.currentIndex===$scope.slides.length-1)?$scope.currentIndex = 0:$scope.currentIndex += 1;
    }

    $scope.prevSlide = function(){
      ($scope.currentIndex===0)?$scope.currentIndex = $scope.slides.length-1:$scope.currentIndex -= 1;
    }

    $scope.setSlide = function(index){
      $scope.currentIndex = index;
    }

    $scope.init = function(api){
      api.getList('images').then(
        function success(data){
          $scope.slides = data;
          $scope.currentIndex = 0;
        }
      );
    }
  });
