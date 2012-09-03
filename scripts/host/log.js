define([
  'utils/ready'
], function (ready) {

  var _taLog = null;

  ready(function () {
    _taLog = document.getElementById('taLog');
    _taLog.value = '';
  });

  function log(type, source, msg) {
    // Update the log console.
    var data = {
      clock: _OSclock,
      source: source || '?',
      msg: msg,
      now: Date.now(),
      type: type || 'info'
    };

    _taLog.value = [
      data.source + ' :',
      '[' + data.now + ']',
      '[' + data.clock + ']',
      data.msg
    ].join(' ') + '\n' + _taLog.value;

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
