define([
  'os/interrupts/Interrupt',
  'vendor/underscore'
], function (Interrupt) {

  var PRIORITY = 0;
  var IRQ = 0;

  function TimerInterrupt(params) {
    this.irq = IRQ;
    this.params = params;
  }

  _.extend(TimerInterrupt.prototype, Interrupt.prototype, {

    priority: function () {
      return PRIORITY;
    }

  });

  return TimerInterrupt;
});
