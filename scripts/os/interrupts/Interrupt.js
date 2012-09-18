/* ------------
   Interrupt.js
   ------------ */

define([
  'vendor/underscore'
], function () {

  function Interrupt(irq, params) {
    // properties
    this.irq = irq;
    this.params = params;
  };

  _.extend(Interrupt.prototype, {

    priority: function () {
      throw new Error('Interrupt.priority is not defined');
    }

  });

  return Interrupt;

});
