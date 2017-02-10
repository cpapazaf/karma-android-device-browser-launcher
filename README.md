# karma-android-device-browser-launcher

> Run Karma Tests on the available android browsers. Tests will run on the physical android devices connected to your pc.

## Installation

The easiest way is to keep `karma-android-device-browser-launcher` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-android-device-browser-launcher": "~0.1"
  }
}
```

You can simply do it by:
```bash
npm install karma-android-device-browser-launcher --save-dev
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    browsers: ['RealAndroidBrowser'],
    customLaunchers: {
      RealAndroidBrowser: {
        base: 'AndroidDevice',
        deviceUuid: '.....',
        sdkHome: '/Users/<user>/Library/Android/sdk/'
      }
    }
  });
};
```

You can pass list of browsers as a CLI argument too:
```bash
karma start --browsers RealAndroidBrowser --log-level debug
```

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
