'use strict';

/**
 * @ngdoc directive
 * @name oncokb.directive:updateTimestamp
 * @author Jing Su created on 2019/06/26
 * @description
 * # refresh date
 */
angular.module('oncokbApp')
    .directive('updateTimestamp', function(_, $timeout, mainUtils, DatabaseConnector, FirebaseModel, $rootScope, firebaseConnector) {
        return {
            templateUrl: 'views/updateTimestamp.html',
            restrict: 'E',
            scope: {
                type: '=',
                hugoSymbol: '=',
                key: '=',
                obj: '=',
                disabled: '=',
                updateTime: '=',
                updatedBy: '=',
                path: '='
            },
            replace: false,
            controller: function($scope) {
                $scope.clicked = false;
                $scope.getIconClass = function(time) {
                    return mainUtils.getTimestampClass(time);
                };
                $scope.validateTime = function () {
                    $scope.clicked = true;
                    $scope.errorMessage = '';
                    if ($scope.type === 'tools') {
                        validateTimeInTools();
                    } else {
                        mainUtils.validateTime($scope.obj, [$scope.key]);
                        if ($scope.key === 'type') {
                            firebaseConnector.set($scope.path + '/' + $scope.key + '_validateTime', $scope.obj[$scope.key + '_validateTime']).then(function (result) {
                                $scope.updateTime = $scope.obj[$scope.key + '_validateTime'].updateTime;
                                $scope.clicked = false;
                            }, function (error) {
                                $scope.clicked = false;
                                console.log("Error:", error);
                            });
                        } else {
                            var data = {};
                            data[$scope.obj[$scope.key + '_uuid']] = $scope.obj[$scope.key + '_validateTime'].updateTime;
                            DatabaseConnector.updateEvidenceLastReview(data, function(){
                                $scope.updateTime = $scope.obj[$scope.key + '_validateTime'].updateTime;
                                $scope.clicked = false;
                                firebaseConnector.set($scope.path + '/' + $scope.key + '_validateTime', $scope.obj[$scope.key + '_validateTime']).then(function (result) {
                                }, function (error) {
                                    console.log("Error:", error);
                                });
                            }, function (error) {
                                $scope.clicked = false;
                                console.log("Error:", error);
                            });
                        }
                    }
                };
                function validateTimeInTools () {
                    var validateTimePath = [];
                    switch ($scope.key) {
                        case 'geneSummary':
                            validateTimePath.push('summary_validateTime');
                            updateTimeForReviewedContentInTools(validateTimePath, [$scope.obj.uuid]);
                            break;
                        case 'geneBackground':
                            validateTimePath.push('background_validateTime');
                            updateTimeForReviewedContentInTools(validateTimePath, [$scope.obj.uuid]);
                            break;
                        case 'geneType':
                            validateTimePath.push('type_validateTime');
                            updateTimeForReviewedContentInTools(validateTimePath, [$scope.obj.uuid]);
                            break;
                        case 'mutationEffect':
                            firebaseConnector.once("Genes/" + $scope.hugoSymbol + '/mutations').then(function(mutations) {
                                var mutationIndex = _.findIndex(mutations, function(item) {
                                    return item.mutation_effect.effect_uuid === $scope.obj.effect_uuid || item.mutation_effect.oncogenic_uuid === $scope.obj.oncogenic_uuid;
                                });
                                if (mutationIndex > -1) {
                                    validateTimePath.push('mutations/' + mutationIndex + '/mutation_effect/effect_validateTime');
                                    validateTimePath.push('mutations/' + mutationIndex + '/mutation_effect/oncogenic_validateTime');
                                    updateTimeForReviewedContentInTools(validateTimePath, [$scope.obj.effect_uuid , $scope.obj.oncogenic_uuid]);
                                } else {
                                    $scope.errorMessage = 'Sorry, we cannot find this mutation.';
                                    $scope.clicked = false;
                                }
                            });
                            break;
                        case 'tumorSummary':
                        case 'diagnosticSummary':
                        case 'prognosticSummary':
                        case 'diagnosticImplication':
                        case 'prognosticImplication':
                            firebaseConnector.once("Genes/" + $scope.hugoSymbol + '/mutations').then(function(mutations) {
                                var tumorIndex = -1;
                                _.some(mutations, function(mutation, mutationIndex) {
                                    if ('tumors' in mutation) {
                                        var locationMap = {
                                            tumorSummary: 'summary',
                                            diagnosticSummary: 'diagnosticSummary',
                                            prognosticSummary: 'prognosticSummary',
                                            diagnosticImplication: 'diagnostic',
                                            prognosticImplication: 'prognostic'
                                        };
                                        var queryKey = locationMap[$scope.key];
                                        var queryObj = {};
                                        queryObj[queryKey + '_uuid'] = $scope.obj.uuid;
                                        tumorIndex = _.findIndex(mutation.tumors, queryObj);
                                        if ( tumorIndex > -1) {
                                            validateTimePath.push('mutations/' + mutationIndex + '/tumors/' + tumorIndex + '/' + queryKey + '_validateTime');
                                        }
                                    }
                                    return tumorIndex > -1;
                                });
                                if (tumorIndex > -1) {
                                    updateTimeForReviewedContentInTools(validateTimePath, [$scope.obj.uuid]);
                                } else {
                                    $scope.errorMessage = 'Sorry, we cannot find this tumor.';
                                    $scope.clicked = false;
                                }
                            });
                            break;
                        case 'ttsDrugs':
                            firebaseConnector.once("Genes/" + $scope.hugoSymbol + '/mutations').then(function(mutations) {
                                var tumorIndex = -1;
                                var treatmentIndex = -1;
                                var uuids = [];
                                _.some(mutations, function (mutation, mutationIndex) {
                                    if ('tumors' in mutation) {
                                        tumorIndex = _.findIndex(mutation.tumors, {summary_uuid: $scope.obj.summary_uuid});
                                        if (tumorIndex > -1) {
                                            validateTimePath.push('mutations/' + mutationIndex + '/tumors/' + tumorIndex + '/summary_validateTime');
                                            uuids.push($scope.obj.summary_uuid);
                                            if ('drugs' in $scope.obj) {
                                                var tis = mutations[mutationIndex].tumors[tumorIndex].TIs;
                                                _.some(tis, function (ti, tiIndex) {
                                                    if ('treatments' in ti) {
                                                        treatmentIndex = _.findIndex(ti.treatments, {name_uuid: $scope.obj.treatment_name_uuid});
                                                        if (treatmentIndex > -1) {
                                                            validateTimePath.push('mutations/' + mutationIndex + '/tumors/' +
                                                                tumorIndex + '/TIs/' + tiIndex + '/treatments/' + treatmentIndex + '/name_validateTime');
                                                            uuids.push($scope.obj.treatment_name_uuid);
                                                        }
                                                    }
                                                    return treatmentIndex > -1;
                                                });
                                            }
                                        }
                                    }
                                    return tumorIndex > -1;
                                });
                                if (validateTimePath.length > 0) {
                                    updateTimeForReviewedContentInTools(validateTimePath, uuids);
                                } else if (tumorIndex === -1) {
                                    $scope.errorMessage = 'Sorry, we cannot find this tumor.';
                                    $scope.clicked = false;
                                } else if (treatmentIndex === -1 && 'drugs' in $scope.obj) {
                                    $scope.errorMessage = 'Sorry, we cannot find this treatment.';
                                    $scope.clicked = false;
                                }
                            });
                            break;
                        case 'drugs':
                            firebaseConnector.once("Genes/" + $scope.hugoSymbol + '/mutations').then(function(mutations) {
                                var treatmentIndex = -1;
                                _.some(mutations, function (mutation, mutationIndex) {
                                    if ('tumors' in mutation) {
                                        _.some(mutation.tumors, function (tumor, tumorIndex) {
                                            _.some(tumor.TIs, function (ti, tiIndex) {
                                                if ('treatments' in ti) {
                                                    treatmentIndex = _.findIndex(ti.treatments, {name_uuid: $scope.obj.uuid});
                                                    if (treatmentIndex > -1) {
                                                        var path = 'mutations/' + mutationIndex + '/tumors/' + tumorIndex + '/TIs/' + tiIndex + '/treatments/' + treatmentIndex;
                                                        validateTimePath.push(path + '/level_validateTime');
                                                        validateTimePath.push(path + '/description_validateTime');
                                                        validateTimePath.push(path + '/propagation_validateTime');
                                                    }
                                                }
                                                return treatmentIndex > -1;
                                            });
                                            return treatmentIndex > -1;
                                        });
                                    }
                                    return treatmentIndex > -1;
                                });
                                if (treatmentIndex > -1) {
                                    updateTimeForReviewedContentInTools(validateTimePath, [$scope.obj.uuid]);
                                } else {
                                    $scope.errorMessage = 'Sorry, we cannot find this treatment.';
                                    $scope.clicked = false;
                                }
                            });
                            break;
                    }
                };

                function updateTimeForReviewedContentInTools(validateTimePath, uuids) {
                    var validateTimeObj = new FirebaseModel.Timestamp($rootScope.me.name);
                    var data = {};
                    _.forEach(uuids, function(uuid) {
                        data[uuid] = validateTimeObj.updateTime;
                    });
                    DatabaseConnector.updateEvidenceLastReview(data, function(){
                        $scope.updateTime = validateTimeObj.updateTime;
                        $scope.clicked = false;
                        _.forEach(validateTimePath, function(path) {
                            firebaseConnector.set("Genes/" + $scope.hugoSymbol + '/' + path, validateTimeObj);
                        }, function(error){
                            console.log("Error:", error);
                        });
                    }, function (error) {
                        $scope.clicked = false;
                        console.log("Error:", error);
                    });

                }
            }
        };
    });
