var AndroidDevice = function (args, logger, baseLauncherDecorator) {
  baseLauncherDecorator(this)

  var deviceUuid = args.deviceUuid
  var sdkHome = args.sdkHome
  var spawn = require('child_process').spawn
  var path = require('path')
  var adb = path.join(sdkHome, 'platform-tools/adb')

  var log = logger.create('launcher.android_device')

  this._start = function(url) {
    var self = this;

    self._execCommand(adb, ['devices']);

    self._process.stderr.on('data', function (data) {
      log.error('' + data);
    })

    self._process.stdout.on('data', function (data) {
      log.debug('' + data);
    })

    log.debug('Starting emulator browser and point it to %s', url);
    log.debug('starting browser...');
    process_browser = spawn(adb, ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', url])

  }

  this._onProcessExit = function (code, errorOutput) {
    var pid = this._process.pid;
    log.debug('pid %d exited with code %d and errorOutput %s', pid, code, errorOutput);
  }
}

AndroidDevice.prototype = {
  name: 'AndroidDevice',

  DEFAULT_CMD: {
    linux: '',
    darwin: '',
    win32: ''
  },
  ENV_CMD: 'ANDROIDEVICE_BIN'
}

AndroidDevice.$inject = ['args', 'logger', 'baseBrowserDecorator'];

module.exports = {
  'launcher:AndroidDevice': ['type', AndroidDevice]
}
