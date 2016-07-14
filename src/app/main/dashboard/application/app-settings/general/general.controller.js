(function() {
    'use strict';

    angular
        .module('app.application.appsettings.keys')
        .controller('GeneralController', function($scope, $state, $stateParams, $mdDialog, $document,
            msApplicationService, msUserService) {

            if (!msUserService.getAccessToken()) {
                $state.go('app.pages_auth_login');
            }

            var appId = $stateParams.appId;
            var appName = '';
            msApplicationService.getAppName(appId, function(error, results) {
                appName = results.data.data.appName;
            });

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
                }).then(function() {
                    $state.go('app.management_applications');
                });

                function DeleteApplicationDialogController($scope, applicationId,
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
                            msApplicationService.remove(applicationId, $scope.password,
                                function(error, results) {
                                    if (error) {
                                        if (error.status === 401) {
                                            return $state.go('app.pages_auth_login');
                                        }

                                        return alert(error.statusText);
                                    }

                                    $mdDialog.hide();
                                });
                        }, function() {
                            $mdDialog.hide();
                        });
                    }
                };
            }
        });
})();
