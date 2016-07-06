(function ()
{
    'use strict';

    angular
        .module('app.dashboards.users', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msApiProvider)
    {
        $stateProvider.state('app.dashboards_users', {
            url    : '/dashboards/users',
            views  : {
                'content@app': {
                    templateUrl: 'app/main/dashboards/users/users.html',
                    controller : 'UsersController as vm'
                }
            },
            resolve: {
                Users: function (msApi)
                {
                    return msApi.resolve('users@get');
                }
            }
        });

        // Api
        msApiProvider.register('users', ['app/data/users/users.json']);
    }

})();