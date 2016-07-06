(function ()
{
    'use strict';

    angular
        .module('masamune')
        .controller('IndexController', IndexController);

    /** @ngInject */
    function IndexController(masamuneTheming)
    {
        var vm = this;

        // Data
        vm.themes = masamuneTheming.themes;

        //////////
    }
})();