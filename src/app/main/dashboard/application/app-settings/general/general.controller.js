(function() {
    'use strict';

    angular
        .module('app.application.appsettings.keys')
        .controller('GeneralController', function($scope, $state, $stateParams, $mdDialog, $document,
            $location, msApplicationService, msUserService, msSchemasService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            var appName = $stateParams.appName;
            var appId = msSchemasService.getAppId();
            if (!$scope.appId) {
                msApplicationService.getAppId(appName, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    appId = results.appId;
                });
            }
            $scope.appName = angular.copy($stateParams.appName);
            $scope.changed = false;
            $scope.collaborators = [];
            $scope.acceptedRoles = ['Dev', 'Guest'];

            var getCollaborators = function() {
                msApplicationService.getCollaborators(appId, appName, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    $scope.collaborators = results.data;
                });
            };
            getCollaborators();

            $scope.showDeleteDialog = function(ev) {
                $mdDialog.show({
                    controller: DeleteApplicationDialogController,
                    controllerAs: 'vm',
                    templateUrl: 'app/main/dashboard/application/app-settings/general/dialogs/deleteApplicationDialog.html',
                    parent: angular.element($document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    locals: {
                        applicationId: appId,
                        applicationName: appName
                    }
                });

                function DeleteApplicationDialogController($scope, $mdDialog, applicationId,
                    applicationName) {

                    $scope.closeDialog = function() {
                        $mdDialog.hide();
                    };

                    $scope.deleteApplication = function() {
                        var confirm = $mdDialog.confirm()
                            .title('Are you sure to delete ' + '"' + applicationName + '"' + ' ?')
                            .ok('Yes')
                            .cancel('No');

                        $mdDialog.show(confirm).then(function() {
                            msApplicationService.remove(applicationId, applicationName, $scope.password,
                                function(error, results) {
                                    if (error) {
                                        if (error.status === 401) {
                                            return $state.go('app.pages_auth_login');
                                        }

                                        $mdDialog.show(
                                            $mdDialog.alert()
                                            .parent(angular.element($document.body))
                                            .clickOutsideToClose(true)
                                            .title(error.data.message)
                                            .textContent('Your app was not deleted.')
                                            .ariaLabel('Alert Dialog Demo')
                                            .ok('Close')
                                            .targetEvent(ev)
                                        );
                                    } else {
                                        $state.go('app.management_applications');
                                    }
                                });
                        }, function() {
                            $mdDialog.hide();
                        });
                    }
                };
            };

            $scope.changeAppName = function(_appName) {
                if (_appName !== appName) {
                    $scope.changed = true;
                } else {
                    $scope.changed = false;
                }
            };

            $scope.cancel = function() {
                $scope.appName = appName;
                $scope.changed = false;
            };

            $scope.saveChanges = function() {
                $scope.changed = false;
                var data = {
                    'name': $scope.appName.trim()
                }

                msApplicationService.update(appId, appName, data, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    var path = $location.path().split('/');
                    path[2] = $scope.appName;
                    var newPath = path.join('/');
                    $location.path(newPath).replace();
                });
            };

            var updateApplication = function(appId, appName, data, callback) {
                msApplicationService.update(appId, appName, data, callback);
            }

            $scope.addCollaborator = function() {
                var data = {
                    'collaborators': {
                        '__op': 'Add',
                        'objects': [{
                            'email': angular.copy($scope.email).trim(),
                            'role': angular.copy($scope.role).trim()
                        }]
                    }
                }

                updateApplication(appId, appName, data, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    var newCollaborators = data.collaborators.objects;
                    newCollaborators.forEach(function(collaborator, index) {
                        $scope.collaborators.push(collaborator);
                    });

                    $scope.email = '';
                });
            };

            $scope.removeCollaborator = function(email) {
                var data = {
                    'collaborators': {
                        '__op': 'Remove',
                        'objects': [angular.copy(email).trim()]
                    }
                }

                updateApplication(appId, appName, data, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    var removedCollaborators = data.collaborators.objects;
                    removedCollaborators.forEach(function(email) {
                        $scope.collaborators.some(function(collaborator, index) {
                            if (collaborator.email === email) {
                                $scope.collaborators.splice(index, 1);

                                return true;
                            }
                        })
                    });
                });
            };

            $scope.changeRole = function(collaborator) {
                var data = {
                    'collaborators': {
                        '__op': 'Update',
                        'objects': [angular.copy(collaborator)]
                    }
                }

                updateApplication(appId, appName, data, function(error, results) {
                    if (error) {
                        if (error.status === 401) {
                            return $state.go('app.pages_auth_login');
                        }

                        return alert(error.statusText);
                    }

                    var updatedCollaborators = data.collaborators.objects;
                    updatedCollaborators.forEach(function(updatedCollaborator) {
                        $scope.collaborators.some(function(collaborator, index) {
                            if (collaborator.email === updatedCollaborator.email) {
                                collaborator.role = updatedCollaborator.role;

                                return true;
                            }
                        })
                    });
                });
            };

        });
})();
