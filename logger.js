var app = require('http').createServer(handler);
var dateformat = require('dateformat');
var io = require('socket.io').listen(app);
var fs = require('fs');

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

function format(data) {
  return [
    data.source + ' :',
    '[' + dateformat(data.now) + ']',
    '[' + (data.type ? date.type : 'info') + ']',
    (data.msg ? data.msg : 'null') + '\n'
  ].join(' ');
}

function log(log, message) {
  console.log(log, message);
  fs.open('logs/' + log + '.log', 'a', 666, function( e, id ) {
    fs.write(id, format(message), null, 'utf8', function(){
      fs.close(id);
    });
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('client log', { msg: 'connected' });
  socket.on('log', function (data) {
    console.log(data);
    log(data.log, data.info);
  });
});