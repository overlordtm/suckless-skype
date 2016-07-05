const SKYPE_FRAME_ID = "#skypeFrame";
const AVAILABLE_STATUS_CLASS = ".PresencePopup-status--online";
const AWAY_STATUS_CLASS = ".PresencePopup-status--idle";
const BUSY_STATUS_CLASS = ".PresencePopup-status--dnd";
const HIDDEN_STATUS_CLASS = ".PresencePopup-status--hidden";
const SETTINGS_BTN_ID = "#menuItem-userSettings";

var gui = require('nw.gui');                  // Load native UI library
var skypeWin = gui.Window.get();                  // Reference to window and tray
var statusRefresherId = null;

// prevent duplicate tray on reload (for development)
window.addEventListener('beforeunload', function() {
  tray.remove();
  tray = null;
}, false);

/* setup tray */
var menu = new nw.Menu();

var settingsItem = new nw.MenuItem({ type: 'normal', label: 'Settings' })
var exitItem = new nw.MenuItem({ type: 'normal', label: 'Exit' })
var availableMenuItem = new gui.MenuItem({ label: 'Available', icon: 'img/available.png' });
var busyMenuItem = new gui.MenuItem({ label: 'Do not disturb', icon: 'img/busy.png' });
var awayMenuItem = new gui.MenuItem({ label: 'Away', icon: 'img/away.png' });
var hiddenMenuItem = new gui.MenuItem({ label: 'Hidden', icon: 'img/hidden.png' });


menu.append(availableMenuItem);
menu.append(busyMenuItem);
menu.append(awayMenuItem);
menu.append(hiddenMenuItem);
menu.append(new nw.MenuItem({ type: 'separator' }));
menu.append(settingsItem);
menu.append(new nw.MenuItem({ type: 'separator' }));
menu.append(exitItem);

settingsItem.on('click', function() {
    skypeWin.show();
    openSettings();
});

exitItem.on('click', function() {
    skypeWin.hide();
    gui.App.quit();
});

availableMenuItem.on('click', function() {
    setStatus(AVAILABLE_STATUS_CLASS);
    setTrayIcon('available.png');
})

busyMenuItem.on('click', function() {
    setStatus(BUSY_STATUS_CLASS);
    setTrayIcon('busy.png');
})

awayMenuItem.on('click', function() {
    setStatus(AWAY_STATUS_CLASS);
    setTrayIcon('away.png');
})

hiddenMenuItem.on('click', function() {
    setStatus(HIDDEN_STATUS_CLASS);
    setTrayIcon('hidden.png');
})

var tray = new nw.Tray({
    title: 'Skype',
    icon: 'img/skype.png',
    tooltip: "Suckless Skype",
    menu: menu
});

// show window on tray click
tray.on('click', function() {
    console.log("tray click", skypeWin);
    if(!skypeWin.shown) {
        skypeWin.show();
        skypeWin.shown = true;
    } else {
        skypeWin.hide();
        skypeWin.shown = false;
    }
    
    
})

/* setup handlers */

// open urls in new broser
skypeWin.on('new-win-policy', function(frame, url, policy) {
  nw.Shell.openExternal(url);
  policy.ignore();
});


// handle exit commad
skypeWin.on('close', function() {
    if (localStorage.getItem('minimizeToTray') === "true") {
        skypeWin.hide();
    } else {
        skypeWin.close(true);
        gui.App.quit();
    }
})

skypeWin.on('loaded', function(frame) {
    var modal = $('#settings')
    if (modal.data('observed') != "true") {
        modal.one('shown.bs.modal', function (e) {
            populateSettings(modal);
            initSettingsListener(modal);
        })
        modal.data("observed", "true")
    }
    if(!statusRefresherId) {
        statusRefresherId = setInterval(statusRefresher, 1000);
    }
})

/* custom functions */

function statusRefresher() {
    var status = skypeFind("#meComponent > div > swx-me-area > div > div > div.Me-skyContainer > swx-avatar-deprecated > span");
    if (!status) {
        return;
    }
    var clazz = status.attr('class');
    status = null;
    if(clazz.indexOf('online') > 0) {
        // online
        setTrayIcon('available.png');
    } else if (clazz.indexOf('idle') > 0) {
        // away
        setTrayIcon('away.png');
    } else if (clazz.indexOf('donotdisturb') > 0) {
        // busy
        setTrayIcon('busy.png');
    } else if (clazz.indexOf('offline') > 0) {
        // invisible
        setTrayIcon('hidden.png');
    } else {
        setTrayIcon('skype.png');
    }
    clazz = null;
}

function setStatus(statusName) {
    var status = skypeFind(statusName)
    if (status.length > 0) {
        status[0].click();
    }
}

function setTrayIcon(iconName) {
    tray.icon = 'img/' + iconName;
}

function skypeFind(selector) {
    var found = skypeFindAll(selector);
    if (found.length > 0) {
        return $(found[0]);
    }
    return null;
}

function skypeFindAll(selector) {
    return $(SKYPE_FRAME_ID).contents().find(selector);
}

function openSettings() {
    $('#settings').modal();
}

function populateSettings(modal) {
    modal.find('input').each(function () {
        $this = $(this);
        var key = $this.data('settings-key');
        if (key) {
            var value = localStorage.getItem(key);
            console.log("populating", $this, value);
            $this.prop('checked', value === "true");
        }
    })
}

function initSettingsListener(modal) {
    modal.find('input').each(function () {
        $(this).on('change', function () {
            $this = $(this);
            var key = $this.data('settings-key');
            var value = $this.prop('checked');
            localStorage.setItem(key, value);
            console.log("Settings changed", key, value);
        })
    })
}