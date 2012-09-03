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

  function KeyboardDriver() { // Add or override specific attributes and method pointers.
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // "Constructor" code.
  }

  _.extend(KeyboardDriver.prototype, DeviceDriver.prototype, {

    driverEntry: function () {
      // Initialization routine for this, the kernel-mode Keyboard Driver
      this.status = "loaded";
      // More?
    },

    isr: function (params) {
      // Parse the params.    TODO: Check that they are valid and osTrapError if not.
      var keyCode = params[0];
      var isShifted = params[1];
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
      }
    }
  });

  return KeyboardDriver;
});
