/* ------------
   Kernel.js

   Requires globals.js

   Routines for the Operataing System, NOT the host.

   This code references page numbers in the text book:
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.
      ISBN 978-0-470-12872-5
   ------------ */

define([
  'host/log',
  'host/Sim',
  'os/Console',
  'os/MemoryManager',
  'os/process/Process',
  'os/Queue',
  'os/Shell',
  'os/Status',
  'os/trace',
  'os/drivers/Keyboard'
], function (log, Sim, Console, MemoryManager, Process, Queue, Shell, Status, trace, KeyboardDriver) {

  var _processes = {};

  var Kernel = {

    createProcess: function (code) {
      var pid;
      var process = new Process(code);
      if (process.valid) {
        _processes['pid_' + process.pid] = process;
        pid = process.pid;
      }
      return pid;
    },

    //
    // OS Startup and Shutdown Routines
    //
    bootstrap: function () { // Page 8
      // Use simLog because we ALWAYS want this, even if _Trace is off.
      log('info', 'host', 'bootstrap');

      // Initialize our global queues.
      _KernelInterruptQueue = new Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
      _KernelBuffers = []; // Buffers... for the kernel.
      _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

      _MemoryManager = new MemoryManager();
      _Console = new Console();             // The console output device.
      _Status = new Status(
        document.getElementById('status_bar')
      );

      // Initialize standard input and output to the _Console.
      _StdIn  = _Console;
      _StdOut = _Console;

      // Load the Keyboard Device Driver
      trace('Loading the keyboard device driver.');
      // Construct it.
      this.keyboardDriver = new KeyboardDriver();
      // Call the driverEntry() initialization routine
      this.keyboardDriver.driverEntry();
      trace(this.keyboardDriver.status);

      //
      // ... more?
      //

      // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
      trace('Enabling the interrupts.');
      this.enableInterrupts();
      // Launch the shell.
      trace('Creating and Launching the shell.');
      _OsShell = new Shell(this);
    },

    shutdown: function () {
      trace('begin shutdown OS');
      // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
      // ... Disable the Interruupts.
      trace('Disabling the interrupts.');
      this.disableInterrupts();
      //
      // Unload the Device Drivers?
      // More?
      //
      trace('end shutdown OS');
    },


    onCPUClockPulse: function () {
      // This gets called from the host hardware every time there is a hardware
      // clock pulse. This is NOT the same as a TIMER, which causes an interrupt
      // and is handled like other interrupts. This, on the other hand, is the
      // lock pulse from the hardware (or host) that tells the kernel that it
      // has to look for interrupts and process them if it finds any.

      // Check for an interrupt, are any. Page 560
      if (_KernelInterruptQueue.getSize() > 0) {
        // Process the first interrupt on the interrupt queue.
        // TODO: Implement a priority queye based on the IRQ number/id to enforce interrupt priority.
        var interrput = _KernelInterruptQueue.dequeue();
        this.interruptHandler(interrput.irq, interrput.params);
      } else if (_CPU.isExecuting) {
        // If there are no interrupts then run a CPU cycle if there is anything being processed.
        _CPU.cycle();
      } else {
        // If there are no interrupts and there is nothing being executed then just be idle.
        trace('Idle');
      }
      Sim.updateMonitor();
    },

    //
    // Interrupt Handling
    //
    enableInterrupts: function () {
      // Keyboard
      Sim.enableKeyboardInterrupt();
      // Put more here.
    },

    disableInterrupts: function () {
      // Keyboard
      Sim.disableKeyboardInterrupt();
      // Put more here.
    },

    // This is the Interrupt Handler Routine.  Page 8.
    interruptHandler: function (irq, params) {
      // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
      trace('Handling IRQ~' + irq);

      // Save CPU state. (I think we do this elsewhere.)

      // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
      // TODO: Use Interrupt Vector in the future.
      // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
      //       Maybe the hardware simulation will grow to support/require that in the future.
      switch (irq) {
        case TIMER_IRQ:
          this.TimerISR(); // Kernel built-in routine for timers (not the clock)
          break;
        case KEYBOARD_IRQ:
          this.keyboardDriver.isr(params[0], params[1]); // Kernel mode device driver
          _StdIn.handleInput();
          break;
        case CREATE_PROCESS_IRQ:
          var pid = this.createProcess(params.program);
          if (pid) {
            _StdIn.putText('pid ' + pid);
            _OsShell.advanceLine();
          } else {
            _StdIn.putText('FAIL: unable to create process');
            _OsShell.advanceLine();
          }
          break;
        case EXIT_PROCESS_IRQ:
          _OsShell.advanceLine();
          break;
        case RUN_PROCESS_IRQ:
          var process = _processes['pid_' + params.pid];
          if (process) {
            _CPU.execute(process);
          } else {
            _StdIn.putText('FAIL: process ' + params.pid + ' does not exist');
            _OsShell.advanceLine();
          }
          break;
        case PRINT_IRQ:
          _StdIn.putText(params.item + ' ');
          break;
        default:
          this.trapError(
            'Invalid Interrupt Request. irq=' + irq + ' params=[' + params + ']'
          );
      }

      // 3. Restore the saved state.  TODO: Question: Should we restore the state via IRET in the ISR instead of here? p560.
    },

    timerISR: function () {
      // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver).
      // Check multiprogramming parameters and enfore quanta here. Call the scheduler / context switch here if necessary.
    },

    //
    // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
    //
    // Some ideas:
    // - ReadConsole
    // - WriteConsole
    // - CreateProcess
    // - ExitProcess
    // - WaitForProcessToExit
    // - CreateFile
    // - OpenFile
    // - ReadFile
    // - WriteFile
    // - CloseFile


    trapError: function (msg) {
      log('error', 'OS', 'TRAP: ' + msg);
      // TODO: Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
      _Console.blueScreen();
      this.shutdown();
    }
  };

  /**
   * Exposes kernel functions to other OS componenets
   *
   * @var object
   */
  _KernelInterface = {
    shutdown: function () {
      Kernel.shutdown();
    },

    trapError: function (message) {
      Kernel.trapError(message);
    }
  };

  return Kernel;
});
