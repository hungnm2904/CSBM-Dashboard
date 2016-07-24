(function() {
    'use strict';

    angular
        .module('app.application.query')
        .controller('QueryController', function($scope, $element, $state, $stateParams, $http,
            msUserService, msSchemasService, msApplicationService, msConfigService,
            msMasterKeyService) {

            var copyToClipboardAndroid = new Clipboard('#android-code-copy-button', {
                text: function(trigger) {
                    var copiedCodeString = document.getElementById('android-code-string').innerText;
                    return copiedCodeString;
                }
            });

            var copyToClipboardiOS = new Clipboard('#swift-code-copy-button', {
                text: function(trigger) {
                    var copiedCodeString = document.getElementById('swift-code-string').innerText;
                    return copiedCodeString;
                }
            });

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }


            var appName = $stateParams.appName;
            var appId = msSchemasService.getAppId();
            var filterOperationsWithInput = ['equals', 'does not equal', 'starts with'];
            var swiftOperationWithoutValue = ['exists', 'does not exist'];
            var _domain = (msConfigService.getConfig()).domain;

            $scope.filterCriteria = [{
                field: '',
                operation: 'exists',
            }];
            $scope.stringFilterOperations = ['exists', 'does not exist', 'equals', 'does not equal', 'starts with'];
            $scope.numberFilterOperations = ['exists', 'does not exist', 'equals', 'does not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal'];
            $scope.datetimeFilterOperations = ['exists', 'does not exist', 'is before', 'is after'];
            $scope.booleanFilterOperations = ['exists', 'does not exist', 'equals'];

            var getSchemas = function() {
                msSchemasService.getSchemas(appId, appName, null, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    $scope.schemas = results;
                });
            };

            if (appId) {
                getSchemas();
            } else {
                msApplicationService.getAppId(appName, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    appId = results.appId;
                    getSchemas();
                });
            }

            var convertToType = function(value, type, callback) {
                if (value) {
                    if (type === 'Number') {
                        if (!Number(value) && value) {
                            return callback(true, null);
                        } else {
                            value = Number(value);
                        }
                    }

                    if (type === 'Array' && value.length > 0) {

                        value = value.split(',');
                        value = value.map(function(v) {
                            return v.trim();
                        });
                    }
                }

                return callback(null, value);
            };

            var filter = function(filterCriteria) {
                var fields = $scope.schema.fields;
                var preparedCriteria = {};
                filterCriteria.forEach(function(criteria, index) {
                    var field = criteria.field;
                    if (fields[field]) {
                        convertToType(criteria.value, fields[field].type,
                            function(error, results) {

                                if (error) {
                                    console.log(error);
                                }

                                var value = results;

                                if (criteria.operation === 'exists') {
                                    preparedCriteria[field] = {
                                        '$exists': true
                                    }
                                } else if (criteria.operation === 'does not exist') {
                                    preparedCriteria[field] = {
                                        '$exists': false
                                    }
                                } else if (criteria.operation === 'does not equal') {
                                    preparedCriteria[field] = {
                                        '$ne': value
                                    }
                                } else if (criteria.operation === 'starts with') {
                                    preparedCriteria[field] = {
                                        '$regex': '^' + value
                                    }
                                } else {
                                    preparedCriteria[criteria.field] = value;
                                }
                            });
                    }
                });

                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/classes/' + $scope.schema.className + '?where=' + JSON.stringify(preparedCriteria),
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        }
                    }).then(function(response) {
                        $scope.documents = response.data.results;
                        console.log($scope.documents);
                    }, function(response) {
                        console.log(response);
                    });

                });
            };

            $scope.changeTable = function() {
                $scope.fields = [];
                $scope.clearAllFilterCriteria();
                $scope.addFilterCriteria(undefined);
            };

            $scope.operationWithInput = function(operation) {
                if (filterOperationsWithInput.includes(operation)) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.clearAllFilterCriteria = function() {
                $scope.filterCriteria.splice(0, $scope.filterCriteria.length);
            };

            $scope.addFilterCriteria = function(field) {
                if (!field) {
                    $scope.filterCriteria.push({
                        field: '',
                        operation: 'exists',
                    });
                }
            };

            $scope.deleteCriteria = function(field) {
                $scope.filterCriteria.some(function(criteria, index) {
                    if (criteria.field === field) {
                        $scope.filterCriteria.splice(index, 1);
                        return true;
                    }
                });
            };

            $scope.filter = function() {
                filter($scope.filterCriteria);
            };

            $scope.getAndroidConstraints = function(operation) {
                var keyword = ''
                switch (operation) {
                    case "equals":
                        keyword = "whereEqualTo";
                        break;
                    case "does not equal":
                        keyword = "whereNotEqualTo";
                        break;
                    case "exists":
                        keyword = "whereExists";
                        break;
                    case "does not exist":
                        keyword = "whereDoesNotExist";
                        break;
                }

                return keyword;
            };

            $scope.checkIfSwiftOperationWithValue = function(operation) {
                if (swiftOperationWithoutValue.includes(operation)) {
                    return false;
                } else {
                    return true;
                }
            };

            $scope.getSwiftConstraints = function(operation) {
                var keyword = ''
                switch (operation) {
                    case "equals":
                        keyword = "equalTo";
                        break;
                    case "does not equal":
                        keyword = "notEqualTo";
                        break;
                    case "exists":
                        keyword = "whereKeyExists";
                        break;
                    case "does not exist":
                        keyword = "whereDoesNotExist";
                        break;
                }

                return keyword;
            };
        });
})();
