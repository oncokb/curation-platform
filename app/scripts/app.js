'use strict';
/**
 * @ngdoc overview
 * @name oncokb
 * @description
 * # oncokb
 *
 * Main module of the application.
 */
var OncoKB = {
    global: {},
    config: {},
    backingUp: false
};
var oncokbApp = angular.module('oncokbApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'localytics.directives',
    'dialogs.main',
    'dialogs.default-translations',
    'RecursionHelper',
    'xml',
    'datatables',
    'datatables.bootstrap',
    'ui.sortable',
    'firebase',
    'daterangepicker',
    'monospaced.elastic',
    'ngTagsInput'
])
    .value('OncoKB', OncoKB)
    // This is used for typeahead
    .constant('SecretEmptyKey', '[$empty$]')
    .constant('loadingScreen', window.loadingScreen)
    .constant('S', window.S)
    .constant('_', window._)
    .constant('Sentry', window.Sentry)
    .constant('Levenshtein', window.Levenshtein)
    .constant('PDF', window.jsPDF)
    .constant('UUIDjs', window.UUIDjs)
    .constant('onLocalhost', location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    .config(function($provide, $locationProvider, $routeProvider, $sceProvider, dialogsProvider, $animateProvider, x2jsProvider, $httpProvider) {

        $routeProvider
            .when('/', {
                templateUrl: 'views/welcome.html',
                internalUse: false
            })
            .when('/variant', {
                templateUrl: 'views/variant.html',
                controller: 'VariantCtrl',
                reloadOnSearch: false,
                internalUse: true
            })
            .when('/tools', {
                templateUrl: 'views/tools.html',
                controller: 'ToolsCtrl',
                internalUse: false
            })
            .when('/genes', {
                templateUrl: 'views/genes.html',
                controller: 'GenesCtrl',
                internalUse: false
            })
            .when('/gene/:geneName', {
                templateUrl: 'views/gene.html',
                controller: 'GeneCtrl',
                internalUse: false
            })
            .when('/feedback', {
                templateUrl: 'views/feedback.html',
                internalUse: false
            })
            .when('/queues', {
                templateUrl: 'views/queues.html',
                internalUse: false
            })
            .when('/therapies', {
                templateUrl: 'views/drugs.html',
                controller: 'DrugsCtrl',
                internalUse: false
            })
            .otherwise({
                redirectTo: '/genes'
            });

        dialogsProvider.useBackdrop(true);
        dialogsProvider.useEscClose(true);
        dialogsProvider.useCopy(false);
        dialogsProvider.setSize('md');

        $animateProvider.classNameFilter(/^((?!(fa-spinner)).)*$/);

        x2jsProvider.config = {
            attributePrefix: '$'
        };

        if(OncoKB.config.production) {
            $provide.decorator('$exceptionHandler', function($delegate, $injector) {
                return function(exception, cause) {
                    Sentry.captureException(exception);
                };
            });

            $httpProvider.interceptors.push('errorHttpInterceptor');
        }

        $sceProvider.enabled(false);
    });

angular.module('oncokbApp').run(
    ['$window', '$timeout', '$rootScope', '$location', '$q', 'loadingScreen', 'DatabaseConnector', 'dialogs', 'mainUtils', 'user', 'loadFiles',
        function($window, $timeout, $rootScope, $location, $q, loadingScreen, DatabaseConnector, dialogs, mainUtils, user, loadFiles) {
            $rootScope.internal = true;
            $rootScope.meta = {
                levelsDesc: {
                    'R3': '',
                    'Px1': 'FDA and/or professional guideline-recognized biomarker prognostic in this indication based on well-powered studie(s)',
                    'Px2': 'FDA and/or professional guideline-recognized biomarker prognostic in this indication based on a single or multiple small studies',
                    'Px3': 'Biomarker prognostic in this indication based on clinical evidence in well powered studies',
                    'Dx1': 'FDA and/or professional guideline-recognized biomarker required for diagnosis in this indication',
                    'Dx2': 'FDA and/or professional guideline-recognized biomarker that supports diagnosis in this indication',
                    'Dx3': 'Biomarker that may assist disease diagnosis in this indication based on clinical evidence',
                },
                levelsDescHtml: {
                    'R3': '<span></span>'
                },
                colorsByLevel: {
                    Level_R3: '#FCD6D3',
                    Level_Px1: '#33A02C',
                    Level_Px2: '#1F78B4',
                    Level_Px3: '#984EA3',
                    Level_Dx1: '#33A02C',
                    Level_Dx2: '#1F78B4',
                    Level_Dx3: '#984EA3'
                }
            };

            // Load setting collection from firebase when the app is initialized.
            loadFiles.load('setting').then(function(result) {}, function(error) {});

            // Error loading the document, likely due revoked access. Redirect back to home/install page
            $rootScope.$on('$routeChangeError', function() {
                $location.url('/');
            });
            var loading = true;

            function testInternal() {
                var defer = $q.defer();
                DatabaseConnector.testAccess(function() {
                    $rootScope.internal = true;
                    defer.resolve();
                }, function(data, status, headers, config) {
                    $rootScope.internal = false;
                    defer.resolve();
                });
                return defer.promise;
            }

            function getEvidenceLevels() {
                DatabaseConnector.getEvidenceLevels(function(data) {
                    _.forEach(data.levels, function(level) {
                        var levelCode = level.levelOfEvidence.replace('LEVEL_', '');
                        $rootScope.meta.levelsDesc[levelCode] = level.description;
                        $rootScope.meta.levelsDescHtml[levelCode] = level.htmlDescription;
                        $rootScope.meta.colorsByLevel[levelCode] = level.colorHex;
                    });
                }, function() {
                    dialogs.error('Error', 'Failed to load evidence levels information. Please Contact developer and stop curation.');
                });
            }

            getEvidenceLevels();
            testInternal().finally(function() {
                $rootScope.$broadcast('internalStateChange');
            });

            $rootScope.$on('$routeChangeStart', function(event, next) {
                var fromIndex = window.location.href.indexOf('/gene/');
                var hugoSymbol = '';
                var regex = /\/([^\/]+)\/?$/;
                if (fromIndex !== -1) {
                    //When the curator left the gene page
                    hugoSymbol = window.location.href.match(regex)[1];
                    window.localStorage.geneName = hugoSymbol;
                }
                var toIndex = $location.path().indexOf('/gene/');
                if (toIndex !== -1) {
                    //When the curator enter the gene page
                    hugoSymbol = $location.path().match(regex)[1];
                    window.localStorage.geneName = hugoSymbol;
                }
                if (toIndex === -1) {
                    var filteredUrl = $location.path().match(regex);
                    if (filteredUrl && filteredUrl.length > 1) {
                        window.localStorage.tab = filteredUrl[1];
                        if (fromIndex === -1) {
                            window.localStorage.geneName = '';
                        }
                    }
                }
                if ($rootScope.me && (fromIndex !== -1 || toIndex !== -1)) {
                    loadFiles.load(['collaborators']).then(function() {
                        var myName = $rootScope.me.name.toLowerCase();
                        if (!$rootScope.collaboratorsMeta) {
                            $rootScope.collaboratorsMeta = {};
                        }
                        if (fromIndex !== -1) {
                            var genesOpened = $rootScope.collaboratorsMeta[myName];
                            $rootScope.collaboratorsMeta[myName] = _.without(genesOpened, hugoSymbol);
                        }
                        if (toIndex !== -1) {
                            if (!$rootScope.collaboratorsMeta[myName]) {
                                $rootScope.collaboratorsMeta[myName] = [];
                            }
                            if ($rootScope.collaboratorsMeta[myName].indexOf(hugoSymbol) === -1) {
                                $rootScope.collaboratorsMeta[myName].push(hugoSymbol);
                            }
                        }
                    }, function(error) {
                        console.log(error);
                    });
                }
                if (!$rootScope.isAuthorizedUser || (next.internalUse && !$rootScope.internal)) {
                    if (loading) {
                        loadingScreen.finish();
                        loading = false;
                    }
                    $location.path('/');
                }
            });
        }]);

/**
 * Bootstrap the app
 */
(function(_, angular, $) {
    /**
     * Get OncoKB configurations
     */
    function fetchData(callback) {
        var initInjector = angular.injector(['ng']);
        var $http = initInjector.get('$http');

        if (window.CurationPlatformConfigString) {
            callback(_.isString(window.CurationPlatformConfigString) ? JSON.parse(window.CurationPlatformConfigString) : window.CurationPlatformConfigString);
        } else {
            $http.get('data/config.json').then(function(response) {
                if (_.isObject(response.data)) {
                    callback(response.data);
                }
            }, function() {
                console.error('Failed to load JSON configuration file.');
            });
        }
    }

    /**
     * Bootstrap Angular application
     */
    function bootstrapApplication() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['oncokbApp']);
        });
    }

    fetchData(function(serverSideConfigs) {
        OncoKB.config = $.extend(true, OncoKB.config, serverSideConfigs);
        firebase.initializeApp(OncoKB.config.firebaseConfig);
        bootstrapApplication();
    });
})(window._, window.angular, window.jQuery);
