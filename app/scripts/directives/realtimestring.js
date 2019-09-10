'use strict';

/**
 * @ngdoc directive
 * @name oncokbApp.directive:driveRealtimeString
 * @description
 * # driveRealtimeString
 */
angular.module('oncokbApp')
    .directive('realtimeString', function ($timeout, _, $rootScope, mainUtils, ReviewResource, $firebaseObject) {
        return {
            templateUrl: 'views/realtimeString.html',
            restrict: 'AE',
            scope: {
                t: '=',
                key: '=',
                path: '=',
                checkboxes: '=',
                o: '=',
                uuid: '=',
                mutation: '=',
                tumor: '=',
                indicateMutationContentInGene: '&indicateMutationContent',
                indicateTumorContentInGene: '&indicateTumorContent'
            },
            replace: true,
            link: {
                pre: function preLink(scope) {
                    $firebaseObject(firebase.database().ref(scope.path)).$bindTo(scope, "data").then(function (success) {
                        scope.pureContent.text = scope.data[scope.key];
                        if (scope.t === 'treatment-select') {
                            scope.changePropagation(true);
                        }
                        scope.cleanUpEditing();
                        scope.initializeFE();
                        $rootScope.$watch('reviewMode', function(n, o) {
                            if (n) {
                                scope.calculateDiff();
                            } else if (scope.t === 'treatment-select' && scope.key === 'level' && scope.data[scope.key] == 0 ) {
                                scope.changePropagation(true);
                            }
                        });
                    }, function (error) {
                        console.log(error);
                    });
                },
                post: function postLink(scope) {
                    scope.timeoutRef = '';
                    scope.editingKey = scope.key + '_editing';
                    $rootScope.$watch('fileEditable', function(n, o) {
                        if (n !== o && scope.fe !== n) {
                            scope.fe = n;
                            scope.editingMessage = '';
                        }
                    });
                    scope.$watch('data[editingKey]', function (n, o) {
                        if (n !== o && ['p', 'short'].includes(scope.t)) {
                            scope.initializeFE();
                        }
                    });
                    scope.$watch('data[key]', function (n, o) {
                        if (scope.pureContent.text !== n) {
                            scope.pureContent.text = n;
                        }
                    });
                    scope.setReviewRelatedContent = function(n, o, propagationType) {
                        var key = scope.key;
                        var uuid = scope.uuid;
                        if (propagationType) {
                            if (propagationType === 'solid') {
                                key = 'propagation';
                                uuid = scope.data.propagation_uuid;
                            } else {
                                key = 'propagationLiquid';
                                uuid = scope.data.propagationLiquid_uuid;
                            }
                            if (_.isUndefined(o)) {
                                // Even if propagation old content is undefined, i.e. Level 0 -> Level 2A Propagation 2B.
                                // We still need to set its UUID in Meta/GeneName/review since we need its UUID for recording history old content.
                                mainUtils.setUUIDInReview(uuid);
                            }
                        }
                        // 1) we track the change in two conditions:
                        // 2) When editing happens not in review mode
                        // 3) When editing happends in review mode but not from admin's "Reject" action
                        if (_.isUndefined(scope.data[key + '_review'])) {
                            scope.data[key + '_review'] = {};
                        }
                        scope.data[key + '_review'].updatedBy = $rootScope.me.name;
                        scope.data[key + '_review'].updateTime = new Date().getTime();
                        // If the content is not approved before, do not store it into lastReviewed object.
                        if ((!$rootScope.reviewMeta[uuid] || _.isUndefined(scope.data[key + '_review'].lastReviewed)) && !_.isUndefined(o)) {
                            scope.data[key + '_review'].lastReviewed = o;
                            mainUtils.setUUIDInReview(uuid);
                            ReviewResource.rollback = _.without(ReviewResource.rollback, uuid);
                        } else if (n === scope.data[key + '_review'].lastReviewed) {
                            delete scope.data[key + '_review'].lastReviewed;
                            mainUtils.deleteUUID(uuid);
                            // if this kind of change happens inside review mode, we track current section in rollback status to remove the review panel since there is nothing to be approved
                            if ($rootScope.reviewMode) {
                                ReviewResource.rollback.push(uuid);
                            }
                        }
                        // Assign new value to scope.data[scope.key] to update content to gene page when multiple editing at the same time.
                        if (scope.data[key] !== n) {
                            scope.data[key] = n;
                        }
                    }
                }
            },
            controller: function ($scope) {
                $scope.pureContent = {
                    text: ''
                };
                $scope.content = {
                    propagationTypes: ['solid', 'liquid']
                };
                $scope.content.propagationOpts = _.reduce($scope.content.propagationTypes, function(acc, next) {
                    acc[next] = [];
                    return acc;
                }, {});
                $scope.propagationOpts = {
                    'no': {
                        name: 'No level',
                        value: 'no'
                    },
                    '2B': {
                        name: 'Level 2B',
                        value: '2B'
                    },
                    '3B': {
                        name: 'Level 3B',
                        value: '3B'
                    },
                    '4': {
                        name: 'Level 4',
                        value: '4'
                    }
                };
                $scope.getMutationName = function(key, oldKey, uuid){
                    if(mainUtils.processedInReview('remove', uuid) && oldKey){
                        return oldKey;
                    } else {
                        return key;
                    }
                };
                $scope.initializeFE = function() {
                    if ($scope.data[$scope.key+'_editing']) {
                        if ($scope.data[$scope.key+'_editing'] === $rootScope.me.name) {
                            $scope.fe = true;
                            $scope.editingMessage = '';
                        } else {
                            $scope.fe = false;
                            $scope.editingMessage = 'Please wait. ' + $scope.data[$scope.key+'_editing'] + ' is editing this section...';
                        }
                    } else {
                        $scope.fe = $rootScope.fileEditable;
                    }
                };
                $scope.cleanUpEditing = function() {
                    if ($scope.data[$scope.key+'_editing']) {
                        $scope.data[$scope.key+'_editing'] = '';
                    }
                };
                function updatePropagationByType(propagationType, initial) {
                    var propagationKey = propagationType === 'solid' ? 'propagation' : 'propagationLiquid';
                    var propagationReviewKey = propagationKey + '_review';
                    var propagationUuidKey = propagationKey + '_uuid';
                    if (!initial && $scope.data[propagationReviewKey]) {
                        delete $scope.data[propagationReviewKey].lastReviewed;
                        mainUtils.deleteUUID($scope.data[propagationUuidKey]);
                    }
                    var _propagationOpts = [];
                    var _propagation = '';
                    if (_.isUndefined($scope.tumorForms)) {
                        $scope.tumorForms = mainUtils.getTumorFormsByCancerTypes($scope.tumor.cancerTypes);
                    }
                    if ($scope.pureContent.text === '1' || $scope.pureContent.text === '2A' ||
                        ($rootScope.reviewMode && ($scope.data[$scope.key + '_review'].lastReviewed === '1' ||
                            $scope.data[$scope.key + '_review'].lastReviewed === '2A'))) {
                        _propagationOpts = [
                            $scope.propagationOpts.no,
                            $scope.propagationOpts['2B'],
                            $scope.propagationOpts['4']
                        ];
                        if (propagationType === 'solid' && !$scope.tumorForms.includes('LIQUID')) {
                            _propagation = setDefaultPropagation(propagationKey, '2B', initial)
                        } else {
                            _propagation = setDefaultPropagation(propagationKey, 'no', initial);
                        }
                    } else if ($scope.pureContent.text === '3A' ||
                        ($rootScope.reviewMode && $scope.data[$scope.key + '_review'].lastReviewed === '3A')) {
                        _propagationOpts = [
                            $scope.propagationOpts.no,
                            $scope.propagationOpts['3B'],
                            $scope.propagationOpts['4']
                        ];
                        if (propagationType === 'solid' && !$scope.tumorForms.includes('LIQUID')) {
                            _propagation = setDefaultPropagation(propagationKey, '3B', initial)
                        } else {
                            _propagation = setDefaultPropagation(propagationKey, 'no', initial);
                        }
                    } else if ($scope.pureContent.text === '4' ||
                        ($rootScope.reviewMode && $scope.data[$scope.key + '_review'].lastReviewed === '4')) {
                        _propagationOpts = [
                            $scope.propagationOpts.no,
                            $scope.propagationOpts['4']
                        ];
                        _propagation = setDefaultPropagation(propagationKey, 'no', initial);
                    } else {
                        _propagation = null;
                    }
                    $scope.content.propagationOpts[propagationType] = _propagationOpts;
                    if (!initial && _propagation !== '' && $scope.data[propagationKey] !== _propagation) {
                        $scope.setReviewRelatedContent(_propagation, $scope.data[propagationKey], propagationType);
                        $scope.data[propagationKey] = _propagation;
                    }
                }

                function setDefaultPropagation(propagationKey, defaultPropagation, initial) {
                    var _propagation = '';
                    if ($scope.tumorForms.length === 1) {
                        if (!initial && !$scope.data[propagationKey] && !$rootScope.reviewMode) {
                            _propagation = defaultPropagation;
                        }
                    }
                    return _propagation;
                }
                $scope.changePropagation = function(initial) {
                    _.forEach($scope.content.propagationTypes, function(propagationType) {
                        updatePropagationByType(propagationType, initial);
                    });
                };
                $scope.inReviewMode = function () {
                    return $rootScope.reviewMode;
                };
                $scope.calculateDiff = function() {
                    if ($scope.t === 'p' && $scope.data[$scope.key+'_review'] && $scope.data[$scope.key+'_review'].lastReviewed) {
                        $scope.diffHTML = mainUtils.calculateDiff($scope.data[$scope.key + '_review'].lastReviewed, $scope.data[$scope.key]);
                    }
                };
                $scope.toggleCheckbox = function (e) {
                    if ($scope.t === 'radio') {
                        if ($scope.data[$scope.key] === e.target.value) {
                            $scope.pureContent.text = '';
                        }
                    } else if ($scope.t === 'checkbox') {
                        if (e.target.checked) {
                            $scope.pureContent.text = e.target.value;
                        } else {
                            $scope.pureContent.text = '';
                        }
                    }
                    $scope.updateContent($scope.pureContent.text, $scope.data[$scope.key]);
                };
                $scope.getInputClass = function () {
                    var contentEditable = $rootScope.reviewMode ? (!mainUtils.processedInReview('accept', $scope.uuid) && !mainUtils.processedInReview('reject', $scope.uuid)) : $scope.fe;
                    var classResult = '' ;
                    if (!['MUTATION_NAME'].includes($scope.t)) {
                        classResult = contentEditable ? 'editableBox' : 'unEditableBox';
                    }
                    return classResult;
                };
                $scope.getInputStyle = function(type) {
                    if ($scope.key === 'ocg' && $scope.reviewLayout('regular')) {
                        if (type === 'new') {
                            return {'margin-top': "-53px"};
                        } else if (type === 'old') {
                            return {'margin-top': "28px"};
                        }
                    }
                };
                $scope.getOldContentChecked = function(checkbox) {
                    if ($scope.key === 'tsg' || $scope.key === 'ocg') {
                        if (_.isUndefined($scope.data[$scope.key+'_review']) || _.isUndefined($scope.data[$scope.key+'_review'].lastReviewed)) {
                            return $scope.data[$scope.key] === checkbox;
                        }
                    }
                    return $scope.data && $scope.data[$scope.key+'_review'] && $scope.data[$scope.key+'_review'].lastReviewed === checkbox;
                };
                $scope.reviewLayout = function (type) {
                    if (type === 'regular') {
                        // display the new header, and difference header and content only when the item is not inside an added/deleted sections, and haven't accepted or rejected yet
                        return !mainUtils.processedInReview('accept', $scope.uuid) && !mainUtils.processedInReview('reject', $scope.uuid) && !mainUtils.processedInReview('inside', $scope.uuid) && !mainUtils.processedInReview('rollback', $scope.uuid);
                    } else if (type === 'name') {
                        return mainUtils.processedInReview('name', $scope.uuid) && !mainUtils.processedInReview('accept', $scope.uuid) && !mainUtils.processedInReview('reject', $scope.uuid) && !mainUtils.processedInReview('add', $scope.uuid) && !mainUtils.processedInReview('inside', $scope.uuid);
                    } else if (type === 'inside') {
                        return mainUtils.processedInReview('inside', $scope.uuid);
                    }
                };
                $scope.rejectedAction = function () {
                    return mainUtils.processedInReview('reject', $scope.uuid);
                };
                $scope.reviewContentEditable = function (type) {
                    if (type === 'regular') {
                        return !mainUtils.processedInReview('accept', $scope.uuid) && !mainUtils.processedInReview('reject', $scope.uuid);
                    } else if (type === 'name') {
                        return !mainUtils.processedInReview('inside', $scope.uuid) && !mainUtils.processedInReview('accept', $scope.uuid) && !mainUtils.processedInReview('reject', $scope.uuid) && !mainUtils.processedInReview('add', $scope.uuid);
                    }
                };
                $scope.getOldContentClass = function(content) {
                    var className = 'unEditableBox';
                    if (content && content.length > 80) {
                        className += ' longContent';
                    }
                    return className;
                };
                $scope.getOldContentDivClass = function(content) {
                    if (content && content.length > 80) {
                        return 'longContentDivMargin';
                    }
                };
                $scope.indicateMutationContent = function(mutation) {
                    $scope.indicateMutationContentInGene({
                        mutation: mutation
                    });
                };
                $scope.indicateTumorContent = function(tumor) {
                    $scope.indicateTumorContentInGene({
                        tumor: tumor
                    });
                };
                $scope.updateContent = function (n, o, propagationType) {
                    // 1) Do not run the function when no data change(n===o).
                    // 2) Do not run the function when there is no new content(_.isUndefined(n)).
                    // 3) Do not run the function when just click panel without any change(_.isEmpty(n) && _.isUndefined(o)).
                    // 4) Do not run the function when file is not editable(scope.fe===false).
                    if (n !== o && !_.isUndefined(n) && $scope.fe) {
                        if (!$rootScope.reviewMode) {
                            mainUtils.updateLastModified();
                            if ($scope.t === 'treatment-select' && $scope.key === 'level') {
                                $scope.changePropagation();
                            }
                            // 1) Do not trigger setReviewRelatedContent() when edit Additional Information (Optional).
                            // 2) Do not trigger setReviewRelatedContent() when move mutations.
                            if ($scope.key !== 'short') {
                                $scope.setReviewRelatedContent(n, o, propagationType);
                            }
                        }
                        if (n !== o && ($scope.key === 'level' || ['summary', 'diagnosticSummary', 'prognosticSummary'].includes($scope.key)  && $scope.mutation && $scope.tumor)) {
                            $timeout(function() {
                                $scope.indicateMutationContent($scope.mutation);
                                $scope.indicateTumorContent($scope.tumor);
                            }, 500);
                        }
                        if ($scope.t === 'p' || $scope.t === 'short') {
                            $timeout.cancel($scope.timeoutRef);
                            if ($scope.fe === true && !$scope.data[$scope.key+'_editing']) {
                                $scope.data[$scope.key+'_editing'] = $rootScope.me.name;
                            }
                            $scope.timeoutRef = $timeout(function() {
                                delete $scope.data[$scope.key+'_editing'];
                                $scope.initializeFE();
                            }, 5*1000);
                        }
                        // Check difference when user edits content in review mode.
                        if ($rootScope.reviewMode) {
                            $scope.calculateDiff();
                        }
                    }
                };
            }
        };
    })
    .directive('autofocus', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            link : function($scope, $element) {
                $timeout(function() {
                    $element[0].focus();
                });
            }
        }
    }]);
