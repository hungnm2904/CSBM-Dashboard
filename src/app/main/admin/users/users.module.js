(function() {
    'use strict';

    angular
        .module('app.admin.users', ['datatables'])
        .config(config);

    function config($stateProvider, msApiProvider) {
        $stateProvider.state('app.admin_users', {
            url: '/admin/users',
            views: {
                'content@app': {
                    templateUrl: 'app/main/admin/users/users.html',
                    controller: 'UsersController as vm'
                }
            }
        });
    }

})();
