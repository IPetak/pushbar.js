class Pushbar {
  constructor(config = { overlay: false, blur: false }) {
    this.activeBar    = '';
    this.previousBars = [];
    this.root         = document.querySelector('html');

    if (config.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.classList.add('pushbar_overlay');
      document.querySelector('body').appendChild(this.overlay);
    }

    if (config.blur) {
      const mainContent = document.querySelector('.pushbar_main_content');
      if (mainContent) {
        mainContent.classList.add('pushbar_blur');
      }
    }

    this.bindEvents();
  }

  static dispatchOpen(pushbar) {
    const event = new CustomEvent('pushbar_opening', { bubbles: true, detail: { pushbar } });
    pushbar.dispatchEvent(event);
  }

  static dispatchClose(pushbar) {
    const event = new CustomEvent('pushbar_closing', { bubbles: true, detail: { pushbar } });
    pushbar.dispatchEvent(event);
  }

  static findPushbarById(pushbarId) {
    return document.querySelector('[data-pushbar-id='+pushbarId+']');
  }

  handleOpenEvent(e) {
    e.preventDefault();
    var pushbarId = e.currentTarget.getAttribute('data-pushbar-target');

    if (pushbarId) {
      this.open(pushbarId);
    }
  }

  handleCloseEvent(e) {
    e.preventDefault();
    if ('click' === e.type) {
      var pushbarId = e.currentTarget.getAttribute('data-pushbar-target') || e.currentTarget.getAttribute('data-pushbar-close') || this.activeBar;
      this.close(pushbarId);
    } else if ('keyup' === e.type) {
      this.close(this.activeBar);
    }
  }

  handleKeyEvent(e) {
    if (this.root.classList.contains('pushbar_locked') && e.keyCode === 27) {
      this.handleCloseEvent(e);
    }
  }

  bindEvents() {
    var _this         = this,
        trigger_types = [ 'target', 'close' ],
        triggers      = '';

    trigger_types.forEach(function (type) {
      triggers = Array.from(document.querySelectorAll('[data-pushbar-'+type+']'));
      triggers.forEach(function (trigger) {
        return trigger.addEventListener('click', function (e) {
          var pushbar = Pushbar.findPushbarById(e.currentTarget.getAttribute('data-pushbar-'+type));

          if (pushbar) {
            if (pushbar.classList.contains('opened')) {
              this.classList.remove('open');
              return _this.handleCloseEvent(e);
            } else {
              this.classList.add('open');
              return _this.handleOpenEvent(e);
            }
          } else {
            return e.preventDefault();
          }
        }, false);
      });
    });

    if (this.overlay) {
      this.overlay.addEventListener('click', e => this.handleCloseEvent(e), false);
    }

    // Handle closing stacked pushbars with escape key.
    document.addEventListener('keyup', e => this.handleKeyEvent(e));
  }

  open(pushbarId) {
    // Get new pushbar target
    var pushbar = Pushbar.findPushbarById(pushbarId);

    if (!pushbar) return;

    pushbar.classList.add('opened');
    pushbar.classList.add('is-open');
    Pushbar.dispatchOpen(pushbar);

    // Set pushbar lock on html element for easy access.
    this.root.classList.add('pushbar_locked');
    // Save currently open pushbar to pushbar trail arrray.
    var previousBar = this.root.getAttribute('pushbar', pushbarId);
    if (previousBar) {
      this.previousBars.push(previousBar);
    }
    // Set currently open pushbar as active one.
    this.root.setAttribute('pushbar', pushbarId);

    this.activeBar = pushbarId;
  }

  close(pushbarId) {
    // Get new pushbar target
    var pushbar = Pushbar.findPushbarById(pushbarId);

    if (!pushbar) return;

    Pushbar.dispatchClose(pushbar);

    pushbar.classList.remove('opened');

    // Set previusly opened pushbar as currently active one.
    if (this.previousBars) {
      this.activeBar = this.previousBars.pop();
      this.root.setAttribute('pushbar', this.activeBar);
    }

    // If all pushbars are closed remove pushbar lock and active bar data.
    if (! this.activeBar) {
      this.root.classList.remove('pushbar_locked');
      this.root.removeAttribute('pushbar');
    }
  }
}
