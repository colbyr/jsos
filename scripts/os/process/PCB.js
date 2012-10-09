define([
  'vendor/underscore'
], function () {

  /**
   * Process Control Block
   */
  function PCB() {
    // process status
    this.registers = {
      acc: 0,
      pc: 0,
      x: 0,
      y: 0,
      z: 0
    };
  }

  _.extend(PCB.prototype, {});

  return PCB;

});