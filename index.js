var fsAccess = require('fs-access')
var spawn = require('child_process').spawn
var path = require('path')
var q = require('q')


var AndroidDevice = function (args, logger, baseLauncherDecorator) {
  var self = this
    baseLauncherDecorator(self)

    var deviceUuid = args.deviceUuid
    var adb = path.join(args.sdkHome, 'platform-tools/adb')


    var log = logger.create('launcher.android_device')

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
        errorOutput = 'Can not find the binary ' + cmd + '\n\t' +
        'Please set env variable ' + self.ENV_CMD
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
    log.debug('Starting %s with id %s', self.name, self.id)
      self._execCommand(adb, this._getOptions(url + '?id=' + self.id));

    //setTimeout(function () {}, 60000)
  }

  this._getOptions = function (url) {
    return [
      '-s',
      deviceUuid,
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-d ' + url
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
        self._execCommand(adb, [ 'shell', 'am', 'force-stop', 'com.android.chrome' ], function () {
          self._done('No error!')
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
