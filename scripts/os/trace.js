/**
 * Trace Function
 */

define(['host/log'], function (log) {

    return function (msg) {
       // Check globals to see if trace is set ON.  If so, then (maybe) log the message. 
       if (_Trace) {
          if (msg === "Idle") {
             // We can't log every idle clock pulse because it would lag the browser very quickly.
             if (_OSclock % 10 == 0) {
               // Check the CPU_CLOCK_INTERVAL in globals.js for an 
               // idea of the tick rate and adjust this line accordingly.
                log(msg, "OS");
             }
          } else {
            log(msg, "OS");
          }
       }
    };

});
