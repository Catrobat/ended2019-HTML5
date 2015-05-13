'use strict';

if (!PocketCode)
	var PocketCode = {};

PocketCode.Web = {
	
	/* WEB core namespace: settings and global helpers */
	hwRatio: 15 / 9,
	hPixelOffset: 80,
	vPixelOffset: 17,
	vpMinHeight: 225,
	vpMinWidth: 135,

	setHWRatio: function (ratio) {
		PocketCode.Web.hwRatio = ratio;
		//set the css min-height/min-width property according to the ratio & min-height: 450px
		var style = PocketCode.Web._webOverlay.viewportContainer.style;
		style.minWidth = (450 / ratio) + 'px';
		//update UI
		PocketCode.Web._webOverlay.onResizeHandler();	
	},
	Fullscreen: {
		ApiAvailable: function () {
			if (
				document.fullscreenEnabled ||
				document.webkitFullscreenEnabled ||
				document.mozFullScreenEnabled ||
				document.msFullscreenEnabled
			)
				return true;

			return false;
		}(),
		request: function(element) {
			element = element || document.documentElement;
			
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		},
		isFullscreen: function() {
			if (
				document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement
			) 
				return true;
			return false;
		},
		exit: function() {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
		},
		lastExitDate: new Date(),	//to prevent re-entering fullscreen in chrome: written when event occurs
	},
	isTablet: function () {
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

	isMobile: function () {
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
	},
	
	/* SPLASH SCREEN */
	_splashScreen: {
	},
	
	/* WEBSITE OVERLAY */
	_webOverlay: {
		viewportContainer: function() {
			var div = document.createElement('div');
			div.className = 'pc-webViewport';
			return div;
		}(),
		closeButton : function() {
			var btn = document.createElement('button');
			btn.className = 'pc-webButton';
			btn.innerHTML = '<svg viewBox="0,0,64,64" preserveAspectRatio="xMidYMin meet">' +
								'<polygon points="60.963,50.831 42.124,31.996 60.96,13.159 50.831,3.037 31.999,21.874 13.164,3.04 3.037,13.16 21.876,31.998 3.039,50.836 13.159,60.963 32,42.12 50.842,60.96" />' +
							'</svg>';
			//btn.click = this.close;
			return btn;
		}(),
		close: function() {
			PocketCode.Web._webOverlay.hide();
		},
		fullscreenButton : function() {
			var btn = document.createElement('button')
			btn.className = 'pc-webButton';
			btn.innerHTML = '<svg viewBox="0,0,64,64" preserveAspectRatio="xMidYMin meet">' +
								'<path d="M18.196,56.064L23.122,61H3V40.879l4.936,4.926l8.06-8.061l10.26,10.262L18.196,56.064z M40.879,3 l4.926,4.935l-7.896,7.896L48.17,26.09l7.896-7.895L61,23.122V3H40.879z M7.936,18.196L3,23.122V3h20.122l-4.927,4.935l8.06,8.06 L15.993,26.256L7.936,18.196z M61,40.879l-4.936,4.926l-7.895-7.896L37.909,48.17l7.895,7.896L40.879,61H61V40.879z" />' +
							'</svg>';
			//if (!PocketCode.Web.fullscreenApiAvailable) {
			//	btn.disabled = true;
			//}
			//else			
			//	btn.onclick = this.toggleFullscreen;
			return btn;
		}(),
		toggleFullscreen: function(e) {
			//console.log('toggle fullscreen');
			var fs = PocketCode.Web.Fullscreen;
			if (fs.ApiAvailable) {
				if (fs.isFullscreen())
					fs.exit();
				else
					fs.request();
			}
		},
		updateFullscreenState: function(e) {
			//window.setTimeout(function() {
				var fs = PocketCode.Web.Fullscreen;
				var btn = PocketCode.Web._webOverlay.fullscreenButton;
				if (fs.isFullscreen()) {
					//console.log('fullscreen');
					btn.className += ' pc-playerButtonChecked';
				}
				else {
					//console.log('NOT fullscreen');
					btn.className = btn.className.replace(' pc-playerButtonChecked', '');
					fs.lastExitDate = new Date();
				}
			//}, 20);
		},
		keyCaptureF11: function(e) {
			var fs = PocketCode.Web.Fullscreen;
			//if (fs.isFullscreen())	//not necessary due to the act that the browser knows it's fullscreen mode
			//	return;
		
			e = window.event || e;
			var kc = e.which || e.keyCode;
			
				//console.log(e.type);// + (new Date()));
			if (kc === 122 && !e.altKey) {	//F11
				e.preventDefault();
				e.stopPropagation();
				if (e.type === 'keydown' && !fs.lastKeyDown) {
					fs.lastKeyDown = new Date();
					//console.log('in kd');
				}
				else if (e.type === 'keyup') {
					var delay = fs.lastKeyDown - fs.lastExitDate;
					//console.log (fs.lastKeyDown - fs.lastExitDate);
					if (delay !== NaN && delay > 700)
						PocketCode.Web._webOverlay.toggleFullscreen(e);
					fs.lastKeyDown = undefined;	//delete
				}
				return false;
		   }
		},
		muteButton : function() {
			var btn = document.createElement('button');
			btn.className = 'pc-webButton';
			btn.innerHTML = '<svg viewBox="0,0,64,64" preserveAspectRatio="xMidYMin meet">' +
								'<path d="M14.878,42.697H6.903c-2.136,0-3.867-1.729-3.867-3.866V25.165c0-2.135,1.731-3.866,3.867-3.866h7.976 L14.878,42.697L14.878,42.697z M19.225,20.34v23.315l18.687,10.764V9.581L19.225,20.34z M60.964,37.92l-5.926-5.922l5.925-5.926 l-3.186-3.184l-5.922,5.925l-5.927-5.925l-3.184,3.184l5.925,5.926l-5.925,5.926l3.183,3.184l5.928-5.927l5.925,5.927L60.964,37.92z" />' +
							'</svg>';
			//btn.onclick = this.toggleMute;				
			return btn;
		}(),
		toggleMute: function() {
			alert('toggleMute');
		},
		_overlayDiv: undefined,
		show: function() {
			if (!this._overlayDiv) {
				this._overlayDiv = document.createElement('div');
				this._overlayDiv.className = 'pc-webOverlay';
				this._overlayDiv.innerHTML = 	'<div class="pc-webOpacity"></div>' +
									'<div class="pc-logo">' +
									'<img src="https://pocketcode.org/images/logo/logo_text.png" alt="PocketCode" /></div>';
				var wl = document.createElement('div');
				wl.className = 'pc-webLayout';
				this._overlayDiv.appendChild(wl);
				
				var wlr = document.createElement('div');
				wlr.className = 'pc-webLayoutRow';
				wlr.innerHTML = 	'<div class="pc-leftCol">' +
										'<div class="pc-webLink"><a href="https://pocketcode.org/"></a></div></div>';
				wl.appendChild(wlr);

				//center column
				var cc = document.createElement('div');
				cc.className = 'pc-centerCol';
				wlr.appendChild(cc);
				var vpb = document.createElement('div')
				vpb.className = 'pc-webViewportBorder';
				cc.appendChild(vpb);
				vpb.appendChild(this.viewportContainer);
				
				//right column
				var rc = document.createElement('div');
				rc.className = 'pc-rightCol';
				wlr.appendChild(rc);
				var wm = document.createElement('div');
				wm.className = 'pc-webMenu';
				rc.appendChild(wm);
				
				wm.appendChild(this.closeButton);
				wm.appendChild(this.fullscreenButton);
				if (!PocketCode.Web.Fullscreen.ApiAvailable)
					this.fullscreenButton.disabled = true;
				wm.appendChild(this.muteButton);
				this.muteButton.disabled = true;	//disabled by default: sound manager not loaded yet
			}
			
			//attach resize events
			if (window.addEventListener) {
				window.addEventListener('resize', this.onResizeHandler, false);
				this.closeButton.addEventListener('click', this.close, false);
				this.fullscreenButton.addEventListener('click', this.toggleFullscreen, false);
				this.muteButton.addEventListener('click', this.toggleMute, false);
				//TODO: document.fullscreenchange
			}
			else {
				window.attachEvent('onresize', this.onResizeHandler);
				this.closeButton.attachEvent('onclick', this.close);
				this.fullscreenButton.attachEvent('onclick', this.toggleFullscreen);
				this.muteButton.attachEvent('onclick', this.toggleMute);
				//TODO: document.fullscreenchange
			}
			//attach fullscreen events
			if (PocketCode.Web.Fullscreen.ApiAvailable) {
				document.addEventListener('webkitfullscreenchange', this.updateFullscreenState, false);
				document.addEventListener('mozfullscreenchange', this.updateFullscreenState, false);
				document.addEventListener('fullscreenchange', this.updateFullscreenState, false);
				document.addEventListener('MSFullscreenChange', this.updateFullscreenState, false);
				
				document.addEventListener("keydown",this.keyCaptureF11,false); 
				document.addEventListener("keyup",this.keyCaptureF11,false);
				document.addEventListener("keypress",this.keyCaptureF11,false);
			}

			//trigger resize event (call)
			this.onResizeHandler();	//init size

			//append + change body styles
			document.body.className += ' pc-webBody ';
			document.body.appendChild(this._overlayDiv);
		},
		hide: function() {
			//remove from DOM
			document.body.removeChild(this._overlayDiv);
			
			//remove events
			if (window.removeEventListener) {
				window.removeEventListener('resize', this.onResizeHandler);
				this.closeButton.removeEventListener('click', this.close, false);
				this.fullscreenButton.removeEventListener('click', this.toggleFullscreen, false);
				this.muteButton.removeEventListener('click', this.toggleMute, false);
			}
			else {
				window.detachEvent('onresize', this.onResizeHandler);
				this.closeButton.detachEvent('onclick', this.close);
				this.fullscreenButton.detachEvent('onclick', this.toggleFullscreen);
				this.muteButton.detachEvent('onclick', this.toggleMute);
			}
			//fullscreen events
			if (PocketCode.Web.Fullscreen.ApiAvailable) {
				document.removeEventListener('webkitfullscreenchange', this.updateFullscreenState, false);
				document.removeEventListener('mozfullscreenchange', this.updateFullscreenState, false);
				document.removeEventListener('fullscreenchange', this.updateFullscreenState, false);
				document.removeEventListener('MSFullscreenChange', this.updateFullscreenState, false);
				
				document.removeEventListener("keydown",this.keyCaptureF11,false); 
				document.removeEventListener("keyup",this.keyCaptureF11,false);
				document.removeEventListener("keypress",this.keyCaptureF11,false);
			}

			if (PocketCode.Web.Fullscreen.isFullscreen())	//turn off fullscreen on close
				PocketCode.Web._webOverlay.toggleFullscreen();
			//remove body style
			document.body.className = document.body.className.replace(' pc-webBody ', '');
		},
		onResizeHandler: function() {
			var style = PocketCode.Web._webOverlay.viewportContainer.style;
			var aw = window.innerWidth - 2 * PocketCode.Web.hPixelOffset;
			var ah = window.innerHeight - 2 * PocketCode.Web.vPixelOffset;

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
			
			//test
			//console.log('height: ' + window.outerHeight + ', ' + screen.height + ', ' + window.innerHeight + ', ' + PocketCode.Web._webOverlay._overlayDiv.height);
			//window.outerHeight >= screen.height && 
		},
	},
	
	/* SHORTCUT METHOD TO CALL LAUNCH */
	launchProject: function (projectId) {
		//show dialog
		this._webOverlay.show();

		//init refs
	    //PocketCode.Web.ViewportContainer = document.getElementById('pcWebViewport');
		//attach resize handler
		//if (window.addEventListener)
		//	window.addEventListener('resize', PocketCode.Web.onResizeHandler, false);
		//else
		//	window.attachEvent('onresize', PocketCode.Web.onResizeHandler);

		//trigger resize event (call)
		//PocketCode.Web.onResizeHandler();	//init size
	},

/*	close: function () {
		this._webOverlay.hide();
		//if (window.removeEventListener)
		//	window.removeEventListener('resize', PocketCode.Web.onResizeHandler);
		//else
		//	window.detachEvent('onresize', PocketCode.Web.onResizeHandler);

		//hide from DOM + stop application

		//dispose app

	    //remove from DOM
	},

	toggleFullScreen: function () {

	},

	toggleMute: function () {

	},*/

};

/* Resources: scripts & styles */
PocketCode.Resources = {
	root: '../',	//http://localhost:26825/loadingTestScripts/',
	files: [
		{ url: 'smartJs/sj.js', type: 'js', size: 1 },
		{ url: 'smartJs/sj-core.js', type: 'js', size: 1 },
		{ url: 'smartJs/sj-event.js', type: 'js', size: 1 },
		{ url: 'smartJs/sj-component.js', type: 'js', size: 1 },
		{ url: 'smartJs/sj-animation.js', type: 'js', size: 1 },
		{ url: 'smartJs/sj-communication.js', type: 'js', size: 1 },
		{ url: 'smartJs/sj-ui.js', type: 'js', size: 1 },

		{ url: 'pocketCode/css/pocketCode.css', type: 'css', size: 1 },
		{ url: 'pocketCode/scripts/core.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/model/bricksCore.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/model/bricksControl.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/model/bricksMotion.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/model/bricksSound.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/model/bricksLook.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/model/bricksVariable.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/model/sprite.js', type: 'js', size: 1 },

		{ url: 'pocketCode/scripts/components/proxy.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/components/soundManager.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/components/broadcastManager.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/components/device.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/components/formula.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/components/parser.js', type: 'js', size: 1 },
		//{ url: 'pocketCode/scripts/components/canvas.js', type: 'js', size: 1 },
		{ url: 'pocketCode/scripts/components/gameEngine.js', type: 'js', size: 1 },
	],
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
/*function play() {

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

}*/

function launchProject(projectId) {

	//if (PocketCode.Web.isTablet || PocketCode.Web.isMobile) {
	//    window.location = "http://www.catrob.at/pocketcode/html5/" + projectId#player;
	//    return;
	//}

	PocketCode.Web.launchProject(projectId);
	//open popup layer
	//alert("coming so: project id= " + projectId);

	//window.location.href = "../LayoutTests/startpageMockup.html";

	//launch app
}

//mockup test
//window.addEventListener("load", function load(event){
//    window.removeEventListener("load", load, false); //remove listener, no longer needed
//    launchProject(123);  
//},false);
//mockup test end
