(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msApplicationService', msApplicationServiceProvider);

    function msApplicationServiceProvider() {
        var _applications = [];
        // var service = this;
        this.$get = function($http, $state, $cookies, msConfigService,
            msUserService) {

            var _domain = (msConfigService.getConfig()).domain;


            var service = {
                applications: applications,
                getAll: getAll,
                create: create,
                remove: remove,
                getMasterkey: getMasterkey,
                getAppName: getAppName
            };

            return service;

            function applications() {
                return _applications;
            };

            function setApplications(applications) {
                // _applications = applications;
                applications.forEach(function(application, index){
                    _applications.push(application);
                });
            };

            function removeApplication(id) {
                _applications.forEach(function(application, index) {
                    if (application._id === id) {
                        return _applications.splice(index, 1);
                    }
                });
            }

            function add(application) {
                _applications.push(application);
                // $rootScope.$broadcast('app-added', { 'app': application })
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
                    setApplications(response.data);
                    callback(null);
                }, function(response) {
                    callback(response);
                });
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
                    add(response.data);
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

            function remove(id, callback) {
                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'DELETE',
                    url: _domain + '/applications/',
                    headers: {
                        'X-CSBM-Application-Id': id,
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    removeApplication(id);
                    callback(null, _applications);
                }, function(response) {
                    callback(response);
                });
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
            }
        };
    };
})();
