/// <reference path="../../smartJs/sj.js" />
/// <reference path="../../smartJs/sj-core.js" />
/// <reference path="../../smartJs/sj-event.js" />
'use strict';

if (!PocketCode)
    var PocketCode = {};

PocketCode.server = 0;

if (PocketCode.server === 0)
    PocketCode.domain = 'https://share.catrob.at/';
else if (PocketCode.server === 1)
    PocketCode.domain = 'https://web-test.catrob.at/';
else
    PocketCode.domain = 'http://localhost/';

PocketCode.websiteUrl = PocketCode.domain + 'pocketcode/';
PocketCode.projectUrl = PocketCode.websiteUrl + 'program/{projectId}';
PocketCode.mobileUrl = PocketCode.domain + 'html5/player/{projectId}';
PocketCode.mobileUrlRfc3066 = PocketCode.domain + 'html5/player/{projectId}/{rfc3066}';
PocketCode.logoUrl = PocketCode.domain + 'html5/pocketCode/img/logo.png';

//add css file
document.addEventListener('DOMContentLoaded', function () {
    var hn = window.location.hostname,
        localFile = window.location.protocol == 'file:';
    var href;
    if (!localFile && (hn === 'localhost' || hn === ''))// || hn === 'web-test.catrob.at' || hn === 'share.catrob.at')
        href = 'pocketCodePlayer.css';
    else
        href = PocketCode.domain + 'html5/player/pocketCodePlayer.css';

    var link = document.createElement('link');
    link.href = href;
    link.type = 'text/css';
    link.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(link);
});


PocketCode.crossOrigin = new ((function () {

    function CrossOrigin() {
        //init: worst case
        this._current = true;
        this._supported = false;
        this._initialized = false;

        var loc = window.location, a = document.createElement('a');
        a.href = PocketCode.domain;
        var port = loc.protocol == 'https:' ? '443' : loc.port;
        var aPort = a.port; //safari fix
        if (aPort == '0')
            aPort = '';
        if (a.hostname == loc.hostname && (aPort == loc.port || aPort == port) && a.protocol == loc.protocol) {  //TODO: check sub domains
            this._current = false;
            this._initialized = true;
        }
        else {
            //this._current = true;
            var oImg = new Image();
            if (!('crossOrigin' in oImg)) {
                this._initialized = true;
                return;
            }
            oImg.crossOrigin = 'anonymous';
            oImg.onload = function () {
                this._supported = true;
                this._initialized = true;
            }.bind(this);
            oImg.onerror = function () {
                this._supported = false;
                this._initialized = true;
                //throw new Error('core: cross origin check failed: please make sure both the provided base and favicon urls are valid');
            }.bind(this);
            oImg.src = PocketCode.domain + 'html5/pocketCode/img/favicon.png';
        }
    }

    //properties
    Object.defineProperties(CrossOrigin.prototype, {
        current: {
            get: function () {
                return this._current;
            },
        },
        supported: {
            get: function () {
                return this._supported;
            },
        },
        initialized: {
            get: function () {
                return this._initialized;
            },
        },
    });

    return CrossOrigin;
})())(),

