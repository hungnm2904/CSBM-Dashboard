(function() {
    'use strict';

    angular
        .module('app.core')
        .provider('msSchemasService', msSchemasServiceProvider);

    function msSchemasServiceProvider() {
        var $rootScope = angular.injector(['ng']).get('$rootScope');

        var _appId = '';
        var _schemas = [];

        this.$get = function($rootScope, $http, $cookies, msConfigService, msMasterKeyService,
            msUserService, msApplicationService) {

            var _domain = (msConfigService.getConfig()).domain;

            var service = {
                setSchemas: setSchemas,
                getSchemasFromLocal: getSchemasFromLocal,
                getSchemasFromServer: getSchemasFromServer,
                getSchemas: getSchemas,
                getClassNames: getClassNames,
                clearSchemas: clearSchemas,
                getSchemaFromLocal: getSchemaFromLocal,
                getSchemaFromServer: getSchemaFromServer,
                getSchema: getSchema,
                setDocuments: setDocuments,
                getDocumentsFromServer: getDocumentsFromServer,
                getDocuments: getDocuments,
                getAppId: getAppId,
                setAppId: setAppId,
                createSchema: createSchema,
                addSchema: addSchema,
                createDocument: createDocument,
                createDocuments: createDocuments,
                addField: addField,
                deleteDocuments: deleteDocuments,
                deleteField: deleteField,
                updateValues: updateValues,
                changeFieldName: changeFieldName,
                filter: filter,
                deleteClass: deleteClass,
                countObjectInClass: countObjectInClass,
                getRelation: getRelation
            }

            return service;

            function setSchemas(appId, appName, className, schemas) {
                _schemas = schemas;
                _appId = appId;
            };

            function getSchemasFromLocal(callback) {
                return callback(null, _schemas);
            };

            function getSchemasFromServer(appId, appName, className, callback) {
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
                        setSchemas(appId, appName, className, response.data.results);
                        callback(null, response.data.results);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function getSchemas(appId, appName, className, callback) {
                if (_schemas.length > 0 && _appId === appId) {
                    getSchemasFromLocal(callback);
                } else {
                    getSchemasFromServer(appId, appName, className, callback);
                }
            };

            function getClassNames(appId, appName, className, callback) {
                getSchemas(appId, appName, className, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var classNames = [];
                    results.forEach(function(schema, index) {
                        classNames.push(schema.className);
                    });

                    callback(null, classNames);
                });
            }

            function getSchemaFromLocal(className, callback) {
                _schemas.some(function(schema) {
                    if (schema.className === className) {
                        callback(null, schema);

                        return true;
                    }
                });
            };

            function getSchemaFromServer(appId, appName, className, callback) {
                getSchemasFromServer(appId, appName, className, function(error, results) {
                    if (error) {
                        callback(error);
                    } else {
                        getSchemaFromLocal(className, callback);
                    }
                });
            };

            function getSchema(appId, appName, className, callback) {
                if (appId) {
                    if (_schemas.length > 0 && _appId === appId) {
                        getSchemaFromLocal(className, callback);
                    } else {
                        getSchemasFromServer(appId, appName, className, function(error, results) {
                            if (error) {
                                callback(error);
                            } else {
                                getSchemaFromLocal(className, callback);
                            }
                        });
                    }
                } else {
                    if (_appId) {
                        getSchemaFromLocal(className, callback);
                    } else {
                        msApplicationService.getAppId(appName, function(error, results) {
                            if (error) {
                                return callback(error);
                            }

                            appId = results.appId;
                            getSchemasFromServer(appId, appName, className, function(error, results) {
                                if (error) {
                                    return callback(error);
                                }

                                getSchemaFromLocal(className, callback);
                            });
                        });
                    }
                }
            };

            function clearSchemas() {
                _schemas = [];
            };

            function getAppId() {
                return _appId;
            };

            function setAppId(appId) {
                _appId = appId;
            }

            function createSchema(className, appName, callback) {
                msMasterKeyService.getMasterKey(_appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'POST',
                        url: _domain + '/csbm/schemas/' + className,
                        headers: {
                            'X-CSBM-Application-Id': _appId,
                            'X-CSBM-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        },
                        data: {
                            'className': className
                        }
                    }).then(function(response) {
                        addSchema(appName, response.data);
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function addSchema(appName, schema) {
                _schemas.push(schema);

                $rootScope.$broadcast('schemas-changed', { 'appId': _appId, 'appName': appName });
            };

            function setDocuments(className, documents) {
                _schemas.forEach(function(schema, index) {
                    if (schema.className === className) {
                        return schema.documents = documents
                    }
                });
            };

            function getDocumentsFromServer(appId, className, callback) {
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
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
                        var count = response.data.count;

                        setDocuments(className, documents);
                        callback(null, documents, count);
                    }, function(response) {
                        callback(response);
                    });
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

                getDocumentsFromServer(appId, className, callback);

                // msMasterKeyService.getMasterKey(appId, function(error, results) {
                //     if (error) {
                //         return callback(error);
                //     }

                //     var masterKey = results;
                //     var url = _domain + '/csbm/classes/' + className + '?order=-createdAt';

                //     $http({
                //         method: 'GET',
                //         url: url,
                //         headers: {
                //             'X-CSBM-Application-Id': appId,
                //             'X-CSBM-Master-Key': masterKey
                //         }
                //     }).then(function(response) {
                //         var documents = response.data.results;
                //         var count = response.data.count;

                //         setDocuments(className, documents);
                //         callback(null, documents, count);
                //     }, function(response) {
                //         callback(response);
                //     });
                // });
            };

            function addDocument(className, _document) {
                _schemas.forEach(function(schema, index) {
                    if (schema.className === className) {
                        return schema.documents.push(_document);
                    }
                });
            };

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

            function createDocuments(className, documents, appName, callback) {
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

                msMasterKeyService.getMasterKey(_appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'POST',
                        url: _domain + '/csbm/batch',
                        headers: {
                            'X-CSBM-Application-Id': _appId,
                            'X-CSBM-Master-Key': masterKey
                        },
                        data: data
                    }).then(function(response) {
                        $http({
                            method: 'GET',
                            url: _domain + '/csbm/schemas',
                            headers: {
                                'X-CSBM-Application-Id': _appId,
                                'X-CSBM-Master-Key': masterKey
                            }
                        }).then(function(response) {
                            setSchemas(_appId, appName, className, response.data.results);
                            getDocuments(_appId, className, null, null, function(error, results) {});
                            $rootScope.$broadcast('schemas-changed', { 'appId': _appId, 'appName': appName, 'className': className });
                        }, function(response) {
                            callback(response);
                        });

                        callback(null, response);
                    }, function(response) {
                        callback(response);
                    });
                });
            }

            function deleteDocuments(documents, className, appId, objectIds, callback) {
                var data = {
                    'requests': []
                };

                objectIds.forEach(function(objectId, index) {
                    data.requests.push({
                        'method': 'DELETE',
                        'path': '/csbm/classes/' + className + '/' + objectId
                    });
                });

                console.log(data);

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
                            'X-CSBM-Master-Key': masterKey,
                        },
                        data: data
                    }).then(function(response) {
                        objectIds.forEach(function(objectId, index) {
                            documents.some(function(_document, index) {
                                if (_document.objectId === objectId) {
                                    documents.splice(index, 1);
                                }
                            });
                        });
                        callback(null, objectIds);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function addField(className, targetClass, appId, columnName, type, callback) {
                var accessToken = msUserService.getAccessToken();

                var data = {
                    'className': className,
                    'fields': {}
                }
                data.fields[columnName] = {
                    'type': type
                }

                if (type === 'Pointer') {
                    data.fields[columnName]['targetClass'] = targetClass
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

                                if (type === 'Pointer') {
                                    schema.fields[columnName]['targetClass'] = targetClass;
                                }
                            }
                        });

                        // updateField(schema);
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function deleteField(fields, documents, className, appId, columnName, callback) {
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
                        // _schemas.forEach(function(schema) {
                        //     if (schema.className === className) {
                        //         delete schema.fields[columnName];
                        //     }
                        // });

                        delete fields[columnName];
                        documents.forEach(function(_document, index) {
                            delete _document[columnName];
                        });

                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function updateField(schema) {
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
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/classes/' + className + '?where=' + JSON.stringify(filterCriteria) + '&order=-createdAt',
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        }
                    }).then(function(response) {
                        // _schemas.some(function(schema, index) {
                        //     if (schema.className === className) {
                        //         var filteredDocuments = response.data.results;
                        //         if (schema.documents && schema.documents.length > 0) {
                        //             schema.documents.splice(0, schema.documents.length);
                        //             filteredDocuments.forEach(function(_document) {
                        //                 schema.documents.push(_document);
                        //             });
                        //         } else {
                        //             schema.documents = filteredDocuments;
                        //         }

                        //         callback(null, schema);
                        //         return true;
                        //     }
                        // });

                        callback(null, response.data.results);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function deleteClass(appName, className, callback) {
                msMasterKeyService.getMasterKey(_appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'DELETE',
                        url: _domain + '/csbm/schemas/' + className,
                        headers: {
                            'X-CSBM-Application-Id': _appId,
                            'X-CSBM-Master-Key': masterKey,
                            'Content-Type': 'application/json'
                        }
                    }).then(function(response) {
                        _schemas.some(function(schema, index) {
                            if (schema.className === className) {
                                _schemas.splice(index, 1);

                                return true;
                            }
                        });

                        $rootScope.$broadcast('schemas-changed', { 'appId': _appId, 'appName': appName, 'className': '_User' });
                        callback(null, response);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function countObjectInClass(appId, className, callback) {

                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/classes/' + className + '?count=1&limit=0',
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        }
                    }).then(function(response) {
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            };

            function getRelation(appId, className, targetClassName, objectId, key, callback) {
                msMasterKeyService.getMasterKey(appId, function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    var queryString = '?where={"$relatedTo":{"object":{"__type":"Relation","className":"' + className + '","objectId":"' + objectId + '"},"key":"' + key + '"}}'

                    console.log(_domain + '/csbm/classes/' + targetClassName + queryString);

                    var masterKey = results;
                    $http({
                        method: 'GET',
                        url: _domain + '/csbm/classes/' + targetClassName + queryString,
                        headers: {
                            'X-CSBM-Application-Id': appId,
                            'X-CSBM-Master-Key': masterKey
                        }
                    }).then(function(response) {
                        callback(null, response.data);
                    }, function(response) {
                        callback(response);
                    });
                });
            }
        };
    };
})();
