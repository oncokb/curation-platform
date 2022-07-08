var $ = window.$;

angular.module('oncokbApp').factory('errorHttpInterceptor', ['$q', function($q) {
    return {
        responseError: function responseError(rejection) {
            Sentry.captureException(new Error('HTTP response error'), {
                extra: {
                    config: rejection.config,
                    status: rejection.status
                }
            });
            return $q.reject(rejection);
        }
    };
}]);

angular.module('oncokbApp').factory('Gene', ['$http', 'OncoKB', function($http, OncoKB) {
    'use strict';

    function getCurationGenes() {
        return $http.get(OncoKB.config.curationLink + 'gene.json');
    }

    function getAllInternalGenes() {
        return $http.get(OncoKB.config.apiLink + 'gene.json');
    }

    function remove(hugoSymbol) {
        return $http.post(OncoKB.config.apiLink + 'genes/remove/' + hugoSymbol, {},
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: function(data) {
                    return $.param(data);
                }
            });
    }

    return {
        getCurationGenes: getCurationGenes,
        getAllInternalGenes: getAllInternalGenes,
        remove: remove
    };
}]);

angular.module('oncokbApp').factory('DataSummary', ['$http', function($http) {
    'use strict';

    function getFromServer() {
        return $http.get('data/summary.json');
    }
    function getGeneType() {
        return $http.get(OncoKB.config.internalPublicApiLink + 'genes');
    }
    function getEvidenceByType(type) {
        return $http.get(OncoKB.config.internalPublicApiLink + 'evidences/lookup?source=oncotree&evidenceTypes=' + type);
    }

    function getEvidenceLevels() {
        return $http.get(OncoKB.config.publicApiLink + 'info');
    }

    return {
        getFromServer: getFromServer,
        getGeneType: getGeneType,
        getEvidenceByType: getEvidenceByType,
        getEvidenceLevels: getEvidenceLevels,
    };
}]);

angular.module('oncokbApp').factory('Drugs', ['$http', 'OncoKB', function ($http, OncoKB) {
    'use strict';
    var transform = function(data) {
        return $.param(data);
    };

    function searchNCITDrugs(keyword) {
        return $http.get(OncoKB.config.privateApiLink + 'search/ncitDrugs?query=' + keyword);
    }

    function updatePreferredName(ncitCode, preferredName) {

        return $http.post(
            OncoKB.config.apiLink + 'drugs/update/' + ncitCode,
            {
                preferredName: preferredName
            },
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            });
    }

    return {
        updatePreferredName: updatePreferredName,
        searchNCITDrugs: searchNCITDrugs
    }
}]);

angular.module('oncokbApp').factory('Alteration', ['$http', 'OncoKB', function($http, OncoKB) {
    'use strict';

    function getFromServer() {
        return $http.get(OncoKB.config.apiLink + 'alteration.json');
    }

    function findByGene(gene) {
        var query = '';
        if (_.isNumber(gene)) {
            query = 'entrezGeneId=' + gene;
        } else {
            query = 'hugoSymbol=' + gene;
        }
        return $http.get(OncoKB.config.internalPublicApiLink + 'variants/lookup?' + query);
    }

    return {
        findByGene: findByGene,
        getFromServer: getFromServer
    };
}]);

angular.module('oncokbApp').config(function($httpProvider) {
    $httpProvider.interceptors.push('xmlHttpInterceptor');
}).factory(('SearchVariant'), ['$http', 'OncoKB', function($http, OncoKB) {
    function getAnnotation(params) {
        var _params = angular.copy(params);
        var _url = OncoKB.config.apiLink + 'var_annotation?';

        for (var _key in _params) {
            if (typeof _params[_key] !== 'undefined' && _params[_key] && _params[_key] !== '') {
                _url += _key + '=' + _params[_key] + '&';
            }
        }
        _url = _url.substring(0, _url.length - 1);
        return $http.get(_url);
    }

    function postAnnotation(params) {
        return $http({
            url: OncoKB.config.apiLink + 'var_annotation',
            method: 'POST',
            params: params
        });
    }

    function lookupVariants(body) {
        return $http.post(OncoKB.config.internalPublicApiLink + 'variants/lookup', body);
    }

    return {
        getAnnotation: getAnnotation,
        postAnnotation: postAnnotation,
        lookupVariants: lookupVariants
    };
}]);

