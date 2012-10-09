define([
  'vendor/underscore'
], function () {

  function Monitor() {
    this.fields = {
      acc: document.getElementById('acc'),
      pc: document.getElementById('pc'),
      xr: document.getElementById('xr'),
      yr: document.getElementById('yr'),
      zf: document.getElementById('zf')
    };
  }

  _.extend(Monitor.prototype, {

    update: function () {
      for (var k in this.fields) {
        this.fields[k].innerText = _CPU.registers[k];
      }
    }

  });

  return Monitor;

});