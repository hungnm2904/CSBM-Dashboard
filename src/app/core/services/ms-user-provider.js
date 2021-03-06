(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msUserService', msUserServiceProvider);

    function msUserServiceProvider() {
        // var $rootScope = angular.injector(['ng']).get('$rootScope');

        var _currentUser;

        this.$get = function($http, $cookies, msConfigService) {

            var _domain = (msConfigService.getConfig()).domain;

            var service = {
                login: login,
                logout: logout,
                register: register,
                getCurrentUser: getCurrentUser,
                getAccessToken: getAccessToken,
                getCurrentEmail: getCurrentEmail,
                getCurrentRole: getCurrentRole,
                removeCurrentUser: removeCurrentUser,
                getCollaborations: getCollaborations,
                checkPassword: checkPassword
            }

            return service;

            function login(email, password, callback) {
                $http({
                    method: 'POST',
                    url: _domain + '/login',
                    data: {
                        email: email,
                        password: password
                    }
                }).then(function(response) {
                    var user = {
                        'userId': response.data.data.userId,
                        'role': response.data.data.role,
                        'email': response.data.data.email,
                        'accessToken': response.data.data.token
                    }

                    var expiresDate = new Date();
                    expiresDate.setDate(expiresDate.getDate() + 1);
                    $cookies.putObject('USER', user, { expires: expiresDate });
                    _setCurrentUser(user);

                    callback(null, _currentUser);
                }, function(response) {
                    callback(response);
                });
            };

            function logout(callback) {
                var accessToken = getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/signout',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    removeCurrentUser();
                    callback(null, response);
                }, function(response) {
                    callback(response);
                });
            };

            function register(email, password, role, callback) {
                $http({
                    method: 'POST',
                    url: _domain + '/signup',
                    data: {
                        email: email,
                        password: password,
                        role: role || undefined
                    }
                }).then(function(response) {
                    callback(response);
                }, function(response) {
                    callback(response);
                });
            };

            function getCurrentUser() {
                if (_currentUser) {
                    return _currentUser;
                }

                var user = $cookies.getObject('USER');
                if (user) {
                    _setCurrentUser(user);
                    return _currentUser;
                }

                return null;
            };

            function _setCurrentUser(user) {
                _currentUser = user;
            };

            function getAccessToken() {
                if (_currentUser) {
                    return _currentUser.accessToken;
                }

                var user = $cookies.getObject('USER');
                if (user) {
                    _setCurrentUser(user);
                    return _currentUser.accessToken;
                }

                return null;
            }

            function getCurrentEmail() {
                if (_currentUser) {
                    return _currentUser.email;
                }

                var user = $cookies.getObject('USER');
                if (user) {
                    _setCurrentUser(user);
                    return _currentUser.email;
                }

                return null;
            };

            function getCurrentRole() {
                if (_currentUser) {
                    return _currentUser.role;
                }

                var user = $cookies.getObject('USER');
                if (user) {
                    _setCurrentUser(user);
                    return _currentUser.role;
                }

                return null;
            };

            function removeCurrentUser() {
                _currentUser = null;
                $cookies.remove('USER');
            };

            function getCollaborations(callback) {
                var accessToken = getAccessToken();
                $http({
                    method: 'GET',
                    url: _domain + '/collaborations',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }).then(function(response) {
                    callback(null, response.data.data);
                }, function(response) {
                    callback(response);
                });
            };

            function checkPassword(password, callback) {
                var accessToken = getAccessToken();
                $http({
                    method: 'POST',
                    url: _domain + '/checkPassword',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: {
                        password: password
                    }
                }).then(function(response) {
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

        };
    };
})();
