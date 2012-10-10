define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 0;
  var IRQ = 5;

  function PrintInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(PrintInterrupt.prototype, {

    priority: function () {
      return PRIORITY;
    }

  });

  return PrintInterrupt;

});