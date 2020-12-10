'use strict';

angular.module('oncokbApp')
    .directive('tumorTypesDropdowns', function(mainUtils, _, dialogs) {
        return {
            templateUrl: 'views/tumorTypesDropdowns.html',
            restrict: 'E',
            scope: {
                selectedMainTypeName: '=',
                selectedSubtypeName: '=',
                afterSelection: '&'
            },
            controller: function($scope) {
                function findCancerType(mainType, subtype, callback) {
                    var list;
                    var _mainType;
                    if (mainType) {
                        list = $scope.oncoTree.tumorTypes[mainType];
                    }
                    if (!mainType && subtype) {
                        _mainType = subtype.mainType;
                    }
                    callback(_mainType, subtype, list);
                }

                $scope.$watch('selectedMainTypeName', function(name) {
                    if (name) {
                        $scope.selectedCancerType.mainType = name;
                    }
                });

                $scope.$watch('selectedSubtypeName', function(name) {
                    if (name) {
                        $scope.selectedCancerType.subtype = $scope.oncoTree.allTumorTypes.find(function(item) {
                            return item.name === name;
                        });
                    }
                });

                $scope.$watch('selectedCancerType.mainType', function(newSelectedMainType) {
                    if (newSelectedMainType) {
                        findCancerType(newSelectedMainType, '', function(mainType, subtype, list) {
                            $scope.selectedCancerType.oncoTreeTumorTypes = list;
                            returnSelectedCancerType();
                        });
                    } else {
                        $scope.selectedCancerType.oncoTreeTumorTypes = $scope.oncoTree.allTumorTypes;
                        $scope.selectedCancerType.subtype = '';
                        returnSelectedCancerType();
                    }
                });

                $scope.$watch('selectedCancerType.subtype', function(newSelectedSubtype) {
                    if (newSelectedSubtype) {
                        findCancerType('', newSelectedSubtype, function(mainType, subtype, list) {
                            $scope.selectedCancerType.mainType = mainType;
                            returnSelectedCancerType();
                        });
                    } else {
                        returnSelectedCancerType();
                    }
                });

                function returnSelectedCancerType() {
                    if (_.isFunction($scope.afterSelection)) {
                        $scope.afterSelection({
                            mainType: $scope.selectedCancerType.mainType,
                            subtype: $scope.selectedCancerType.subtype
                        });
                    }
                }
            },
            link: {
                post: function(scope) {
                    scope.oncoTree = {};
                    scope.selectedCancerType = {
                        mainType: '',
                        subtype: '',
                        oncoTreeTumorTypes: []
                    };
                    mainUtils.getTumorTypes().then(function(result) {
                        scope.oncoTree.mainTypes = result.mainTypes.map(function(mainType) {
                            return mainType.name;
                        });
                        scope.oncoTree.tumorTypes = _.groupBy(result.subtypes, 'mainType');
                        scope.oncoTree.allTumorTypes = result.tumorTypes;
                        scope.selectedCancerType = {
                            mainType: '',
                            subtype: '',
                            oncoTreeTumorTypes: result.tumorTypes
                        };
                    }, function(error) {
                        dialogs.error('Error', 'Failed to load tumor types information. Please Contact developer.');
                    });
                }
            }
        };
    });
