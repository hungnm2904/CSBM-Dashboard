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
        $scope.collaborations = [];

        var countInfo = function(application) {
            msApplicationService.countTotalClasses(application._id, function(error, results) {
                if (error) {
                    return alert(error.statusText);
                }
                application['totalClasses'] = results;
            })

            msSchemasService.countObjectInClass(application._id, '_User', function(error, results) {
                if (error) {
                    console.log(error);
                }

                application['totalUsers'] = results.count
            });

            msSchemasService.countObjectInClass(application._id, '_Installation', function(error, results) {
                if (error) {
                    console.log(error);
                }

                application['totalInstallations'] = results.count
            });
        };

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

                countInfo(application);
            });
        });

        msUserService.getCollaborations(function(error, results) {
            if (error) {
                return alert(error.statusText);
            }

            if (results) {
                $scope.collaborations = angular.copy(results.applications);
                $scope.collaborations.forEach(function(collaboration) {
                    var appId = collaboration._id;
                    var appName = collaboration.name;

                    var createdAt = new Date(collaboration.created_at);
                    createdAt = new Date(createdAt.getTime() + (createdAt.getTimezoneOffset() * 60000));

                    collaboration.created_at = (createdAt.getDate() + '') + '/' + (createdAt.getMonth() + 1 + '') + '/' + (createdAt.getFullYear() + '');

                    countInfo(collaboration);
                });
            }

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

        $scope.goToAppManagement = function(appId, appName) {
            msModeService.setToAppMode();
            msModeService.renderApplicationNavigations('apps', appId, appName, '_User');
        };

        $scope.goToCollaborationManagement = function(appId, appName, collaborationRole) {
            msModeService.setToCollaborationMode();
            msModeService.setCollaborationRole(collaborationRole);
            if (collaborationRole === 'Dev') {
                msModeService.renderCollaborationNavigations('collaboration--dev', appId, appName, '_User');
            } else if (collaborationRole === 'Guest') {
                msModeService.renderGuestNavigations('collaboration--guest', appName, 'app.application_diagram');
            }
        };

    }
})();
