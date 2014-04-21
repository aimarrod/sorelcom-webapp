angular.module('sorelcomApp')
    .directive('onFinishRender', function ($parse) {
    return {
        scope: false,
        restrict: 'A',
        link: function (scope, element, attrs) {
            var fn = $parse(attrs.onFinishRender);
            element.ready(function () {
                fn(scope, {'element':element, 'index': parseInt(attrs.index)});
            });
        }
    }
});