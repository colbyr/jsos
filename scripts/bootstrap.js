require([], function () {

  console.log('boostrapped!');

  require([
    'host/control',
    'host/devices',
    'host/cpu'
  ]);

  require([
    'os/interrupt',
    'os/canvastext',
    'os/console',
    'os/deviceDriver',
    'os/deviceDriverKeyboard',
    'os/queue',
    'os/shell'
  ], function () {
    require(['os/kernel']);
  });

  require(['utils']);

});
