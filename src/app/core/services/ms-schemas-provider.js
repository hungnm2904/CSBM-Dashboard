(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msSchemasService', msSchemasServiceProvider);

    function msSchemasServiceProvider() {
        var $rootScope = angular.injector(['ng']).get('$rootScope');

        var _schemas = [];

        this.$get = function($rootScope, $http, $cookies, msConfigService,
            msMasterKeyService, msUserService) {

            var _domain = (msConfigService.getConfig()).domain;

            var service = {
                setSchemas: setSchemas,
                getSchemas: getSchemas,
                getSchema: getSchema,
                createSchema: createSchema,
                addSchema: addSchema,
                setDocuments: setDocuments,
                getDocuments: getDocuments,
                createDocument: createDocument,
                addField: addField,
                deleteDocuments: deleteDocuments,
                deleteField: deleteField,
                updateValues: updateValues,
                changeField: changeField
            }

            return service;

            function setSchemas(appId, index, schemas) {
                _schemas = schemas;
                _schemas.forEach(function(schema) {
                    delete schema.fields.ACL;
                });

                if (!index || index > _schemas.length - 1) {
                    index = 0;
                }

                $rootScope.$broadcast('schemas-changed', { 'appId': appId, 'index': index });
            };

            function getSchemas(appId, index, callback) {
                if (_schemas && _schemas.length > 0) {
                    return callback(null, _schemas);
                }

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
                        setSchemas(appId, index, response.data.results);
                        callback(null, _schemas);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function getSchema(appId, index, callback) {
                if (_schemas && _schemas.length > 0) {
                    if (index > _schemas.length - 1) {
                        index = 0;
                    }
                    return callback(null, _schemas[index]);
                }

                service.getSchemas(appId, index, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    callback(null, _schemas[index]);
                });
            };

            function createSchema(className, appId, callback) {
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'POST',
                        url: _domain + '/csbm/schemas/' + className,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        },
                        data: {
                            'className': className
                        }
                    }).then(function(response) {
                        addSchema(appId, response.data);
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function addSchema(appId, schema) {
                delete schema.fields.ACL
                _schemas.push(schema);
                var index = _schemas.length - 1;
                $rootScope.$broadcast('schemas-changed', { 'appId': appId, 'index': index });
            };

            function setDocuments(className, documents) {
                _schemas.forEach(function(schema, index) {
                    if (schema.className === className) {
                        return schema.documents = documents
                    }
                });
            };

            function getDocuments(appId, className, limit, skip, callback) {
                $http({
                    method: 'GET',
                    url: _domain + '/csbm/classes/' + className + '?limit=' + limit + '&count=1&order=-updatedAt&skip=' + skip,
                    headers: {
                        'X-CSBM-Application-Id': appId
                    }
                }).then(function(response) {
                    var documents = response.data.results;
                    var count = response.data.count;

                    setDocuments(className, documents);
                    callback(null, documents, count);
                }, function(response) {
                    callback(response);
                });
            };

            function addDocument(className, _document) {
                _schemas.forEach(function(schema, index) {
                    if (schema.className === className) {
                        return schema.documents.push(_document);
                    }
                });
            }

            function createDocument(className, appId, data, callback) {
                $http({
                    method: 'POST',
                    url: _domain + '/csbm/classes/' + className,
                    headers: {
                        'X-CSBM-Application-Id': appId,
                        'Content-Type': 'application/json'
                    },
                    data: data
                }).then(function(response) {
                    var _document = response.data;
                    _document.updatedAt = _document.createdAt;
                    Object.assign(_document, data);
                    addDocument(className, _document);
                    callback(null, _document);
                }, function(response) {
                    callback(response);
                });
            };

            function deleteDocuments(className, appId, objectIds, callback) {
                var data = {
                    'requests': []
                };

                objectIds.forEach(function(objectId, index) {
                    data.requests.push({
                        'method': 'DELETE',
                        'path': '/csbm/classes/' + className + '/' + objectId
                    });
                });

                $http({
                    method: 'POST',
                    url: _domain + '/csbm/batch',
                    headers: {
                        'X-CSBM-Application-Id': appId
                    },
                    data: data
                }).then(function(response) {
                    callback(null, objectIds);
                }, function(response) {
                    callback(response);
                });
            };

            function addField(className, appId, columnName, type, callback) {
                var accessToken = msUserService.getAccessToken();

                var data = {
                    'className': className,
                    'fields': {}
                }
                data.fields[columnName] = {
                    'type': type
                }

                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'PUT',
                        url: _domain + '/csbm/schemas/' + className,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        },
                        data: data
                    }).then(function(response) {
                        var schema = response.data;

                        updateField(schema);
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function deleteField(className, appId, columnName, callback) {
                var accessToken = msUserService.getAccessToken();

                var data = {
                    'className': className,
                    'fields': {}
                }
                data.fields[columnName] = {
                    '__op': 'Delete'
                }

                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'PUT',
                        url: _domain + '/csbm/schemas/' + className,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        },
                        data: data
                    }).then(function(response) {
                        var schema = response.data;

                        updateField(schema);
                        callback(null, schema);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function updateField(schema) {
                delete schema.fields.ACL;
                var className = schema.className;
                var fields = schema.fields

                _schemas.forEach(function(schema, index) {
                    if (schema.className === className) {
                        $rootScope.$broadcast('fields-change', { 'fields': fields })
                        return schema.fields = fields;
                    }
                });
            };

            function updateFieldName(className, appId, callback) {
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/schemas/' + className,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey,
                        }
                    }).then(function(response) {
                        console.log(response);
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            }

            function updateValues(className, appId, objectId, data, callback) {
                $http({
                    method: 'PUT',
                    url: _domain + '/csbm/classes/' + className + '/' + objectId,
                    headers: {
                        'X-CSBM-Application-Id': appId,
                        'Content-Type': 'application/json'
                    },
                    data: data
                }).then(function(response) {
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

            function changeField(applicationName, className, fieldName, newFieldName, appId,
                callback) {

                var accessToken = msUserService.getAccessToken();
                $http({
                    method: 'POST',
                    url: _domain + '/fields',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    },
                    data: {
                        applicationName: applicationName,
                        className: className,
                        fieldName: fieldName,
                        newFieldName: newFieldName
                    },
                }).then(function(response) {
                    updateFieldName(className, appId, function(error, results) {
                        updateField(results);
                    });
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            }
        };
    };
})();
