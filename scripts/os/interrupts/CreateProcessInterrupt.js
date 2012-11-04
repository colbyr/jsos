define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 2;
  var IRQ = 2;

  function CreateProcessInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(CreateProcessInterrupt.prototype, Interrupt, {

    priority: function () {
      return PRIORITY;
    }

  });

  return CreateProcessInterrupt;

});