angular.module('oncokbApp').factory('SendEmail', ['$http', 'OncoKB', function($http, OncoKB) {
    'use strict';
    var transform = function(data) {
        return $.param(data);
    };

    function init(params) {
        return $http.post(
            OncoKB.config.curationLink + 'sendEmail',
            params,
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            });
    }

    return {
        init: init
    };
}]);

angular.module('oncokbApp').factory('DriveAnnotation', ['$http', 'OncoKB', '_', function($http, OncoKB, _) {
    'use strict';
    var transform = function(data) {
        return $.param(data);
    };

    function updateGene(data) {
        return $http.post(
            OncoKB.config.apiLink + 'driveAnnotation',
            data,
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            });
    }

    function updateGeneType(hugoSymbol, data) {
        return $http.post(
            OncoKB.config.apiLink + 'genes/update/' + hugoSymbol,
            data,
            {
                transformResponse: function(result) {
                    return {status: result};
                }
            });
    }

    function deleteEvidences(data) {
        return $http.post(
            OncoKB.config.apiLink + 'evidences/delete',
            data);
    }

    function updateVUS(hugoSymbol, data) {
        return $http.post(
            OncoKB.config.apiLink + 'vus/update/' + hugoSymbol,
            data,
            {
                transformResponse: function(result) {
                    return {status: result};
                }
            });
    }

    function updateEvidenceBatch(data) {
        return $http.post(
            OncoKB.config.apiLink + 'evidences/update',
            data,
            {
                transformResponse: function(result) {
                    return {status: result};
                }
            });
    }

    function updateEvidenceRelevantCancerTypesBatch(data) {
        return $http.post(
            OncoKB.config.apiLink + 'evidences/updateRelevantCancerTypes',
            data,
            {
                transformResponse: function(result) {
                    return {status: result};
                }
            });
    }

    function updateEvidenceTreatmentPriorityBatch(data) {
        return $http.post(
            OncoKB.config.apiLink + 'evidences/priority/update',
            data,
            {
                transformResponse: function(result) {
                    return {status: result};
                }
            });
    }

    function getEvidencesByUUID(uuid) {
        return $http.get(
            OncoKB.config.internalPublicApiLink + 'evidences/' + uuid,
            {
                transformResponse: function(result) {
                    return {status: result};
                }
            });
    }

    function getEvidencesByUUIDs(uuids) {
        return $http.post(
            OncoKB.config.internalPublicApiLink + 'evidences',
            uuids,
            {
                transformResponse: function(result) {
                    return {status: result};
                }
            });
    }

    function getPubMedArticle(pubMedIDs) {
        var validPubMedIDs = [];
        _.each(pubMedIDs, function(pubMedID) {
            if (!_.isNaN(Number(pubMedID))) {
                validPubMedIDs.push(pubMedID);
            }
        });
        return $http.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' + validPubMedIDs.join(','));
    }

    function getClinicalTrial(nctIds) {
        if (!nctIds || !_.isArray(nctIds) || nctIds.length === 0) {
            return {};
        } else {
            return $http.get(OncoKB.config.privateApiLink + 'utils/validation/trials?nctIds=' + nctIds.join());
        }
    }

    return {
        updateGene: updateGene,
        updateGeneType: updateGeneType,
        deleteEvidences: deleteEvidences,
        updateVUS: updateVUS,
        updateEvidenceBatch: updateEvidenceBatch,
        updateEvidenceTreatmentPriorityBatch: updateEvidenceTreatmentPriorityBatch,
        updateEvidenceRelevantCancerTypesBatch: updateEvidenceRelevantCancerTypesBatch,
        getEvidencesByUUID: getEvidencesByUUID,
        getEvidencesByUUIDs: getEvidencesByUUIDs,
        getPubMedArticle: getPubMedArticle,
        getClinicalTrial: getClinicalTrial
    };
}]);

angular.module('oncokbApp').factory('InternalAccess', ['$http', 'OncoKB', function($http, OncoKB) {
    'use strict';
    function hasAccess() {
        return $http.get(OncoKB.config.apiLink + 'access');
    }

    return {
        hasAccess: hasAccess
    };
}]);

