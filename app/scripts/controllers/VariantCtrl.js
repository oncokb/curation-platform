'use strict';

angular.module('oncokbApp')
    .controller('VariantCtrl', [
        '$scope',
        '$filter',
        'DatabaseConnector',
        'OncoKB',
        'mainUtils',
        '_',
        'PrivateApi',
        function($scope, $filter, DatabaseConnector, OncoKB, mainUtils, _, PrivateApi) {

            function getUnique(data, attr) {
                var unique = [];

                if (angular.isArray(data)) {
                    data.forEach(function(e) {
                        if (unique.indexOf(e[attr]) === -1) {
                            unique.push(e[attr]);
                        }
                    });
                    return unique.sort();
                }
                return null;
            }

            function searchAnnotationCallback(status, data) {
                $scope.data = data;
                $scope.rendering = false;
            }

            function separateTumorTypes(tumorTypes) {
                var subtypes = {};
                var cancerTypes = {};
                _.each(tumorTypes, function(tumorType) {
                    if (tumorType) {
                        if (tumorType.name) {
                            subtypes[tumorType.name] = tumorType;
                        }
                        if (!tumorType.name && tumorType.mainType && tumorType.mainType.name) {
                            cancerTypes[tumorType.mainType.name] = tumorType;
                        }
                    }
                });
                return {
                    subtypes: _.values(subtypes),
                    cancerTypes: _.values(cancerTypes)
                };
            }

            $scope.$watch('gene', function(newGene) {
                if (newGene) {
                    DatabaseConnector.findAlterationsByGene(newGene.entrezGeneId)
                        .then(function(result) {
                            $scope.alterations = result.data;
                        }, function() {
                            $scope.alterations = [];
                        });
                }
            });

            $scope.init = function() {
                $scope.view = {};

                $scope.query = {};

                $scope.rendering = false;

                $scope.loadingPage = true;

                if (OncoKB.global.genes && OncoKB.global.genes && OncoKB.global.tumorTypes) {
                    var separatedTumorTypes = separateTumorTypes(OncoKB.global.tumorTypes);

                    $scope.genes = angular.copy(OncoKB.global.genes);
                    $scope.cancerTypes = separatedTumorTypes.cancerTypes;
                    $scope.subtypes = separatedTumorTypes.subtypes;
                    $scope.view.filteredCancerTypes = angular.copy($scope.cancerTypes);
                    $scope.view.filteredSubtypes = angular.copy($scope.subtypes);
                    $scope.loadingPage = false;
                } else {
                    DatabaseConnector.getGeneTumorType(function(data) {
                        OncoKB.global.genes = angular.copy(data.genes);
                        OncoKB.global.tumorTypes = angular.copy(data.tumorTypes);

                        var separatedTumorTypes = separateTumorTypes(OncoKB.global.tumorTypes);

                        $scope.genes = data.genes;
                        $scope.cancerTypes = separatedTumorTypes.cancerTypes;
                        $scope.subtypes = separatedTumorTypes.subtypes;
                        $scope.view.filteredCancerTypes = angular.copy($scope.cancerTypes);
                        $scope.view.filteredSubtypes = angular.copy($scope.subtypes);
                        $scope.loadingPage = false;
                    });
                }
            };

            $scope.isSearchable = function() {
                if ($scope.gene && $scope.alteration) {
                    return true;
                }
                return false;
            };

            $scope.hasSelectedCancerType = function() {
                if ($scope.view.hasOwnProperty('selectedCancerType') && $scope.view.selectedCancerType) {
                    return true;
                }
                return false;
            };

            $scope.search = function() {
                var hasSelectedCancerType = $scope.hasSelectedCancerType();
                $scope.rendering = true;
                $scope.reportViewActive = hasSelectedCancerType;
                $scope.regularViewActive = !hasSelectedCancerType;
                $scope.alteration = mainUtils.trimMutationName($scope.alteration);
                var params = {};
                var paramsContent = {
                    entrezGeneId: $scope.gene.entrezGeneId || '',
                    alteration: $scope.alteration || ''
                };

                for (var key in paramsContent) {
                    if (paramsContent[key] !== '') {
                        params[key] = paramsContent[key];
                    }
                }
                if (hasSelectedCancerType) {
                    params.cancerType = $scope.view.selectedCancerType.name;
                    if ($scope.view.selectedSubtype && $scope.view.selectedSubtype.name) {
                        params.tumorType = $scope.view.selectedSubtype.name;
                    } else {
                        params.tumorType = params.cancerType;
                    }
                } else {
                    params.cancerType = '';
                    params.subtype = '';
                    params.tumorType = '';
                }

                $scope.query.params = params;
                PrivateApi.getVariantAnnotation(params.entrezGeneId, params.alteration, params.tumorType)
                    .then(function(data) {
                        searchAnnotationCallback('success', data.data);
                    }, function() {
                        searchAnnotationCallback('fail');
                    });
            };

            $scope.useExample = function() {
                $scope.gene = _.find($scope.genes, function(gene) {
                    return gene.hugoSymbol === 'ABL1';
                });
                $scope.alteration = 'BCR-ABL1 Fusion';
                $scope.view.selectedCancerType = {
                    name: 'B-Lymphoblastic Leukemia/Lymphoma'
                };
                $scope.view.selectedSubtype = {
                    name: 'B-Lymphoblastic Leukemia/Lymphoma with t(9;22)(q34.1;q11.2);BCR-ABL1'
                };
                $scope.search();
            };

            $scope.afterCancerTypeSelected = function(mainType, subtype) {
                $scope.view.selectedCancerType = mainType;
                $scope.view.selectedSubtype = subtype;
            };
        }]);
