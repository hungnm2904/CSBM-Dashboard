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
                createDocuments: createDocuments,
                addField: addField,
                deleteDocuments: deleteDocuments,
                deleteField: deleteField,
                updateValues: updateValues,
                changeFieldName: changeFieldName,
                filter: filter
            }

            return service;

            function setSchemas(appId, className, schemas) {
                _schemas = schemas;
                _schemas.forEach(function(schema) {
                    delete schema.fields.ACL;
                });

                $rootScope.$broadcast('schemas-changed', { 'appId': appId, 'className': className });
            };

            function getSchemas(appId, className, callback) {
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
                        setSchemas(appId, className, response.data.results);
                        callback(null, _schemas);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function getSchema(appId, className, callback) {
                if (_schemas && _schemas.length > 0) {
                    _schemas.some(function(schema) {
                        if (schema.className === className) {
                            callback(null, schema);

                            return true;
                        }
                    });
                }

                service.getSchemas(appId, className, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    _schemas.some(function(schema) {
                        if (schema.className === className) {
                            callback(null, schema);

                            return true;
                        }
                    });
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
                var findInLocal = false;
                _schemas.some(function(schema, index) {
                    if (schema.className === className) {
                        if (schema.documents) {
                            callback(null, _schemas[index].documents, null);
                            findInLocal = true;
                            return true;
                        }
                    }
                });

                if (findInLocal) {
                    return true;
                }

                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    var url = _domain + '/csbm/classes/' + className;

                    if (limit != null && skip != null) {
                        url = url + '?limit=' + limit + '&count=1&order=-updatedAt&skip=' + skip;
                    }

                    $http({
                        method: 'GET',
                        // url: _domain + '/csbm/classes/' + className + '?limit=' + limit + '&count=1&order=-updatedAt&skip=' + skip,
                        url: url,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        }
                    }).then(function(response) {
                        var documents = response.data.results;
                        var count = response.data.count;

                        setDocuments(className, documents);
                        callback(null, documents, count);
                    }, function(response) {
                        callback(response);
                    });
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
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'POST',
                        url: _domain + '/csbm/classes/' + className,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey,
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
                });
            };

            function createDocuments(appId, className, documents, callback) {

                var data = {
                    'requests': []
                };

                documents.forEach(function(_document, index) {
                    delete _document.objectId;
                    delete _document.createdAt;
                    delete _document.updatedAt;
                    data.requests.push({
                        'method': 'POST',
                        'path': '/csbm/classes/' + className,
                        'body': _document
                    });
                });

                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'POST',
                        url: _domain + '/csbm/batch',
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        },
                        data: data
                    }).then(function(response) {
                        callback(null, response);
                    }, function(response) {
                        callback(response);
                    });
                });
            }

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
                        _schemas.forEach(function(schema) {
                            if (schema.className === className) {
                                schema.fields[columnName] = {
                                    'type': type
                                };
                            }
                        });

                        // updateField(schema);
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
                        _schemas.forEach(function(schema) {
                            if (schema.className === className) {
                                delete schema.fields[columnName];
                            }
                        });
                        callback(null, response.data);
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
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            }

            function updateValues(className, appId, objectId, field, data, callback) {
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'PUT',
                        url: _domain + '/csbm/classes/' + className + '/' + objectId,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        },
                        data: data
                    }).then(function(response) {
                        _schemas.forEach(function(schema) {
                            if (schema.className === className) {
                                var documents = schema.documents;
                                documents.forEach(function(_document) {
                                    if (_document.objectId === objectId) {
                                        return _document[field] = data[field];
                                    }
                                });
                            }
                        });
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function changeFieldName(applicationName, className, fieldName, newFieldName, appId,
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
                    _schemas.forEach(function(schema) {
                        if (schema.className === className) {
                            schema.fields[newFieldName] = schema.fields[fieldName];
                            delete schema.fields[fieldName];

                            schema.documents.forEach(function(_document) {
                                _document[newFieldName] = _document[fieldName];
                                delete _document[fieldName]
                            });

                            return;
                        }
                    });

                    // updateFieldName(className, appId, function(error, results) {
                    //     updateField(results);
                    // });
                    callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };

            function filter(appId, className, filterCriteria, callback) {
                $http({
                    method: 'GET',
                    url: _domain + '/csbm/classes/' + className + '?where=' + JSON.stringify(filterCriteria),
                    headers: {
                        'X-CSBM-Application-Id': appId
                    }
                }).then(function(response) {
                    _schemas.some(function(schema, index) {
                        if (schema.className === className) {
                            var filteredDocuments = response.data.results;
                            if (schema.documents && schema.documents.length > 0) {
                                schema.documents.splice(0, schema.documents.length);
                                filteredDocuments.forEach(function(_document) {
                                    schema.documents.push(_document);
                                });
                            } else {
                                schema.documents = filteredDocuments;
                            }

                            callback(null, schema);
                            return true;
                        }
                    });

                    // callback(null, response.data);
                }, function(response) {
                    callback(response);
                });
            };
        };
    };
})();