angular.module('oncokbApp').factory('Cache', ['$http', 'OncoKB', function($http, OncoKB) {
    'use strict';
    var transform = function(data) {
        return $.param(data);
    };

    function setStatus(status) {
        return $http.post(
            OncoKB.config.apiLink + 'cache',
            {cmd: status},
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            }
        );
    }

    function getStatus() {
        return $http({
            url: OncoKB.config.apiLink + 'cache',
            method: 'GET',
            params: {cmd: 'getStatus'}
        });
    }

    function updateGene(hugoSymbol) {
        var transform = function(data) {
            return $.param(data);
        };
        return $http.post(
            OncoKB.config.apiLink + 'cache', {
                cmd: 'updateGene',
                hugoSymbol: hugoSymbol
            }, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                transformRequest: transform
            });
    }

    return {
        reset: function() {
            return setStatus('reset');
        },
        getStatus: getStatus,
        updateGene: updateGene
    };
}]);

angular.module('oncokbApp').factory('OncoTree', ['$http', 'OncoKB', '_', function($http, OncoKB, _) {
    'use strict';

    function getTumorTypeByMainType(mainType) {
        return $http.get(OncoKB.config.oncoTreeLink +
            'tumorTypes/search/maintype/' + mainType + '?exactMatch=true&version=' + OncoKB.config.oncoTreeVersion);
    }

    function getTumorTypes() {
        return $http.get(OncoKB.config.privateApiLink + 'utils/tumorTypes');
    }

    function getRelevantCancerTypes(levelOfEvidence, cancerTypes) {
        var queryStr = [];
        if (levelOfEvidence) {
            queryStr.push('levelOfEvidence=' + levelOfEvidence);
        }
        if (queryStr.length > 0) {
            queryStr = '?' + queryStr.join('&');
        } else {
            queryStr = '';
        }
        return $http.post(OncoKB.config.privateApiLink + 'utils/relevantCancerTypes' + queryStr, cancerTypes);
    }

    return {
        getTumorTypeByMainType: getTumorTypeByMainType,
        getTumorTypes: getTumorTypes,
        getRelevantCancerTypes: getRelevantCancerTypes,
    };
}]);

angular.module('oncokbApp').factory('ApiUtils', ['$http', function($http) {
    'use strict';

    function getIsoforms(type) {
        if (type === 'msk') {
            return $http.get('data/isoformMskcc.json');
        }
        return $http.get('data/isoformUniport.json');
    }

    function getOncogeneTSG() {
        return $http.get('data/oncogeneTSG.json');
    }

    return {
        getIsoforms: getIsoforms,
        getOncogeneTSG: getOncogeneTSG
    };
}]);

angular.module('oncokbApp').factory('DataValidation', function(OncoKB) {
    'use strict';
    return {
        getWebSocket: function () {
            return new WebSocket('ws://' + OncoKB.config.websocketApiLink + 'curation/validation');
        }
    };
});

angular.module('oncokbApp')
    .factory('PrivateApi', ['$http', 'OncoKB', function($http, OncoKB) {
        'use strict';

        function getSuggestedVariants() {
            return $http.get(OncoKB.config.privateApiLink + 'utils/suggestedVariants');
        }

        function isHotspot(hugoSymbol, variant) {
            if (!hugoSymbol || !variant) {
                return null;
            }
            return $http.get(OncoKB.config.privateApiLink + 'utils/isHotspot?hugoSymbol=' +
                hugoSymbol + '&variant=' + variant);
        }

        function getTranscripts(hugoSymbol) {
            if (!hugoSymbol) {
                return null;
            }
            return $http.get(OncoKB.config.privateApiLink + 'transcripts/' + hugoSymbol);
        }

        function updateGeneTranscript(hugoSymbol, entrezGeneId, grch37Isoform, grch37RefSeq, grch38Isoform, grch38RefSeq) {
            if ((hugoSymbol || entrezGeneId) && grch37Isoform) {
                var urlParams = [];
                if (hugoSymbol) {
                    urlParams.push('hugoSymbol=' + hugoSymbol);
                }
                if (entrezGeneId) {
                    urlParams.push('entrezGeneId=' + entrezGeneId);
                }
                if (grch37Isoform) {
                    urlParams.push('grch37Isoform=' + grch37Isoform);
                }
                if (grch37RefSeq) {
                    urlParams.push('grch37RefSeq=' + grch37RefSeq);
                }
                if (grch38Isoform) {
                    urlParams.push('grch38Isoform=' + grch38Isoform);
                }
                if (grch38RefSeq) {
                    urlParams.push('grch38RefSeq=' + grch38RefSeq);
                }
                return $http.get(OncoKB.config.internalPrivateApiLink + 'utils/updateTranscript?' + urlParams.join('&'));
            }
            return null;
        }

        function validateGeneTranscriptUpdate(hugoSymbol, entrezGeneId, grch37Isoform, grch38Isoform) {
            if ((hugoSymbol || entrezGeneId) && grch37Isoform) {
                var urlParams = [];
                if (hugoSymbol) {
                    urlParams.push('hugoSymbol=' + hugoSymbol);
                }
                if (entrezGeneId) {
                    urlParams.push('entrezGeneId=' + entrezGeneId);
                }
                if (grch37Isoform) {
                    urlParams.push('grch37Isoform=' + grch37Isoform);
                }
                if (grch38Isoform) {
                    urlParams.push('grch38Isoform=' + grch38Isoform);
                }
                return $http.get(OncoKB.config.privateApiLink + 'utils/validateTranscriptUpdate?' + urlParams.join('&'));
            }
            return null;
        }

        function getVariantAnnotation(entrezGeneId, alteration, tumorType) {
            var params = {
                entrezGeneId: entrezGeneId,
                alteration: alteration,
            };
            if (tumorType) {
                params.tumorType = tumorType;
            }
            var paramsStr = _.reduce(params, function(acc, value, key) {
                acc.push(key + '=' +value);
                return acc;
            }, []).join('&');
            return $http.get(OncoKB.config.internalPrivateApiLink + 'utils/variantAnnotation?' + paramsStr);
        }

        return {
            getSuggestedVariants: getSuggestedVariants,
            getVariantAnnotation: getVariantAnnotation,
            getTranscripts: getTranscripts,
            updateGeneTranscript: updateGeneTranscript,
            validateGeneTranscriptUpdate: validateGeneTranscriptUpdate,
            isHotspot: isHotspot
        };
    }]);
