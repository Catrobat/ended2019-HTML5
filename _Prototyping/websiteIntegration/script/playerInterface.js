﻿
if (!PocketCode)
	var PocketCode = {};

PocketCode.Web = {

  hwRatio: 15 / 9,
	hPixelOffset: 80,
	vPixelOffset: 15,
	vpMinHeight: 225,
	vpMinWidth: 135,
	
	setHWRatio: function(ratio) {
		PocketCode.Web.hwRatio = ratio;
		PocketCode.Web.onResizeHandler();
	},
	
	fullscreenApiAvailable: function() {
		if (
			document.fullscreenEnabled || 
			document.webkitFullscreenEnabled || 
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
		) 
			return true;
			
		return false;
	}(),
	//requestFullscreen, isFullScreen, cancelFullScreen, document.fullscreenchange
	//http://www.sitepoint.com/use-html5-full-screen-api/
	
	isTablet: function() {
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
	},//(),
	
	isMobile: function() {
	if (PocketCode.isTablet()) return false;

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
	},//(),
	
	onResizeHandler: function() {
		var style = PocketCode.Web.ViewportContainer.style;
		var webLayout = document.getElementById('pcWebLayout');
		var aw = window.innerWidth - 2 * PocketCode.Web.hPixelOffset;	//available width/height	//webLayout.clientWidth
		var ah = window.innerHeight - 2 * PocketCode.Web.vPixelOffset;													//webLayout.clientHeight
		
		var hwr = PocketCode.Web.hwRatio;
		if (hwr > ah / aw) {
			var h = ah;
			var w = ah / hwr;
		}
		else {
			var w = aw;
			var h = aw * hwr
		}
		style.width = w + 'px';
		style.height = h + 'px';
	},
	
	launchProject: function(projectId) {
		//show dialog
		
		//init refs
		PocketCode.Web.ViewportContainer = document.getElementById('pcWebViewportContainer');
		//attach resize handler
		if(window.addEventListener)
			window.addEventListener('resize', PocketCode.Web.onResizeHandler, false);
		else
		  window.attachEvent('onresize', PocketCode.Web.onResizeHandler);
		
		//trigger resize event (call)
		PocketCode.Web.onResizeHandler();	//init size
	},
	
	close: function() {
		if(window.removeEventListener)
			window.removeEventListener('resize', PocketCode.Web.onResizeHandler);
		else
			window.detachEvent('onresize', PocketCode.Web.onResizeHandler);

		//remove from DOM
		
		//dispose app
		
		
	},
	
	toggleFullScreen: function() {
	
	},
	
	toggleMute: function() {
	
	},
	
};

/*
function isDesktop() {
	if (false == isTablet() && false == isMobile()) {
		return true;
	}
	return false;
}

if (isMobile() || isTablet()) {
	document.write('<link href="../css/common-mobile.css" rel="stylesheet">')
}
*/

// is called when you click the "x" sign for closing on the top right
// corner of the screen. only temporary !
//function goBack() {
//    window.history.back();
//}

// is called when you press the "Play" button in the middle of the app preview
// only temporary !
function play() {

	var project = document.getElementById("playerContainerTable_mid");
	var startButton = document.getElementById("startButton");
	var pauseButton = document.getElementById("pauseButton");
	var muteButton = document.getElementById("muteButton");
	var restartButton = document.getElementById("restartButton");
	var arrowPicture = document.getElementById("arrowPicture");

	startButton.style.visibility = "hidden";

	pauseButton.style.opacity = "1";
	muteButton.style.opacity = "1";
	restartButton.style.opacity = "1";
	arrowPicture.style.opacity = "1";

	project.style.opacity = "1";

}

function launchProject(projectId) {

	//if (PocketCode.Web.isTablet || PocketCode.Web.isMobile) {
	//    window.location = "http://www.catrob.at/pocketcode/html5/" + projectId;
	//    return;
  //}

	PocketCode.Web.launchProject(projectId);
	//open popup layer
	//alert("coming so: project id= " + projectId);

	//window.location.href = "../LayoutTests/startpageMockup.html";

	//launch app
}

//mockup test
window.addEventListener("load", function load(event){
	window.removeEventListener("load", load, false); //remove listener, no longer needed
	launchProject(123);  
},false);
//mockup test end

