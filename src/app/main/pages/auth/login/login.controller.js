(function() {
    'use strict';

    angular
        .module('app.pages.auth.login')
        .controller('LoginController', LoginController);

    function LoginController($state, msUserService) {
        var vm = this;

        msUserService.getCurrentUser(function(user) {
            if (user) {
                $state.go('app.management_applications');
            }
        });

        vm.login = function() {
            vm.dataLoading = true;
            msUserService.login(vm.email, vm.password, function(error, results) {
                if (error) {
                    console.log(error);
                    return vm.error = error.data.message;
                }

                if (results.role === 'Dev') {
                    $state.go('app.management_applications');
                } else if (results.role === 'Admin') {
                    $state.go('app.admin_applications');
                }
            });
        };
    };
})();
