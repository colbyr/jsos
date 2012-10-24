/* ------------
   CPU.js

   Requires global.js.

   Routines for the host CPU simulation, NOT for the OS itself.
   In this manner, it's A LITTLE BIT like a hypervisor, in that the Document
   envorinment inside a browser is the "bare metal" (so to speak) for which we
   write code that hosts our client OS. But that analogy only goes so far, and
   the lines are blurred, because we are using JavaScript in both the host and
   client environments.

   This code references page numbers in the text book:
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne
     ISBN 978-0-470-12872-5
   ------------ */

define([
  'os/interrupts/ExitProcessInterrupt',
  'os/interrupts/PrintInterrupt',
  'os/trace',
  'vendor/underscore'
], function (ExitProcessInterrupt, PrintInterrupt, trace) {

  var CONST = 2;
  var MEM = 3;
  var NONE = 1;

  var OPCODES = {
    'A9': { // LDA - load ACC with constant
      arg: CONST,
      func: function (num) {
        this.registers.acc = num;
      }
    },
    'AD': { // LDA - load ACC from memory
      arg: MEM,
      func: function (loc) {
        this.registers.acc = this.process.read(loc);
      }
    },
    '8D': { // STA - store ACC in memory
      arg: MEM,
      func: function (loc) {
        this.process.write(loc, this.registers.acc);
      }
    },
    '6D': { // ADC - add contents of a memory location to the ACC
      arg: MEM,
      func: function (loc) {
        this.registers.acc = _add(
          this.registers.acc,
          this.process.read(loc)
        );
      }
    },
    'A2': { // LDX - load XR with a constant
      arg: CONST,
      func: function (num) {
        this.registers.xr = num;
      }
    },
    'AE': { // LDX - load XR from memory
      arg: MEM,
      func: function (loc) {
        this.registers.xr = this.process.read(loc);
      }
    },
    'A0': { // LDY - load YR with a constant
      arg: CONST,
      func: function (num) {
        this.registers.yr = num;
      }
    },
    'AC': { // LDY - load YR from memory
      arg: MEM,
      func: function (loc) {
        this.registers.yr = this.process.read(loc);
      }
    },
    'EA': { // NOP - no operation
      arg: NONE,
      func: function () {}
    },
    '00': { // BRK - Break (really a system call)
      arg: NONE,
      func: function () {
        this.exitProcess();
      }
    },
    'EC': { // CPX - compare byte in mem to the XR (set Z flagto zero if equal)
      arg: MEM,
      func: function (loc) {
        this.registers.zf =
          this.registers.xr === this.process.read(loc) ?  '0' : '1';
      }
    },
    'D0': { // BNE - branch X bytes if ZF = 0
      arg: CONST,
      func: function (offset) {
        console.log("BNE [D0 " + offset + "]");
        if(this.registers.zf === '0') {
            console.log("  PC before branch: " + this.registers.pc);
            // apply branch-ahead offset 
            var pc = _add(this.registers.pc, offset);
            // check to see that we haven't gone "around" past 255.
            if(_dec(pc) > 255) {
                pc = _sub(this.registers.pc, '100');
            }
            this.registers.pc = pc;
            // LOG
            console.log("  PC after branch: " + this.registers.pc);
        }
      }
    },
    'EE': { // INC - incrememt the value of a byte
      arg: MEM,
      func: function (loc) {
        this.process.write(
          loc,
          _inc(this.process.read(loc))
        );
      }
    },
    'FF': { // SYS - system call loaded from XR
      arg: NONE,
      func: function () {
        var call = this.registers.xr;
        switch (call) {
          case '01':
            _KernelInterruptQueue.enqueue(new PrintInterrupt({
              item: this.registers.yr.toUpperCase()
            }));
            break;
          case '02':
            _KernelInterruptQueue.enqueue(new PrintInterrupt({
              item: this.process.read(
                _dec(this.registers.yr)
              ).toUpperCase()
            }));
            break;
        }
      }
    }
  };

  function _dec(string) {
    return parseInt(string, 16);
  }

  function _hex(num) {
    var hex = num.toString(16);
    return hex.length === 2 ? hex : '0' + hex;
  }

  function _add(h1, h2) {
    return _hex(_dec(h1) + _dec(h2));
  }

  function _sub(h1, h2) {
    return _hex(_dec(h1) - _dec(h2));
  }

  function _inc(h1) {
    return _add('01', h1);
  }

  function _exec(cpu, inst) {
    inst = inst.toUpperCase();
    var args = [];
    var op = OPCODES[inst];
    var inc = 0;
    if (op) {
      switch (op.arg) {
        case CONST:
          args[0] = cpu.process.inst(
            _dec(_add(cpu.registers.pc, '01'))
          );
          break;
        case MEM:
          var a = cpu.process.inst(_dec(_add(cpu.registers.pc, '02')));
          var b = cpu.process.inst(_dec(_add(cpu.registers.pc, '01')));
          args[0] = _dec(a + b);
          break;
        case NONE:
          break;
        default:
          throw new Error('CPU._exec: no arg specified for "' + inst + '"');
      }
      op.func.apply(cpu, args);
      inc = op.arg;
    } else {
      // TODO: handle error case
      _StdIn.putText('FAIL: unrecognized op code "' + inst + '"');
      _StdIn.advanceLine();
      cpu.exitProcess();
    }
    return inc;
  }

  function CPU() {
    this.isExecuting = false;
    this.process = null;
    this.registers = {
      pc:  '00', // Program Counter
      acc: '00', // Accumulator
      xr:  '00', // X register
      yr:  '00', // Y register
      zf:  '0'   // Z-ero flag (Think of it as "isZero".)
    };
  }

  _.extend(CPU.prototype, {

    cycle: function () {
      trace('CPU cycle');
      // TODO: Accumulate CPU usage and profiling statistics here.
      // Do real work here. Set this.isExecuting appropriately.
      var inst = this.process.inst(_dec(this.registers.pc));
      // TODO: make an output interrupt
      this.registers.pc = _add(
        this.registers.pc,
        _exec(this, inst)
      );
    },

    execute: function (process) {
      this.resetRegisters();
      this.process = process;
      this.isExecuting = true;
    },

    exitProcess: function () {
      this.isExecuting = false;
      this.process = null;
      _KernelInterruptQueue.enqueue(new ExitProcessInterrupt());
    },

    resetRegisters: function () {
      for (var k in this.registers) {
        this.registers[k] = k === 'zf' ? '0' : '00';
      }
    }

  });

  return CPU;

});
