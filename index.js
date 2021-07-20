var spawn = require('child_process').spawn
var path = require('path')

var BROWSER_CHROME = "chrome"
var BROWSER_INTERNET = "internet"
var BROWSER_FIREFOX = "firefox"

var BROWSERS = {
  chrome: {
    startActivity: "com.android.chrome/org.chromium.chrome.browser.ChromeTabbedActivity",
    stopActivity: "com.android.chrome"
  },
  internet: {
    startActivity: "com.sec.android.app.sbrowser/.SBrowserMainActivity",
    stopActivity: "com.sec.android.app.sbrowser"
  },
  firefox: {
    startActivity: "org.mozilla.firefox/org.mozilla.gecko.BrowserApp",
    stopActivity: "org.mozilla.firefox"
  }
}

function guessSdkHome () {
  switch (process.platform) {
    case 'darwin':
      return ''
    case 'linux':
      return ''
    case 'win32':
      return ''
  }
}

var AndroidDevice = function (args, logger, baseLauncherDecorator) {
  var self = this
  baseLauncherDecorator(self)

  var log = logger.create('launcher.android_device')

  var deviceUuid = args.deviceUuid || null
  var deviceBrowser = args.deviceBrowser || BROWSER_INTERNET
  var sdkHome = args.sdkHome || guessSdkHome()
  var adb = path.join(sdkHome, 'platform-tools/adb')


  this._execCommand = function (cmd, args, closeCallback=null) {
    if (!cmd) {
      log.error('No binary for %s browser on your platform.\n  ' +
          'Please, set "%s" env variable.', self.name, self.ENV_CMD)

      self._retryLimit = -1
      return self._clearTempDirAndReportDone('no binary')
    }

    cmd = this._normalizeCommand(cmd)

    log.debug(cmd + ' ' + args.join(' '))
    self._process = spawn(cmd, args)

    var errorOutput = ''

    self._process.on('close', function (code) {
      log.debug(cmd + ' closed!')
      if (closeCallback) {
        closeCallback()
      }
    })

    self._process.on('error', function (err) {
      if (err.code === 'ENOENT') {
        self._retryLimit = -1
        errorOutput = 'Can not find the binary ' + cmd + '\n\t' + 'Please set env variable ' + self.ENV_CMD
      } else {
        errorOutput += err.toString()
      }
    })
  }

  // overwrites the karma/lib/launchers/base.js start function
  // we do that because the adb command is not blocking. While with
  // the normal browsers we keep the process id of the browser and then
  // we kill the browser process when the testcase is done
  this.start = function(url) {
    // TODO: fix how it should fail by adding state and taking care of the restarts
    if (deviceBrowser !== BROWSER_CHROME && deviceBrowser !== BROWSER_INTERNET && deviceBrowser !== BROWSER_FIREFOX) {
      log.error('Wrong Device browser, is: %s', deviceBrowser)
      this.error = 'Wrong device browser [chrome, firefox, internet]'
    }

    log.debug('Starting %s with id %s and options %s', self.name, self.id, this._getOptions(url + '?id=' + self.id))
    self._execCommand(adb, this._getOptions(url + '?id=' + self.id));

  }

  this._getOptions = function (url) {
    return [
      (deviceUuid === null)? '' : '-s',
      (deviceUuid === null)? '' : deviceUuid,
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-n',
      BROWSERS[deviceBrowser].startActivity,
      '-d ' + '"' + url + '"'
      ]
  }

  this.restart = function () {
    log.debug('Restarting %s', self.name)
  }

  // overwrites karma/lib/launchers/base.js
  // I do that to not allow the emition of the 'kill' event since
  // it kills the running process without letting us properly clean
  // the device status
  this.kill = function () {
    log.debug('Process %s exited', self.name)

    if (killingPromise) {
      return killingPromise
    }

    var killingPromise =this.emitAsync('android-device-browser-kill').then(function(resolve, reject) {
        self._execCommand(adb, ['-s', deviceUuid, 'shell', 'am', 'force-stop', BROWSERS[deviceBrowser].stopActivity ], function () {
          self._done()
        })
      }
    )

    return killingPromise
  }

  this.forceKill = function () {
    log.debug('forceKill')
    return this.kill()
  }

  this.markCaptured = function () {
    log.debug('mark Captured')
  }

  this.isCaptured = function () {
    log.debug('is Captured')
    return true
  }

  this._done = function (error) {
    log.debug('Done now, emiting event with error %s', error)
    this.emit('done')

    if (this.error) {
      this.error = error
      emitter.emit('browser_process_failure', this)
    }
  }

}

AndroidDevice.prototype = {
  name: 'AndroidDevice',
  DEFAULT_CMD: {
    linux: '',//getAdbLinux(),
    darwin: '',
    win32: ''//getAdbExe()
  },
  ENV_CMD: 'ANDROIDDEVICE_BIN'
}

AndroidDevice.$inject = ['args', 'logger', 'baseBrowserDecorator'];

module.exports = {
  'launcher:AndroidDevice': ['type', AndroidDevice]
}
