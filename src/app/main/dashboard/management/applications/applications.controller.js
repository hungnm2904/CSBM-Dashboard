(function() {
    'use strict';

    angular
        .module('app.management.applications')
        .controller('ApplicationsController', ApplicationsController);

    function ApplicationsController($scope, $rootScope, $state, $mdDialog, $document, msUserService,
        msApplicationService, msSchemasService, msDialogService) {

        if (!msUserService.getAccessToken()) {
            $state.go('app.pages_auth_login');
        }

        $scope.applications = msApplicationService.applications();

        msApplicationService.getAll(function(error) {
            if (error) {
                if (error.status === 401) {
                    return $state.go('app.pages_auth_login', { error: error.statusText });
                }
                return alert(error.statusText);
            }
        });

        $scope.showAddDialog = function(ev) {
            $mdDialog.show({
                controller: AddApplicationDialogController,
                controllerAs: 'vm',
                templateUrl: 'app/main/dashboard/management/applications/dialogs/addApplicationDialog.html',
                parent: angular.element($document.body),
                targetEvent: ev,
                clickOutsideToClose: false
            });

            function AddApplicationDialogController($scope, $state) {
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

                        console.log(confirm);

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

        $scope.goToAppManagement = function(appId) {
            $state.go('app.application_classes', { 'appId': appId, 'className': '_User' });
        };
    }
})();
