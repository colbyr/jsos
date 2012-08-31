define([
  'utils/ready'
], function (ready) {

  var _taLog = null;

  ready(function () {
    _taLog = document.getElementById('taLog');
    _taLog.value = '';
  });

  function log(msg, source) {
    // Update the log console.
    _taLog.value = JSON.stringify({
      clock: _OSclock,
      source: source ? source : '?',
      msg: msg,
      now: Date.now()
    }) + taLog.value;
    // Optionally udpate a log database or some streaming service.
  }

  return log;

});
