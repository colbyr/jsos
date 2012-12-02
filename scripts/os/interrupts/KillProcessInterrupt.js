define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 2;
  var IRQ = 8;

  function KillProcessInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(KillProcessInterrupt.prototype, Interrupt, {

    priority: function () {
      return PRIORITY;
    }

  });

  return KillProcessInterrupt;

});
