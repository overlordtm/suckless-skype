const SKYPE_FRAME_ID = "#skypeFrame";
const AVAILABLE_STATUS_CLASS = ".PresencePopup-status--online";
const AWAY_STATUS_CLASS = ".PresencePopup-status--idle";
const BUSY_STATUS_CLASS = ".PresencePopup-status--dnd";
const HIDDEN_STATUS_CLASS = ".PresencePopup-status--hidden";
const SETTINGS_BTN_ID = "#menuItem-userSettings";

var gui = require('nw.gui');                  // Load native UI library
var skypeWin = gui.Window.get();                  // Reference to window and tray

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
var busyMenuItem = new gui.MenuItem({ label: 'Busy', icon: 'img/busy.png' });
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
    skypeWin.show();
})

/* setup handlers */

// handle exit commad
skypeWin.on('close', function() {
    if (localStorage.getItem('minimizeToTray') === "true") {
        skypeWin.hide();
    } else {
        skypeWin.close(true);
        gui.App.quit();
    }
})

skypeWin.on('document-start', function(frame) {
    console.log("document-start", frame);
    $(frame.document).ready(function() {
        var x = $(this).find(SETTINGS_BTN_ID);
        console.log("frame ready", x, this);

    });
    // $(SKYPE_FRAME_ID).contents().ready(function () {
    //     var settingsBtn = skypeFind(SETTINGS_BTN_ID);
    //     console.log("SKYPE frame ready", settingsBtn);
    // });
})

/* custom functions */

function setStatus(statusName) {
    var status = $(skypeFrame()).find(statusName)
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
    var settingsBtn = skypeFind(SETTINGS_BTN_ID);
    if(!settingsBtn.hasClass("active")) {
        settingsBtn[0].click();
        setTimeout(customizeSettings, 0);
    }
}

function customizeSettings() {
    var list = skypeFind("#swxContent1 > swx-navigation > div > div > section > div.UserSettingsPage-master > ul");
    if (!list) {
        console.log("Failed to get settings pane");
        return
    }

    if (list.hasClass('suckless-skype')) {
        console.log("Settings already customized");
        return;
    }

    console.log("Customizing settings menu");

    var listItem = $('<li>').attr('role', 'option');
    var href = $('<a>').attr('href', '#').addClass('DesktopSettingsPage-category');
    var title = $('<h2>').addClass('DesktopSettingsPage-label').html("Desktop");

    $(href).on('click', function() {
        var detailsPane = skypeFind('.UserSettingsPage-detail');
        console.log("Desktop settings clicked", detailsPane);
    });

    href.append(title);
    listItem.append(href);
    list.append(listItem);
    list.addClass('suckless-skype');
}