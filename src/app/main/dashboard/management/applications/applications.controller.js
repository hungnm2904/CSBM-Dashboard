(function() {
    'use strict';

    angular
        .module('app.management.applications')
        .controller('ApplicationsController', ApplicationsController);

    function ApplicationsController($scope, $rootScope, $state, $mdDialog, $document, msUserService,
        $http, msApplicationService, msSchemasService, msModeService, msMasterKeyService,
        msConfigService) {

        if (!msUserService.getAccessToken()) {
            $state.go('app.pages_auth_login');
        }

        var _domain = (msConfigService.getConfig()).domain;

        $scope.applications = msApplicationService.applications();
        $scope.applicationNames = [];

        msApplicationService.getAll(function(error) {
            if (error) {
                if (error.status === 401) {
                    return $state.go('app.pages_auth_login', { error: error.statusText });
                }
                return alert(error.statusText);
            }

            $scope.applications.forEach(function(application) {
                var appId = application._id;
                var appName = application.name;

                $scope.applicationNames.push(appName);

                var createdAt = new Date(application.created_at);
                createdAt = new Date(createdAt.getTime() + (createdAt.getTimezoneOffset() * 60000));

                application.created_at = (createdAt.getDate() + '') + '/' + (createdAt.getMonth() + 1 + '') + '/' + (createdAt.getFullYear() + '');

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
                        application['totalClasses'] = response.data.results.length;
                    }, function(response) {
                        console.log(response);
                    });
                });

                msSchemasService.countObjectInClass(appId, '_User',
                    function(error, results) {
                        if (error) {
                            console.log(error);
                        }

                        application['totalUsers'] = results.count
                    });

                msSchemasService.countObjectInClass(appId, '_Installation',
                    function(error, results) {
                        if (error) {
                            console.log(error);
                        }

                        application['totalInstallations'] = results.count
                    });
            });
        });

        $scope.showAddDialog = function(ev) {
            $mdDialog.show({
                controller: AddApplicationDialogController,
                controllerAs: 'vm',
                templateUrl: 'app/main/dashboard/management/applications/dialogs/addApplicationDialog.html',
                parent: angular.element($document.body),
                targetEvent: ev,
                locals: {
                    applicationNames: $scope.applicationNames
                },
                clickOutsideToClose: false,
                escapeToClose: false
            });

            function AddApplicationDialogController($scope, $state, applicationNames) {
                $scope.applicationNames = applicationNames;

                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.createApplication = function() {
                    msApplicationService.create($scope.applicationName,
                        function(error, results) {
                            if (error) {
                                if (error.status === 401) {
                                    return $state.go('app.pages_auth_login');
                                }

                                $mdDialog.hide();
                                return alert(error.statusText);
                            }

                            $mdDialog.hide();
                        });
                };
            };
        };

        $scope.showDeleteDialog = function(ev) {
            $mdDialog.show({
                controller: DeleteApplicationDialogController,
                controllerAs: 'vm',
                templateUrl: 'app/main/dashboard/management/applications/dialogs/deleteApplicationDialog.html',
                parent: angular.element($document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                locals: {
                    applications: $scope.applications
                }
            });

            function DeleteApplicationDialogController($scope, $state, applications) {
                $scope.applications = applications;

                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.deleteApplication = function() {
                    var application = JSON.parse($scope.application);
                    var confirm = $mdDialog.confirm()
                        .title('Are you sure to delete ' + '"' + application.name + '"' + ' ?')
                        .ok('Yes')
                        .cancel('No');

                    $mdDialog.show(confirm).then(function() {
                        msApplicationService.remove(application._id,
                            function(error, results) {
                                if (error) {
                                    if (error.status === 401) {
                                        return $state.go('app.pages_auth_login');
                                    }
                                    return alert(error.statusText);
                                }
                            });
                        $mdDialog.hide();
                    }, function() {
                        $mdDialog.hide();
                    });
                }
            };
        }

        $scope.goToAppManagement = function(appId, appName) {
            msModeService.renderApplicationNavigations(appId, appName, '_User');
            // $state.go('app.application_classes', {
            //     'appId': appId,
            //     'appName': appName,
            //     'className': '_User',
            //     'objectId': null
            // });
        };
    }
})();
