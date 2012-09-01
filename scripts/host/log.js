define([
  'utils/ready'
], function (ready) {

  var _taLog = null;

  ready(function () {
    _taLog = document.getElementById('taLog');
    _taLog.value = '';
  });

  function log(msg, source, type) {
    // Update the log console.
    var data = {
      clock: _OSclock,
      source: source ? source : '?',
      msg: msg,
      now: Date.now()
    };

    _taLog.value = JSON.stringify(data) + _taLog.value;

    // Optionally udpate a log database or some streaming service.
    if (socket) {
      socket.emit('log', {
        log: data.source,
        info: data
      });
    }
  }

  return log;

});
