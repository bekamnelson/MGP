const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withPlayServicesAdsVersion(config) {
    return withProjectBuildGradle(config, (config) => {
        const injection = `
allprojects {
    configurations.all {
        resolutionStrategy.eachDependency { details ->
            if (details.requested.group == 'com.google.android.gms' && details.requested.name == 'play-services-ads') {
                details.useVersion('24.3.0')
            }
        }
    }
}
`;
        if (!config.modResults.contents.includes("play-services-ads")) {
            config.modResults.contents += injection;
        }
        return config;
    });
};