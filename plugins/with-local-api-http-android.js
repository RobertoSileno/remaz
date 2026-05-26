const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withLocalApiHttpAndroid(config) {
  return withAndroidManifest(config, (pluginConfig) => {
    const application = pluginConfig.modResults.manifest.application?.[0];

    if (application?.$) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }

    return pluginConfig;
  });
};
