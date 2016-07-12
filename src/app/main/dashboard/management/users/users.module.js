(function() {
    'use strict';

    angular
        .module('app.management.users', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider) {
        $stateProvider.state('app.management_users', {
            url: '/dashboard/users',
            views: {
                'content@app': {
                    templateUrl: 'app/main/dashboard/management/users/users.html',
                    controller: 'UsersController as vm'
                }
            },
            resolve: {
                Users: function(msApi) {
                    return msApi.resolve('users@get');
                }
            }
        });

        // Api
        msApiProvider.register('users', ['app/data/users/users.json']);
    }

})();
