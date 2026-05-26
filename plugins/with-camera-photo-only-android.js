const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withCameraPhotoOnlyAndroid(config) {
  return withAndroidManifest(config, (pluginConfig) => {
    const manifest = pluginConfig.modResults.manifest;
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const permissions = manifest['uses-permission'] || [];
    const removesAudioPermission = permissions.some(
      (permission) =>
        permission.$?.['android:name'] === 'android.permission.RECORD_AUDIO' &&
        permission.$?.['tools:node'] === 'remove'
    );

    if (!removesAudioPermission) {
      permissions.push({
        $: {
          'android:name': 'android.permission.RECORD_AUDIO',
          'tools:node': 'remove',
        },
      });
    }

    manifest['uses-permission'] = permissions;
    return pluginConfig;
  });
};
