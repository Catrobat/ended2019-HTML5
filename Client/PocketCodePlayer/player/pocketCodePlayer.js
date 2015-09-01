/// <reference path="../../smartJs/sj.js" />
/// <reference path="../../smartJs/sj-core.js" />
/// <reference path="../../smartJs/sj-event.js" />
'use strict';

if (!PocketCode)
	var PocketCode = {};

PocketCode.websiteUrl = 'https://share.catrob.at/pocketcode/';
PocketCode.projectUrl = PocketCode.websiteUrl + 'program/{projectId}';
PocketCode.mobileUrl = PocketCode.websiteUrl + 'html5/player/{projectId}';
PocketCode.logoUrl = 'https://share.catrob.at/images/logo/logo_text.png';

PocketCode.Web = {

	/* root path for css and scripts to be loaded dynamically */
	resourceRoot: '',   //TODO: add release deployment url

	FullscreenApi: new ((function () {
		function FullscreenApi() {
			if (window.addEventListener)
				window.addEventListener('load', this._initOnLoad.bind(this), false);
			else
				window.attachEvent('onload', this._initOnLoad.bind(this));
		}

		FullscreenApi.prototype = {
			_initOnLoad: function () {    //init when DOM available
				this.supported = function () {
					if (document.fullscreenEnabled || document.webkitFullscreenEnabled ||
						document.mozFullScreenEnabled || document.msFullscreenEnabled)
						return true;

					return false;
				}();

				if (this.supported) {
					//bind events
					this._addDomListener(document, 'fullscreenchange', this._fullscreenchangeHandler);
					this._addDomListener(document, 'webkitfullscreenchange', this._fullscreenchangeHandler);
					this._addDomListener(document, 'mozfullscreenchange', this._fullscreenchangeHandler);
					this._addDomListener(document, 'MSFullscreenChange', this._fullscreenchangeHandler);
				}
				this.lastExitDate = new Date(); //to prevent re-entering fullscreen in chrome: written when event occurs

				this.onFullscreenChange = function (state) {
					//default event handler to be overwritten
				};
			},
			_addDomListener: function (target, eventName, eventHandler) {
				var handler = eventHandler.bind(this);
				target.addEventListener(eventName, handler, false);
				return handler;
			},
			_removeDomListener: function (target, eventName, eventHandler) {
				target.removeEventListener(eventName, eventHandler, false);
			},
			bindF11: function () {
				if (this.supported && !this.isBrowserFullscreen()) {
					this._l1 = this._addDomListener(document, 'keydown', this._keyHandler);
					this._l2 = this._addDomListener(document, 'keyup', this._keyHandler);
					this._l3 = this._addDomListener(document, 'keypress', this._keyHandler);
				}
			},
			unbindF11: function () {
				if (!this._l1 || !this._l2 || !this._l3)
					return;

				this._removeDomListener(document, 'keydown', this._l1);
				this._removeDomListener(document, 'keyup', this._l2);
				this._removeDomListener(document, 'keypress', this._l3);
			},
			isJsFullscreen: function () {
				if (
					document.fullscreenElement ||
					document.webkitFullscreenElement ||
					document.mozFullScreenElement ||
					document.msFullscreenElement
				)
					return true;

				return false;
			},
			isBrowserFullscreen: function () {
				return (window.outerHeight >= screen.height && window.outerWidth >= screen.width);
			},
			requestFullscreen: function (element) {
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
			exitFullscreen: function () {
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
			toggleFullscreen: function (e) {
				if (this.supported) {
					if (this.isJsFullscreen())
						this.exitFullscreen();
					else
						this.requestFullscreen();
				}
			},
			_fullscreenchangeHandler: function (e) {
				var _self = this;
				window.setTimeout(function () {  //needed to detect fullscreen correctly in IE
					var fs = _self.isJsFullscreen.bind(_self);
					if (!fs())
						_self.lastExitDate = new Date();

					_self.onFullscreenChange.call(_self, fs());
				}, 10);
			},
			_keyHandler: function (e) {
				e = e || window.event;
				var kc = e.keyCode || e.which;

				if (kc === 122 && !e.altKey) {	//F11
					e.preventDefault();
					e.stopPropagation();

					if (e.type === 'keydown' && !this.lastKeyDown) {
						this.lastKeyDown = new Date();
					}
					else if (e.type === 'keyup') {
						var delay = this.lastKeyDown - this.lastExitDate;

						if (delay !== NaN && delay > 700)
							this.toggleFullscreen(e);
						this.lastKeyDown = undefined;
					}
					return false;
				}
			},
		};

		return FullscreenApi;
	})())(),

	WebOverlay: (function () {
		function WebOverlay() {
			/* default settings for layout */
			this.hwRatio = 15 / 9;
			this.hPixelOffset = 80;
			this.vPixelOffset = 17;
			this.vpMinHeight = 225;
			//this.vpMinWidth = 135;

			//init DOM
			//viewportContainer
			var div = document.createElement('div');
			div.className = 'pc-playerViewport';
			this.viewportContainer = div;

			//closeButton
			var btn = document.createElement('button');
			btn.className = 'pc-webButton';
			btn.innerHTML = '<svg viewBox="0,0,64,64" preserveAspectRatio="xMidYMin meet">' +
								'<polygon points="60.963,50.831 42.124,31.996 60.96,13.159 50.831,3.037 31.999,21.874 13.164,3.04 3.037,13.16 21.876,31.998 3.039,50.836 13.159,60.963 32,42.12 50.842,60.96" />' +
							'</svg>';
			this.closeButton = btn;

			//fullscreenButton
			var btn = document.createElement('button')
			btn.className = 'pc-webButton';
			btn.innerHTML = '<svg viewBox="0,0,64,64" preserveAspectRatio="xMidYMin meet">' +
								'<path d="M18.196,56.064L23.122,61H3V40.879l4.936,4.926l8.06-8.061l10.26,10.262L18.196,56.064z M40.879,3 l4.926,4.935l-7.896,7.896L48.17,26.09l7.896-7.895L61,23.122V3H40.879z M7.936,18.196L3,23.122V3h20.122l-4.927,4.935l8.06,8.06 L15.993,26.256L7.936,18.196z M61,40.879l-4.936,4.926l-7.895-7.896L37.909,48.17l7.895,7.896L40.879,61H61V40.879z" />' +
							'</svg>';
			this.fullscreenButton = btn;

			//muteButton
			btn = document.createElement('button');
			btn.className = 'pc-webButton';
			btn.innerHTML = '<svg viewBox="0,0,64,64" preserveAspectRatio="xMidYMin meet">' +
								'<path d="M14.878,42.697H6.903c-2.136,0-3.867-1.729-3.867-3.866V25.165c0-2.135,1.731-3.866,3.867-3.866h7.976 L14.878,42.697L14.878,42.697z M19.225,20.34v23.315l18.687,10.764V9.581L19.225,20.34z M60.964,37.92l-5.926-5.922l5.925-5.926 l-3.186-3.184l-5.922,5.925l-5.927-5.925l-3.184,3.184l5.925,5.926l-5.925,5.926l3.183,3.184l5.928-5.927l5.925,5.927L60.964,37.92z" />' +
							'</svg>';
			this.muteButton = btn;

			//this._dom
			var overlay = document.createElement('div');
			overlay.className = 'pc-webOverlay';
			overlay.innerHTML = '<div class="pc-webOpacity"></div>' +
									'<div class="pc-logo">' +
									'<img src="' + PocketCode.logoUrl + '" alt="PocketCode" /></div>';
			var wl = document.createElement('div');
			wl.className = 'pc-webLayout';
			overlay.appendChild(wl);

			//left column
			var wlr = document.createElement('div');
			wlr.className = 'pc-webLayoutRow';
			wlr.innerHTML = '<div class="pc-leftCol">' +
									'<div class="pc-webLink"><a href="' + PocketCode.websiteUrl + '"></a></div></div>';
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

			wm.appendChild(this.muteButton);
			this.muteButton.disabled = true;	//disabled by default: sound manager not loaded yet

			this._dom = overlay;
			//this._touchStartHandler = undefined;
			//this._touchEndHandler = undefined;
			//this._touchCancelHandler = undefined;
			//this._touchLeaveandler = undefined;
			//this._touchMoveHandler = undefined;

			//bind events
			if (window.addEventListener) {
				window.addEventListener('resize', this._onResizeHandler.bind(this), false);
				this.closeButton.addEventListener('click', this._hide.bind(this), false);
				this.fullscreenButton.addEventListener('click', this._toggleFullscreenHandler.bind(this), false);
				this.muteButton.addEventListener('click', this._toggleMuteHandler.bind(this), false);
			}
			else {
				window.attachEvent('onresize', this._onResizeHandler.bind(this)._onResizeHandler);
				this.closeButton.attachEvent('onclick', this._hide.bind(this));
				this.fullscreenButton.attachEvent('onclick', this._toggleFullscreenHandler.bind(this));
				this.muteButton.attachEvent('onclick', this._toggleMuteHandler.bind(this));
			}
		}

		WebOverlay.prototype = {
			_addDomListener: function (target, eventName, eventHandler) {
				var handler = eventHandler.bind(this);
				target.addEventListener(eventName, handler, false);
				return handler;
			},
			_removeDomListener: function (target, eventName, eventHandler) {
				target.removeEventListener(eventName, eventHandler, false);
			},
			_onResizeHandler: function (e) {
				var style = this.viewportContainer.style;
				var aw = window.innerWidth - 2 * this.hPixelOffset;
				var ah = window.innerHeight - 2 * this.vPixelOffset;

				var hwr = this.hwRatio, w, h;
				if (hwr >= ah / aw) {
					w = ah / hwr;
					h = ah;
				}
				else {
					w = aw;
					h = aw * hwr;
				}
				if (h < this.vpMinHeight) {
					h = this.vpMinHeight;
					w = h / hwr;
				}

				style.width = w + 'px';
				style.height = h + 'px';
			},
			_toggleFullscreenHandler: function (e) {
				PocketCode.Web.FullscreenApi.toggleFullscreen();
			},
			_toggleMuteHandler: function (e) {
				console.log('TODO: trigger event to notify application');
			},
			appendSplash: function (splashScreen) {
				this._splashScreen = splashScreen;
				this.viewportContainer.appendChild(splashScreen._dom);
			},
			show: function () {
				this._touchStartHandler = this._addDomListener(document, 'touchstart', function (e) { e.preventDefault(); }, false); //e.stopPropagation(); return false; 
				this._touchEndHandler = this._addDomListener(document, 'touchend', function (e) { e.preventDefault(); }, false);
				this._touchCancelHandler = this._addDomListener(document, 'touchcancel', function (e) { e.preventDefault(); }, false);
				this._touchLeaveandler = this._addDomListener(document, 'touchleave', function (e) { e.preventDefault(); }, false);
				this._touchMoveHandler = this._addDomListener(document, 'touchmove', function (e) { e.preventDefault(); }, false);

				var fapi = PocketCode.Web.FullscreenApi;
				if (fapi.supported && !fapi.isBrowserFullscreen())
					this.fullscreenButton.disabled = false;
				else
					this.fullscreenButton.disabled = true;

				//trigger resize event (call)
				this._onResizeHandler();	//init size

				PocketCode.Web.FullscreenApi.bindF11();
				//append + change body styles
				document.body.className += ' pc-webBody ';
				document.body.appendChild(this._dom);

				if (this._splashScreen)
					this._splashScreen.show();  //init size
			},
			_hide: function () {
				this._removeDomListener(document, 'touchstart', this._touchStartHandler);
				this._removeDomListener(document, 'touchend', this._touchEndHandler);
				this._removeDomListener(document, 'touchcancel', this._touchCancelHandler);
				this._removeDomListener(document, 'touchleave', this._touchLeaveandler);
				this._removeDomListener(document, 'touchmove', this._touchMoveHandler);

				document.body.removeChild(this._dom);
				if (this._splashScreen)
					this._splashScreen.hide();
				PocketCode.Web.FullscreenApi.unbindF11();
				PocketCode.Web.FullscreenApi.exitFullscreen();
				//remove body style
				document.body.className = document.body.className.replace(' pc-webBody ', '').trim();
			},
			setHWRatio: function (ratio) {
				this.hwRatio = ratio;
				//set the css min-height/min-width property according to the ratio & min-height: 450px
				var style = this.viewportContainer.style;
				style.minWidth = (450 / ratio) + 'px';
				//update UI
				this._onResizeHandler();
			},

		};

		return WebOverlay;
	})(),

	LoadingIndicator: (function () {
		function LoadingIndicator() {
			var dom = document.createElement('div');
			dom.className = 'pc-liContainer pc-liBaseColor';

			this.progressBar = document.createElement('div');
			this.progressBar.className = 'pc-liFillColor pc-liBar pc-liProgress';
			dom.appendChild(this.progressBar);

			var li = document.createElement('div');
			li.className = 'pc-li';
			dom.appendChild(li);
			this._progressItems = document.createElement('div');
			this._progressItems.className = 'pc-liProgressStyle';
			for (var i = 0; i < 7; i++) {
				this._progressItems.appendChild(document.createElement('div'));
			}
			li.appendChild(this._progressItems);
			this._dom = dom;

			this._pendingCount = 0;
		}

		LoadingIndicator.prototype = {
			show: function () {
				this._dom.style.display = '';
				if (this.progressBar.style.display == 'none')
					this.setPending();
			},
			hide: function () {
				this._dom.style.display = 'none';
				clearInterval(this._loadingTimer);
			},
			setProgress: function (perc) {
				this.hidePending();
				var style = this.progressBar.style;
				style.display = '';
				style.width = perc + '%';
			},
			hideProgress: function () {
				this.progressBar.style.display = 'none';
			},
			_renderPending: function () {
				this._pendingCount++;
				var ch = this._progressItems.children;
				if (this._pendingCount > ch.length + 3)
					this._pendingCount = 1;

				for (var i = 1, l = ch.length; i <= l; i++) {
					if (i >= this._pendingCount - 3 && i <= this._pendingCount)
						ch[i - 1].style.backgroundColor = '#ef7716';
					else
						ch[i - 1].style.backgroundColor = '';
				}
			},
			setPending: function () {
				this.hideProgress();
				this._renderPending();
				this._loadingTimer = setInterval(this._renderPending.bind(this), 400);
			},
			hidePending: function () {
				clearInterval(this._loadingTimer);
				this._pendingCount = 0;

				var ch = this._progressItems.children;
				for (var i = 0, l = ch.length; i < l; i++)
					ch[i].style.backgroundColor = '';
			},
		};

		return LoadingIndicator;
	})(),

	SplashScreen: (function () {
		function SplashScreen() {
			this._loadingText = 'loading ... ';
			this._initialisingText = 'initialising ...';
			this._errorText = 'Error: loading failed';

			var dom = document.createElement('div');
			dom.className = 'pc-webLayout pc-splashScreen';
			var row = document.createElement('div');
			row.className = 'pc-webLayoutRow';
			dom.appendChild(row);

			this._container = document.createElement('div');
			this._container.className = 'pc-centerCol';
			row.appendChild(this._container);

			var dialog = document.createElement('div');
			dialog.className = 'pc-splashDialog';
			this._container.appendChild(dialog);

			var headline = document.createElement('div');
			headline.className = 'pc-splashLoadingText pc-splashLoadingColor';
			headline.innerHTML = '&lt;Pocket<span class="f">Code</span>&nbsp;/&gt;';
			dialog.appendChild(headline);

			var text = document.createElement('div');
			text.className = 'pc-splashLoadingColor pc-splashLoadingSubText';
			this._text = document.createTextNode(this._loadingText);
			text.appendChild(this._text);
			dialog.appendChild(text);

			this._loadingIndicator = new PocketCode.Web.LoadingIndicator();
			dialog.appendChild(this._loadingIndicator._dom);

			this._dom = dom;
			//this._touchStartHandler = undefined;
			//this._touchEndHandler = undefined;
			//this._touchCancelHandler = undefined;
			//this._touchLeaveandler = undefined;
			//this._touchMoveHandler = undefined;

			//bind events
			if (window.addEventListener) {
				window.addEventListener('resize', this._onResizeHandler.bind(this), false);
			}
			else {
				window.attachEvent('onresize', this._onResizeHandler.bind(this)._onResizeHandler);
			}
		}

		SplashScreen.prototype = {
			_addDomListener: function (target, eventName, eventHandler) {
				var handler = eventHandler.bind(this);
				target.addEventListener(eventName, handler, false);
				return handler;
			},
			_removeDomListener: function (target, eventName, eventHandler) {
				target.removeEventListener(eventName, eventHandler, false);
			},
			_onResizeHandler: function (e) {
				//font-size of 10px => 194px x 90px
				var fs = Math.round(this._dom.offsetWidth * 0.6 / 19.4);
				var fh = Math.round(window.innerHeight * 0.3 / 9.0);
				fs = (fs < fh) ? fs : fh;
				fs = (fs < 10) ? 10 : fs;
				fs = (fs > 14) ? 14 : fs;
				this._dom.style.fontSize = fs + 'px';
			},
			show: function () {
				this._touchStartHandler = this._addDomListener(document, 'touchstart', function (e) { e.preventDefault(); }, false); //e.stopPropagation(); return false; 
				this._touchEndHandler = this._addDomListener(document, 'touchend', function (e) { e.preventDefault(); }, false);
				this._touchCancelHandler = this._addDomListener(document, 'touchcancel', function (e) { e.preventDefault(); }, false);;
				this._touchLeaveandler = this._addDomListener(document, 'touchleave', function (e) { e.preventDefault(); }, false);;
				this._touchMoveHandler = this._addDomListener(document, 'touchmove', function (e) { e.preventDefault(); }, false);;

				this._loadingIndicator.show();
				this._dom.style.display = '';
				this._onResizeHandler();    //init size
			},
			hide: function () {
				this._removeDomListener(document, 'touchstart', this._touchStartHandler);
				this._removeDomListener(document, 'touchend', this._touchEndHandler);
				this._removeDomListener(document, 'touchcancel', this._touchCancelHandler);
				this._removeDomListener(document, 'touchleave', this._touchLeaveandler);
				this._removeDomListener(document, 'touchmove', this._touchMoveHandler);

				this._dom.style.display = 'none';
				this._loadingIndicator.hide();
			},
			showBorder: function () {
				this._container.className += ' pc-splashScreenBorder ';
			},
			hideBorder: function () {
				this._container.className = this._container.className.replace(' pc-splashScreenBorder ', '').trim();
			},
			setProgress: function (loaded, total) {
				if (loaded !== total) { //perc < 100
					this._text.nodeValue = this._loadingText + '[' + loaded + '/' + total + ']';
					this._loadingIndicator.setProgress(100 / total * loaded);
				}
				else {
					this._text.nodeValue = this._initialisingText;
					this._loadingIndicator.setPending();
				}
			},
			showError: function () {
				this._loadingIndicator.setProgress(0);
				this._text.parentNode.style.color = '#A31515';
				this._text.nodeValue = this._errorText;
			},
		};

		return SplashScreen;
	})(),

	ResourceLoader: (function () {
		function ResourceLoader(resources) {
			this._resources = resources;
			this._root = resources.root;
			this._files = resources.files;

			//events to override
			this.onProgress = function () { };
			this.onError = function () { };

			//if (window.addEventListener)
			//	window.addEventListener('error', this._onGlobalError.bind(this), false);
			//else
			//    window.attachEvent('onerror', this._onGlobalError.bind(this));
		};

		//methods
		ResourceLoader.prototype = {
			_onGlobalError: function (msg, url, line, col, error) {
				// Note that col & error are new to the HTML 5 spec and may not be 
				// supported in every browser.  It worked for me in Chrome.
				var extra = !col ? '' : '\ncolumn: ' + col;
				extra += !error ? '' : '\nerror: ' + error;

				// You can view the information in an alert to see things working like this:
				alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);

				// TODO: Report this error via ajax so you can keep track
				//       of what pages have JS issues

				var suppressErrorAlert = true;
				// If you return true, then error alerts (like in older versions of 
				// Internet Explorer) will be suppressed.
				return suppressErrorAlert;
			},
			startLoading: function () {
				var size = 0;
				var files = this._files;

				//start requests
				if (files.length > 0) {
					this._updateProgress(0, files.length);
					this._loadingFileIdx = 0;
					var file = files[0];
					this._requestFile(this._root, file, this._onFileLoadHandler, this._onErrorHandler);
				}
			},
			_requestFile: function (root, file, successHandler, errorHandler) {
				//check for exising tag: prevent duplicated files due to simultanous loaders
				var href = root + file.url;
				var _self = this;
				if (document.getElementById(href)) {
					setTimeout(successHandler.bind(this), 20);
					return;
				}

				var oHead = document.head || document.getElementsByTagName("head")[0];
				switch (file.type) {
					case 'js':
						var loaded = false;
						var oScript = document.createElement("script");
						//oScript.type = "text\/javascript";    //type optional in HTML5 -> default: "text\/javascript" 
						oScript.async = false;  //ensure execution order after async download
						oScript.onerror = errorHandler.bind(this);
						oScript.onload = oScript.onreadystatechange = function () {
							if (!loaded && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
								loaded = true;
								oScript.onload = oScript.onreadystatechange = null;
								setTimeout(successHandler.bind(_self), 20);//();
							}
						};
						oHead.appendChild(oScript);
						//oHead.insertBefore(oScript, oHead.firstChild);    //alternative
						oScript.id = oScript.src = href;
						break;
					case 'css':
						var oCss = document.createElement("link");
						oCss.type = "text/css";
						oCss.rel = "stylesheet";
						oCss.id = href;
						oHead.appendChild(oCss);

						var oCssSim = new Image();
						oCssSim.onerror = function () {
							oCss.href = href;
							setTimeout(successHandler.bind(_self), 20);
						};
						oCssSim.src = href;
						break;
						//case 'img':
						//	var oImg = new Image();
						//	oImg.onerror = errorHandler.bind(this);
						//	oImg.onload = successHandler;
						//	oImg.src = href;
						//	break;
				}
			},
			_onFileLoadHandler: function () {
				if (this._errorOccured)
					return;

				var files = this._files;
				var l = files.length;
				if (this._loadingFileIdx++ < l - 1) {
					this._updateProgress(this._loadingFileIdx, l);
					var file = files[this._loadingFileIdx];
					this._requestFile(this._root, file, this._onFileLoadHandler, this._onErrorHandler);
				}
				else {
					this._updateProgress(l, l);
				}

			},
			_updateProgress: function (loaded, total) {
				this.onProgress(loaded, total);
			},
			_onErrorHandler: function (e) {//msg, url, line, col, error) {
				this._errorOccured = true;
				if (this._loadingTimer)
					clearInterval(this._loadingTimer);

				this.onError(); //call external handler
			},

		};

		return ResourceLoader;
	})(),

	PlayerInterface: new ((function () {
		function PlayerInterface() {
			this._domLoaded = false;
			if (window.addEventListener)
				window.addEventListener('load', this._initOnLoad.bind(this), false);
			else
				window.attachEvent('onload', this._initOnLoad.bind(this));
		}

		PlayerInterface.prototype = {
			_initOnLoad: function () {
				this._domLoaded = true;
				this._splashScreen = new PocketCode.Web.SplashScreen();
				this._loader = new PocketCode.Web.ResourceLoader(PocketCode.Web.resources);
				this._loader.onError = this._loaderOnError.bind(this);
				this._loader.onProgress = this._loaderOnProgress.bind(this);

				if (this._projectId)
					this.launchProject();
			},
			launchProject: function (projectId, rfc3066, containerElement) {  //TODO:
				//if (projectId)
				this._projectId = projectId;    //undefined allowed and handled in application
				this._rfc3066 = rfc3066;
				if (!this._domLoaded)
					return;

				if (document.body.children.length <= 1) {
					this._launchMobile();
					return;
				}

				//Desktop: UI
				var ol = new PocketCode.Web.WebOverlay();
				this._webOverlay = ol;

				ol.appendSplash(this._splashScreen);
				var fapi = PocketCode.Web.FullscreenApi;
				fapi.onFullscreenChange = function (state) {
					var btn = ol.fullscreenButton;
					if (state)  //true
						btn.className += ' pc-webButtonChecked ';
					else
						btn.className = btn.className.replace(' pc-webButtonChecked ', '').trim();
				};
				ol.show();
				this._loader.startLoading();
			},
			_launchMobile: function () {
				//mobile events
				//document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
				window.addEventListener('orientationchange', function (e) { window.scrollTo(0, 0); }, false);

				//mobile UI
				this._splashScreen.showBorder();
				document.body.appendChild(this._splashScreen._dom);
				this._splashScreen.show();  //init size
				this._loader.startLoading();
			},
			_initApplication: function () {
				//the whole framework is already loaded
				var vpc = this._webOverlay ? this._webOverlay.viewportContainer : undefined;
				this._player = new PocketCode.PlayerApplication(vpc, this._rfc3066);//this._splashScreen, this._webOverlay);
				this._player.onInit.addEventListener(new SmartJs.Event.EventListener(this._applicationInitHandler, this));
				this._player.onHWRatioChange.addEventListener(new SmartJs.Event.EventListener(this._applicationRatioChangetHandler, this));
				this._player.loadProject(this._projectId);
			},
			_applicationInitHandler: function () {
				this._splashScreen.hide();
			},
			_applicationRatioChangetHandler: function (e) {
				if (this._webOverlay)
					this._webOverlay.setHWRatio(e.ratio);
			},
			_loaderOnError: function () {
				this._splashScreen.showError();
			},
			_loaderOnProgress: function (current, total) {
				this._splashScreen.setProgress(current, total);
				if (current === total)
					this._initApplication();
			},
		}
		return PlayerInterface;
	})())(),

};


/* Resources: scripts & styles */
PocketCode.Web.resources = {
	root: function () {
		var hn = window.location.hostname;
		if (hn === 'localhost' || hn === '' || hn === 'web-test.catrob.at' || hn === 'pocketcode.org')
			return '../';

		return PocketCode.Web.resourceRoot;
	}(),//'../',	//http://localhost:26825/loadingTestScripts/',
	files: [
		//{ url: 'smartJs/sj.css', type: 'css' },
		{ url: 'smartJs/sj.js', type: 'js' },
		{ url: 'smartJs/sj-core.js', type: 'js' },
		{ url: 'smartJs/sj-event.js', type: 'js' },
		{ url: 'smartJs/sj-components.js', type: 'js' },
		{ url: 'smartJs/sj-animation.js', type: 'js' },
		{ url: 'smartJs/sj-communication.js', type: 'js' },
		{ url: 'smartJs/sj-ui.js', type: 'js' },

		{ url: 'pocketCode/libs/soundjs/soundjs-NEXT.min.js', type: 'js' },
		{ url: 'pocketCode/libs/fabric/fabric-1.6.0-rc.1.js', type: 'js' },

		{ url: 'pocketCode/css/pocketCode.css', type: 'css' },

		{ url: 'pocketCode/scripts/core.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksCore.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksControl.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksList.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksLook.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksMotion.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksSound.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksVariable.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/renderingImage.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/userVariable.js', type: 'js' },

		{ url: 'pocketCode/scripts/components/broadcastManager.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/device.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/formula.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/imageHelper.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/imageStore.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/userVariableHost.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/gameEngine.js', type: 'js' },    //make sure includes are in the right order (inheritance)
		{ url: 'pocketCode/scripts/components/i18nProvider.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/parser.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/proxy.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/soundManager.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/sprite.js', type: 'js' },

		{ url: 'pocketCode/scripts/ui/button.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/canvas.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/dialog.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/playerStartScreen.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/playerToolbar.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/popupWindow.js', type: 'js' },

		{ url: 'pocketCode/scripts/view/pageView.js', type: 'js' },
		{ url: 'pocketCode/scripts/view/playerPageView.js', type: 'js' },
		{ url: 'pocketCode/scripts/view/playerViewportView.js', type: 'js' },

		{ url: 'pocketCode/scripts/controller/controllerCore.js', type: 'js' },
		{ url: 'pocketCode/scripts/controller/playerPageController.js', type: 'js' },
		{ url: 'pocketCode/scripts/controller/playerViewportController.js', type: 'js' },

		//TODO: insert player scripts
		{ url: 'PocketCodePlayer/player/scripts/playerApplication.js', type: 'js' },
	],
};


if (!launchProject) {
	var launchProject = function (projectId, rfc3066, containerElement) {

		//if (PocketCode.Web.isTablet || PocketCode.Web.isMobile) {
		//    window.location = "http://www.catrob.at/pocketcode/html5/" + projectId#player;
		//    return;
		//}

		PocketCode.Web.PlayerInterface.launchProject(projectId, rfc3066, containerElement);
		//open popup layer
		//alert("coming so: project id= " + projectId);

		//window.location.href = "../LayoutTests/startpageMockup.html";

		//launch app
	}
}

//test: running before dom ready
//launchProject(123);

//mockup test
//window.addEventListener("load", function load(event){
//    window.removeEventListener("load", load, false); //remove listener, no longer needed
//    launchProject(123);  
//},false);
//mockup test end
