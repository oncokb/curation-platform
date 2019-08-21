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
                function findMainType(name) {
                    for (var i = 0; i < $scope.oncoTree.mainTypes.length; i++) {
                        if ($scope.oncoTree.mainTypes[i].name === name) {
                            return $scope.oncoTree.mainTypes[i];
                        }
                    }
                    return '';
                }

                function findCancerType(mainType, subtype, callback) {
                    var list;
                    var _mainType;
                    if (mainType && mainType.name) {
                        list = $scope.oncoTree.tumorTypes[mainType.name];
                    }
                    if (!mainType && subtype) {
                        _mainType = findMainType(subtype.mainType.name);
                    }
                    callback(_mainType, subtype, list);
                }

                $scope.$watch('selectedMainTypeName', function(name) {
                    if (name) {
                        $scope.selectedCancerType.mainType = $scope.oncoTree.mainTypes.find(function(item) {
                            return item.name === name;
                        });
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
                    mainUtils.getOncoTreeMainTypes().then(function(result) {
                        var mainTypesReturned = result.mainTypes,
                            tumorTypesReturned = result.tumorTypes;
                        if (mainTypesReturned) {
                            scope.oncoTree.mainTypes = mainTypesReturned;
                            if (_.isArray(tumorTypesReturned)) {
                                var tumorTypes = {};
                                var allTumorTypes = [];
                                _.each(mainTypesReturned, function(mainType, i) {
                                    tumorTypes[mainType.name] = tumorTypesReturned[i];
                                    allTumorTypes = _.union(allTumorTypes, tumorTypesReturned[i]);
                                });
                                scope.oncoTree.tumorTypes = tumorTypes;
                                scope.oncoTree.allTumorTypes = allTumorTypes;
                                scope.selectedCancerType = {
                                    mainType: '',
                                    subtype: '',
                                    oncoTreeTumorTypes: allTumorTypes
                                };
                            }
                        }
                    }, function(error) {
                        dialogs.error('Error', 'Failed to load tumor types information. Please Contact developer.');
                    });
                }
            }
        };
    });
