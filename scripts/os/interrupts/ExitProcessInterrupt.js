define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 2;
  var IRQ = 4;

  function ExitProcessInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(ExitProcessInterrupt.prototype, Interrupt, {

    priority: function () {
      return PRIORITY;
    }

  });

  return ExitProcessInterrupt;

});
