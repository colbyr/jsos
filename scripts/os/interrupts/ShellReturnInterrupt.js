define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 0;
  var IRQ = 7;

  function ShellReturnInterrupt() {
    this.irq = IRQ;
    this.params = {};
  }

  _.extend(ShellReturnInterrupt.prototype, Interrupt, {

    priority: function () {
      return PRIORITY;
    }

  });

  return ShellReturnInterrupt;

});
