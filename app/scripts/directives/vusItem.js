'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:vusItem
 * @description
 * # vusItem
 */
angular.module('oncokbApp')
    .directive('vusItem', function(_, mainUtils, dialogs) {
        return {
            templateUrl: 'views/vusItem.html',
            restrict: 'E',
            scope: {
                fileEditable: '=',
                vus: '=',
                commentsPath: '=',
                onUpdate: '&',
                onRefresh: '&',
                onDelete: '&',
            },
            controller: function($scope) {
                $scope.status = {
                    saving: false,
                    editing: false,
                    tmpValue: $scope.vus.name
                };
                $scope.updateVus = function() {
                    $scope.status.saving = false;
                    $scope.onUpdate({
                        variant: $scope.vus,
                        newName: $scope.status.tmpValue
                    }).then(function() {
                        $scope.status.editing = false;
                    }, function() {
                        $scope.status.editing = true;
                    }, function() {
                        $scope.status.saving = false;
                    });

                };
                $scope.refreshVus = function() {
                    $scope.onRefresh({
                        variant: $scope.vus
                    });

                };
                $scope.deleteVus = function() {
                    $scope.onDelete({
                        variant: $scope.vus
                    });
                };
                $scope.onDiscard = function() {
                    $scope.status.tmpValue = $scope.vus.name;
                    $scope.status.editing = false;
                };
                $scope.getVUSClass = function(time) {
                    return mainUtils.getTimestampClass(time);
                };
            }
        };
    });
