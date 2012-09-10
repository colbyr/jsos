define(['utils/underscore'], function () {

  /**
   * Default status message
   *
   * @var string
   */
  var DEFAULT_STATUS = 'Everything is fine. Nothing is ruined.';

  /**
   * Days of the week for nice clock formatting
   *
   * @var array
   */
  var _days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  /**
   * formats the date from a js Date object
   *  e.g. "Sun"
   *
   * @param  Date
   * @return string
   */
  function _formatDate(date) {
    return _days[date.getDay()];
  }

  /**
   * formats the time from a js Date object
   *  e.g. "10:26 PM"
   *
   * @param  Date
   * @return string
   */
  function _formatTime(date) {
    return date.getHours() % 12 + ':' + date.getMinutes() + ' ' +
      (date.getHours() > 11 ? 'PM' : 'AM');
  }

  /**
   * Controller for the status bar
   *
   * @param  node
   * @return void
   */
  function Status(root) {
    this.message = DEFAULT_STATUS;
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
      var now = new Date();
      return this.message + ' -- ' + _formatDate(now) + ' ' + _formatTime(now);
    },

    /**
     * Restores the status to the default
     *
     * @return void
     */
    resetStatus: function () {
      this.setStatus(DEFAULT_STATUS);
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
    },

    /**
     * Stops refresh loop
     *
     * @return void
     */
    stop: function () {
      this.timeout = window.clearTimeout(this.timeout);
    }

  });

  return Status;

});