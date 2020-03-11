'use strict';

angular.module('oncokbApp')
    .controller('ToolsCtrl', ['$scope', 'dialogs', 'OncoKB', 'DatabaseConnector', '$timeout', '_', 'FindRegex',
        'mainUtils', 'loadFiles', '$rootScope', 'DTColumnDefBuilder', 'DTOptionsBuilder', 'FirebaseModel', '$q',
        function($scope, dialogs, OncoKB, DatabaseConnector, $timeout, _, FindRegex, mainUtils, loadFiles, $rootScope,
                 DTColumnDefBuilder, DTOptionsBuilder, FirebaseModel, $q) {
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
            var subtypeMapping = {};
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
                        mainUtils.getOncoTreeMainTypes().then(function(result) {
                            _.each(result.tumorTypes, function(items) {
                                _.each(items, function(item) {
                                    subtypeMapping[item.code] = item.name;
                                });
                            });
                            if ($scope.data.evidenceType === 'tumorSummary') {
                                _.each(response.data, function (item) {
                                    var reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations));
                                    if (item.subtype) {
                                        reviewedData.tumorType = subtypeMapping[item.subtype];
                                    }
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
                                        reviewedData['citations'] = getCitations(item.description);
                                        if (item.subtype) {
                                            reviewedData.tumorType = subtypeMapping[item.subtype];
                                        }
                                        $scope.reviewedData.drugs.body.push(reviewedData);
                                    }
                                });
                            } else if ($scope.data.evidenceType === 'ttsDrugs') {
                                var drugsMapping = {};
                                _.each(response.data, function(item) {
                                    if (item.evidenceType !== 'TUMOR_TYPE_SUMMARY') {
                                        var tempTT = item.subtype ? subtypeMapping[item.subtype] : item.cancerType;
                                        var key = item.gene.hugoSymbol + getAlterations(item.alterations) + tempTT;
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
                                        var tempTT = item.subtype ? subtypeMapping[item.subtype] : item.cancerType;
                                        var key = item.gene.hugoSymbol + getAlterations(item.alterations) + tempTT;
                                        var reviewedData = {};
                                        if (drugsMapping[key]) {
                                            _.each(drugsMapping[key], function(drugItem) {
                                                reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations), drugItem.drugs);
                                                reviewedData.tumorType = tempTT;
                                                reviewedData.treatmentNameUuid = drugItem.uuid;
                                                reviewedData.level = drugItem.level;
                                                $scope.reviewedData.ttsDrugs.body.push(reviewedData);
                                            });
                                        } else {
                                            reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations));
                                            reviewedData.tumorType = tempTT;
                                            $scope.reviewedData.ttsDrugs.body.push(reviewedData);
                                        }
                                    }
                                });
                            } else if ($scope.data.evidenceType === 'diagnosticSummary' || $scope.data.evidenceType === 'prognosticSummary'
                                || $scope.data.evidenceType === 'diagnosticImplication' || $scope.data.evidenceType === 'prognosticImplication') {
                                _.each(response.data, function (item) {
                                    var reviewedData = new FirebaseModel.ReviewedData(item, getAlterations(item.alterations));
                                    if (item.subtype) {
                                        reviewedData.tumorType = subtypeMapping[item.subtype];
                                    }
                                    $scope.reviewedData[$scope.data.evidenceType].body.push(reviewedData);
                                });
                            }
                            finishLoadingReviewedData();
                        });
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
            var IS_PENDING = 'isPending';
            var IS_ERROR = 'isError';
            var IS_COMPLETE = 'isComplete';
            function initDataValidation () {
                $scope.dataValidation = {
                    status: '', // isPending | 'isError' | 'isComplte'
                    additionalInfo: '',
                    tests: []
                };
            }
            initDataValidation();
            $scope.onClickDataValidation = function () {
              var websocket = DatabaseConnector.getDataValidateWebSocket();
                websocket.onopen = function(e) {
                    initDataValidation();
                    $scope.dataValidation.status = IS_PENDING;
                    $scope.$apply();
                };

                websocket.onmessage = function(event) {
                    var testIndex = -1;
                    var data = mainUtils.isJson(event.data) ? JSON.parse(event.data) : event.data;
                    $scope.dataValidation.tests.forEach(function(test, index) {
                        if (test.test === data.test) {
                            testIndex = index;
                        }
                    });
                    if (_.isString(data)) {
                        $scope.dataValidation.additionalInfo = data;
                    } else {
                        if (testIndex === -1) {
                            $scope.dataValidation.tests.push(data);
                        } else {
                            $scope.dataValidation.tests[testIndex] = data;
                        }
                    }
                    $scope.$apply();
                };

                websocket.onclose = function(event) {
                    if (event.wasClean) {
                        $scope.dataValidation.status = IS_COMPLETE;
                    } else {
                        $scope.dataValidation.status = IS_ERROR;
                    }
                    $scope.$apply();
                };

                websocket.onerror = function(error) {
                    $scope.dataValidation.status = IS_ERROR;
                    $scope.$apply();
                };
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
