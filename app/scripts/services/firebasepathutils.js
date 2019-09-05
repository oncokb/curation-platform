'use strict';

/**
 * @ngdoc service
 * @name oncokbApp.firebasePathUtils
 * @description
 * # firebasePathUtils
 * Service in the oncokbApp.
 */
angular.module('oncokbApp')
    .factory('firebasePathUtils', function() {
        function getTherapyMapPath(drug, geneName, mutationUuid, cancerTypeUuid, therapyUuid){
            return drug + '/' + geneName + '/' + mutationUuid + '/cancerTypes/' + cancerTypeUuid + '/' + therapyUuid;
        }
        function getMutationNameMapPath(drug, geneName, mutationUuid) {
            return drug + '/' + geneName + '/' + mutationUuid + '/mutationName';
        }
        function getTherapyNameMapPath(drug, geneName, mutationUuid, cancerTypeUuid, therapyUuid){
            return drug + '/' + geneName + '/' + mutationUuid + '/cancerTypes/' + cancerTypeUuid + '/' + therapyUuid + '/name';
        }
        function getCancerTypesMapPath(drug, geneName, mutationUuid){
            return 'Map/' + drug + '/' + geneName + '/' + mutationUuid + '/cancerTypes'
        }
        function getValidateTimePathInGene(path, key) {
            return path + '/' + key + '_validateTime';
        }
        function getValidateTimePathInToolsPage(hugoSymbol, path) {
            return 'Genes/' + hugoSymbol + '/' + path;
        }
       return{
            getTherapyMapPath: getTherapyMapPath,
           getMutationNameMapPath: getMutationNameMapPath,
           getTherapyNameMapPath: getTherapyNameMapPath,
           getCancerTypesMapPath: getCancerTypesMapPath,
           getValidateTimePathInGene: getValidateTimePathInGene,
           getValidateTimePathInToolsPage: getValidateTimePathInToolsPage
       };
    });
