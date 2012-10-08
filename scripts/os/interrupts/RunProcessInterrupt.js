define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 0;
  var IRQ = 3;

  function RunProcessInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(RunProcessInterrupt.prototype, Interrupt, {

    priority: function () {
      return PRIORITY;
    }

  });

  return RunProcessInterrupt;

});
