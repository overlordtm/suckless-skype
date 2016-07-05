var gui = require('nw.gui');                  // Load native UI library
var skypeWin = gui.Window.get();                  // Reference to window and tray

// prevent duplicate tray on reload (for development)
window.addEventListener('beforeunload', function() {
  tray.remove();
  tray = null;
}, false);

var menu = new nw.Menu();

var settingsItem = new nw.MenuItem({ type: 'normal', label: 'Settings' })

settingsItem.on('click', function() {
    skypeWin.show();
    $('#settings').modal();

    $('#settings form input[data-settings-key]').each( function() {
        var $this = $(this);
        var key = $this.data('settings-key');
        var value = localStorage.getItem(key);
        if (value === "true") {
            $this.prop('checked', true);
        }
    });

    $('#settings form').on('change', 'input', function() {
        var $this = $(this);

        var key = $this.data('settings-key');
        var type = $this.prop('nodeName');

        console.log("smth changed", key, $this.is('input[type=checkbox]'));

        if ($this.is('input[type=checkbox]')) {
            localStorage.setItem(key, $this.is(':checked'));
        }
    });
});

menu.append(settingsItem);

menu.append(new nw.MenuItem({ type: 'separator' }));

var exitItem = new nw.MenuItem({ type: 'normal', label: 'Exit' })

exitItem.on('click', function() {
    skypeWin.hide();
    gui.App.quit();
});
menu.append(exitItem);

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

// handle exit commad
skypeWin.on('close', function() {
    if (localStorage.getItem('minimizeToTray') === "true") {
        skypeWin.hide();
    } else {
        skypeWin.close(true);
        gui.App.quit();
    }
})

gui.App.on('open', function(args) {
    console.log("odpru sm se");
})


function skypeFrame() {
    return document.getElementById('skypeFrame').contentDocument;
}