PocketCode.Web = {

    /* root path for css and scripts to be loaded dynamically */
    resourceRoot: '',   //TODO: add release deployment url

    FullscreenApi: new ((function () {
        function FullscreenApi() {
            if (window.addEventListener)
                window.addEventListener('load', this._initOnLoad.bind(this), false);
            //else
            //	window.attachEvent('onload', this._initOnLoad.bind(this));
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
                this.lastExitDate = Date.now(); //to prevent re-entering fullscreen in chrome: written when event occurs

                this.onFullscreenChange = function (state) {
                    //default event handler to be overwritten
                };
            },
            _addDomListener: function (target, eventName, eventHandler) {
                var handler = function (e) {
                    e.stopPropagation();
                    return eventHandler.call(this, e);
                }.bind(this);
                if (target.addEventListener)
                    target.addEventListener(eventName, handler, false);
                //else
                //	target.attachEvent('on' + eventName, handler);
                return handler;
            },
            _removeDomListener: function (target, eventName, eventHandler) {
                if (target.removeEventListener)
                    target.removeEventListener(eventName, eventHandler, false);
                else
                    target.detachEvent('on' + eventName, eventHandler);
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
                window.setTimeout(function () {  //needed to detect fullscreen correctly in IE
                    var fs = this.isJsFullscreen;
                    if (!fs())
                        this.lastExitDate = Date.now();

                    this.onFullscreenChange(fs());
                }.bind(this), 10);
            },
            _keyHandler: function (e) {
                e = e || window.event;
                var kc = e.keyCode || e.which;

                if (kc === 122 && !e.altKey) {	//F11
                    e.preventDefault();
                    e.stopPropagation();

                    if (e.type === 'keydown' && !this.lastKeyDown) {
                        this.lastKeyDown = Date.now();
                    }
                    else if (e.type === 'keyup') {
                        var delay = this.lastKeyDown - this.lastExitDate;

                        if (!isNaN(delay) && delay > 700)
                            this.toggleFullscreen(e);
                        this.lastKeyDown = undefined;
                    }
                    return false;
                }
            },
        };

        return FullscreenApi;
    })())(),

    ExitButton: (function () {
        function ExitButton() {
            var btn = document.createElement('button');
            btn.className = 'pc-webButton pc-backButton';
            btn.innerHTML = '<svg viewBox="0,0,64,64" preserveAspectRatio="xMidYMin meet">' +
				'<path d="M32,1C14.88,1,1,14.88,1,31.999C1,49.12,14.88,63,32,63s31-13.88,31-31.001C63,14.88,49.12,1,32,1zM32,56.979c-13.796,0-24.98-11.184-24.98-24.98c0-13.795,11.185-24.98,24.98-24.98s24.979,11.186,24.979,24.98C56.979,45.796,45.796,56.979,32,56.979z"></path>' +
				'<polygon points="27.583,32 39.629,44.395 35.001,49 18.371,32 35.001,15 39.629,19.605" class="pc-svgPlayerIcon"></polygon>' +
			'</svg>' +
			'<span>Exit</span>';
            this.dom = btn;
            //btn.addEventListener('click', function (e) { if (history.length > 0) history.back(); else window.close(); }, false);
            //btn.addEventListener('touchend', function (e) { if (history.length > 0) history.back(); else window.close(); }, false);
        }

        return ExitButton;
    })(),

    WebOverlay: (function () {
        function WebOverlay() {
            /* default settings for layout */
            this.hwRatio = 15 / 9;
            this.hPixelOffset = 160;    //we will have to change them based on css changes
            this.vPixelOffset = 34;
            this.vpMinHeight = 370;

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
            btn = document.createElement('button');
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


            //var menu = new PocketCode.Ui.Menu();
            // var menu2 = PocketCode.Ui.Menu();
            // var m = PocketCode.Web.ExitButton();
            //console.log( this );
            //this.menuButton = btn;

            //this._dom
            var overlay = document.createElement('div');
            overlay.className = 'pc-webOverlay';
            overlay.dir = 'ltr';
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
            var vpb = document.createElement('div');
            vpb.className = 'pc-webViewportBorder';
            cc.appendChild(vpb);
            vpb.appendChild(this.viewportContainer);

            //right column
            var rc = document.createElement('div');
            rc.className = 'pc-rightCol';
            wlr.appendChild(rc);
            var wm = document.createElement('div');
            this.menuContainer = wm;
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
            //this.hide();
            this.hidden = true;

            //bind events
            this._addDomListener(window, 'resize', this._onResizeHandler);
            //this._addDomListener(this.closeButton, 'click', this._close);
            this._addDomListener(this.fullscreenButton, 'click', this._toggleFullscreenHandler);
            this._addDomListener(this.fullscreenButton, 'touchend', this._toggleFullscreenHandler);

            //this._addDomListener(this.muteButton, 'click', this._toggleMuteHandler);
            //if (window.addEventListener) {
            //	window.addEventListener('resize', this._onResizeHandler.bind(this), false);
            //	this.closeButton.addEventListener('click', this._hide.bind(this), false);
            //	this.fullscreenButton.addEventListener('click', this._toggleFullscreenHandler.bind(this), false);
            //	this.muteButton.addEventListener('click', this._toggleMuteHandler.bind(this), false);
            //}
            //else {
            //	window.attachEvent('onresize', this._onResizeHandler.bind(this)._onResizeHandler);
            //	this.closeButton.attachEvent('onclick', this._hide.bind(this));
            //	this.fullscreenButton.attachEvent('onclick', this._toggleFullscreenHandler.bind(this));
            //	this.muteButton.attachEvent('onclick', this._toggleMuteHandler.bind(this));
            //}
        }

        WebOverlay.prototype = {
            _addDomListener: function (target, eventName, eventHandler) {
                var handler = function (e) {
                    e.stopPropagation();
                    return eventHandler.call(this, e);
                }.bind(this);
                if (target.addEventListener)
                    target.addEventListener(eventName, handler, false);
                //else
                //	target.attachEvent('on' + eventName, handler);
                return handler;
            },
            _removeDomListener: function (target, eventName, eventHandler) {
                if (target.removeEventListener)
                    target.removeEventListener(eventName, eventHandler, false);
                //else
                //	target.detachEvent('on' + eventName, eventHandler);
            },
            _onResizeHandler: function (e) {
                var style = this.viewportContainer.style;
                var aw = window.innerWidth - this.hPixelOffset;
                var ah = window.innerHeight - this.vPixelOffset;
                if (ah < this.vpMinHeight)
                    ah = this.vpMinHeight;

                var hwr = this.hwRatio, w, h;
                if (hwr >= ah / aw) {
                    h = ah;
                    w = ah / hwr;
                }
                else {
                    w = aw;
                    h = aw * hwr;
                }
                if (h < this.vpMinHeight) {
                    h = this.vpMinHeight;
                    w = h / hwr;
                }

                style.width = Math.ceil(w) + 'px';
                style.height = Math.ceil(h) + 'px';
            },
            _toggleFullscreenHandler: function (e) {
                PocketCode.Web.FullscreenApi.toggleFullscreen();
            },
            appendControl: function (control) {
                this._splashScreen = control;
                this.viewportContainer.appendChild(control._dom);
            },
            show: function () {
                this.hidden = false;
                this._clickHandler = this._addDomListener(document, 'click', function (e) {
                    if (!(e.target instanceof HTMLInputElement) && (!(e.target instanceof HTMLLabelElement) || typeof e.target.htmlFor != 'string'))
                        e.preventDefault();
                });
                this._dblClickHandler = this._addDomListener(document, 'dblclick', function (e) { e.preventDefault(); });
                this._touchStartHandler = this._addDomListener(document, 'touchstart', function (e) {
                    if (!(e.target instanceof HTMLInputElement) && (!(e.target instanceof HTMLLabelElement) || typeof e.target.htmlFor != 'string'))
                        e.preventDefault();
                });
                //this._touchEndHandler = this._addDomListener(document, 'touchend', function (e) { e.preventDefault(); });
                //this._touchCancelHandler = this._addDomListener(document, 'touchcancel', function (e) { e.preventDefault(); });
                this._touchLeaveandler = this._addDomListener(document, 'touchleave', function (e) { e.preventDefault(); });
                this._touchMoveHandler = this._addDomListener(document, 'touchmove', function (e) { e.preventDefault(); });

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
            hide: function () {
                this.hidden = true;
                this._removeDomListener(document, 'click', this._clickHandler);
                this._removeDomListener(document, 'dblclick', this._dblClickHandler);
                this._removeDomListener(document, 'touchstart', this._touchStartHandler);
                //this._removeDomListener(document, 'touchend', this._touchEndHandler);
                //this._removeDomListener(document, 'touchcancel', this._touchCancelHandler);
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
                if (this.hwRatio == ratio)
                    return;
                this.hwRatio = ratio;
                //set the css min-height/min-width property according to the ratio & min-height: 450px
                //var style = this.viewportContainer.style;
                //style.minWidth = Math.ceil(450 / ratio) + 'px';
                //update UI
                this._onResizeHandler();
            },
            setUiDirection: function (dir) {
                this._dom.dir = dir;
            },
            appendEmulator: function (emulatorControl) {
                if (this._deviceEmulator)   //this will occur when a new (another) project is loaded (gameEngine)
                    this._dom.removeChild(emulatorControl.dom);

                if (!emulatorControl)
                    return;
                this._deviceEmulator = emulatorControl;
                this._dom.appendChild(emulatorControl.dom);
                //emulatorControl.verifyResize();   //manually called because we are dealing with the DOM directly
            }
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
                if (this._loadingTimer)
                    clearInterval(this._loadingTimer);
            },
            setProgress: function (perc) {
                if (typeof perc !== 'number' || perc < 0.0 || perc > 100.0)
                    throw new Error('invalid parameter: percentage');
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
                if (this._loadingTimer)
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
            dom.dir = 'ltr';
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
            if (window.addEventListener)
                window.addEventListener('resize', this._onResizeHandler.bind(this), false);
            //}
            //else {
            //	window.attachEvent('onresize', this._onResizeHandler.bind(this)._onResizeHandler);
            //}
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
                this._clickHandler = this._addDomListener(document, 'click', function (e) { e.preventDefault(); });
                this._dblClickHandler = this._addDomListener(document, 'dblclick', function (e) { e.preventDefault(); });
                this._touchStartHandler = this._addDomListener(document, 'touchstart', function (e) { e.preventDefault(); }); //e.stopPropagation(); return false; 
                //this._touchEndHandler = this._addDomListener(document, 'touchend', function (e) { e.preventDefault(); });
                //this._touchCancelHandler = this._addDomListener(document, 'touchcancel', function (e) { e.preventDefault(); });
                this._touchLeaveandler = this._addDomListener(document, 'touchleave', function (e) { e.preventDefault(); });
                this._touchMoveHandler = this._addDomListener(document, 'touchmove', function (e) { e.preventDefault(); });

                this._loadingIndicator.show();
                this._dom.style.display = '';
                this._onResizeHandler();    //init size
            },
            hide: function () {
                this._removeDomListener(document, 'click', this._clickHandler);
                this._removeDomListener(document, 'dblclick', this._dblClickHandler);
                this._removeDomListener(document, 'touchstart', this._touchStartHandler);
                //this._removeDomListener(document, 'touchend', this._touchEndHandler);
                //this._removeDomListener(document, 'touchcancel', this._touchCancelHandler);
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
            this._version = Date.now().toString().substring(3, 6); //prevent caching

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
            //_onGlobalError: function (msg, url, line, col, error) {
            //	// Note that col & error are new to the HTML 5 spec and may not be 
            //	// supported in every browser.  It worked for me in Chrome.
            //	var extra = !col ? '' : '\ncolumn: ' + col;
            //	extra += !error ? '' : '\nerror: ' + error;

            //	// You can view the information in an alert to see things working like this:
            //	alert("Error: " + msg + "\nurl: " + url + "\nline: " + line + extra);

            //	// TODO: Report this error via ajax so you can keep track
            //	//       of what pages have JS issues

            //	var suppressErrorAlert = true;
            //	// If you return true, then error alerts (like in older versions of 
            //	// Internet Explorer) will be suppressed.
            //	return suppressErrorAlert;
            //},
            startLoading: function () {
                this._loadingAborted = false;
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
            abortLoading: function () {
                this._loadingAborted = true;
            },
            _requestFile: function (root, file, successHandler, errorHandler) {
                //check for exising tag: prevent duplicated files due to simultanous loaders
                var href = root + file.url;
                if (document.getElementById(href)) {
                    setTimeout(successHandler.bind(this), 10);
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
                                setTimeout(successHandler.bind(this), 10);//();
                            }
                        }.bind(this);
                        oHead.appendChild(oScript);
                        //oHead.insertBefore(oScript, oHead.firstChild);    //alternative
                        oScript.id = href;
                        oScript.src = href + '?v=' + this._version;
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
                            setTimeout(successHandler.bind(this), 10);
                        }.bind(this);
                        oCssSim.src = href + '?v=' + this._version;
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
                if (this._loadingAborted)
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
            this._addDomListener(window, 'load', this._initOnLoad);
            this._isMobile = (typeof ((window.orientation!==undefined)?window.orientation:((window.screen!==undefined)?window.screen.orientation.angle:undefined)) !== 'undefined') || !!navigator.userAgent.match(/iPad|iPhone|Android|BlackBerry|Phone|ZuneWP7|WPDesktop|webOS/i);
        }

        PlayerInterface.prototype = {
            _addDomListener: function (target, eventName, eventHandler) {
                var handler = function (e) {
                    e.stopPropagation();
                    return eventHandler.call(this, e);
                }.bind(this);
                if (target.addEventListener)
                    target.addEventListener(eventName, handler, false);
                //else
                //	target.attachEvent('on' + eventName, handler);
                return handler;
            },
            _removeDomListener: function (target, eventName, eventHandler) {
                if (target.removeEventListener)
                    target.removeEventListener(eventName, eventHandler, false);
                else
                    target.detachEvent('on' + eventName, eventHandler);
            },
            _initOnLoad: function () {
                this._domLoaded = true;
                this._splashScreen = new PocketCode.Web.SplashScreen();
                this._loader = new PocketCode.Web.ResourceLoader(PocketCode.Web.resources);
                this._loader.onError = this._loaderOnError.bind(this);
                this._loader.onProgress = this._loaderOnProgress.bind(this);

                if (this._projectId)
                    this.launchProject(this._projectId, this._rfc3066);
            },
            launchProject: function (projectId, rfc3066, containerElement) {
                if (!window.addEventListener) {
                    alert('sorry.. your browser does not meet the HTML5 feature requirements to run this application');
                    return;
                }
                this._redirected = !!document.getElementById('97F79358-0DA5-4243-8C1C-A1AE3BF226C0'); //on our index page

                if (projectId)
                    this._projectId = projectId;    //undefined allowed and handled in application
                this._rfc3066 = rfc3066;
                if (!this._domLoaded)
                    return;

                var expectedUrl = '';
                if (rfc3066) {
                    expectedUrl = PocketCode.mobileUrlRfc3066.replace('{projectId}', this._projectId);
                    expectedUrl = expectedUrl.replace('{rfc3066}', rfc3066);
                }
                else
                    expectedUrl = PocketCode.mobileUrl.replace('{projectId}', this._projectId);
                //redirect for mobile and browsers that do not support cross origin img loading
                if (!PocketCode.crossOrigin.initialized) {
                    //IE needs some more time
                    window.setTimeout(this.launchProject.bind(this, projectId, rfc3066, containerElement), 100);
                    return;
                }
                if ((this._isMobile && window.location.href !== expectedUrl && window.location.hostname !== 'localhost') || (PocketCode.crossOrigin.current && !PocketCode.crossOrigin.supported))
                    window.location = expectedUrl;
                if (this._isMobile) {
                    this._launchMobile();
                    return;
                }

                //Desktop: UI
                var ol = new PocketCode.Web.WebOverlay();
                this._addDomListener(ol.closeButton, 'click', this._closeHandler);
                this._addDomListener(ol.closeButton, 'touchend', this._closeHandler);
                this._keyupListener = this._addDomListener(document, 'keyup', this._keyHandler);
                //var check = document.getElementById('97F79358-0DA5-4243-8C1C-A1AE3BF226C0');
                if (this._redirected)//document.getElementById('97F79358-0DA5-4243-8C1C-A1AE3BF226C0')) //on our index page
                    ol.closeButton.disabled = true;
                this._addDomListener(ol.muteButton, 'click', this._muteHandler);
                this._addDomListener(ol.muteButton, 'touchend', this._muteHandler);
                this._webOverlay = ol;


                ol.appendControl(this._splashScreen);
                var fapi = PocketCode.Web.FullscreenApi;
                fapi.onFullscreenChange = function (state) {
                    var btn = ol.fullscreenButton;
                    btn.blur();
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
                this._exitButton = new PocketCode.Web.ExitButton();

                this._exitButton.dom.addEventListener('click', this._closeHandler.bind(this), false);
                this._exitButton.dom.addEventListener('touchend', this._closeHandler.bind(this), false);

                document.body.appendChild(this._exitButton.dom);
                this._loader.startLoading();
            },
            _initApplication: function (mobileInitialized) {
                if (this._webOverlay && this._webOverlay.hidden)
                    return;

                var vpc = this._webOverlay ? this._webOverlay.viewportContainer : undefined;
                this._player = new PocketCode.Player.Application(vpc, this._rfc3066, mobileInitialized);
                this._player.onInit.addEventListener(new SmartJs.Event.EventListener(this._applicationInitHandler, this));
                this._player.onUiDirectionChange.addEventListener(new SmartJs.Event.EventListener(this._uiDirectionChangeHandler, this));
                this._player.onExit.addEventListener(new SmartJs.Event.EventListener(this._closeHandler, this));
                this._player.onEmulatorLoaded.addEventListener(new SmartJs.Event.EventListener(this._deviceEmulatorLoadHandler, this));

                if (this._isMobile) {
                    //this._player = new PocketCode.Player.Application();//this._splashScreen, this._webOverlay);
                    //this._player.onInit.addEventListener(new SmartJs.Event.EventListener(this._applicationInitHandler, this));
                    this._player.onMobileInitRequired.addEventListener(new SmartJs.Event.EventListener(this._reinitMobileHandler, this));
                    //this._player.onExit.addEventListener(new SmartJs.Event.EventListener(this._closeHandler, this));
                    //this._player.loadProject(this._projectId);
                    //	var vp = new PocketCode.Ui.Viewport();
                    //	var restrictionDialog = new PocketCode.Ui.MobileRestrictionDialog();
                    //	restrictionDialog.onCancel.addEventListener(new SmartJs.Event.EventListener(this._mobileCancelHandler, this));
                    //	restrictionDialog.onConfirm.addEventListener(new SmartJs.Event.EventListener(this._mobileConfirmHandler, this));
                    //	vp.appendChild(restrictionDialog);
                    //	this._splashScreen.hide();
                    //	vp.addToDom();
                }
                else {
                    //if (this._webOverlay && this._webOverlay.hidden)
                    //	return;
                    //the whole framework is already loaded
                    //var vpc = this._webOverlay ? this._webOverlay.viewportContainer : undefined;
                    //this._player = new PocketCode.Player.Application(vpc, this._rfc3066);
                    //this._player.onInit.addEventListener(new SmartJs.Event.EventListener(this._applicationInitHandler, this));
                    this._player.onHWRatioChange.addEventListener(new SmartJs.Event.EventListener(this._applicationRatioChangetHandler, this));
                    //this._player.onExit.addEventListener(new SmartJs.Event.EventListener(this._closeHandler, this));
                    //this._player.loadProject(this._projectId);
                }
                this._player.loadProject(this._projectId);
            },
            _reinitMobileHandler: function (e) {
                this._splashScreen.show();
                this._splashScreen.setProgress(0, 0);   //set pending

                this._player.dispose();
                this._initApplication(true);
                //this._player = new PocketCode.Player.Application(undefined, undefined, true);
                //this._player.onInit.addEventListener(new SmartJs.Event.EventListener(this._applicationInitHandler, this));
                //this._player.loadProject(this._projectId);
            },
            _applicationInitHandler: function (e) {
                this._splashScreen.hide();
                if (this._exitButton) {
                    document.body.removeChild(this._exitButton.dom);
                    delete this._exitButton;
                }
                if (e.menu) {
                    e.menu.addToDom(this._webOverlay.menuContainer);
                }
                this._splashScreen.setProgress(0, PocketCode.Web.resources.files.length);  //reinit- if the overlay is opened again
                if (this._webOverlay)
                    this._webOverlay.muteButton.disabled = false;
            },
            _uiDirectionChangeHandler: function (e) {
                if (this._webOverlay)
                    this._webOverlay.setUiDirection(e.direction);
            },
            _applicationRatioChangetHandler: function (e) {
                if (this._webOverlay)
                    this._webOverlay.setHWRatio(e.ratio);
            },
            _loaderOnError: function () {
                this._splashScreen.showError();
            },
            _loaderOnProgress: function (current, total) {
                //console.log(current + ', ' + total);
                this._splashScreen.setProgress(current, total);
                if (current === total)
                    this._initApplication();
            },
            _muteHandler: function (e) {
                var btn = this._webOverlay.muteButton;
                btn.blur();
                var muted = this._player.toggleMuteSounds();
                if (muted)  //true
                    btn.className += ' pc-webButtonChecked ';
                else
                    btn.className = btn.className.replace(' pc-webButtonChecked ', '').trim();
            },
            _keyHandler: function (e) {
                if (!this._redirected && e.keyCode == 27 && (!this._player || (this._player && !this._player.hasOpenDialogs))) {
                    this._removeDomListener(document, 'keyup', this._keyupListener);
                    this._closeHandler();
                }
            },
            _closeHandler: function (e) {
                this._loader.abortLoading();
                try {
                    this._splashScreen.hide();
                    if (this._exitButton)
                        document.body.removeChild(this._exitButton.dom);
                    if (this._webOverlay) {
                        this._webOverlay.hide();
                        if (this._webOverlay.muteButton) {
                            var btn = this._webOverlay.muteButton;
                            btn.className = btn.className.replace(' pc-webButtonChecked ', '').trim();
                            btn.disabled = true;
                        }
                    }
                    this._projectId = undefined;
                    this._rfc3066 = undefined;
                }
                catch (e) { }   //silent catch: avoid errors onClose during init

                if (this._player) {  //handle close before initialize
                    try {
                        this._player.onInit.removeEventListener(new SmartJs.Event.EventListener(this._applicationInitHandler, this));
                        this._player.onUiDirectionChange.removeEventListener(new SmartJs.Event.EventListener(this._uiDirectionChangeHandler, this));
                        this._player.onHWRatioChange.removeEventListener(new SmartJs.Event.EventListener(this._applicationRatioChangetHandler, this));
                        this._player.onExit.removeEventListener(new SmartJs.Event.EventListener(this._closeHandler, this));
                        this._player.onEmulatorLoaded.removeEventListener(new SmartJs.Event.EventListener(this._deviceEmulatorLoadHandler, this));
                        this._player.dispose();
                        //this._player = undefined;
                    }
                    catch (e) { }   //silent catch: avoid errors onClose during init
                }
                if (this._redirected) {
                    //this._viewport.hide();
                    if (history.length > 0)
                        history.back();
                    else
                        window.close();
                    //return;
                }
            },
            _deviceEmulatorLoadHandler: function (e) {
                this._webOverlay.appendEmulator(e.emulator);
            },
        };

        return PlayerInterface;
    })())(),

};


