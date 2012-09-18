define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 0;
  var IRQ = 0;

  function KeyboardInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(KeyboardInterrupt.prototype, Interrupt.prototype, {

    priority: function () {
      return PRIORITY;
    }

  });

  return KeyboardInterrupt;
});
