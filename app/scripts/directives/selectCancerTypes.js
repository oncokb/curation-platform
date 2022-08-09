'use strict';
angular.module('oncokbApp')
    .directive('selectCancerTypes', function ($rootScope, DatabaseConnector, _, mainUtils) {
        return {
            templateUrl: 'views/selectCancerTypes.html',
            restrict: 'E',
            scope:{
                title: '=',
                cancerTypes: '=',
                message: '=',
                oncotree: '=',
                requireNonEmpty: '=',
                onChange: '&'
            },
            controller: function ($scope) {
                $scope.meta = {
                    cancerTypes: $scope.cancerTypes || [],
                    originalTumorName: mainUtils.getFullCancerTypesNames($scope.cancerTypes),
                    newCancerTypes: [],
                    oncotree: $scope.oncotree,
                    invalid: false,
                    message: ''
                };
                $scope.$watch('meta.newCancerTypes', function (n) {
                    if (n.length > 0 && (n[n.length - 1].mainType || n[n.length - 1].subtype)) {
                        $scope.meta.newCancerTypes.push({
                            mainType: '',
                            subtype: '',
                            oncoTreeTumorTypes: angular.copy($scope.meta.oncotree.allTumorTypes)
                        });
                    }
                    for (var i = n.length - 2; i >= 0; i--) {
                        if (!n[i].mainType) {
                            if (n[i].mainType !== '') {
                                n.splice(i, 1);
                                i--;
                            }
                        }
                    }
                    function callback(index, mainType, subType, oncoTreeTumorTypes) {
                        n[index].oncoTreeTumorTypes = oncoTreeTumorTypes ? oncoTreeTumorTypes : $scope.meta.oncotree.allTumorTypes;

                        if (mainType) {
                            n[index].mainType = mainType;
                        }

                        var next = index + 1;
                        if (next < n.length - 1) {
                            findCancerType(next, n[next].mainType, n[next].subtype, callback);
                        }
                    }

                    if (n.length > 1) {
                        findCancerType(0, n[0].mainType, n[0].subtype, callback);
                    }
                    $scope.tumorValidationCheck();
                    if ($scope.onChange) {
                        $scope.onChange({
                            cancerTypes: $scope.meta.newCancerTypes,
                            invalid: $scope.meta.invalid
                        });
                    }
                }, true);

                initNewCancerTypes();

                function findCancerType(index, mainType, subtype, callback) {
                    var list;
                    var _mainType;
                    if (mainType && mainType.mainType) {
                        list = $scope.meta.oncotree.tumorTypes[mainType.mainType];
                    }
                    if (!mainType && subtype) {
                        _mainType = findMainType(subtype.mainType);
                    }
                    callback(index, _mainType, subtype, list);
                }

                function initNewCancerTypes() {
                    var newCancerTypes = [];
                    _.each($scope.meta.cancerTypes, function (cancerType) {
                        newCancerTypes.push({
                            mainType: {
                                mainType: cancerType.mainType
                            },
                            subtype: {
                                subtype: cancerType.subtype,
                                code: cancerType.code
                            },
                            oncoTreeTumorTypes: angular.copy($scope.meta.oncotree.allTumorTypes)
                        });
                    });
                    newCancerTypes.push({
                        mainType: '',
                        subtype: '',
                        oncoTreeTumorTypes: angular.copy($scope.meta.oncotree.allTumorTypes)
                    });
                    $scope.meta.newCancerTypes = newCancerTypes;
                }

                function findMainType(name) {
                    for (var i = 0; i < $scope.meta.oncotree.mainTypes.length; i++) {
                        if ($scope.meta.oncotree.mainTypes[i].mainType === name) {
                            return $scope.meta.oncotree.mainTypes[i];
                        }
                    }
                    return '';
                }

                // This function is desgined to handle the case that maintype name is the same with subtype
                // For example, previous cancerTypes are "Melanoma(maintype), Colorectal Cancer", the current cancerTypes are "Melanoma(subtype), Colorectal Cancer"
                // In that case, we should allow save changes even though the tumor type name stay the same
                function changedSubSameWithMainItem(newCancerTypes, oldCancerTypes) {
                    var result = false;
                    _.some(newCancerTypes, function(item1) {
                        if (item1.mainType && item1.subtype && item1.mainType === item1.subtype.name) {
                            _.some(oldCancerTypes, function(item2) {
                                if (item2.mainType && item2.mainType === item1.mainType && !item2.subtype) {
                                    result = true;
                                    return true;
                                }
                            });
                            return true;
                        }
                    });
                    if (result) {
                        return result;
                    }
                    _.some(oldCancerTypes, function(item1) {
                        if (item1.mainType && item1.subtype && item1.mainType === item1.subtype) {
                            _.some(newCancerTypes, function(item2) {
                                if (item2.mainType && item2.mainType === item1.mainType && !(item2.subtype && item2.subtype.name)) {
                                    result = true;
                                    return true;
                                }
                            });
                            return true;
                        }
                    });
                    return result;
                }
                $scope.tumorValidationCheck = function () {
                    var tumorNameList = $scope.meta.cancerTypes;
                    var currentTumorStr = mainUtils.getFullCancerTypesNames($scope.meta.newCancerTypes);
                    if (!currentTumorStr) {
                        if ($scope.requireNonEmpty) {
                            $scope.meta.message = 'Please input cancer type';
                            $scope.meta.invalid = true;
                        }
                    } else if (currentTumorStr === $scope.meta.originalTumorName) {
                        var exceptionResult = changedSubSameWithMainItem($scope.meta.newCancerTypes, $scope.meta.cancerTypes);
                        if (exceptionResult) {
                            $scope.meta.message = '';
                            $scope.meta.invalid = false;
                        } else {
                            $scope.meta.message = 'Same with original tumor type';
                            $scope.meta.invalid = true;
                        }
                    } else if (mainUtils.hasDuplicateCancerTypes($scope.meta.newCancerTypes)) {
                        $scope.meta.message = 'Remove duplication in the cancer type input';
                        $scope.meta.invalid = true;
                    } else if (tumorNameList.indexOf(currentTumorStr) !== -1) {
                        $scope.meta.message = 'Same tumor type already exists';
                        $scope.meta.invalid = true;
                    } else {
                        $scope.meta.message = '';
                        $scope.meta.invalid = false;
                    }
                };
            }
        }
    });
