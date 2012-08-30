require([], function () {

  require(['globals']);

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
      'host/Sim',
      'utils/ready'
    ], function (kernel, Sim, ready) {
      ready(function () {
        Sim.init();
      });
    });
  });

  require(['utils']);

});
