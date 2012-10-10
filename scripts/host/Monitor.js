define([
  'host/Memory',
  'vendor/underscore'
], function (Memory) {

  function Monitor() {
    this.fields = {
      acc: document.getElementById('acc'),
      pc: document.getElementById('pc'),
      xr: document.getElementById('xr'),
      yr: document.getElementById('yr'),
      zf: document.getElementById('zf')
    };
    this.memory = document.getElementById('memory');
  }

  function hex(num, length) {
    var hex = num.toString(16);
    length = length || 1;
    while (hex.length < length) {
      hex = '0' + hex;
    }
    return hex.toUpperCase();
  }

  _.extend(Monitor.prototype, {

    update: function () {
      for (var k in this.fields) {
        this.fields[k].innerText = _CPU.registers[k].toUpperCase();
      }
      this.updateMemory();
    },

    updateMemory: function () {
      var mem = Memory.dump();
      var rep = '';
      for (var page = 0; page < mem.length; page += 256) {
        rep += '- - - - - - page break - - - - - -\n\n';
        for (var row = 0; row < 256; row += 8) {
          rep += hex(page + row, 4) + ':  ';
          for (var i = 0; i < 8; i += 1) {
            rep += ' ' + mem[page + row + i];
          }
          rep += '\n';
        }
        rep += '\n';
      }
      this.memory.value = rep;
    }

  });

  return Monitor;

});