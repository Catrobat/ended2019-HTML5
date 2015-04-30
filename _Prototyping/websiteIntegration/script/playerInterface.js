function isTablet() {
    var ua = navigator.userAgent;

    // Check if user agent is a Tablet
    if ((/iP(a|ro)d/i.test(ua)) || ((/tablet/i.test(ua)) && (!/RX-34/i.test(ua)) || (/FOLIO/i.test(ua)))) {
        return true;
    }
        // Check if user agent is an Android Tablet
    else if ((/Linux/i.test(ua)) && (/Android/i.test(ua)) && (!/Fennec|mobi|HTC.Magic|HTCX06HT|Nexus.One|SC-02B|fone.945/i.test(ua))) {
        return true;
    }
        // Check if user agent is a Kindle or Kindle Fire
    else if ((/Kindle/i.test(ua)) || /Mac.OS/i.test(ua) && (/Silk/i.test(ua))) {
        return true;
    }
        // Check if user agent is a pre Android 3.0 Tablet
    else if ((/GT-P10|SC-01C|SHW-M180S|SGH-T849|SCH-I800|SHW-M180L|SPH-P100|SGH-I987|zt180|HTC(.Flyer|\_Flyer)|Sprint.ATP51|ViewPad7|pandigital(sprnova|nova)|Ideos.S7|Dell.Streak.7|Advent.Vega|A101IT|A70BHT|MID7015|Next2|nook/i.test(ua)) || (/MB511/i.test(ua))) {
        return true;
    }

    return false;
}

function isMobile() {
    if (isTablet()) return false;

    var ua = navigator.userAgent;

    // Check if user agent is unique Mobile User Agent
    if ((/BOLT|Fennec|Iris|Maemo|Minimo|Mobi|mowser|NetFront|Novarra|Prism|RX-34|Skyfire|Tear|XV6875|XV6975|Google.Wireless.Transcoder/i.test(ua))) {
        return true;
    }
        // Check if user agent is an odd Opera User Agent - http://goo.gl/nK90K
    else if ((/Opera/i.test(ua)) && (/Windows.NT.5/i.test(ua)) && (/HTC|Xda|Mini|Vario|SAMSUNG\-GT\-i8000|SAMSUNG\-SGH\-i9/i.test(ua))) {
        return true;
    }
    return false;
}

function isDesktop() {
    if (false == isTablet() && false == isMobile()) {
        return true;
    }
    return false;
}

if (isMobile() || isTablet()) {
    document.write('<link href="../css/common-mobile.css" rel="stylesheet">')
}

function launchProject(projectId) {

    //if (!isDesktop()) {
    //    window.location = "http://www.catrob.at/pocketcode/html5/" + projectId;
    //    return;
    //}

    //open popup layer
    alert("coming soon: project id= " + projectId);
    //launch app
}