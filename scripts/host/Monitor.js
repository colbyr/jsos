define([
  'host/Memory',
  'utils/DOM',
  'vendor/underscore'
], function (Memory, DOM) {

  function Monitor() {
    this.fields = {
      acc: document.getElementById('acc'),
      pc: document.getElementById('pc'),
      xr: document.getElementById('xr'),
      yr: document.getElementById('yr'),
      zf: document.getElementById('zf')
    };
    this.memory = document.getElementById('memory');
    this.processes = {
      running: document.getElementById('running'),
      ready: document.getElementById('ready'),
      active: document.getElementById('active')
    };
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
      this.updateProcesses();
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
    },

    updateProcesses: function () {
      this.updateRunning();
      this.updateReady();
      this.updateActive();
    },

    updateActive: function () {
      DOM.replace(this.processes.active, _.map(_Processes.q, function (p) {
        return DOM.create('li', {}, DOM.text(p.toString()));
      }, this));
    },

    updateReady: function () {
      DOM.replace(this.processes.ready, _.map(_ReadyQueue.q, function (p) {
        return DOM.create('li', {}, DOM.text(p.toString()));
      }, this));
    },

    updateRunning: function () {
      if (_CPU.process) {
        DOM.replace(
          this.processes.running,
          DOM.create('li', {}, DOM.text(_CPU.process.toString()))
        );
      } else {
        DOM.clear(this.processes.running, null);
      }
    },

    removeChildren: function (node) {
      _.each(node.children, node.removeChild, node);
    }

  });

  return Monitor;

});