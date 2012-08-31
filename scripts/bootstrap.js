require(['globals'], function () {

  require([
    'os/canvastext'
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
