require([
  'os/Kernel',
  'host/Sim',
  'utils/ready',
  'globals',
  'utils'
], function (Kernel, Sim, ready) {
  ready(function () {
    Sim.init(Kernel);
  });
});
