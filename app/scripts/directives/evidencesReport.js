'use strict';

angular.module('oncokbApp')
    .directive('evidenceReport', function(mainUtils, _) {
        return {
            templateUrl: 'views/evidencesReport.html',
            restrict: 'E',
            scope: {
                shownSections: '=',
                evidences: '=',
            },
            link: function postLink(scope) {
                scope.getEvidenceTypeName = function(evidenceType) {
                    return mainUtils.getEvidenceTypeName(evidenceType);
                };
                scope.getAlterationsName = function(alterations) {
                    return alterations.map(function(alteration) {
                        return alteration.name;
                    }).join(', ');
                };
                scope.getTreatmentsName = function(treatments) {
                    return mainUtils.getTreatmentsName(treatments);
                };
                scope.getCancerTypeNameFromOncoTreeType = function(cancerType) {
                    return mainUtils.getCancerTypeNameFromOncoTreeType(cancerType);
                };
            }
        };
    });
