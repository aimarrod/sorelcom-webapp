angular.module('sorelcomApp')
    .controller('UploadCtrl', function ($scope, Track, leafletData) {
        $scope.tracks = [];
        $scope.fileRead = false;

        $scope.upload = function () {
            for (var i = 0, len = $scope.tracks.length; i < len; i++) {
                var track = $scope.tracks[i];
                validate(track.data);

                if(track.$error) continue;

                Track.save(track.data).$promise.then(
                    function(track){
                        console.log(track);
                    },
                    function(err){
                        console.log(err);
                    }
                );
            }
        };

        $scope.remove = function (track) {
            $scope.tracks.splice($scope.tracks.indexOf(track), 1);
        }

        $scope.read = function ($text, $format) {
            var geojson = togeojson($text, $format);

            for (var i = 0, len = geojson.features.length; i < len; i++) {
                var track = {
                    data: geojson.features[i]
                };
                var bbox = L.geoJson(track.data).getBounds();
                track.bbox = {
                    northEast: bbox._northEast,
                    southWest: bbox._southWest
                }
                $scope.tracks.push(track);
            }
        };

        function validate(track) {
            track.$error = null;
            if(!track.properties)
                return track.$error = 'You must add data'; 

            if (!track.properties.name)
                return track.$error = 'A name is needed';

            if (!track.properties.description)
                return track.$error = 'A description is needed';

        }

        function togeojson(text, format) {
            if ($.inArray(format, ['gpx', 'GPX']) > -1)
                return toGeoJSON.gpx($.parseXML(text));

            else if ($.inArray(format, ['kml', 'KML']) > -1)
                return toGeoJSON.kml($.parseXML(text));

            else if ($.inArray(format, ['json', 'JSON', 'geojson', 'GEOJSON']) > -1)
                return JSON.parse(text);

            return null;
        }
    });
