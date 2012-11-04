define([
  'vendor/underscore'
], function () {

  /**
   * Process Control Block
   */
  function PCB() {
    // process status
    this.registers = {
      acc: '00',
      pc: '00',
      xr: '00',
      yr: '00',
      zf: '0'
    };
  }

  _.extend(PCB.prototype, {
    snapshot: function (ss) {
      _.extend(this.registers, ss);
    }
  });

  return PCB;

});