'use strict';

/**
 * @ngdoc directive
 * @name oncokbStaticApp.directive:mainLevel
 * @description
 * # mainLevel
 */
angular.module('oncokbApp')
    .directive('levelIcon', function(_) {
        return {
            templateUrl: 'views/levelIcon.html',
            restrict: 'E',
            scope: {
                level: '=',
            },
            controller: function($scope) {
            },
            link: function postLink(scope) {
                scope.getLevel = function(level) {
                    return _.replace(level, /LEVEL_(Px|Dx)?/g, '');
                };
            }
        };
    });
