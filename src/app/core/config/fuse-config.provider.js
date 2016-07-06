(function ()
{
    'use strict';

    angular
        .module('app.core')
        .provider('masamuneConfig', masamuneConfigProvider);

    /** @ngInject */
    function masamuneConfigProvider()
    {
        // Default configuration
        var masamuneConfiguration = {
            'disableCustomScrollbars'        : false,
            'disableMdInkRippleOnMobile'     : true,
            'disableCustomScrollbarsOnMobile': true
        };

        // Methods
        this.config = config;

        //////////

        /**
         * Extend default configuration with the given one
         *
         * @param configuration
         */
        function config(configuration)
        {
            masamuneConfiguration = angular.extend({}, masamuneConfiguration, configuration);
        }

        /**
         * Service
         */
        this.$get = function ()
        {
            var service = {
                getConfig: getConfig,
                setConfig: setConfig
            };

            return service;

            //////////

            /**
             * Returns a config value
             */
            function getConfig(configName)
            {
                if ( angular.isUndefined(masamuneConfiguration[configName]) )
                {
                    return false;
                }

                return masamuneConfiguration[configName];
            }

            /**
             * Creates or updates config object
             *
             * @param configName
             * @param configValue
             */
            function setConfig(configName, configValue)
            {
                masamuneConfiguration[configName] = configValue;
            }
        };
    }

})();