/* Resources: scripts & styles */
PocketCode.Web.resources = {
    root: function () {
        var hn = window.location.hostname,
            localFile = window.location.protocol == 'file:';
        if (!localFile && (hn === 'localhost' || hn === ''))// || hn === 'web-test.catrob.at' || hn === 'share.catrob.at')
            return '../';

        return PocketCode.domain + 'html5/';
    }(),
    files: [
		//{ url: 'smartJs/sj.css', type: 'css' },
		//{ url: 'smartJs/sj.js', type: 'js' },
		//{ url: 'smartJs/sj-core.js', type: 'js' },
		//{ url: 'smartJs/sj-event.js', type: 'js' },
		//{ url: 'smartJs/sj-components.js', type: 'js' },
		//{ url: 'smartJs/sj-animation.js', type: 'js' },
		//{ url: 'smartJs/sj-communication.js', type: 'js' },
		//{ url: 'smartJs/sj-ui.js', type: 'js' },
		{ url: 'pocketCode/libs/smartJs/sj.custom.min.js', type: 'js' },

		{ url: 'pocketCode/libs/soundjs/soundjs-0.6.1.custom.min.js', type: 'js' },
		{ url: 'pocketCode/libs/iscroll/iscroll-5.3.1.custom.min.js', type: 'js' },

		{ url: 'pocketCode/css/pocketCode.css', type: 'css' },

		{ url: 'pocketCode/scripts/core.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui.js', type: 'js' },

		{ url: 'pocketCode/scripts/model/bricksCore.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksControl.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksEvent.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksLook.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksMotion.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksPen.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksSound.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksData.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/bricksUserScript.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/userVariable.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/userVariableHost.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/look.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/sprite.js', type: 'js' },
		{ url: 'pocketCode/scripts/model/scene.js', type: 'js' },

		{ url: 'pocketCode/scripts/components/publishSubscribe.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/collisionManager.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/physicsWorld.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/deviceFeature.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/device.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/formula.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/imageHelper.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/imageStore.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/gameEngine.js', type: 'js' },    //make sure includes are in the right order (inheritance)
		{ url: 'pocketCode/scripts/components/i18nProvider.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/math.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/loggingProvider.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/parser.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/proxy.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/renderingItem.js', type: 'js' },
		{ url: 'pocketCode/scripts/components/soundManager.js', type: 'js' },

		{ url: 'pocketCode/scripts/ui/button.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/canvas.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/dialog.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/input.js', type: 'js' },
        { url: 'pocketCode/scripts/ui/expander.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/menu.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/playerStartScreen.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/playerToolbar.js', type: 'js' },
		{ url: 'pocketCode/scripts/ui/scrollContainer.js', type: 'js' },
        { url: 'pocketCode/scripts/ui/deviceEmulator.js', type: 'js' },

		{ url: 'pocketCode/scripts/view/pageView.js', type: 'js' },
		{ url: 'pocketCode/scripts/view/playerPageView.js', type: 'js' },
		{ url: 'pocketCode/scripts/view/playerViewportView.js', type: 'js' },

		{ url: 'pocketCode/scripts/controller/controllerCore.js', type: 'js' },
		{ url: 'pocketCode/scripts/controller/playerPageController.js', type: 'js' },
		{ url: 'pocketCode/scripts/controller/playerViewportController.js', type: 'js' },

		//TODO: insert player scripts
		{ url: 'player/scripts/playerApplication.js', type: 'js' },
		{ url: 'player/scripts/ui/playerMenu.js', type: 'js' },
    ],
};


if (!launchProject) {
    var launchProject = function (projectId, rfc3066, containerElement) {
        PocketCode.Web.PlayerInterface.launchProject(projectId, rfc3066, containerElement);
    };
}
