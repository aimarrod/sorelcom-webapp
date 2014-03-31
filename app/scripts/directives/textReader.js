'use strict';

angular.module('sorelcomApp')

  /**
   * Reads a file as text and calls back a function with the result
   */
  .directive('textReader', function ($parse) {
   return {
      restrict: 'A',
      scope: false,
      link: function(scope, element, attrs) {
         var fn = $parse(attrs.textReader);

         element.on('change', function(onChangeEvent) {
            var reader = new FileReader();
            var format = onChangeEvent.target.value.split('.').pop()

            reader.onload = function(onLoadEvent) {
               scope.$apply(function() {
                  fn(scope, {$text: onLoadEvent.target.result, $format:format });
               });
            };
 
            reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
         });
      }
   };
});