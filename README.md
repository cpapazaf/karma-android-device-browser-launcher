# karma-android-device-browser-launcher

## Installation

The easiest way is to keep `karma-android-device-browser-launcher` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "@iprecali1/karma-android-device-browser-launcher": "1.0.0"
  }
}
```

You can simply do it by:
```bash
npm install @iprecali1/karma-android-device-browser-launcher@1.0.0
```

## Configuration
```js
// karma.conf.js
hostname: '.....' // (Mandatory your PC IP address)

module.exports = function(config) {
  config.set({
    browsers: ['RealAndroidBrowser'],
    customLaunchers: {
      RealAndroidBrowser: {
        base: 'AndroidDevice',
        deviceUuid: '.....', // (Mandatory)
        sdkHome: '/Users/<user>/Library/Android/sdk/', // (Mandatory)
        deviceBrowser: 'firefox' //(optional) select from [chrome, internet, firefox]. default is: internet
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
