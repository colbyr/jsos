/* ----------------------------------
   DeviceDriverKeyboard.js

   Requires deviceDriver.js

   The Kernel Keyboard Device Driver
   ---------------------------------- */

define([
  'host/log',
  'os/trace',
  'os/drivers/Device',
  'utils/underscore'
], function (log, trace, DeviceDriver) {

  /**
   * Character Map
   * since keyboard codes don't map to ASCII values in String.fromCharacterCode()
   *
   * @var object
   */
  var _characters = {
    // digits and shifted punctuation
    48: {l: '0', u: ')'},
    49: {l: '1', u: '!'},
    50: {l: '2', u: '@'},
    51: {l: '3', u: '#'},
    52: {l: '4', u: '$'},
    53: {l: '5', u: '%'},
    54: {l: '6', u: '^'},
    55: {l: '7', u: '&'},
    56: {l: '8', u: '*'},
    57: {l: '9', u: '('},
    // special characters
    186: {l: ';', u: ':'},
    187: {l: '=', u: '+'},
    188: {l: ',', u: '<'},
    189: {l: '-', u: '_'},
    190: {l: '.', u: '>'},
    191: {l: '/', u: '?'},
    192: {l: '`', u: '~'},
    219: {l: '[', u: '{'},
    220: {l: '\\', u: '|'},
    221: {l: ']', u: '}'},
    222: {l: '\'', u: '"'}
  };

  /**
   * Driver for standard US QWERTY keyboards
   */
  function KeyboardDriver() {
    this.status = '';
  }

  /**
   * @extends DeviceDriver
   */
  _.extend(KeyboardDriver.prototype, DeviceDriver.prototype, {

    driverEntry: function () {
      // Initialization routine for this, the kernel-mode Keyboard Driver
      this.status = 'loaded';
      // More?
    },

    /**
     * Interupt Service Routine
     *
     * !! same as krnKbdDispatchKeyPress
     *
     * @param  int
     * @param  bool
     * @return void
     */
    isr: function (keyCode, isShifted) {
      if (typeof keyCode !== 'number' || typeof isShifted !== 'boolean') {
        _KernelInterface.trapError(
          'KeyboardDriver.isr expects parameters of type (int, bool)'
        );
        return;
      } else {
        trace("Key code:" + keyCode + " shifted:" + isShifted);
      }

      var character;
      // Check to see if we even want to deal with the key that was pressed.
      if (keyCode >= 65 && keyCode <= 90) { // [a-z]
        // if isShifted === false; offset the code by 32 for lowercase
        character = String.fromCharCode(isShifted ? keyCode : keyCode + 32);
        // TODO: Check for caps-lock and handle as shifted if so.
      } else if (keyCode === 32) { // space
        character = String.fromCharCode(keyCode);
      } else if (keyCode === 8  || // backspace
                 keyCode === 13 || // enter
                 keyCode === 38 || // up
                 keyCode === 40) { // down
        character = keyCode;
      } else if (_characters.hasOwnProperty(keyCode)) { // special characters
        character = isShifted ? _characters[keyCode].u : _characters[keyCode].l;
      }

      // if it isn't a recognized keyCode, don't bother queuing
      if (character) {
        _KernelInputQueue.enqueue(character);
      }
    }
  });

  return KeyboardDriver;
});
