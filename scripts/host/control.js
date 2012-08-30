/* ------------  
   Control.js

   Requires global.js.

   Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document envorinment inside a browser is the "bare metal" (so to speak) for which we write code that
   hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in 
   both the host and client environments.

   This (and other host/simulation scripts) is the only place that we should see "web" code, like 
   DOM manipulation and JavaScript event handling, and so on.  (Index.html is the only place for markup.)

   This code references page numbers in the text book: 
   Operating System Concepts 8th editiion by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

define([
  'host/cpu'
], function (CPU) {
  //
  // Control Services
  //
  var _btns = null;
  var _display = null;
  var _hardwareClockId = null;
  var _taLog = null;

  function _listen(element, func) {
    element.onclick = func;
    if (element.captureEvents) {
      element.captureEvents(Event.CLICK);
    }
  }

  var Sim = {

    init: function () {
      _display = document.getElementById("display");
      // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
      CANVAS  = _display;
      // Get a global reference to the drawing context.
      DRAWING_CONTEXT = CANVAS.getContext('2d');
      // Enable the added-in canvas text functions (see canvastext.js for provenance and details).
      CanvasTextFunctions.enable(DRAWING_CONTEXT);
      // Clear the log text box.
      _taLog = document.getElementById("taLog");
      _taLog.value = '';
      // Set focus on the start button.
      _btns = {
        halt: document.getElementById('btnHaltOS'),
        start: document.getElementById('btnStartOS'),
        reset: document.getElementById('btnReset')
      };
      for (var k in _btns) {
        _listen(_btns[k], this[k]);
      }
      _btns.start.focus();     // TODO: This does not seem to work.  Why?
    },

    log: function (msg, source) {
        if (!source) {
            source = "?";
        }

        // Build the log string.   
        var str = "({ clock:" + _OSclock +
          ", source:" + source +
          ", msg:" + msg +
          ", now:" + Date.now() +
          " })"  + "\n";

        // Update the log console.
        _taLog.value = str + taLog.value;
        // Optionally udpate a log database or some streaming service.
    },


    //
    // Control Events
    //
    start: function (btn) {
        // Disable the start button...
        btn.disabled = true;

        // .. enable the Emergency Halt and Reset buttons ...
        _btns.halt.disabled = false;
        _btns.reset.disabled = false;

        // .. set focus on the OS console display ... 
        _display.focus();

        // ... Create and initialize the CPU ...
        _CPU = new CPU();
        _CPU.init();

        // ... then set the clock pulse simulation to call ?????????.
        _hardwareClockID = setInterval(simClockPulse, CPU_CLOCK_INTERVAL);
        // .. and call the OS Kernel Bootstrap routine.
        krnBootstrap();
    },

    halt: function (btn) {
        this.log("emergency halt", "host");
        this.log("Attempting Kernel shutdown.", "host");
        // Call the OS sutdown routine.
        krnShutdown();
        // Stop the JavaScript interval that's simulating our clock pulse.
        clearInterval(_hardwareClockID);
        // TODO: Is there anything else we need to do here?
    },

    reset: function (btn) {
        // The easiest and most thorough way to do this is to reload (not refresh) the document.
        location.reload(true);  
        // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
        // be reloaded from the server. If it is false or not specified, the browser may reload the 
        // page from its cache, which is not what we want.
    }
  };

  return Sim;

});
