'use strict';

angular.module('oncokbApp')
    .directive('annotationReport', function(mainUtils, _) {
        return {
            templateUrl: 'views/annotationReport.html',
            restrict: 'E',
            scope: {
                hugoSymbol: '=',
                alteration: '=',
                tumorType: '=',
                data: '=',
            },
            link: function postLink(scope) {
                function processLevel(levelOfEvidence) {
                    var level = levelOfEvidence.replace('LEVEL_', '');
                    return '<span class="oncokb level-' + level + '">Level ' + _.upperFirst(level) + '</span>';
                }

                function convertEvidence(evidences) {
                    evidences.forEach(function(evidence) {
                        evidence.pmids = evidence.articles.filter(function(article) {
                            return !!article.pmid;
                        });
                        evidence.abstracts = evidence.articles.filter(function(article) {
                            return !!article.abstract;
                        });
                    });
                    return _.pick(_.reduce(evidences, function(acc, evidence) {
                        var evidenceType = evidence.evidenceType;
                        if (evidenceType.includes('THERAPEUTIC')) {
                            if (!acc.THERAPEUTIC_IMPLICATIONS) {
                                acc.THERAPEUTIC_IMPLICATIONS = [];
                            }
                            acc.THERAPEUTIC_IMPLICATIONS.push(evidence);
                        } else {
                            if (_.endsWith(evidenceType, 'IMPLICATION')) {
                                evidenceType = evidenceType + 'S';
                            }
                            if (!acc[evidenceType]) {
                                acc[evidenceType] = [];
                            }
                            acc[evidenceType].push(evidence);
                        }
                        return acc;
                    }, {}), scope.shownSections);
                }

                function initializeReportDat() {
                    scope.reportData = {
                        tumorTypes: [],
                        allEvidences: []
                    };

                }

                initializeReportDat();
                scope.summaryInfo = [];
                scope.shownSections = ['THERAPEUTIC_IMPLICATIONS', 'DIAGNOSTIC_IMPLICATIONS', 'PROGNOSTIC_IMPLICATIONS'];

                scope.$watch('data', function() {
                    initializeReportDat();
                    scope.reportData.allEvidences = convertEvidence(_.reduce(scope.data.tumorTypes, function(acc, next) {
                        acc = acc.concat(next.evidences);
                        return acc;
                    }, []));

                    _.each(scope.data.tumorTypes, function(tumorType) {
                        var copyTT = _.cloneDeep(tumorType);
                        copyTT.evidences = convertEvidence(copyTT.evidences);
                        scope.reportData.tumorTypes.push(copyTT);
                    });

                    scope.summaryInfo = [
                        scope.data.oncogenic,
                        scope.data.mutationEffect ? scope.data.mutationEffect.knownEffect : '',
                        scope.data.highestSensitiveLevel ? processLevel(scope.data.highestSensitiveLevel) : '',
                        scope.data.highestResistanceLevel ? processLevel(scope.data.highestResistanceLevel) : '',
                        scope.data.highestDiagnosticImplicationLevel ? processLevel(scope.data.highestDiagnosticImplicationLevel) : '',
                        scope.data.highestPrognosticImplicationLevel ? processLevel(scope.data.highestPrognosticImplicationLevel) : ''].filter(function(item) {
                        return !!item;
                    });
                    scope.summaries = [{
                        title: 'Gene Summary',
                        content: scope.data.geneSummary
                    }, {
                        title: 'Alteration Summary',
                        content: scope.data.variantSummary
                    }, {
                        title: 'Tumor Type Summary',
                        content: scope.data.tumorTypeSummary
                    }, {
                        title: 'Diagnostic Summary',
                        content: scope.data.diagnosticSummary
                    }, {
                        title: 'Prognostic Summary',
                        content: scope.data.prognosticSummary
                    }].filter(function(item) {
                        return !!item.content;
                    });
                });
                scope.getTreatmentsName = function(treatments) {
                    return mainUtils.getTreatmentsName(treatments);
                };
                scope.getCancerTypeNameFromOncoTreeType = function(cancerType) {
                    return mainUtils.getCancerTypeNameFromOncoTreeType(cancerType);
                };
                scope.shouldShowTumorType = function(tumorType) {
                    return _.keys(tumorType.evidences).length > 0;
                };
            }
        };
    });
