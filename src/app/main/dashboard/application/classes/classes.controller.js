(function() {
    'use strict';

    angular
        .module('app.application.classes')
        .controller('ClassesController', function($scope, $http, $cookies, $window, $state,
            $stateParams, $mdDialog, $document, $rootScope, $timeout, msSchemasService, msDialogService,
            msToastService, msUserService, msApplicationService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            var appId = $stateParams.appId;
            var appName = $stateParams.appName;
            var className = $stateParams.className;
            $scope.title = className;
            if ($scope.title.includes('_')) {
                $scope.title = $scope.title.split('_')[1];
            }
            var _objectId = $stateParams.objectId;

            var checked = [];
            var objectIdList = [];
            var imageExtension = 'png,jpg';
            var audioExtension = 'mp3,mp4';
            var textExtension = 'txt';

            // $scope.className = className;
            $scope.columnName = '';
            $scope.fields = [];
            $scope.fields_add = [];
            $scope.documents = [];
            $scope.add = [];
            $scope.addNewSchema = false;
            $scope.editMode = [];
            $scope.updatedValue = '';
            $scope.jsFileImport;
            $scope.types = ['String', 'Number', 'Boolean', 'Array', 'File'];

            var skip;
            $scope.numPerPage = 10;

            var renderClass = function() {
                msSchemasService.getSchema(appId, appName, className, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    appId = msSchemasService.getAppId();
                    $scope.schemas = results.fields;

                    console.log($scope.schemas);

                    var fields = Object.getOwnPropertyNames(results.fields);
                    $scope.allFields = [].concat(fields);
                    fields.splice(0, 3);
                    $scope.fields = [].concat(fields);
                    $scope.fields_add = [].concat(fields);

                    if (_objectId) {
                        var preparedCriteria = {
                            'objectId': _objectId
                        };

                        msSchemasService.filter(appId, className, preparedCriteria, function(error, results) {
                            if (error) {
                                return alert(error.statusText);
                            }

                            $scope.documents = results.documents;
                            $scope.documents.forEach(function(_document, index) {
                                objectIdList.push(_document.objectId);
                            });
                            $scope.filterCriteria = [{
                                field: 'objectId',
                                operation: 'equals',
                                value: _objectId
                            }];
                        });
                    } else {
                        pagination();
                    }
                });
            };

            var filter = function(filterCriteria) {
                var preparedCriteria = {};
                filterCriteria.forEach(function(criteria, index) {
                    var field = criteria.field;

                    convertToType(criteria.value, $scope.schemas[field].type,
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
                });

                msSchemasService.filter(appId, className, preparedCriteria, function(error, results) {
                    if (error) {
                        return alert(error.statusText);
                    }
                });
            }

            var pagination = function() {
                // if ($scope.currentPage === 1) {
                //     skip = 0;
                // } else {
                //     skip = ($scope.currentPage - 1) * $scope.numPerPage;
                // }
                msSchemasService.getDocuments(appId, className, null, null,
                    function(error, results, count) {
                        if (error) {
                            return alert(error.statusText);
                        }

                        $scope.documents = results
                        $scope.documents.forEach(function(_document) {
                            objectIdList.push(_document.objectId);
                        });

                        // $scope.totalItems = count;
                    });
            }

            // var sort = function() {
            //     $scope.predicate = 'updatedAt';
            //     $scope.reverse = true;
            //     $scope.currentPage = 1;
            //     $scope.order = function(predicate) {
            //         $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            //         $scope.predicate = predicate;
            //     };
            // };

            renderClass();
            // sort();

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

                    if (type === 'Boolean') {
                        value = (value.toLowerCase() === 'true');
                    }
                }

                return callback(null, value);
            };

            var toggleEditMode = function(index) {
                $scope.editMode[index] = !$scope.editMode[index];
            };

            var showDialog = function(ev, path) {
                $mdDialog.show({
                    controller: 'ClassesController',
                    controllerAs: 'vm',
                    templateUrl: path,
                    parent: angular.element($document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false
                });
            };

            $scope.closeDialog = function() {
                $mdDialog.hide();
            };

            $scope.goEditMode = function(index, value) {
                $scope.updatedValue = value;
                toggleEditMode(index);
            };

            $scope.getFileType = function(fileName) {
                if (!fileName) {
                    return 'undefined';
                }

                var tmp = fileName.split('.');
                var fileExtension = tmp[tmp.length - 1];
                if (imageExtension.includes(fileExtension)) {
                    return 'Image';
                };
                if (audioExtension.includes(fileExtension)) {
                    return 'Audio';
                };
                if (textExtension.includes(fileExtension)) {
                    return 'Text';
                };
            };

            $scope.importJsFile = function(el) {
                var files = el.files;

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var reader = new FileReader();
                    reader.onload = (function(theFile) {
                        return function(e) {
                            if (e.target.result) {
                                var documents = JSON.parse(e.target.result);
                                var className = theFile.name.split('.')[0];

                                msSchemasService.createDocuments(appId, className, documents.results,
                                    function(error, results) {
                                        if (error) {
                                            return alert(error.statusText);
                                        }

                                        $scope.closeDialog();
                                    });
                            }

                        };
                    })(file);
                    reader.readAsText(file);
                }
            };

            $scope.gotoPointerClass = function(_className, _objectId) {
                $state.go('app.application_classes_' + _className, { 'appId': appId, 'className': _className, 'objectId': _objectId });
            };

            // $scope.$watch('currentPage + numPerPage', function() {
            //     pagination();
            //     checked = [];
            // });

            // $rootScope.$on('fields-change', function(event, args) {
            //     var fields = Object.getOwnPropertyNames(args.fields);
            //     $scope.allFields = [].concat(fields);
            //     fields.splice(0, 3)
            //     $scope.fields = [].concat(fields);
            //     $scope.fields_add = [].concat(fields);
            //     // $scope.fields_add.splice(0, 3);

            //     pagination();
            // });

            var uneditableFileds = ['objectId', 'createdAt', 'updatedAt'];
            $scope.editable = function(field) {
                return uneditableFileds.indexOf(field) === -1;
            };

            var editable = function(field) {
                return uneditableFileds.indexOf(field) === -1;
            };

            $scope.showFilterDialog = function(ev) {
                $mdDialog.show({
                    controller: FilterDialogController,
                    controllerAs: 'vm',
                    templateUrl: 'app/main/dashboard/application/classes/dialogs/filterDialog.html',
                    parent: angular.element($document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    locals: {
                        schemas: $scope.schemas,
                        appId: appId,
                        className: className,
                        filterCriteria: $scope.filterCriteria
                    }
                }).then(function(filterCriteria) {
                    $scope.filterCriteria = filterCriteria;
                });

                function FilterDialogController($scope, $mdDialog, schemas, appId, className,
                    filterCriteria) {

                    var filterOperationsWithInput = ['equals', 'does not equal', 'starts with'];
                    var allFields = Object.getOwnPropertyNames(schemas);

                    $scope.schemas = schemas;
                    $scope.filterCriteria = filterCriteria;
                    $scope.stringFilterOperations = ['exists', 'does not exist', 'equals', 'does not equal', 'starts with'];
                    $scope.numberFilterOperations = ['exists', 'does not exist', 'equals', 'does not equal', 'less than', 'less than or equal', 'greater than', 'greater than or equal'];
                    $scope.datetimeFilterOperations = ['exists', 'does not exist', 'is before', 'is after'];
                    $scope.booleanFilterOperations = ['exists', 'does not exist', 'equals'];

                    $scope.closeDialog = function(results) {
                        $mdDialog.hide(results);
                    }

                    if (!$scope.filterCriteria || $scope.filterCriteria.length == 0) {
                        $scope.filterCriteria = [{
                            field: allFields[0],
                            operation: $scope.stringFilterOperations[0],
                        }];
                    }

                    $scope.operationWithInput = function(operation) {
                        if (filterOperationsWithInput.includes(operation)) {
                            return true;
                        } else {
                            return false;
                        }
                    }

                    $scope.clearAllFilterCriteria = function() {
                        $scope.filterCriteria.splice(0, $scope.filterCriteria.length);
                    }

                    $scope.addFilterCriteria = function() {
                        $scope.filterCriteria.push({
                            field: allFields[0],
                            operation: $scope.stringFilterOperations[0],
                        });
                    }

                    $scope.deleteCriteria = function(field) {
                        $scope.filterCriteria.some(function(criteria, index) {
                            if (criteria.field === field) {
                                $scope.filterCriteria.splice(index, 1);
                                return true;
                            }
                        });
                    }

                    $scope.filter = function() {
                        filter($scope.filterCriteria);
                        $scope.closeDialog($scope.filterCriteria);
                    }
                }
            }


            $scope.showAddColumnDialog = function(ev) {
                showDialog(ev, 'app/main/dashboard/application/classes/dialogs/addColumnDialog.html');
            };

            $scope.addColumn = function() {
                if (!$scope.columnName || !$scope.type) {
                    msDialogService.showAlertDialog('Add New Column Fail', 'Name and Type not allow null');
                } else {
                    msSchemasService.addField(className, appId, $scope.columnName, $scope.type,
                        function(error, results) {
                            if (error) {
                                if (error.status === 401) {
                                    return $state.go('app.pages_auth_login');
                                }

                                return alert(error.statusText);
                                // msDialogService.showAlertDialog('Add New Column Fail', 'Column exists');
                            }
                        });
                    $scope.closeDialog();
                }
            };

            $scope.showDeleteColumnDialog = function(ev) {
                // msDialogService
                //     .showDialog(ev, 'app/core/services/dialogs/deleteColumnDialog.html');
                $mdDialog.show({
                    controller: DeleteDialogController,
                    controllerAs: 'vm',
                    templateUrl: 'app/main/dashboard/application/classes/dialogs/deleteColumnDialog.html',
                    parent: angular.element($document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    locals: {
                        schemas: $scope.schemas
                    }
                });

                function DeleteDialogController($scope, schemas) {
                    var uneditableFileds = ['objectId', 'createdAt', 'updatedAt'];

                    $scope.schemas = schemas;

                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };

                    $scope.editable = function(field) {
                        return uneditableFileds.indexOf(field) === -1;
                    };

                    $scope.deleteColumn = function() {
                        if (!$scope.columnName) {
                            msDialogService.showAlertDialog('Delete Exists Column Fail', 'Please select column.');
                        } else {
                            var confirm = $mdDialog.confirm()
                                .title('Are you sure to delete ' + '"' + $scope.columnName + '"' + ' ?')
                                .ok('Yes')
                                .cancel('No');

                            $mdDialog.show(confirm).then(function() {
                                msSchemasService.deleteField(className, appId, $scope.columnName,
                                    function(error, results) {
                                        if (error) {
                                            if (error.status === 401) {
                                                return $state.go('app.pages_auth_login');
                                            }

                                            return alert(error.statusText);
                                        }
                                    });
                                $scope.closeDialog();
                            }, function() {
                                $scope.closeDialog();
                            });
                        }
                    };
                };
            };

            $scope.showUpdateFieldNameDialog = function(ev) {
                $mdDialog.show({
                    controller: UpdateFieldNameController,
                    controllerAs: 'vm',
                    templateUrl: 'app/main/dashboard/application/classes/dialogs/changeFieldName.html',
                    parent: angular.element($document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        schemas: $scope.schemas
                    }
                });

                function UpdateFieldNameController($scope, schemas) {
                    $scope.schemas = schemas;

                    $scope.editable = editable;

                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };

                    $scope.updateFieldName = function() {
                        var confirm = $mdDialog.confirm()
                            .title('Are you sure to change ' + '"' + $scope.field + '"' +
                                ' to ' + '"' + $scope.newFieldName + '"' + ' ?')
                            .ok('Yes')
                            .cancel('No');

                        $mdDialog.show(confirm).then(function() {
                            msSchemasService.changeFieldName(appName, className, $scope.field,
                                $scope.newFieldName, appId,
                                function(error, results) {
                                    if (error) {
                                        if (error.status === 401) {
                                            return $state.go('app.pages_auth_login');
                                        }

                                        return alert(error.statusText);
                                    }
                                });
                            $scope.closeDialog();
                        }, function() {
                            $scope.closeDialog();
                        });
                    }
                };
                // showDialog(ev, 'app/main/dashboard/application/classes/dialogs/changeFieldName.html');
            };

            $scope.showImportClassesDialog = function(ev) {
                showDialog(ev, 'app/main/dashboard/application/classes/dialogs/importClasses.html');
            }

            $scope.showDeleteClassDialog = function(ev) {
                $mdDialog.show({
                    controller: DeleteClassDialogController,
                    controllerAs: 'vm',
                    templateUrl: 'app/main/dashboard/application/classes/dialogs/deleteClassDialog.html',
                    parent: angular.element($document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    fullscreen: false,
                    locals: {
                        documents: $scope.documents
                    }
                });

                function DeleteClassDialogController($scope, documents) {

                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };

                    $scope.deleteClass = function() {
                        if (documents.length > 0) {
                            var objectIds = [];
                            documents.forEach(function(_document) {
                                objectIds.push(_document.objectId);
                            });

                            msSchemasService.deleteDocuments(className, appId, objectIds,
                                function(error, results) {
                                    if (error) {
                                        alert(error.statusText);
                                    } else {
                                        documents.splice(0, documents.length);

                                        msSchemasService.deleteClass(className,
                                            function(error, results) {

                                                console.log(results);
                                            });
                                    }
                                    $mdDialog.hide();
                                });
                        }
                    };

                };
            };

            $scope.updateValues = function(index, _document, field) {
                toggleEditMode(index);
                var objectId = _document.objectId;
                var value = _document[field];
                var type = $scope.schemas[field].type;
                var data = {};
                convertToType(value, type, function(error, results) {
                    if (error) {
                        var titleMessage = 'Add New Row Fail';
                        var errorMessage = '"' + field + '"' + ' must be ' + '"' + type + '"';
                        msDialogService.showAlertDialog(titleMessage, errorMessage);
                        _document[field] = $scope.updatedValue;
                    } else {
                        data[field] = results;
                        msSchemasService.updateValues(className, appId, objectId, field, data,
                            function(results) {});
                    }
                });
            };

            $scope.toggle = function(objectId) {
                var index = checked.indexOf(objectId);

                if (index === -1) {
                    checked.push(objectId);
                } else {
                    checked.splice(index, 1);
                }
            };

            $scope.exists = function(objectId) {
                return checked.indexOf(objectId) > -1;
            };

            $scope.isIndeterminate = function() {
                return (checked.length !== 0 &&
                    checked.length !== objectIdList.length);
            };

            $scope.isChecked = function() {
                if (objectIdList != 0) {
                    return checked.length === objectIdList.length;
                } else {
                    return false;
                }
            };

            $scope.toggleAll = function() {
                if (checked.length === objectIdList.length) {
                    checked = [];
                } else if (checked.length === 0 || checked.length > 0) {
                    checked = objectIdList.slice(0);
                }
            };

            $scope.checkList = function() {
                return checked.length;
            }

            $scope.deleteRow = function() {
                var confirm = $mdDialog.confirm()
                    .title('Are you sure to delete these rows ?')
                    .ok('Yes')
                    .cancel('No');

                $mdDialog.show(confirm).then(function() {
                    msSchemasService.deleteDocuments(className, appId, checked,
                        function(error, results) {
                            if (error) {
                                return alert(error.statusText);
                            }


                            pagination();
                        });
                }, function() {});
            };

            $scope.addRow = function() {
                var newSchema = {};
                var checkType = true;
                var errorMessage;
                var titleMessage;

                for (var field in $scope.schemas) {
                    if (field != 'objectId' && field != 'createdAt' &&
                        field != 'updatedAt') {

                        var value = $scope.add[field];
                        var type = $scope.schemas[field].type;

                        convertToType(value, type, function(error, results) {
                            if (error) {
                                checkType = false;
                                var titleMessage = 'Add New Row Fail';
                                var errorMessage = '"' + field + '"' + ' must be ' + '"' + type + '"';
                                return msDialogService.showAlertDialog(titleMessage, errorMessage);
                            }

                            newSchema[field] = results;
                        });
                    }
                };

                if (checkType) {
                    msSchemasService.createDocument(className, appId, newSchema,
                        function(error, results) {
                            if (error) {
                                return alert(error.statusText);
                            }
                            $scope.add = [];

                            pagination();

                            objectIdList.push(results.objectId);
                        });
                    $scope.addNewSchema = false;
                }
            };

            $scope.showAddRow = function() {
                $scope.addNewSchema = !$scope.addNewSchema;
            };

            $scope.cancelAddRow = function() {
                $scope.addNewSchema = false;
                $scope.fields.forEach(function(field) {
                    $scope.add[field] = '';
                });
            };


            var curTH;
            var startOffset;
            var curIndex;
            $scope.beResize = function(ev, index) {
                var curEl = ev.currentTarget;

                curTH = curEl.parentElement;
                curIndex = index;
                startOffset = curTH.offsetWidth - ev.pageX;
            };

            document.addEventListener('mousemove', function(e) {
                if (curTH) {
                    var offset = startOffset + e.pageX;

                    if (offset < 60) {
                        return false;
                    }

                    curTH.style.width = offset + 'px';
                    $timeout(function() {
                        $scope['width' + curIndex] = offset + 'px';
                    });
                }
            });

            document.addEventListener('mouseup', function() {
                curTH = undefined;
            });
        });
})();
