require([
  'os/Kernel',
  'host/Sim',
  'vendor/ready',
  'globals'
], function (Kernel, Sim, ready) {
  ready(function () {
    Sim.init(Kernel);
  });
});
