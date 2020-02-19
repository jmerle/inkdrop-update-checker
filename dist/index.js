"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

var _execa = _interopRequireDefault(require("execa"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let commandListener = null;

function notify(level, message, details) {
  const options = {
    dismissable: true
  };

  if (typeof details === 'string') {
    options.detail = details;
  }

  inkdrop.notifications[`add${level}`](message, options);
}

async function checkForUpdates(force) {
  try {
    const {
      stdout
    } = await (0, _execa.default)(inkdrop.packages.getIpmPath(), ['update', '--json'], {
      input: 'no'
    });
    const data = JSON.parse(stdout.split('\n')[0]);

    if (data.length === 0) {
      if (force) {
        notify('Success', 'All plugins are up-to-date.');
      }

      return;
    }

    const pluginsStr = `plugin${data.length > 1 ? 's' : ''}`;
    const namesArr = data.map(item => item.name);
    const firstNames = namesArr.slice(0, -1);
    const lastName = namesArr[namesArr.length - 1];
    const namesStr = `${firstNames.join(', ')} and ${lastName}`;
    const message = `Run 'ipm update' in a terminal to update ${data.length} outdated ${pluginsStr}.`;
    const details = `Outdated ${pluginsStr}: ${namesStr}.`;
    notify('Info', message, details);
  } catch (err) {
    console.error('Could not check for plugin updates', err);

    if (force) {
      notify('Error', `Could not check for plugin updates: ${err.message}`);
    }
  }
}

function activate() {
  commandListener = inkdrop.commands.add(document.body, {
    'update-checker:check': () => checkForUpdates(true)
  });

  if (inkdrop.isMainWindow) {
    checkForUpdates(false);
  }
}

function deactivate() {
  if (commandListener !== null) {
    commandListener.dispose();
    commandListener = null;
  }
}
//# sourceMappingURL=index.js.map