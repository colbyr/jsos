define(['utils/underscore'], function () {

  /**
   * Default status message
   *
   * @var string
   */
  var DEFAULT = 'Everything is fine. Nothing is ruined';

  /**
   * Controller for the status bar
   *
   * @param  node
   * @return void
   */
  function Status(root) {
    this.message = DEFAULT;
    this.root = root;
    this.timeout = undefined;

    // start the clock
    this.refresh();
  }

  _.extend(Status.prototype, {

    /**
     * Updates the status bar
     *
     * @return void
     */
    refresh: function () {
      this.root.innerHTML = this.render();
      this.timeout = window.setTimeout(this.refresh.bind(this), 1000);
    },

    /**
     * Generates the status string
     *
     * @return string
     */
    render: function () {
      return this.message + ' - ' + new Date().toLocaleString();
    },

    /**
     * Sets a new status message and refreshes the bar
     *
     * @param  string
     * @return void
     */
    setStatus: function (message) {
      this.message = message;
      this.refresh();
    }

  });

  return Status;

});