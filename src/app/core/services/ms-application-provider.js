(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msApplicationService', msApplicationServiceProvider);

    function msApplicationServiceProvider() {
        var _applications = [];
        const defaultColumns = Object.freeze({
            // Contain the default columns for every parse object type (except _Join collection)
            _Default: {
                "objectId": { type: 'String' },
                "createdAt": { type: 'Date' },
                "updatedAt": { type: 'Date' },
                "ACL": { type: 'ACL' },
            },
            // The additional default columns for the _User collection (in addition to DefaultCols)
            _User: {
                "username": { type: 'String' },
                "password": { type: 'String' },
                "email": { type: 'String' },
                "emailVerified": { type: 'Boolean' },
            },
            // The additional default columns for the _Installation collection (in addition to DefaultCols)
            _Installation: {
                "installationId": { type: 'String' },
                "deviceToken": { type: 'String' },
                "channels": { type: 'Array' },
                "deviceType": { type: 'String' },
                "pushType": { type: 'String' },
                "GCMSenderId": { type: 'String' },
                "timeZone": { type: 'String' },
                "localeIdentifier": { type: 'String' },
                "badge": { type: 'Number' },
                "appVersion": { type: 'String' },
                "appName": { type: 'String' },
                "appIdentifier": { type: 'String' },
                "parseVersion": { type: 'String' },
            },
            // The additional default columns for the _Role collection (in addition to DefaultCols)
            _Role: {
                "name": { type: 'String' },
                "users": { type: 'Relation', targetClass: '_User' },
                "roles": { type: 'Relation', targetClass: '_Role' }
            },
            // The additional default columns for the _Session collection (in addition to DefaultCols)
            _Session: {
                "restricted": { type: 'Boolean' },
                "user": { type: 'Pointer', targetClass: '_User' },
                "installationId": { type: 'String' },
                "sessionToken": { type: 'String' },
                "expiresAt": { type: 'Date' },
                "createdWith": { type: 'Object' }
            },
            _Product: {
                "productIdentifier": { type: 'String' },
                "download": { type: 'File' },
                "downloadName": { type: 'String' },
                "icon": { type: 'File' },
                "order": { type: 'Number' },
                "title": { type: 'String' },
                "subtitle": { type: 'String' },
            },
            _PushStatus: {
                "pushTime": { type: 'String' },
                "source": { type: 'String' }, // rest or webui
                "query": { type: 'String' }, // the stringified JSON query
                "payload": { type: 'Object' }, // the JSON payload,
                "title": { type: 'String' },
                "expiry": { type: 'Number' },
                "status": { type: 'String' },
                "numSent": { type: 'Number' },
                "numFailed": { type: 'Number' },
                "pushHash": { type: 'String' },
                "errorMessage": { type: 'Object' },
                "sentPerType": { type: 'Object' },
                "failedPerType": { type: 'Object' },
            }
        });
        // var service = this;
        this.$get = function($http, $state, $cookies, msConfigService, msUserService,
            msMasterKeyService) {

            var _domain = (msConfigService.getConfig()).domain;
            var service = {
                applications: applications,
                getAll: getAll,
                getById: getById,
                clearApplications: clearApplications,
                create: create,
                remove: remove,
                update: update,
                getMasterkey: getMasterkey,
                getAppName: getAppName,
                getAppId: getAppId,
                getCollaborators: getCollaborators,
                checkUserExistById: checkUserExistById,
                countTotalClasses: countTotalClasses,
                cloneApplication: cloneApplication
            };

            return service;

            function _setApplications(applications) {
                applications.forEach(function(application, index) {
                    _applications.push(application);
                });
            };

            function _add(application) {
                _applications.unshift(application);
            };

            function _updateApplication(id, data) {
                _applications.some(function(application, index) {
                    if (application._id === id) {
                        for (var key in data) {
                            application[key] = angular.copy(data[key]);
                        }

                        return true;
                    }

                });
            };

            function _removeApplication(id) {
                _applications.some(function(application, index) {
                    if (application._id === id) {
                        _applications.splice(index, 1);

                        return true;
                    }
                });
            }

            function applications() {
                return _applications;
            };

            function getAll(callback) {
                if (_applications && _applications.length > 0) {
                    return callback(null, _applications);
                }

                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/applications',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    _setApplications(response.data);
                    callback(null);
                }, function(response) {
                    callback(response);
                });
            };

            function _getByIdLocal(appId, callback) {
                _applications.some(function(application, index) {
                    if (application._id === appId) {
                        callback(null, application);

                        return true;
                    }
                });
            }

            function getById(appId, callback) {
                if (_applications && _applications.length > 0) {
                    return _getByIdLocal(appId, callback);
                }
            }

            function clearApplications() {
                _applications = [];
            };

            function create(name, callback) {
                var data = {
                    "applicationName": name
                }
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'POST',
                    url: _domain + '/applications/',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: data
                }).then(function(response) {
                    _add(response.data);
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

            function _remove(id, password, callback) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'DELETE',
                    url: _domain + '/applications/',
                    headers: {
                        'X-CSBM-Application-Id': id,
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: {
                        "password": password
                    }
                }).then(function(response) {
                    _removeApplication(id);
                    callback(null, _applications);
                }, function(response) {
                    callback(response);
                });
            };

            function remove(id, appName, password, callback) {
                if (!id) {
                    getAppId(appName, function(error, results) {
                        id = results.appId;
                        _remove(id, password, callback);
                    });
                } else {
                    _remove(id, password, callback);
                }
            };

            function _update(id, data, callback) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'PUT',
                    url: _domain + '/applications/' + id,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: data
                }).then(function(response) {
                    _updateApplication(id, data);
                    callback(null, response);
                }, function(response) {
                    callback(response);
                });
            };

            function update(id, appName, data, callback) {
                if (!id) {
                    getAppId(appName, function(error, results) {
                        if (error) {
                            return callback(error);
                        }
                        id = results.appId;
                        _update(id, data, callback);
                    });
                } else {
                    _update(id, data, callback);
                }
            };

            function getMasterkey(id, callback) {

                console.log('~~>' + id);

                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/masterKey',
                    headers: {
                        'X-CSBM-Application-Id': id,
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    callback(null, response);
                }, function(response) {
                    callback(response);
                });
            };

            function getAppName(id, callback) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/appName',
                    headers: {
                        'X-CSBM-Application-Id': id,
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    callback(null, response);
                }, function(response) {
                    callback(response);
                });
            };

            function getAppId(appName, callback) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/appId',
                    headers: {
                        'X-CSBM-Application-Name': appName,
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

            function _getCollaborators(id, callback) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/applications/collaborators/' + id,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

            function getCollaborators(id, appName, callback) {
                if (!id) {
                    getAppId(appName, function(error, results) {
                        if (error) {
                            return callback(error);
                        }
                        id = results.appId;
                        _getCollaborators(id, callback);
                    });
                } else {
                    _getCollaborators(id, callback);
                }
            };

            function checkUserExistById(appId, id, callback) {

                console.log('checkUserExistById: ' + appId);

                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/users/' + id,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        }
                    }).then(function(response) {
                        callback(null, response);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function countTotalClasses(appId, callback) {
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/schemas',
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        }
                    }).then(function(response) {
                        callback(null, response.data.results.length);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function _fieldNameIsValidForClass(fieldName, className) {
                if (defaultColumns._Default[fieldName]) {
                    return false;
                }
                if (defaultColumns[className] && defaultColumns[className][fieldName]) {
                    return false;
                }
                return true;
            }

            function _cloneApplicationSchema(appId, clonedMasterKey, schemas, callback) {
                var data = {
                    'requests': []
                };

                schemas.forEach(function(schema, index) {
                    var className = schema.className;
                    var fields = schema.fields;

                    for (var fieldName in fields) {
                        if (!_fieldNameIsValidForClass(fieldName, className)) {
                            delete fields[fieldName];
                        };
                    };

                    data.requests.push({
                        'method': 'POST',
                        'path': '/csbm/schemas/' + className,
                        'body': {
                            'className': className,
                            'fields': fields
                        }
                    });
                });

                $http({
                    method: 'POST',
                    url: _domain + '/csbm/batch',
                    headers: {
                        'X-CSBM-Application-Id': appId,
                        'X-CSBM-Master-Key': clonedMasterKey
                    },
                    data: data
                }).then(function(response) {
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

            function _cloneApplicationData(appId, cloneId, masterKey, clonedMasterKey, schemas, callback) {
                schemas.forEach(function(schema, index) {
                    var className = schema.className;
                    if (className !== '_Session') {
                        var url = _domain + '/csbm/classes/' + className + '?order=-createdAt';
                        $http({
                            method: 'GET',
                            url: url,
                            headers: {
                                'X-CSBM-Application-Id': appId,
                                'X-CSBM-Master-Key': masterKey
                            }
                        }).then(function(response) {
                            var documents = response.data.results;

                            documents.forEach(function(_document) {
                                delete _document.objectId;
                                delete _document.createdAt;
                                delete _document.updatedAt;

                                $http({
                                    method: 'POST',
                                    url: _domain + '/csbm/classes/' + className,
                                    headers: {
                                        'X-CSBM-Application-Id': cloneId,
                                        'X-CSBM-Master-Key': clonedMasterKey,
                                        'Content-Type': 'application/json'
                                    },
                                    data: _document
                                }).then(function(response) {

                                }, function(response) {
                                    callback(response);
                                });
                            });
                        }, function(response) {});
                    }
                    if (index === schemas.length - 1) {
                        return callback(null, null);
                    }
                });
            };

            function _cloneApplication(appId, cloneName, mode, callback) {
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/schemas',
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        }
                    }).then(function(response) {
                        var schemas = response.data.results;

                        create(cloneName, function(error, results) {
                            if (error) {
                                callback(error);
                            } else {
                                var cloneId = results._id;

                                msMasterKeyService.getMasterKey(cloneId, function(error, results) {
                                    if (error) {
                                        return callback(error);
                                    }

                                    var clonedMasterKey = results;

                                    if (mode === 'Schema only') {
                                        _cloneApplicationSchema(cloneId, clonedMasterKey, schemas, callback);
                                    } else {
                                        _cloneApplicationSchema(cloneId, clonedMasterKey, schemas,
                                            function(error, results) {
                                                if (error) {
                                                    return callback(error);
                                                }

                                                _cloneApplicationData(appId, cloneId, masterKey, clonedMasterKey, schemas, callback);
                                            });
                                    }
                                });
                            }
                        });
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function cloneApplication(appId, appName, cloneName, mode, callback) {
                if (!appId) {
                    getAppId(appName, function(error, results) {
                        appId = results.appId;
                        _cloneApplication(appId, cloneName, mode, callback);
                    });
                } else {
                    _cloneApplication(appId, cloneName, mode, callback);
                }
            };
        };
    };
})();
