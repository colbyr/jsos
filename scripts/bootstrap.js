require([
  'os/Kernel',
  'host/Sim',
  'utils/ready',
  'globals'
], function (Kernel, Sim, ready) {
  ready(function () {
    Sim.init(Kernel);
  });
});
