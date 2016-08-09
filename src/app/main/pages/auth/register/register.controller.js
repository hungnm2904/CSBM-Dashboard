(function() {
    'use strict';

    angular
        .module('app.pages.auth.register')
        .controller('RegisterController', RegisterController);

    RegisterController.$inject = ['$rootScope', '$location', '$timeout', '$http', '$cookies', '$window', '$state', 'msUserService'];

    function RegisterController($rootScope, $location, $timeout, $http, $cookies, $window, $state, msUserService) {
        var vm = this;

        vm.register = function() {
            vm.dataLoading = true;
            if (vm.passwordConfirm != vm.password) {
                vm.error = 'Password Confirm does not match';
            } else {
                vm.error = '';
                msUserService.register(vm.email, vm.password, 'Dev', function(response) {
                    if (response.status != 200) {
                        vm.error = response.data.message;
                    } else {
                        $state.go('app.pages_auth_login');
                    }
                });
            }
        };
    }
})();
