require([
  'os/kernel',
  'host/Sim',
  'vendor/ready',
  'globals'
], function (Kernel, Sim, ready) {
  ready(function () {
    Sim.init(Kernel);
  });
});
