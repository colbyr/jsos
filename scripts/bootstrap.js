require([], function () {

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
    require([
      'os/kernel',
      'host/control',
      'utils/ready'
    ], function (kernel, Sim, ready) {
      ready(function () {
        Sim.init();
      });
    });
  });

  require(['utils']);

});
