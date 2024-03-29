'use strict';

angular.module('oncokbApp')
    .factory('DatabaseConnector', [
        '$timeout',
        '$q',
        '$rootScope',
        'Gene',
        'Alteration',
        'Evidence',
        'SearchVariant',
        'DriveAnnotation',
        'Sentry',
        'onLocalhost',
        'DataSummary',
        'Drugs',
        'Cache',
        'OncoTree',
        'InternalAccess',
        'ApiUtils',
        'PrivateApi',
        'DataValidation',
        '$firebaseArray',
        function($timeout,
                 $q,
                 $rootScope,
                 Gene,
                 Alteration,
                 Evidence,
                 SearchVariant,
                 DriveAnnotation,
                 Sentry,
                 onLocalhost,
                 DataSummary,
                 Drugs,
                 Cache,
                 OncoTree,
                 InternalAccess,
                 ApiUtils,
                 PrivateApi,
                 DataValidation,
                 $firebaseArray) {
            var numOfLocks = {};
            var data = {};
            var testing = OncoKB.config.testing || false;
            var inProduction = (OncoKB.config.production && !onLocalhost) || false;

            function searchNCITDrugs(keyword) {
                var deferred = $q.defer();
                Drugs.searchNCITDrugs(keyword)
                    .then(function(data) {
                        deferred.resolve(data.data);
                    }, function(error) {
                        Sentry.captureException(new Exception('Failed to add a new history record for ' + hugoSymbol + '. \n\n Content: ' + JSON.stringify(historyData) + '\n\nError: \n' + JSON.stringify(error)));
                        deferred.reject(error);
                    });
                return deferred.promise;
            }

            function updateDrugPreferredName(ncitCode, newPreferredName) {
                var deferred = $q.defer();
                if (testing) {
                    deferred.resolve();
                } else {
                    Drugs.updatePreferredName(ncitCode, newPreferredName)
                        .then(function(data) {
                            deferred.resolve(data.data);
                        }, function(error) {
                            deferred.reject(error);
                        });
                }
                return deferred.promise;
            }

            function getAllGenes(callback, timestamp) {
                Gene.getCurationGenes()
                    .then(function(data) {
                        if (timestamp) {
                            numOfLocks[timestamp]--;
                        }
                        callback(data);
                    }, function() {
                        if (timestamp) {
                            numOfLocks[timestamp]--;
                        }
                        callback();
                    });
            }

            function getAllInternalGenes() {
                return Gene.getAllInternalGenes();
            }

            function removeGeneFromDB(hugoSymbol, callback) {
                Gene.remove(hugoSymbol)
                    .then(function(data) {
                        callback(data);
                    }, function() {
                        callback();
                    });
            }

            function getAllTumorType(callback, timestamp) {
                getTumorTypes()
                    .then(function(data) {
                        if (timestamp) {
                            numOfLocks[timestamp]--;
                        }
                        callback(data);
                    }, function() {
                        if (timestamp) {
                            numOfLocks[timestamp]--;
                        }
                        callback();
                    });
            }

            function getReviewedData(evidenceType) {
                var deferred = $q.defer();
                if (evidenceType === 'geneType') {
                    DataSummary.getGeneType()
                        .then(function(data) {
                            deferred.resolve(data);
                        }, function(result) {
                            deferred.reject(result);
                        });
                } else {
                    DataSummary.getEvidenceByType(evidenceType)
                        .then(function(data) {
                            deferred.resolve(data);
                        }, function(result) {
                            deferred.reject(result);
                        });
                }
                return deferred.promise;
            }

            function searchVariant(params, success, fail) {
                SearchVariant
                    .getAnnotation(params)
                    .then(function(data) {
                        success(data);
                    }, function() {
                        fail();
                    });
            }

            function updateGene(data, success, fail) {
                if (testing) {
                    success('');
                } else {
                    DriveAnnotation
                        .updateGene(data)
                        .then(function(data) {
                            success(data);
                        }, function(error) {
                            fail(error);
                        });
                }
            }

            function updateGeneType(hugoSymbol, data, historyData, success, fail) {
                if (testing) {
                    success('');
                    addHistoryRecord(historyData);
                } else {
                    DriveAnnotation
                        .updateGeneType(hugoSymbol, data)
                        .then(function(data) {
                            success(data);
                            addHistoryRecord(historyData);
                        }, function() {
                            fail();
                        });
                }
            }

            function getEvidencesByUUID(uuid, success, fail) {
                if (testing) {
                    success('');
                } else {
                    DriveAnnotation
                        .getEvidencesByUUID(uuid)
                        .then(function(data) {
                            success(data);
                        }, function() {
                            fail();
                        });
                }
            }

            function getEvidencesByUUIDs(uuids, success, fail) {
                if (testing) {
                    success('');
                } else {
                    DriveAnnotation
                        .getEvidencesByUUIDs(uuids)
                        .then(function(data) {
                            success(data);
                        }, function() {
                            fail();
                        });
                }
            }
            function getPubMedArticle(pubMedIDs, success, fail) {
                DriveAnnotation
                    .getPubMedArticle(pubMedIDs)
                    .then(function(data) {
                        success(data.data);
                    }, function() {
                        fail();
                    });
            }
            function deleteEvidences(data, historyData, success, fail) {
                if (testing) {
                    success('');
                    addHistoryRecord(historyData);
                } else {
                    DriveAnnotation
                        .deleteEvidences(data)
                        .then(function(data) {
                            success(data);
                            addHistoryRecord(historyData);
                        }, function() {
                            fail();
                        });
                }
            }

            function updateVUS(hugoSymbol, data, success, fail) {
                if ($rootScope.internal) {
                    if (testing) {
                        success('');
                    } else {
                        DriveAnnotation
                            .updateVUS(hugoSymbol, data)
                            .then(function(data) {
                                success(data);
                            }, function(error) {
                                var content = 'VUS update Error for ' + hugoSymbol;
                                content = content + '\nThe system error returned is ' + JSON.stringify(error);
                                Sentry.captureException(new Exception(content));
                                fail(error);
                                setAPIData('vus', hugoSymbol, data);
                            });
                    }
                } else {
                    setAPIData('vus', hugoSymbol, data);
                }
            }
            function setAPIData(type, hugoSymbol, data) {
                if (_.isUndefined($rootScope.apiData)) {
                    $rootScope.apiData = {};
                }
                if (_.isUndefined($rootScope.apiData[hugoSymbol])) {
                    $rootScope.apiData[hugoSymbol] = {};
                }
                if (type === 'vus') {
                    $rootScope.apiData[hugoSymbol]['vus'] = data;
                } else if (type === 'priority' || type === 'drug') {
                    // TODO
                    // $rootScope.apiData.get(hugoSymbol).set(type, $rootScope.metaModel.createList(''));
                }
            }
            function updateEvidenceBatch(data, historyData, success, fail) {
                if (testing) {
                    success('');
                    addHistoryRecord(historyData);
                } else {
                    DriveAnnotation
                        .updateEvidenceBatch(data)
                        .then(function(data) {
                            success(data);
                            addHistoryRecord(historyData);
                        }, function() {
                            fail();
                        });
                }
            }

            function updateEvidenceTreatmentPriorityBatch(data, success, fail) {
                if (testing) {
                    success('');
                } else {
                    DriveAnnotation
                        .updateEvidenceTreatmentPriorityBatch(data)
                        .then(function(data) {
                            success(data);
                        }, function() {
                            fail();
                        });
                }
            }

            function updateEvidenceRelevantCancerTypesBatch(data) {
                return DriveAnnotation.updateEvidenceRelevantCancerTypesBatch(data);
            }

            function timeout(callback, timestamp) {
                $timeout(function() {
                    if (numOfLocks[timestamp] === 0) {
                        callback(data[timestamp]);
                    } else {
                        timeout(callback, timestamp);
                    }
                }, 100);
            }

            function testAccess(successCallback, failCallback) {
                if (testing) {
                    if (angular.isFunction(successCallback)) {
                        successCallback();
                    }
                } else {
                    InternalAccess
                        .hasAccess()
                        .then(function(data, status, headers, config) {
                            if (angular.isFunction(successCallback)) {
                                successCallback(data, status, headers, config);
                            }
                        }, function(data, status, headers, config) {
                            if (angular.isFunction(failCallback)) {
                                failCallback(data, status, headers, config);
                            }
                        });
                }
            }

            function getCacheStatus() {
                var deferred = $q.defer();
                if (testing) {
                    deferred.resolve('enabled');
                } else {
                    Cache.getStatus()
                        .then(function(data) {
                            deferred.resolve(data);
                        }, function(result) {
                            deferred.reject(result);
                        });
                }
                return deferred.promise;
            }

            function updateGeneCache(hugoSymbol) {
                var deferred = $q.defer();
                if (testing) {
                    deferred.resolve();
                } else if (hugoSymbol) {
                    Cache.updateGene(hugoSymbol)
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(result) {
                            deferred.reject(result);
                        });
                } else {
                    deferred.reject();
                }
                return deferred.promise;
            }

            function getOncoTreeTumorTypesByMainType(mainType) {
                var deferred = $q.defer();
                OncoTree.getTumorTypeByMainType(mainType)
                    .success(function(data) {
                        deferred.resolve(data);
                    })
                    .error(function(result) {
                        deferred.reject(result);
                    });
                return deferred.promise;
            }

            function getRelevantCancerTypes(levelOfEvidence, cancerTypes) {
                var deferred = $q.defer();
                OncoTree.getRelevantCancerTypes(levelOfEvidence, cancerTypes)
                    .then(function(data) {
                        deferred.resolve(data);
                    }, function(result) {
                        deferred.reject(result);
                    });
                return deferred.promise;
            }

            function getIsoforms(hugoSymbol) {
                var deferred = $q.defer();
                PrivateApi.getTranscripts(hugoSymbol)
                    .then(function(data) {
                        deferred.resolve(data.data);
                    }, function(result) {
                        deferred.reject(result);
                    });
                return deferred.promise;
            }

            function updateGeneTranscript(hugoSymbol, entrezGeneId, grch37Isoform, grch37RefSeq, grch38Isoform, grch38RefSeq) {
                return PrivateApi.updateGeneTranscript(hugoSymbol, entrezGeneId, grch37Isoform, grch37RefSeq, grch38Isoform, grch38RefSeq)
            }

            function validateGeneTranscriptUpdate(hugoSymbol, entrezGeneId, grch37Isoform, grch38Isoform) {
                return PrivateApi.validateGeneTranscriptUpdate(hugoSymbol, entrezGeneId, grch37Isoform, grch38Isoform)
            }

            function getOncogeneTSG() {
                var deferred = $q.defer();
                ApiUtils.getOncogeneTSG()
                    .then(function(data) {
                        deferred.resolve(data.data);
                    }, function(result) {
                        deferred.reject(result);
                    });
                return deferred.promise;
            }

            function getSuggestedVariants() {
                var deferred = $q.defer();
                if (testing) {
                    deferred.resolve({
                        meta: '',
                        data: ['Fusion']
                    });
                } else {
                    PrivateApi.getSuggestedVariants()
                        .then(function(data) {
                            deferred.resolve(data);
                        }, function(result) {
                            deferred.reject(result);
                        });
                }
                return deferred.promise;
            }

            function isHotspot(hugoSymbol, variant) {
                var deferred = $q.defer();
                if (testing) {
                    deferred.resolve({
                        meta: '',
                        data: false
                    });
                } else {
                    PrivateApi.isHotspot(hugoSymbol, variant)
                        .then(function(data) {
                            deferred.resolve(data);
                        }, function(result) {
                            deferred.reject(result);
                        });
                }
                return deferred.promise;
            }

            function addHistoryRecord(historyData) {
                var hugoSymbol = historyData.hugoSymbol;
                delete historyData.hugoSymbol;

                var historyList = $firebaseArray(firebase.database().ref('History/' + hugoSymbol + '/api'));
                historyList.$add({
                    admin: $rootScope.me.name,
                    timeStamp: new Date().getTime(),
                    records: historyData
                }).then(function(ref) {
                    console.log('Added a new history record.');
                }, function (error) {
                    Sentry.captureException(new Exception('Failed to add a new history record for ' + hugoSymbol + '. \n\n Content: ' + JSON.stringify(historyData) + '\n\nError: \n' + JSON.stringify(error)));
                });
            }

            function lookupVariants(body) {
                var deferred = $q.defer();
                SearchVariant.lookupVariants(body)
                    .then(function(data) {
                        deferred.resolve(data);
                    }, function(result) {
                        deferred.reject(result);
                    });
                return deferred.promise;
            }
            function getTumorTypes() {
                var deferred = $q.defer();
                OncoTree.getTumorTypes()
                    .then(function(result) {
                        deferred.resolve(result.data);
                    }, function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }
            function getSubTypes() {
                var deferred = $q.defer();
                OncoTree.getSubTypes()
                    .then(function(result) {
                        deferred.resolve(result.data);
                    }, function(error) {
                        deferred.reject(error);
                    });
                return deferred.promise;
            }
            function getGeneTumorType(callback) {
                var timestamp = new Date().getTime().toString();

                numOfLocks[timestamp] = 2;
                data[timestamp] = {};

                getAllGenes(function(d) {
                    data[timestamp].genes = d.data;
                }, timestamp);
                getAllTumorType(function(d) {
                    data[timestamp].tumorTypes = d;
                }, timestamp);

                timeout(callback, timestamp);
            }


            function findAlterationsByGene(gene) {
                if (gene) {
                    return Alteration.findByGene(gene);
                } else {
                    var deferred = $q.defer();
                    deferred.reject("Need to specify gene parameter");
                    return deferred.promise;
                }
            }

            function getEvidenceLevels(success, fail) {
                DataSummary
                    .getEvidenceLevels()
                    .then(function(result) {
                        success(result.data);
                    }, function() {
                        fail();
                    });
            }

            // Public API here
            return {
                searchNCITDrugs: searchNCITDrugs,
                updateDrugPreferredName: updateDrugPreferredName,
                getGeneTumorType: getGeneTumorType,
                searchAnnotation: searchVariant,
                updateGene: updateGene,
                updateGeneType: updateGeneType,
                findAlterationsByGene: findAlterationsByGene,
                removeGeneFromDB: removeGeneFromDB,
                deleteEvidences: deleteEvidences,
                updateVUS: updateVUS,
                updateEvidenceBatch: updateEvidenceBatch,
                updateEvidenceTreatmentPriorityBatch: updateEvidenceTreatmentPriorityBatch,
                updateEvidenceRelevantCancerTypesBatch: updateEvidenceRelevantCancerTypesBatch,
                addHistoryRecord: addHistoryRecord,
                getCacheStatus: getCacheStatus,
                updateGeneCache: function(hugoSymbol) {
                    return updateGeneCache(hugoSymbol);
                },
                getAllGenes: function() {
                    if ($rootScope.internal) {
                        return Gene.getAllInternalGenes();
                    } else {
                        return Gene.getCurationGenes();
                    }
                },
                getAllInternalGenes: getAllInternalGenes,
                getOncoTreeTumorTypesByMainType: getOncoTreeTumorTypesByMainType,
                getRelevantCancerTypes: getRelevantCancerTypes,
                testAccess: testAccess,
                getIsoforms: getIsoforms,
                updateGeneTranscript: updateGeneTranscript,
                validateGeneTranscriptUpdate: validateGeneTranscriptUpdate,
                getOncogeneTSG: getOncogeneTSG,
                getSuggestedVariants: getSuggestedVariants,
                isHotspot: isHotspot,
                getEvidencesByUUID: getEvidencesByUUID,
                getEvidencesByUUIDs: getEvidencesByUUIDs,
                getEvidencesByType: function(evidenceType) {
                    return DataSummary.getEvidenceByType(evidenceType);
                },
                getPubMedArticle: getPubMedArticle,
                getReviewedData: getReviewedData,
                lookupVariants: lookupVariants,
                getTumorTypes: getTumorTypes,
                getSubTypes: getSubTypes,
                getEvidenceLevels: getEvidenceLevels,
                getDataValidateWebSocket: function(){
                    return DataValidation.getWebSocket();
                },
            };
        }]);
