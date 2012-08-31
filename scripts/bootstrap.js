require(['globals'], function () {

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
      'os/Kernel',
      'host/Sim',
      'utils/ready'
    ], function (Kernel, Sim, ready) {
      ready(function () {
        Sim.init(Kernel);
      });
    });
  });

  require(['utils']);

});
