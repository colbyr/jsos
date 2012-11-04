define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 2;
  var IRQ = 6;

  function ContextSwitchInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(ContextSwitchInterrupt.prototype, Interrupt, {

    priority: function () {
      return PRIORITY;
    }

  });

  return ContextSwitchInterrupt;

});
