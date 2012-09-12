/**
 * Trace Function
 */

define(['host/log'], function (log) {

  var _THROTTLE = 10;

  return function (msg) {
    // Check globals to see if trace is set ON.  If so, then (maybe) log it
    if (_Trace &&
        // We can't log every idle clock pulse because it would lag the browser
        (msg !== 'Idle' || _OSclock % _THROTTLE === 0)) {
      log('info', 'OS', msg);
    }
  };

});
