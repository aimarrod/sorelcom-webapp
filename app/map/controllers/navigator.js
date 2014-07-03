angular.module('sorelcomApp').controller('ExploreCtrl', function ($scope, $modal, API, Explorer) {
    $scope.Explorer = Explorer;
    Explorer.init();
    $scope.$on('$destroy', Explorer.destroy)
});
