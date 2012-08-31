/* ------------
   Interrupt.js   
   ------------ */

define([], function () {

  function Interrupt(irq, params) {
      // Properties
      this.irq = irq;
      this.params = params;
  }

  return Interrupt;
});