angular.module('oncokbApp')
    .factory('ReviewResource', ['$http', 'OncoKB', function() {
        'use strict';
        return {
            mostRecent: {}, // uuid string is the key, and value is an object with updateTime and updatedBy
            // the following attributes will be arrays with uuids as content
            accepted: [], // accepted section
            rejected: [], // rejected section
            rollback: [], // rolledback items
            loading: [], // loading section
            inside: [], // the items that is inside an added or removed section
            updated: [], // content updated sections
            nameChanged: [], // name changed sections
            added: [], // newly added sections
            removed: [], // deleted sections
            precise: [], // the exact item that has been changed
            openInReviewMode: [], // Store uuids for updated and added evidences
            reviewObjs: {}
        };
    }]);
angular.module('oncokbApp')
    .factory('FirebaseModel', ['$rootScope', '_', 'mainUtils', function($rootScope, _, mainUtils) {
        'use strict';
        function createTIs() {
            var result = [];
            for (var i = 0; i < 4; i++) {
                var ti = new TI();
                switch(i) {
                    case 0:
                        ti.type = 'SS';
                        ti.name = 'Standard implications for sensitivity to therapy';
                        break;
                    case 1:
                        ti.type = 'SR';
                        ti.name = 'Standard implications for resistance to therapy';
                        break;
                    case 2:
                        ti.type = 'IS';
                        ti.name = 'Investigational implications for sensitivity to therapy';
                        break;
                    case 3:
                        ti.type = 'IR';
                        ti.name = 'Investigational implications for resistance to therapy';
                        break;
                }
                result.push(ti);
            }
            return result;
        }
        function Gene(name) {
            this.name = name;
            this.summary = '';
            this.summary_uuid = mainUtils.generateUUID();
            this.background = '';
            this.background_uuid = mainUtils.generateUUID();
            this.isoform_override = '';
            this.isoform_override_grch38 = '';
            this.dmp_refseq_id = '';
            this.dmp_refseq_id_grch38 = '';
            this.type = {
                tsg: '',
                tsg_uuid: mainUtils.generateUUID(),
                ocg: '',
                ocg_uuid: mainUtils.generateUUID()
            };
            this.type_uuid = mainUtils.generateUUID();
            this.mutations_uuid = mainUtils.generateUUID();
        }
        function Mutation(name) {
            this.name = name;
            this.name_uuid = mainUtils.generateUUID();
            this.mutation_effect = {
                oncogenic: '',
                oncogenic_uuid: mainUtils.generateUUID(),
                resistance: '',
                resistance_uuid: mainUtils.generateUUID(),
                effect: '',
                effect_uuid: mainUtils.generateUUID(),
                description: '',
                description_uuid: mainUtils.generateUUID(),
                short: ''
            };
            this.mutation_effect_uuid = mainUtils.generateUUID();
            this.tumors_uuid = mainUtils.generateUUID();
        };
        function Tumor(cancerTypes) {
            this.cancerTypes = cancerTypes;
            this.cancerTypes_uuid = mainUtils.generateUUID();
            this.summary = '';
            this.summary_uuid = mainUtils.generateUUID();
            this.diagnosticSummary = '';
            this.diagnosticSummary_uuid = mainUtils.generateUUID();
            this.prognosticSummary = '';
            this.prognosticSummary_uuid = mainUtils.generateUUID();
            this.prognostic = {
                level: '',
                level_uuid: mainUtils.generateUUID(),
                description: '',
                description_uuid: mainUtils.generateUUID(),
                short: ''
            };
            this.prognostic_uuid = mainUtils.generateUUID();
            this.diagnostic = {
                level: '',
                level_uuid: mainUtils.generateUUID(),
                description: '',
                description_uuid: mainUtils.generateUUID(),
                short: ''
            };
            this.diagnostic_uuid = mainUtils.generateUUID();
            this.TIs = createTIs();
        };
        function Cancertype(mainType, subtype, code) {
            this.mainType = mainType;
            this.subtype = subtype;
            this.code = code;
        }
        function TI() {
            this.name =  '';
            this.name_uuid = mainUtils.generateUUID();
            this.type = '';
            this.treatments = [];
            this.treatments_uuid = mainUtils.generateUUID();
        }
        function Treatment(name) {
            this.name = name;
            this.name_uuid = mainUtils.generateUUID();
            this.level = '';
            this.level_uuid = mainUtils.generateUUID();
            this.propagation = ''; // propagationSolid
            this.propagation_uuid = mainUtils.generateUUID();
            this.propagationLiquid = '';
            this.propagationLiquid_uuid = mainUtils.generateUUID();
            this.indication = '';
            this.indication_uuid = mainUtils.generateUUID();
            this.description = '';
            this.description_uuid = mainUtils.generateUUID();
            this.short = '';
        };
        function Comment(userName, email, content) {
            this.date = (new Date()).getTime().toString();
            this.userName = userName;
            this.email = email;
            this.content = content;
            this.resolved = 'false';
        }
        function VUSItem(name, userName, userEmail) {
            this.name = name;
            this.time = {
                by: {
                    name: userName,
                    email: userEmail
                },
                value: new Date().getTime()
            };
        }
        function Timestamp(userName) {
            this.updatedBy = userName;
            this.updateTime = new Date().getTime();
        }
        function Meta() {
            this.lastModifiedBy = $rootScope.me.name;
            this.lastModifiedAt = (new Date()).getTime().toString();
            this.review = {
                currentReviewer: ''
            };
        }
        function Setting() {
            this.enableReview = true;
        }
        function Drug(drugName, ncitCode, synonyms, ncitName){
            this.drugName = drugName;
            this.ncitCode = ncitCode;
            this.uuid = mainUtils.generateUUID();
            this.description = '';
            this.ncitName = ncitName;
            this.synonyms = synonyms || [];
        }
        function ReviewedData(item, mutation, drugs) {
            return {
                hugoSymbol: _.isUndefined(item.gene) ? item.hugoSymbol: item.gene.hugoSymbol,
                uuid: item.uuid,
                mutation: mutation,
                tumorType: item.cancerTypes.map(function(cancerType) {
                    return cancerType.subtype ? cancerType.subtype : cancerType.mainType;
                }).join(", "),
                drugs: drugs,
                lastReview: item.lastReview,
                oncogene: _.isUndefined(item.gene) ? item.oncogene : item.gene.oncogene,
                tsg: _.isUndefined(item.gene) ? item.tsg : item.gene.tsg,
                truncatingMutations: item.alteration === 'Truncating Mutations',
                deletion: item.alteration === 'Deletion',
                amplification: item.alteration === 'Amplification',
                level: item.levelOfEvidence,
                description: item.description,
                solidPropagationLevel: item.solidPropagationLevel,
                liquidPropagationLevel: item.liquidPropagationLevel
            };
        }
        return {
            Gene: Gene,
            Mutation: Mutation,
            Tumor: Tumor,
            Treatment: Treatment,
            Comment: Comment,
            Cancertype: Cancertype,
            VUSItem: VUSItem,
            Timestamp: Timestamp,
            Meta: Meta,
            Setting: Setting,
            Drug: Drug,
            ReviewedData: ReviewedData
        };
    }]);
