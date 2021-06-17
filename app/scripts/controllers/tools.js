'use strict';

angular.module('oncokbApp')
    .controller('ToolsCtrl', ['$scope', 'dialogs', 'OncoKB', 'DatabaseConnector', '$timeout', '_', 'FindRegex',
        'mainUtils', 'loadFiles', '$rootScope', 'DTColumnDefBuilder', 'DTOptionsBuilder', 'FirebaseModel', '$q', '$firebaseObject',
        function($scope, dialogs, OncoKB, DatabaseConnector, $timeout, _, FindRegex, mainUtils, loadFiles, $rootScope,
                 DTColumnDefBuilder, DTOptionsBuilder, FirebaseModel, $q, $firebaseObject) {
            $scope.init = function() {
                $scope.newGenes = [];
                $scope.loading = false;
                $scope.includeUUID = false;
                $scope.typeCheckboxes = ['update', 'name change', 'add', 'delete'];
                $scope.selectedTypeCheckboxes = [];
                $scope.dateRange = {startDate: null, endDate: null};
                $scope.dateRangeOptions = {
                    ranges: {
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()]
                    }
                };
                $scope.ugtData = {};
                loadFiles.load('history').then(function() {
                    $scope.geneNames = _.keys($rootScope.historyData);
                }, function() {
                    dialogs.notify('Warning', 'Sorry, the system failed to load history. Please try again or search later.');
                });
                loadFiles.load('meta').then(function(result) {
                    $scope.hugoSymbols = _.without(_.keys($rootScope.metaData), 'collaborators');
                }, function() {
                    dialogs.notify('Warning', 'Sorry, the system failed to load meta. Please try again or search later.');
                });
            };
            var sorting = [[2, 'desc'], [1, 'asc'], [0, 'asc']];

            $scope.dtOptions = DTOptionsBuilder
                .newOptions()
                .withDOM('ifrtlp')
                .withOption('order', sorting)
                .withBootstrap();

            $scope.dtColumns = [
                DTColumnDefBuilder.newColumnDef(0),
                DTColumnDefBuilder.newColumnDef(1),
                DTColumnDefBuilder.newColumnDef(2).withOption('sType', 'date'),
                DTColumnDefBuilder.newColumnDef(3)
            ];
            $scope.$watch('ugtData.gene', function (n) {
                if($scope.ugtData.firebaseGeneUnbind) {
                    $scope.ugtData.firebaseGeneUnbind();
                }
                if (n) {
                    $firebaseObject(firebase.database().ref('Genes/' + n))
                        .$bindTo($scope, "ugtData.firebaseGene")
                        .then(function (unbind) {
                            if ($scope.ugtData.firebaseGene) {
                                $scope.ugtData.firebaseGeneUnbind = unbind;
                                $scope.ugtData.grch37Isoform = $scope.ugtData.firebaseGene.isoform_override;
                                $scope.ugtData.grch37RefSeq = $scope.ugtData.firebaseGene.dmp_refseq_id;
                                $scope.ugtData.grch38Isoform = $scope.ugtData.firebaseGene.isoform_override_grch38;
                                $scope.ugtData.grch38RefSeq = $scope.ugtData.firebaseGene.dmp_refseq_id_grch38;
                            }
                        })
                        .catch(function (error) {
                            console.error("Error:", error);
                        });
                } else {
                    $scope.ugtData = {
                        validating: false,
                        validated: false,
                        validationResult: '',
                        updating: false,
                        gene: '',
                        grch37Isoform: '',
                        grch37RefSeq: '',
                        grch38Isoform: '',
                        grch38RefSeq: '',
                    };
                }
            });
            $scope.updateGeneTranscript = function () {
                $scope.ugtData.updating = true;
                DatabaseConnector
                    .updateGeneTranscript(
                        $scope.ugtData.gene,
                        null,
                        $scope.ugtData.grch37Isoform,
                        $scope.ugtData.grch37RefSeq,
                        $scope.ugtData.grch38Isoform,
                        $scope.ugtData.grch38RefSeq,
                    )
                    .then(function () {
                        // successfully updated the transcript in the production
                        // update the transcript in the firebase
                        $scope.ugtData.firebaseGene.isoform_override = $scope.ugtData.grch37Isoform;
                        $scope.ugtData.firebaseGene.dmp_refseq_id = $scope.ugtData.grch37RefSeq;
                        $scope.ugtData.firebaseGene.isoform_override_grch38 = $scope.ugtData.grch38Isoform;
                        $scope.ugtData.firebaseGene.dmp_refseq_id_grch38 = $scope.ugtData.grch38RefSeq;
                        dialogs.notify('Successful', 'Successfully updated gene transcript');
                    })
                    .catch(function (error) {
                        // reset back to the original content
                        $scope.ugtData.grch37Isoform = $scope.ugtData.firebaseGene.isoform_override;
                        $scope.ugtData.grch37RefSeq = $scope.ugtData.firebaseGene.dmp_refseq_id;
                        $scope.ugtData.grch38Isoform = $scope.ugtData.firebaseGene.isoform_override_grch38;
                        $scope.ugtData.grch38RefSeq = $scope.ugtData.firebaseGene.dmp_refseq_id_grch38;

                        dialogs.error('Failed to update gene transcript', error.data);
                    })
                    .finally(function () {
                        $scope.ugtData.updating = false;
                    });
            };
            $scope.validateGeneTranscriptUpdate = function () {
                $scope.ugtData.validating = true;
                DatabaseConnector
                    .validateGeneTranscriptUpdate(
                        $scope.ugtData.gene,
                        null,
                        $scope.ugtData.grch37Isoform,
                        $scope.ugtData.grch38Isoform,
                    )
                    .then(function (content) {
                        // successfully updated the transcript in the production
                        // update the transcript in the firebase
                        $scope.ugtData.validationResult = content.data;
                        $scope.ugtData.validated = true;
                    })
                    .catch(function (error) {
                        if (error && error.data) {
                            $scope.ugtData.validationResult = 'Error:\n' + error.data;
                        } else {
                            $scope.ugtData.validationResult = 'Error:\n' + JSON.stringify(error);
                        }
                    })
                    .finally(function () {
                        $scope.ugtData.validating = false;
                    });
            };

            $scope.searchHistory = function(genesForHistory) {
                $scope.errorMessage = '';
                $scope.historySearchResults = [];
                if ((!$scope.dateRange.startDate || !$scope.dateRange.endDate) &&
                    (!_.isArray($scope.genesForHistory) || $scope.genesForHistory.length === 0) &&
                    $scope.selectedTypeCheckboxes.length === 0) {
                    $scope.errorMessage = 'Please choose conditions from Gene, Date or Type.';
                    return;
                }
                $scope.loading = true;
                var startTimestamp = 0;
                var endTimestamp = 0;
                var hasDateRange = false;
                if ($scope.dateRange.startDate && $scope.dateRange.endDate) {
                    hasDateRange = true;
                    startTimestamp = new Date($scope.dateRange.startDate.format('YYYY-MM-DD')).getTime();
                    var endDate = moment($scope.dateRange.endDate).add(1, 'days');
                    endTimestamp = new Date(endDate.format('YYYY-MM-DD')).getTime();
                }
                loadFiles.load('history').then(function(success) {
                    var historyResults = [];
                    if (_.isArray($scope.genesForHistory) && $scope.genesForHistory.length > 0) {
                        if ($scope.selectedTypeCheckboxes.length > 0) {
                            if (hasDateRange) {
                                // Get history by gene & date & operation
                                historyResults = getHistoryByOperation(getHistoryByDateRange(getHistoryByHugoSymbol($rootScope.historyData, genesForHistory), startTimestamp, endTimestamp), $scope.selectedTypeCheckboxes);
                            } else {
                                // Get history by gene & operation
                                historyResults = getHistoryByOperation(getHistoryByHugoSymbol($rootScope.historyData, genesForHistory), $scope.selectedTypeCheckboxes);
                            }
                        } else {
                            if (hasDateRange) {
                                // Get history by gene & date
                                historyResults = getHistoryByDateRange(getHistoryByHugoSymbol($rootScope.historyData, genesForHistory), startTimestamp, endTimestamp);
                            } else {
                                // Get history by gene
                                historyResults = getHistoryByHugoSymbol($rootScope.historyData, genesForHistory);
                            }
                        }
                    } else if (hasDateRange) {
                        if ($scope.selectedTypeCheckboxes.length > 0) {
                            // Get history by operation & date
                            historyResults = getHistoryByOperation(getHistoryByDateRange($rootScope.historyData, startTimestamp, endTimestamp), $scope.selectedTypeCheckboxes);
                        } else {
                            // Get history by date
                            historyResults = getHistoryByDateRange($rootScope.historyData, startTimestamp, endTimestamp);
                        }
                    } else if ($scope.selectedTypeCheckboxes.length > 0) {
                        // Get history by operation
                        historyResults = getHistoryByOperation($rootScope.historyData, $scope.selectedTypeCheckboxes);
                    }
                    $scope.historySearchResults = historyResults;
                    if ($scope.historySearchResults.length === 0) {
                        $scope.errorMessage = 'Sorry, there are no results that match your search.';
                    } else if ($scope.historySearchResults.length > 0) {
                        if ($scope.includeUUID) { // Used for developers to look gene meta data
                            _.each($scope.historySearchResults, function(history) {
                                _.each(history.records, function (record) {
                                    if (record.old && record.new) {
                                        record.diffHTML = mainUtils.calculateDiff(JSON.stringify(record.old), JSON.stringify(record.new));
                                    }
                                });
                            });
                        } else {
                            _.each($scope.historySearchResults, function(history) {
                                _.each(history.records, function(record) {
                                    if (record.operation === 'add') {
                                        record.new = filterHistoryRecord(record.new);
                                    } else if (record.operation === 'delete') {
                                        record.old = filterHistoryRecord(record.old);
                                    } else if (record.old && record.new) {
                                        if (_.isString(record.old) && _.isString(record.new)) {
                                            record.diffHTML = mainUtils.calculateDiff(record.old, record.new);
                                        } else if (_.isObject(record.old) && _.isObject(record.new)) {
                                            var filteredOld = filterHistoryRecord(record.old);
                                            var filteredNew = filterHistoryRecord(record.new);
                                            record.diffHTML = mainUtils.calculateDiff(JSON.stringify(filteredOld), JSON.stringify(filteredNew));
                                        } else {
                                            record.diffHTML = mainUtils.calculateDiff(JSON.stringify(record.old), JSON.stringify(record.new));
                                        }
                                    }
                                });
                            });
                        }
                    }
                    $scope.loading = false;
                });
            };

            function getLocationTarget(location) {
                // return gene/alteration/evidence
                var geneLocations = ['Gene Summary', 'Gene Background'];
                var alterationLocations = ['Mutation Effect'];
                if (geneLocations.indexOf(location) !== -1) {
                    return 'gene';
                } else if (_.filter(alterationLocations, function (altLoc) {
                    return _.endsWith(location, altLoc);
                }).length > 0) {
                    return 'alteration';
                } else if (location.indexOf(',') === -1) {
                    return 'alteration';
                } else {
                    return 'evidence';
                }
            }

            function getPastTense(operation) {
                switch (operation) {
                    case 'add':
                     return 'Added';
                    case 'delete':
                     return 'Deleted';
                    case 'update':
                     return 'Updated';
                    case 'name change':
                     return 'Name Changed';
                    default:
                     return '';
                }
            }

            function addRecordToFile(content, records) {
                _.sortBy(records, ['gene', 'timestamp']).forEach(function (record) {
                    var isTreatmentRecord = false;
                    var updatedLocation = record.record.location
                        .split(',')
                        .map(function (item) {
                            return item.trim().split('+').map(function (drug) {
                                drug = drug.trim();
                                if ($rootScope.drugList[drug]) {
                                    return $rootScope.drugList[drug].drugName;
                                } else {
                                    return drug;
                                }
                            }).join(' + ');
                        })
                        .filter(function (locationItem) {
                            if (new RegExp([
                                'Standard implications for sensitivity to therapy',
                                'Standard implications for resistance to therapy',
                                'Investigational implications for sensitivity to therapy',
                                'Investigational implications for resistance to therapy',
                                'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY',
                                'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE',
                                'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY',
                                'INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE',
                            ].join("|")).test(locationItem)) {
                                isTreatmentRecord = true;
                                return false;
                            }
                            return locationItem !== 'null' && !!locationItem;
                        })
                        .join(', ');

                    // remove the evidence type from the location
                    // var recordDate = new Date(record.timeStamp);
                    if (isTreatmentRecord) {
                        if (record.record.old || record.record.new) {
                            var level = record.record.operation === 'delete' ? record.record.old.level : record.record.new.level;
                            content.push([record.gene, updatedLocation, level, getPastTense(record.record.operation)].join(' '));
                        }
                    } else if (_.endsWith(updatedLocation, 'Mutation Effect')) {
                        var targetKey = record.record.operation === 'deleted' ? 'old' : 'new';
                        var target = record.record[targetKey];
                        var location = '';
                        var localTargetField = '';
                        if (target.oncogenic) {
                            location = 'Oncogenicity';
                            localTargetField = 'oncogenic';
                        } else if (target.effect) {
                            location = 'Mutation Effect';
                            localTargetField = 'effect';
                        } else if (target.description) {
                            location = 'Mutation Effect Description';
                        } else{
                            location = 'Mutation Effect';
                            record.record.operation = 'delete';
                        }
                        content.push([record.gene, updatedLocation.replace('Mutation Effect', location), getPastTense(record.record.operation)].join(' '));
                        if (localTargetField) {
                            content.push(['\t', 'New:', record.record.new[localTargetField]].join(' '));
                            content.push(['\t', 'Old:', record.record.old[localTargetField]].join(' '));
                        }
                    } else if (record.record.operation === 'name change') {
                        if (record.record.new !== record.record.old) {
                            content.push([record.gene, updatedLocation, getPastTense(record.record.operation)].join(' '));
                            content.push(['\t', 'New:', record.record.new].join(' '));
                            content.push(['\t', 'Old:', record.record.old].join(' '));
                        }
                    } else {
                        content.push([record.gene, updatedLocation, getPastTense(record.record.operation)].join(' '));
                    }
                });
                return _.uniq(content);
            }
            $scope.downloadHistoryDiff = function() {
                var result = {
                    gene : [],
                    alteration: [],
                    evidence: []
                };
                $scope.historySearchResults.forEach(function(recordByTime){
                    recordByTime.records.forEach(function (record) {
                        var locationTarget = getLocationTarget(record.location);
                        result[locationTarget].push({
                            gene: recordByTime.gene,
                            timeStamp: recordByTime.timeStamp,
                            record: record
                        });
                    });
                });

                var content = [];
                if (result.gene.length > 0) {
                    content.push('Gene:');
                    content = addRecordToFile(content, result.gene);
                    content.push('');
                }
                if (result.alteration.length > 0) {
                    content.push('Alteration:');
                    content = addRecordToFile(content, result.alteration);
                    content.push('');
                }
                if (result.evidence.length > 0) {
                    content.push('Evidence:');
                    content = addRecordToFile(content, result.evidence);
                    content.push('');
                }
                var blob = new Blob([content.join('\n')], {
                    type: 'text/plain;charset=utf-8;'
                });
                saveAs(blob, 'history_diff_note.txt');

            };



            function filterHistoryRecord(record) {
                _.map(record, function(value, key) {
                    if (key.match(/(_review|_uuid)+/g)) {
                        delete record[key];
                    } else if (Array.isArray(value)) {
                        _.map(value, function(item) {
                            filterHistoryRecord(item);
                        });
                    } else if (_.isObject(value)) {
                        filterHistoryRecord(value);
                    }
                });
                return record;
            }
            function getHistoryByHugoSymbol(historyData, hugoSymbols) {
                var results =[];
                _.each(hugoSymbols, function(hugoSymbol) {
                    _.each(historyData[hugoSymbol].api, function(item) {
                        results.push({gene: hugoSymbol, admin: item.admin, timeStamp: item.timeStamp, records: item.records});
                    });
                });
                return results;
            }
            function getHistoryByDateRange(historyData, startTimestamp, endTimestamp) {
                var results =[];
                _.each(historyData, function(history, hugoSymbol) {
                    if (history.gene) {
                        hugoSymbol = history.gene;
                    }
                    if (history.api) {
                        _.each(history.api, function(item) {
                            if (startTimestamp < item.timeStamp && item.timeStamp <= endTimestamp) {
                                results.push({gene: hugoSymbol, admin: item.admin, timeStamp: item.timeStamp, records: item.records});
                            }
                        });
                    } else if (startTimestamp < history.timeStamp && history.timeStamp <= endTimestamp) {
                        results.push({gene: hugoSymbol, admin: history.admin, timeStamp: history.timeStamp, records: history.records});
                    }
                });
                return results;
            }
            function getHistoryByOperation(historyData, operations) {
                var results =[];
                var records = [];
                _.each(historyData, function(history, hugoSymbol) {
                    if (history.gene) {
                        hugoSymbol = history.gene;
                    }
                    if (history.api) {
                        _.each(history.api, function(item) {
                            records = [];
                            _.each(item.records, function(record) {
                                if (operations.indexOf(record.operation) !== -1) {
                                    records.push(record);
                                }
                            });
                            if (records.length > 0) {
                                results.push({gene: hugoSymbol, admin: item.admin, timeStamp: item.timeStamp, records: records});
                            }
                        });
                    } else {
                        records = [];
                        _.each(history.records, function(record) {
                            if (operations.indexOf(record.operation) !== -1) {
                                records.push(record);
                            }
                        });
                        if (records.length > 0) {
                            results.push({gene: hugoSymbol, admin: history.admin, timeStamp: history.timeStamp, records: records});
                        }
                    }
                });
                return results;
            }
            $scope.getHistoryButtonContent = function() {
                if ($scope.loading) {
                    return 'Loading <i class="fa fa-spinner fa-spin"></i>';
                } else {
                    return 'Submit';
                }
            };

            $scope.reviewedDT = {};
            $scope.reviewedDT.dtOptions = {
                paging: true,
                hasBootstrap: true,
                scrollY: 500,
                scrollCollapse: true
            };
            $scope.data = { evidenceType: ''};
            $scope.evidenceTypes = [{
                label: 'Gene Summary',
                value: 'geneSummary'
            }, {
                label: 'Gene Background',
                value: 'geneBackground'
            }, {
                label: 'Oncogene/Tumor Suppressor',
                value: 'geneType'
            }, {
                label: 'Mutation Effect',
                value: 'mutationEffect'
            }, {
                label: 'Tumor Type Summary',
                value: 'tumorSummary'
            }, {
                label: 'Diagnostic Summary',
                value: 'diagnosticSummary'
            }, {
                label: 'Prognostic Summary',
                value: 'prognosticSummary'
            }, {
                label: 'Diagnostic Implication',
                value: 'diagnosticImplication'
            }, {
                label: 'Prognostic Implication',
                value: 'prognosticImplication'
            }, {
                label: 'Tumor Type Summary + Therapeutics',
                value: 'ttsDrugs'
            }, {
                label: 'Therapeutics (All Levels)',
                value: 'drugs'
            }];
            $scope.reviewedData = {
                geneSummary: {
                    header: ['Gene', 'Summary'],
                    body: [],
                    keys: ['hugoSymbol', 'description'],
                    fileName: 'GeneSummary.txt',
                    evidenceTypes: 'GENE_SUMMARY'
                },
                geneBackground: {
                    header: ['Gene', 'Background'],
                    body: [],
                    keys: ['hugoSymbol', 'description'],
                    fileName: 'GeneBackground.txt',
                    evidenceTypes: 'GENE_BACKGROUND'
                },
                geneType: {
                    header: ['Gene', 'Oncogene', 'Tumor Suppressor', 'Truncating Mutations', 'Deletion', 'Amplification'],
                    body: [],
                    keys: ['hugoSymbol', 'oncogene', 'tsg', 'truncatingMutations', 'deletion', 'amplification'],
                    fileName: 'Onc/TS.txt',
                    evidenceTypes: 'geneType'
                },
                mutationEffect: {
                    header:['Gene', 'Mutation', 'Oncogenic', 'Mutation Effect', 'Description', 'Citations'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'oncogenic', 'mutationEffect', 'description', 'citations'],
                    fileName: 'MutationEffect.txt',
                    evidenceTypes: 'MUTATION_EFFECT,ONCOGENIC'
                },
                tumorSummary: {
                    header: ['Gene', 'Mutation', 'Tumor Type', 'Tumor Summary'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'tumorType', 'description'],
                    fileName: 'TumorTypeSummary.txt',
                    evidenceTypes: 'TUMOR_TYPE_SUMMARY'
                },
                diagnosticSummary: {
                    header: ['Gene', 'Mutation', 'Tumor Type', 'Diagnostic Summary'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'tumorType', 'description'],
                    fileName: 'DiagnosticSummary.txt',
                    evidenceTypes: 'DIAGNOSTIC_SUMMARY'
                },
                prognosticSummary: {
                    header: ['Gene', 'Mutation', 'Tumor Type', 'Prognostic Summary'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'tumorType', 'description'],
                    fileName: 'PrognosticSummary.txt',
                    evidenceTypes: 'PROGNOSTIC_SUMMARY'
                },
                diagnosticImplication: {
                    header: ['Gene', 'Mutation', 'Tumor Type', 'Level', 'Description'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'tumorType', 'level', 'description'],
                    fileName: 'DiagnosticImplication.txt',
                    evidenceTypes: 'DIAGNOSTIC_IMPLICATION'
                },
                prognosticImplication: {
                    header: ['Gene', 'Mutation', 'Tumor Type', 'Level', 'Description'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'tumorType', 'level', 'description'],
                    fileName: 'PrognosticImplication.txt',
                    evidenceTypes: 'PROGNOSTIC_IMPLICATION'
                },
                ttsDrugs: {
                    header: ['Gene', 'Mutation', 'Tumor Type', 'Tumor Summary', 'Drugs', 'Level'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'tumorType', 'description', 'drugs', 'level'],
                    fileName: 'TumorTypeSummaryDrugs.txt',
                    evidenceTypes: 'TUMOR_TYPE_SUMMARY,DIAGNOSTIC_SUMMARY, PROGNOSTIC_SUMMARY, STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY,STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE,INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY,INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE'
                },
                drugs: {
                    header: ['Gene', 'Mutation', 'Tumor Type', 'Drugs', 'Level', 'Solid Propagation', 'Liquid Propagation', 'Description', 'Citations'],
                    body: [],
                    keys: ['hugoSymbol', 'mutation', 'tumorType', 'drugs', 'level', 'solidPropagationLevel', 'liquidPropagationLevel', 'description', 'citations'],
                    fileName: 'Therapeutics.txt',
                    evidenceTypes: 'STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY,STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_RESISTANCE,INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_SENSITIVITY,INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG_RESISTANCE'
                }
            };
            $scope.loadingReviewed = false;
            $scope.displayReviewedData = false;

            function finishLoadingReviewedData() {
                $scope.loadingReviewed = false;
                $scope.displayReviewedData = true;
            }
            $scope.updateReviewData = function() {
                $scope.displayReviewedData = false;
            };
            $scope.generateEvidences = function () {
                $scope.loadingReviewed = true;
                $scope.displayReviewedData = false;
                $scope.reviewedData[$scope.data.evidenceType].body = [];

                DatabaseConnector.getReviewedData($scope.reviewedData[$scope.data.evidenceType].evidenceTypes).then(function(response) {
                    if ($scope.data.evidenceType === 'geneSummary' || $scope.data.evidenceType === 'geneBackground') {
                        _.each(response.data, function(item) {
                            $scope.reviewedData[$scope.data.evidenceType].body.push(new FirebaseModel.ReviewedData(item));
                        });
                        finishLoadingReviewedData();
                    } else if ($scope.data.evidenceType === 'geneType') {
                        var variantLookupBody = _.map(response.data, function(item) {
                            return {
                                hugoSymbol: item.hugoSymbol
                            };
                        });
                        var geneWithVariants = {};
                        DatabaseConnector.lookupVariants(variantLookupBody).then(function(result) {
                            _.each(result.data, function(items) {
                                var reviewedData = {};
                                _.each(items, function(item) {
                                    if (_.isEmpty(reviewedData)) {
                                        reviewedData = new FirebaseModel.ReviewedData(item);
                                        geneWithVariants[item.gene.hugoSymbol] = true;
                                    }
                                });
                                if (!_.isEmpty(reviewedData)) {
                                    $scope.reviewedData.geneType.body.push(reviewedData);
                                }
                            });
                            _.each(response.data, function(item) {
                                if (geneWithVariants[item.hugoSymbol] !== true) {
                                    $scope.reviewedData.geneType.body.push(new FirebaseModel.ReviewedData(item));
                                }
                            });
                            finishLoadingReviewedData();
                        });
                    } else if ($scope.data.evidenceType === 'mutationEffect') {
                        _.each(response.data, function (item) {
                            var flag = false;
                            for (var i = 0; i < $scope.reviewedData.mutationEffect.body.length; i++) {
                                var evidence = $scope.reviewedData.mutationEffect.body[i];
                                if (item.gene.hugoSymbol === evidence.hugoSymbol && getAlterations(item.alterations) === evidence.mutation) {
                                    flag = true;
                                    constructMEObj(item, evidence);
                                    break;
                                }
                            }
                            if (flag === false) {
                                var reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations));
                                constructMEObj(item, reviewedData);
                                $scope.reviewedData.mutationEffect.body.push(reviewedData);
                            }
                        });
                        finishLoadingReviewedData();
                    } else {
                            if ($scope.data.evidenceType === 'tumorSummary') {
                                _.each(response.data, function (item) {
                                    var reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations));
                                    $scope.reviewedData.tumorSummary.body.push(reviewedData);
                                });
                            } else if ($scope.data.evidenceType === 'drugs') {
                                _.each(response.data, function(item) {
                                    var drugs = [];
                                    if (item.treatments.length > 0) {
                                        _.each(item.treatments, function (treatment) {
                                            drugs.push(treatment.drugs.map(function(drug){ return drug.drugName}).join('+'));
                                        });
                                        var reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations), drugs.join());
                                        reviewedData['citations'] = item.articles.map(function(article) {
                                            if(article.pmid) {
                                                return article.pmid;
                                            }else{
                                                return article.abstract;
                                            }
                                        }).join(', ');
                                        $scope.reviewedData.drugs.body.push(reviewedData);
                                    }
                                });
                            } else if ($scope.data.evidenceType === 'ttsDrugs') {
                                var drugsMapping = {};
                                _.each(response.data, function(item) {
                                    if (item.evidenceType !== 'TUMOR_TYPE_SUMMARY') {
                                        var key = item.gene.hugoSymbol + getAlterations(item.alterations) + item.tumorType;
                                        var drugs = [];
                                        _.each(item.treatments, function (treatment) {
                                            _.each(treatment.drugs, function (drug) {
                                                drugs.push(drug.drugName);
                                            });
                                        });
                                        if (drugsMapping[key]) {
                                            drugsMapping[key].push({
                                                drugs: drugs.join(),
                                                level: item.levelOfEvidence,
                                                description: item.description,
                                                uuid: item.uuid
                                            });
                                        } else {
                                            drugsMapping[key] = [{
                                                drugs: drugs.join(),
                                                level: item.levelOfEvidence,
                                                description: item.description,
                                                uuid: item.uuid
                                            }];
                                        }
                                    }
                                });
                                _.each(response.data, function(item) {
                                    if (item.evidenceType === 'TUMOR_TYPE_SUMMARY') {
                                        var key = item.gene.hugoSymbol + getAlterations(item.alterations) + item.tumorType;
                                        var reviewedData = {};
                                        if (drugsMapping[key]) {
                                            _.each(drugsMapping[key], function(drugItem) {
                                                reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations), drugItem.drugs);
                                                reviewedData.treatmentNameUuid = drugItem.uuid;
                                                reviewedData.level = drugItem.level;
                                                $scope.reviewedData.ttsDrugs.body.push(reviewedData);
                                            });
                                        } else {
                                            reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations));
                                            $scope.reviewedData.ttsDrugs.body.push(reviewedData);
                                        }
                                    }
                                });
                            } else if ($scope.data.evidenceType === 'diagnosticSummary' || $scope.data.evidenceType === 'prognosticSummary'
                                || $scope.data.evidenceType === 'diagnosticImplication' || $scope.data.evidenceType === 'prognosticImplication') {
                                _.each(response.data, function (item) {
                                    var reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations));
                                    $scope.reviewedData[$scope.data.evidenceType].body.push(reviewedData);
                                });
                            }
                            finishLoadingReviewedData();
                    }
                });
            }
            function getAlterations(alterations) {
                var result = [];
                _.each(alterations, function (item) {
                    result.push(item.alteration);
                });
                return result.join(', ');
            }
            function getCitations(data) {
                var processedData = FindRegex.result(data);
                var PMIDs = [];
                var abstracts = [];
                _.each(processedData, function (item) {
                    if (item.type === 'pmid') {
                        PMIDs.push(item.id.toString());
                    } else if (item.type === 'abstract') {
                        abstracts.push(item.id);
                    }
                });
                var result = '';
                if (PMIDs.length > 0) {
                    result = PMIDs.join(', ');
                }
                if (abstracts.length > 0) {
                    result += abstracts.join(', ');
                }
                return result;
            }
            function constructMEObj(item, evidence) {
                if (item.evidenceType === 'MUTATION_EFFECT') {
                    evidence['mutationEffect'] = item.knownEffect;
                    evidence['description'] = item.description;
                    evidence['citations'] = getCitations(item.description);
                } else if (item.evidenceType === 'ONCOGENIC') {
                    evidence['oncogenic'] = item.knownEffect;
                }
            }
            $scope.downloadReviewedData = function() {
                var header = [];
                var content = [];
                var tempArr = [];
                var fileName = 'Reviewed.txt';
                if ($scope.data.evidenceType && $scope.reviewedData[$scope.data.evidenceType]) {
                    content.push($scope.reviewedData[$scope.data.evidenceType].header.join('\t'));
                    fileName = $scope.reviewedData[$scope.data.evidenceType].fileName;
                }
                _.each($scope.reviewedData[$scope.data.evidenceType].body, function(item) {
                    tempArr = [];
                    _.each($scope.reviewedData[$scope.data.evidenceType].keys, function(key) {
                        if (key === 'citations' && !_.isUndefined(item[key])) {
                            tempArr.push('=HYPERLINK(\"https://www.ncbi.nlm.nih.gov/pubmed/' + item[key] + '\", \"'+item[key] + '\")');
                        } else {
                            tempArr.push(item[key]);
                        }
                    });
                    content.push(tempArr.join('\t'));
                });
                var blob = new Blob([content.join('\n')], {
                    type: 'text/plain;charset=utf-8;'
                });
                saveAs(blob, fileName);
            };
            $scope.getReviewButtonContent = function() {
                if ($scope.loadingReviewed) {
                    return 'Loading <i class="fa fa-spinner fa-spin"></i>';
                } else {
                    return 'Submit';
                }
            }

            $scope.tmValidation = {
                flag: false,
                result: '',
                validating: false
            };
            $scope.tsgValidation = {
                flag: false,
                result: '',
                validating: false
            };
            $scope.validateTruncating = function(type) {
                if (type === 'tmValidation') {
                    $scope.tmValidation = {
                        flag: false,
                        result: '',
                        validating: true
                    };
                } else if (type === 'tsgValidation') {
                    $scope.tsgValidation = {
                        flag: false,
                        result: '',
                        validating: true
                    };
                }
                DatabaseConnector.getReviewedData('geneType').then(function(response) {
                    var geneTypes = {};
                    var tempHugo = '';
                    var variantCallBody = [];
                    _.each(response.data, function(item) {
                        geneTypes[item.hugoSymbol] = {
                            oncogene: item.oncogene,
                            tsg: item.tsg
                        };
                        variantCallBody.push({
                            hugoSymbol: item.hugoSymbol
                        });
                    });
                    DatabaseConnector.lookupVariants(variantCallBody).then(function(result) {
                        if (type === 'tmValidation') {
                            var tmValidationResult = [];
                            _.each(result.data, function(alterations) {
                                _.each(alterations, function(alteration) {
                                    if (alteration.alteration === 'Truncating Mutations') {
                                        tempHugo = alteration.gene.hugoSymbol;
                                        if (geneTypes[tempHugo] && geneTypes[tempHugo].tsg === false && geneTypes[tempHugo].oncogene === true) {
                                            tmValidationResult.push(tempHugo);
                                        }
                                    }
                                });
                            });
                            if (tmValidationResult.length === 0) {
                                $scope.tmValidation.result = 'Yes! All genes passed the validation.';
                                $scope.tmValidation.flag = true;
                            } else {
                                $scope.tmValidation.result = 'Genes that having Truncating Mutation curated but only marked as Oncogenes: ' + tmValidationResult.sort().join(', ');
                                $scope.tmValidation.flag = false;
                            }
                            $scope.tmValidation.validating = false;
                        } else if (type === 'tsgValidation') {
                            var tsgValidationResult = [];
                            // Add a validation to find tumor suppressor genes that have no truncating mutations curated
                            _.each(result.data, function(alterations) {
                                if (alterations.length > 0) {
                                    tempHugo = alterations[0].gene.hugoSymbol;
                                    if (geneTypes[tempHugo] && geneTypes[tempHugo].tsg === true) {
                                        var hasTruncating = false;
                                        _.some(alterations, function(alteration) {
                                            if (alteration.alteration === 'Truncating Mutations') {
                                                hasTruncating = true;
                                                return true;
                                            }
                                        });
                                        if(!hasTruncating){
                                            tsgValidationResult.push(tempHugo);
                                        }
                                    }
                                }
                            });
                            if (tsgValidationResult.length === 0) {
                                $scope.tsgValidation.result = 'Yes! All genes passed the validation.';
                                $scope.tsgValidation.flag = true;
                            } else {
                                $scope.tsgValidation.result = 'Tumor suppressor genes that have no Truncating Mutations curated are: ' + tsgValidationResult.sort().join(', ');
                                $scope.tsgValidation.flag = false;
                            }
                            $scope.tsgValidation.validating = false;
                        }

                    });
                });
            }
            $scope.getValidationButtonContent = function(type) {
                if ($scope.tmValidation.validating && type === 'tmValidation') {
                    return 'Validating <i class="fa fa-spinner fa-spin"></i>';
                } else if ($scope.tsgValidation.validating && type === 'tsgValidation') {
                    return 'Validating <i class="fa fa-spinner fa-spin"></i>';
                } else {
                    return 'Validate';
                }
            };
            $scope.clearDateRange = function() {
                $scope.dateRange = {startDate: null, endDate: null};
            };
            $scope.toggleSelection = function toggleSelection(checkbox) {
                var idx = $scope.selectedTypeCheckboxes.indexOf(checkbox);
                if (idx > -1) {
                    $scope.selectedTypeCheckboxes.splice(idx, 1);
                } else {
                    $scope.selectedTypeCheckboxes.push(checkbox);
                }
            };

            // data validation
            $scope.IS_PENDING = 'IS_PENDING';
            $scope.IS_ERROR = 'IS_ERROR';
            $scope.IS_COMPLETE = 'IS_COMPLETE';
            $scope.dataValidationTypes = [{
                key: 'TEST',
                name: 'Test'
            }, {
                key: 'INFO',
                name: 'Info'
            }];
            function initDataValidation() {
                var initialData = {};
                _.reduce(initialData, (acc, next) => {
                    acc[next.key] = [];
                    return acc;
                }, initialData);
                $scope.dataValidation = {
                    status: '', // isPending | 'isError' | 'isComplete'
                    type: 'TEST',
                    additionalInfo: '',
                    data: initialData
                };
            }
            initDataValidation();
            $scope.onClickDataValidation = function () {
              var websocket = DatabaseConnector.getDataValidateWebSocket();
                websocket.onopen = function(e) {
                    initDataValidation();
                    $scope.dataValidation.status = $scope.IS_PENDING;
                    $scope.$apply();
                };

                websocket.onmessage = function(event) {
                    var testIndex = -1;
                    var data = mainUtils.isJson(event.data) ? JSON.parse(event.data) : event.data;
                    if (_.isString(data)) {
                        $scope.dataValidation.additionalInfo = data;
                    } else {
                        var type = data.type;
                        if(!$scope.dataValidation.data[type]){
                            $scope.dataValidation.data[type]=[];
                        }
                        $scope.dataValidation.data[type].forEach(function(test, index) {
                            if (test.key === data.key) {
                                testIndex = index;
                            }
                        });
                        data.data = _.sortBy(data.data, 'target');
                        if (testIndex === -1) {
                            $scope.dataValidation.data[type].push(data);
                        } else {
                            $scope.dataValidation.data[type][testIndex] = data;
                        }
                    }
                    $scope.$apply();
                };

                websocket.onclose = function(event) {
                    if (!event.wasClean) {
                        $scope.dataValidation.status = $scope.IS_ERROR;
                    }
                    $scope.$apply();
                    $scope.validateNumOfVUS();
                };

                websocket.onerror = function(error) {
                    $scope.dataValidation.status = $scope.IS_ERROR;
                    $scope.$apply();
                };
            };

            var VUS_TEST_CHECK_NAME = 'The VUS number are match';
            function failedToValidateVUS() {
                $scope.dataValidation.status = $scope.IS_ERROR;
                $scope.dataValidation.data.TEST.push({
                    test: VUS_TEST_CHECK_NAME,
                    status: $scope.IS_ERROR,
                    data: []
                });
            }
            function succeedToValidateVUS(issueGenes) {
                $scope.dataValidation.status = $scope.IS_COMPLETE;
                $scope.dataValidation.data.TEST.push({
                    key: VUS_TEST_CHECK_NAME,
                    status: issueGenes && issueGenes.length > 0 ? $scope.IS_ERROR : $scope.IS_COMPLETE,
                    data: issueGenes.sort().map(function(gene) {
                        return {
                            target: gene,
                            reason: 'The number of VUS does not match'
                        }
                    })
                });
            }
            $scope.validateNumOfVUS = function() {
                DatabaseConnector.getEvidencesByType('VUS')
                    .then(function(response) {
                        var vusInProduction = _.groupBy(response.data.map(function(evidence) {
                            evidence.gene = evidence.gene.hugoSymbol;
                            return evidence;
                        }), 'gene');
                        loadFiles.load('vus').then(function() {
                            DatabaseConnector.getAllGenes()
                                .then(function(genes){
                                    var issueGenes = [];
                                    _.each(genes.data, function(gene) {
                                        if ($rootScope.VUS[gene.hugoSymbol] && _.keys($rootScope.VUS[gene.hugoSymbol]).length !== vusInProduction[gene.hugoSymbol].length) {
                                            issueGenes.push(gene.hugoSymbol);
                                        }
                                    });
                                    succeedToValidateVUS(issueGenes);
                                }, failedToValidateVUS);
                        }, failedToValidateVUS);
                    }, failedToValidateVUS)
            };

            $scope.create = function() {
                var promises = [];
                $scope.createdGenes = [];
                _.each($scope.newGenes.split(","), function (geneName) {
                    promises.push(createGene(geneName.trim().toUpperCase()));
                });
                $q.all(promises).then(function() {});
            };

            function createGene(geneName) {
                var deferred = $q.defer();
                if ($scope.hugoSymbols.includes(geneName)) {
                    dialogs.notify('Warning', 'Sorry, the ' + geneName + ' gene already exists.');
                } else {
                    var gene = new FirebaseModel.Gene(geneName);
                    mainUtils.setIsoFormAndGeneType(gene).then(function () {
                        firebase.database().ref('Genes/' + geneName).set(gene).then(function(result) {
                            var meta = new FirebaseModel.Meta();
                            firebase.database().ref('Meta/' + geneName).set(meta).then(function(result) {
                                $scope.createdGenes.push(geneName);
                                deferred.resolve();
                            }, function(error) {
                                // Delete saved new gene from Genes collection
                                firebase.database().ref('Genes/' + geneName).remove();
                                dialogs.notify('Warning', 'Failed to create a Meta record for the new gene ' + geneName + '!');
                                deferred.reject(error);
                            });
                        }, function(error) {
                            dialogs.notify('Warning', 'Failed to create the  gene ' + geneName + '!');
                            deferred.reject(error);
                        });
                    }, function(error) {
                        dialogs.notify('Warning', 'Failed to create the  gene ' + geneName + '!');
                        deferred.reject(error);
                    });
                }
                return deferred.promise;
            }
        }]);
