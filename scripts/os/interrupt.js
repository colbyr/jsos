/* ------------
   Interrupt.js
   ------------ */

define([], function () {

  return function (irq, params) {
    // Properties
    this.irq = irq;
    this.params = params;
  };

});
