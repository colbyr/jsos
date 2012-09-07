/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

define([
  'os/trace',
  'os/drivers/Device',
  'utils/underscore'
], function (trace, DeviceDriver) {

  // keycode-special character map
  var _characters = {
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

  function KeyboardDriver() {
    this.status = '';
  }

  _.extend(KeyboardDriver.prototype, DeviceDriver.prototype, {

    driverEntry: function () {
      // Initialization routine for this, the kernel-mode Keyboard Driver
      this.status = 'loaded';
      // More?
    },

    isr: function (keyCode, isShifted) {
      // Parse the params TODO: Check that they are valid and osTrapError if not.
      trace("Key code:" + keyCode + " shifted:" + isShifted);
      var chr = "";
      // Check to see if we even want to deal with the key that was pressed.
      if ((keyCode >= 65 && keyCode <= 90) ||  // A..Z
          (keyCode >= 97 && keyCode <= 123)) { // a..z
        // Determine the character we want to display.  
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted) {
          chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);
      } else if ((keyCode >= 48 && keyCode <= 57) || // digits 
                 keyCode === 32 ||  // space
                 keyCode === 13) { // enter
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
      } else if (_characters[keyCode]) {
        _KernelInputQueue.enqueue(
          isShifted ? _characters[keyCode].u : _characters[keyCode].l
        );
      }
    }
  });

  return KeyboardDriver;
});
