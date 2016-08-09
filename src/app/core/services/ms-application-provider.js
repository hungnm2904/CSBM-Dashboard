(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msApplicationService', msApplicationServiceProvider);

    function msApplicationServiceProvider() {
        var _applications = [];
        // var service = this;
        this.$get = function($http, $state, $cookies, msConfigService, msUserService,
            msMasterKeyService) {

            var _domain = (msConfigService.getConfig()).domain;
            var service = {
                applications: applications,
                getAll: getAll,
                clearApplications: clearApplications,
                create: create,
                remove: remove,
                update: update,
                getMasterkey: getMasterkey,
                getAppName: getAppName,
                getAppId: getAppId,
                getCollaborators: getCollaborators,
                checkUserExistById: checkUserExistById,
                countTotalClasses: countTotalClasses
            };

            return service;

            function _setApplications(applications) {
                applications.forEach(function(application, index) {
                    _applications.push(application);
                });
            };

            function _add(application) {
                _applications.push(application);
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
        };
    };
})();
