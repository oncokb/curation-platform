'use strict';

angular.module('oncokbApp')
    .controller('GenesCtrl', ['$window', '$scope', '$rootScope', '$location', '$timeout',
        '$routeParams', '_',
        'DTColumnDefBuilder', 'DTOptionsBuilder', 'DatabaseConnector',
        'OncoKB', 'S', 'mainUtils', 'UUIDjs', 'dialogs', 'loadFiles', '$firebaseObject', '$firebaseArray', 'FirebaseModel', 'user', '$q',
        function($window, $scope, $rootScope, $location, $timeout, $routeParams, _,
                 DTColumnDefBuilder, DTOptionsBuilder, DatabaseConnector,
                 OncoKB, S, mainUtils, UUIDjs, dialogs, loadFiles, $firebaseObject, $firebaseArray, FirebaseModel, user, $q) {
            function saveGene(docIndex) {
                if (docIndex < $scope.hugoSymbols.length) {
                    var hugoSymbol = $scope.hugoSymbols[docIndex];
                    console.log(docIndex, hugoSymbol);
                    var params = {};
                    var gene = $scope.allFiles.gene[hugoSymbol];
                    var vus = $scope.allFiles.vus[hugoSymbol];
                    if (gene) {
                        var geneData = mainUtils.getGeneData(gene, true, true, $rootScope.drugList);
                        params.gene = JSON.stringify(geneData);
                    }
                    if (vus) {
                        var vusData = mainUtils.getVUSData(vus, true);
                        params.vus = JSON.stringify(vusData);
                    }
                    if (!_.isEmpty(params)) {
                        DatabaseConnector.updateGene(params,
                            function(result) {
                                console.log('\t success', result);
                                saveGene(++docIndex);
                            },
                            function(result) {
                                console.log('\t failed', result);
                                saveGene(++docIndex);
                            }
                        );
                    } else {
                        saveGene(++docIndex);
                    }
                } else {
                    $scope.status.saveAllGenes = true;
                    console.log('finished.');
                }
            }
            $scope.metaFlags = {};
            function processMeta() {
                loadFiles.load(['meta', 'queues']).then(function(result) {
                    $scope.hugoSymbols = _.without(_.keys($rootScope.metaData), 'collaborators');
                    user.setFileeditable($scope.hugoSymbols).then(function(editableData) {
                        _.each($scope.hugoSymbols, function(hugoSymbol) {
                            $scope.metaFlags[hugoSymbol] = {
                                hugoSymbol: hugoSymbol,
                                lastModifiedBy: $rootScope.metaData[hugoSymbol].lastModifiedBy,
                                lastModifiedAt: $rootScope.metaData[hugoSymbol].lastModifiedAt,
                                queues: 0,
                                review: 'No',
                                editable: editableData[hugoSymbol]
                            };
                            // currentReviewer is the key it will always have regardless of having uuid tracked or not.
                            if ($rootScope.metaData[hugoSymbol].review && _.keys($rootScope.metaData[hugoSymbol].review).length > 1) {
                                $scope.metaFlags[hugoSymbol].review = 'Yes';
                            }
                            if ($rootScope.firebaseQueues && $rootScope.firebaseQueues[hugoSymbol]) {
                                _.each($rootScope.firebaseQueues[hugoSymbol].queue, function(item) {
                                    if (!item.curated) {
                                        if ($scope.metaFlags[hugoSymbol] && $scope.metaFlags[hugoSymbol].queues) {
                                            $scope.metaFlags[hugoSymbol].queues++;
                                        } else {
                                            $scope.metaFlags[hugoSymbol].queues = 1;
                                        }
                                    }
                                });
                            }
                        });
                        $scope.status.rendering = false;
                    });
                });
            }
            processMeta();
            $scope.redirect = function(path) {
                $location.path(path);
            };
            $scope.allFiles = {
                gene: {},
                vus: {}
            };
            $scope.saveAllGenes = function() {
                $scope.status.saveAllGenes = false;
                firebase.database().ref('Genes').on('value', function(geneFiles) {
                    $scope.allFiles.gene = geneFiles.val() ? geneFiles.val() : {};
                    firebase.database().ref('VUS').on('value', function(vusFiles) {
                        $scope.allFiles.vus = vusFiles.val() ? vusFiles.val() : {};
                        saveGene(0);
                    }, function() {
                        console.log('fail to get vus data');
                    });
                }, function() {
                    console.log('fail to get genes data');
                });
            };

            var sorting = [[1, 'desc'], [0, 'asc'], [2, 'asc']];
            if ($rootScope.me.admin) {
                sorting = [[3, 'desc'], [4, 'desc'], [1, 'desc'], [0, 'asc']];
            }
            jQuery.extend(jQuery.fn.dataTableExt.oSort, {
                'date-html-asc': function(a, b) {
                    if (_.isEmpty(a)) return 1;
                    if (_.isEmpty(b)) return -1;
                    return mainUtils.getTimeStamp(a) - mainUtils.getTimeStamp(b);
                },
                'date-html-desc': function(a, b) {
                    if (_.isEmpty(a)) return 1;
                    if (_.isEmpty(b)) return -1;
                    return mainUtils.getTimeStamp(b) - mainUtils.getTimeStamp(a);
                }
            });

            $scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withDOM('ifrtlp')
                .withOption('order', sorting)
                .withPaginationType('full_numbers')
                .withDisplayLength(25)
                .withBootstrap();

            $scope.dtColumns = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1).withOption('sType', 'date-html'),
                DTColumnDefBuilder.newColumnDef(2),
            ];
            if ($rootScope.me.admin) {
                $scope.dtColumns.push(DTColumnDefBuilder.newColumnDef(3));
                $scope.dtColumns.push(DTColumnDefBuilder.newColumnDef(4));
            }

            $scope.status = {
                saveAllGenes: true,
                migrate: true,
                rendering: true,
                queueRendering: true
            };
            $scope.oncoTree = {
                mainTypes: {}
            };
            $scope.mappedTumorTypes = {};
        }]
    );
