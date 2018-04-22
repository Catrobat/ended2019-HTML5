/// <reference path="../ui.js" />
'use strict';

//RFC 3066 implementation: as singleton
PocketCode._I18nProvider = (function (propObject) {

    function I18nProvider() {

        this._direction = PocketCode.Ui.Direction.LTR;
        this._currentLanguage = undefined;
        this._supportedLanguages = [];

        this._dictionary = {    //storage: including locStrings used before loading / errors on loading
            "lblLoadingResources": "Loading resources...",
            "lblOk": "OK",
            "lblCancel": "Cancel",
            "lblConfirm": "Confirm",
            "lblRetry": "Retry",
            "lblGlobalErrorCaption": "Global Error",
            "msgGlobalError": "A global exception was detected.",
            "lblBrowserNotSupportedErrorCaption": "Browser Not Supported",
            "msgBrowserNotSupportedError": "Your browser does not meet the minimal requirements to run this application.",
            "msgBrowserNotSupportedErrorOther": "Please try again using another browser.",
            "lblMobileRestrictionsWarningCaption": "Please confirm",
            "msgMobileRestrictionsWarning": "Due to mobile browser restrictions you have to confirm that this application is allowed to download, cache, show/play images and audio/video content required in the requested project.",
            "msgMobileRestrictionsDebug": "There is currently NO official support for mobile devices- this is an experimental preview only! So please do NOT file bugs until there is an official release available.",
            "lblProjectNotFoundErrorCaption": "Project Not Found",
            "msgProjectNotFoundError": "The project you are trying to load could not be found on our server. Please make sure you are using a valid Project ID.",
            "lblProjectNotValidErrorCaption": "Project Not Valid",
            "msgProjectNotValidError": "The project you are trying to load has an invalid file structure or missing resources.",
            "lblParserErrorCaption": "Error Parsing Project",
            "msgParserError": "The project you are trying to load could not be parsed correctly on our server.",
            "lblInternalServerErrorCaption": "Internal Server Error",
            "msgInternalServerError": "We are sorry. The latest request caused an internal server error.",
            "lblServerConnectionErrorCaption": "Server Not Responding",
            "msgServerConnectionError": "Error connecting to our server or server not responding.",
            "msgInternetConnectionAvailable": "Please make sure you are connected to the internet.",
            "lblProjectLoadingErrorCaption": "Loading failed",
            "msgProjectLoadingError": "There was an error loading the project's resources.",
            //TODO: only add strings required if i18n strings fail to load at startup

            //new: add new loc strings here until they are included in crowdin
            "lbDeviceEmulator": "Device Emulator",
            "lbDeviceMaxDegree": "Maximum Speed",
            "lbDeviceMaxDegreeDescr": "Represents the maximum angle your device can be rotated, e.g. the max speed a sprite can reach based on the inclination sonsor.",
            "lbDeviceAcc": "Maximum Acceleration",
            "lbDeviceAccDescr": "Represents the change (angle per second) the device will move to one side if you start pressing a cusor button, e.g. the maximum acceleration of a sprite based on the inclination sensor.",
            "lbDeviceIncX": "Inclination X",
            "lbDeviceIncY": "Inclination Y",

            "variableTrue": "richtig",  //true
            "variableFalse": "falsch",  //false
            "variableNaN": "NaN",
            "variableInfinity": "Infinity",

            "lbLanguage": "Sprache",
        };
            "menuNavigation": "Navigation",

            //bricks

            "brick_wait":"Wait",
            "nxt_second_s":"second/s", //singular & plural
            "times_s":"time/s",
            "brick_note":"Note",
            "brick_forever":"Forever",
            "brick_loop_end":"End of loop",
            "brick_if_begin":"If",
            "brick_if_begin_second_part":"is true then",
            "brick_if_else":"Else",
            "brick_if_end":"End If",
            "brick_wait_until":"Wait until",
            "brick_wait_until_second_part":"is true",
            "brick_repeat":"Repeat",
            "brick_repeat_until":"Repeat until",
            "brick_scene_transition":"Continue scene",
            "brick_scene_start":"Start scene",
            "brick_clone":"Create clone of",
            "brick_when_cloned":"When I start as a clone",
            "brick_delete_this_clone":"Delete this clone",
            "brick_stop_script":"Stop script/s",
            "brick_when_started":"When program starts",
            "brick_when":"When tapped",
            "brick_when_touched":"When screen is touched",
            "brick_broadcast_receive":"When you receive",
            "brick_broadcast":"Broadcast",
            "brick_broadcast_wait":"Broadcast and wait",
            "brick_when_condition_when":"When",
            "brick_when_becomes_true":"becomes true",
            "brick_collision_receive":"When physical collision with",
            "brick_when_background":"When background changes to",
            "brick_set_variable":"Set variable",
            "brick_change_variable":"Change variable",
            "to_label":"to",
            "by_label":"by",
            "brick_show_variable":"Show variable",
            "brick_show_variable_position":"at ",
            "brick_hide_variable":"Hide variable",
            "x_label":"X: ",
            "y_label":"Y: ",
            "brick_add_item_to_userlist_add":"Add",
            "brick_add_item_to_userlist":"to list",
            "brick_delete_item_from_userlist_delete":"Delete item from list",
            "brick_delete_item_from_userlist":"at position",
            "brick_insert_item_into_userlist_insert_into":"Insert",
            "brick_insert_item_into_userlist_into_list":"into list",
            "brick_insert_item_into_userlist_at_position":"at position",
            "brick_replace_item_in_userlist_replace_in_list":"Replace item in list",
            "brick_replace_item_in_userlist_item_at_index":"at position ",
            "brick_replace_item_in_userlist_with_value":"with ",
            "brick_ask_and_save_entered_value":"and save the entered",
            "brick_change_ghost_effect_by":"Change transparency by ",
            "brick_set_brightness_to":"set brightness to ",
            "brick_change_brightness_by":"Change brightness by ",
            "brick_set_color_to":"Set color to ",
            "brick_change_color_by":"Change color by ",
            "brick_wipe_painted_away":"Wipe painted away",
            "brick_move_n_step_s":"step/s",
            "brick_go_back_layer_s":"layer/s",
            "brick_go_to":"Go to",
            "brick_set_x":"Set X to ",
            "brick_set_y":"Set Y to ",
            "brick_change_x_by":"Change X by ",
            "brick_change_y_by":"Change Y by ",
            "brick_set_rotation_style":"Set rotation style ",
            "brick_if_on_edge_bounce":"If on edge, bounce",
            "brick_move":"Move",
            "brick_turn_left":"Turn left",
            "brick_turn_right":"Turn right",
            "degrees":"degrees",
            "brick_point_in_direction":"Point in direction",
            "brick_point_to":"Point towards",
            "brick_glide":"Glide",
            "brick_glide_to_x":"to X:",
            "brick_go_back":"Go back",
            "brick_come_to_front":"Go to front",
            "brick_vibration":"Vibrate for",
            "brick_set_physics_object_type":"Set motion type to",
            "brick_set_velocity_to":"Set velocity to ",
            "brick_set_velocity_unit":"steps/second",
            "brick_rotate_left":"Rotate left ",
            "brick_rotate_right":"Rotate right ",
            "brick_turn_speed_unit":"degrees/second",
            "brick_set_gravity_to":"Set gravity for all objects to ",
            "brick_set_gravity_unit":"steps/second²",
            "brick_set_mass":"Set mass to ",
            "brick_set_mass_unit":"kilogram",
            "brick_set_bounce_factor":"Set bounce factor to ",
            "ev3_tone_percent":"%",
            "brick_set_friction":"Set friction to ",
            "brick_pen_down":"Pen down",
            "brick_pen_up":"Pen up",
            "brick_pen_size":"Set pen size to",
            "brick_pen_color":"Set pen color to",
            "brick_clear_background":"Clear",
            "brick_stamp":"Stamp",
            "color_red":"Red",
            "color_green":"Green",
            "color_blue":"Blue",
            "brick_set_look":"Switch to look",
            "brick_next_look":"Next look",
            "brick_previous_look":"Previous look",
            "brick_set_size_to":"Set size to",
            "brick_change_size_by":"Change size by",
            "brick_hide":"Hide",
            "brick_show":"Show",
            "brick_ask_label":"Ask",
            "brick_say_bubble":"Say",
            "brick_think_say_for_text":"for",
            "brick_think_bubble":"Think",
            "brick_set_transparency":"Set transparency ",
            "brick_clear_graphic_effect":"Clear graphic effects",
            "brick_set_background":"Set background",
            "brick_and_wait":"and wait",
            "brick_video":"Turn camera",
            "brick_choose_camera":"Use camera",
            "brick_flash":"Turn flashlight",
            "brick_play_sound":"Start sound",
            "brick_play_sound_and_wait":"Start sound and wait",
            "brick_stop_all_sounds":"Stop all sounds",
            "brick_set_volume_to":"Set volume to",
            "brick_change_volume_by":"Change volume by",
            "brick_speak":"Speak",
            "brick_speak_and_wait":"and wait",


            //formula
            "formula_editor_logic_notequal":"&#x2260;",
            "formula_editor_logic_lesserthan":"&lt;",
            "formula_editor_logic_greaterthan":"&gt;",
            "formula_editor_logic_and":"AND",
            "formula_editor_logic_or":"OR",
            "formula_editor_logic_not":"NOT",
            "formula_editor_logic_greaterequal":"&#x2265;",
            "formula_editor_logic_leserequal":"&#x2264;",
            "formula_editor_logic_equal":"=",
            "formula_editor_operator_mult":"×",
            "formula_editor_operator_plus":"+",
            "formula_editor_operator_minus":"-",
            "formula_editor_operator_divide":"÷",
            "formula_editor_operator_power":"^",
            "formula_editor_sensor_x_acceleration":"acceleration_x",
            "formula_editor_sensor_y_acceleration":"acceleration_y",
            "formula_editor_sensor_z_acceleration":"acceleration_z",
            "formula_editor_sensor_compass_direction":"compass_direction",
            "formula_editor_sensor_latitude":"latitude",
            "formula_editor_sensor_longitude":"longitude",
            "formula_editor_sensor_location_accuracy":"location_accuracy",
            "formula_editor_sensor_altitude":"altitude",
            "formula_editor_sensor_x_inclination":"inclination_x",
            "formula_editor_sensor_y_inclination":"inclination_y",
            "formula_editor_sensor_loudness":"loudness",
            "formula_editor_sensor_date_year":"year",
            "formula_editor_sensor_date_month":"month",
            "formula_editor_sensor_date_day":"day",
            "formula_editor_sensor_date_weekday":"weekday",
            "formula_editor_sensor_time_hour":"hour",
            "formula_editor_sensor_time_minute":"minute",
            "formula_editor_sensor_time_second":"second",
            "formula_editor_function_finger_x":"screen_touch_x",
            "formula_editor_function_finger_y":"screen_touch_y",
            "formula_editor_function_is_finger_touching":"screen_is_touched",
            "formula_editor_function_index_of_last_finger":"last_screen_touch_index",
            "formula_editor_sensor_face_detected":"is_face_detected",
            "formula_editor_sensor_face_size":"face_size",
            "formula_editor_sensor_face_x_position":"face_x_position",
            "formula_editor_sensor_face_y_position":"face_y_position",
            "formula_editor_object_transparency":"transparency",
            "formula_editor_object_brightness":"brightness",
            "formula_editor_object_color":"color",
            "formula_editor_object_look_number":"look_number",
            "formula_editor_object_look_name":"look_name",
            "formula_editor_object_background_number":"background_number",
            "formula_editor_object_background_name":"background_name",
            "formula_editor_object_layer":"layer",
            "formula_editor_object_rotation":"direction",
            "formula_editor_object_size":"size",
            "formula_editor_object_x":"position_x",
            "formula_editor_object_y":"position_y",
            "formula_editor_function_collides_with_edge":"touches_edge",
            "formula_editor_function_touched":"touches_finger",
            "formula_editor_object_x_velocity":"x_velocity",
            "formula_editor_object_y_velocity":"y_velocity",
            "formula_editor_object_angular_velocity":"angular_velocity",
            "formula_editor_sensor_lego_nxt_1":"NXT_sensor_1",
            "formula_editor_sensor_lego_nxt_2":"NXT_sensor_2",
            "formula_editor_sensor_lego_nxt_3":"NXT_sensor_3",
            "formula_editor_sensor_lego_nxt_4":"NXT_sensor_4",
            "formula_editor_phiro_sensor_front_left":"phiro_front_left_sensor",
            "formula_editor_phiro_sensor_front_right":"phiro_front_right_sensor",
            "formula_editor_phiro_sensor_side_left":"phiro_side_left_sensor",
            "formula_editor_phiro_sensor_side_right":"phiro_side_right_sensor",
            "formula_editor_phiro_sensor_bottom_left":"phiro_bottom_left_sensor",
            "formula_editor_phiro_sensor_bottom_right":"phiro_bottom_right_sensor",
            "formula_editor_function_sin":"sin",
            "formula_editor_function_cos":"cos",
            "formula_editor_function_tan":"tan",
            "formula_editor_function_ln":"ln",
            "formula_editor_function_log":"log",
            "formula_editor_function_pi":"pi",
            "formula_editor_function_sqrt":"sqrt",
            "formula_editor_function_rand":"random",
            "formula_editor_function_abs":"abs",
            "formula_editor_function_round":"round",
            "formula_editor_function_mod":"mod",
            "formula_editor_function_arcsin":"arcsin",
            "formula_editor_function_arccos":"arccos",
            "formula_editor_function_arctan":"arctan",
            "formula_editor_function_exp":"exp",
            "formula_editor_function_power":"power",
            "formula_editor_function_floor":"floor",
            "formula_editor_function_ceil":"ceil",
            "formula_editor_function_max":"max",
            "formula_editor_function_min":"min",
            "formula_editor_function_true":"TRUE",
            "formula_editor_function_false":"FALSE",
            "formula_editor_function_length":"length",
            "formula_editor_function_letter":"letter",
            "formula_editor_function_join":"join",
            "formula_editor_function_number_of_items":"number_of_items",
            "formula_editor_function_list_item":"element",
            "formula_editor_function_contains":"contains",
            "formula_editor_function_multi_finger_x":"screen_touch_x",
            "formula_editor_function_multi_finger_y":"screen_touch_y",
            "formula_editor_function_is_multi_finger_touching":"screen_is_touched",
            "formula_editor_function_arduino_read_pin_value_digital":"arduino_digital_pin",
            "formula_editor_function_arduino_read_pin_value_analog":"arduino_analog_pin",
            "formula_editor_bracket_open":"(",
            "formula_editor_bracket_close":")",
            "formula_editor_function_collision":"touches_object",

        };

        this._onLanguageChange = new SmartJs.Event.Event(this);
        this._onDirectionChange = new SmartJs.Event.Event(this);
        this._onError = new SmartJs.Event.Event(this);
    }

    //events
    Object.defineProperties(I18nProvider.prototype, {
        onLanguageChange: {
            get: function () {
                return this._onLanguageChange;
            }
        },
        onDirectionChange: {
            get: function () {
                return this._onDirectionChange;
            }
        },
        onError: {
            get: function () {
                return this._onError;
            }
        },
    });

    //properties
    Object.defineProperties(I18nProvider.prototype, {
        _rtlRegExp: {
            value: new RegExp('^[^A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF]*[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]'),
        },
        currentLanguage: {
            get: function () {
                return this._currentLanguage;
            },
        },
        currentLanguageDirection: {
            get: function () {
                return this._direction;
            },
        },
        supportedLanguages: {
            get: function () {
                return this._supportedLanguages;
            },
        },
    });

    //methods
    I18nProvider.prototype.merge({
        init: function (rfc3066) {
            if (this._supportedLanguages.length == 0) {
                var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N_LANGUAGES, SmartJs.RequestMethod.GET);
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._loadSuppordetLanguagesLoadHandler, this));
                req.onLoad.addEventListener(new SmartJs.Event.EventListener(function () { this.loadDictionary(rfc3066); }.bind(this)));
                req.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));
                PocketCode.Proxy.send(req);
            }
            else
                this.loadDictionary(rfc3066);
        },
        _loadSuppordetLanguagesLoadHandler: function (e) {
            var languages = e.responseJson.supportedLanguages;
            if (!(languages instanceof Array))
                throw new Error('invalid language file');

            var lang;
            for (var i = 0, l = languages.length; i < l; i++) {
                lang = languages[i];
                if (!lang.languageCode || !lang.uiString)
                    throw new Error('invalid language file');
            }
            this._supportedLanguages = languages;
        },
        loadDictionary: function (rfc3066) {
            if (rfc3066) {
                if (rfc3066 == this._currentLanguage)
                    return;
                var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N, SmartJs.RequestMethod.GET, { rfc3066: rfc3066 });
            }
            else
                var req = new PocketCode.ServiceRequest(PocketCode.Services.I18N_AUTO, SmartJs.RequestMethod.GET);

            req.onLoad.addEventListener(new SmartJs.Event.EventListener(this._loadDictionaryLoadHandler, this));
            req.onError.addEventListener(new SmartJs.Event.EventListener(this._loadErrorHandler, this));
            PocketCode.Proxy.send(req);
        },
        _loadDictionaryLoadHandler: function (e) {
            var json = e.responseJson;
            if (typeof json !== 'object')
                throw new Error('invalid argument dictionary expected type object');
            if (!json.languageCode || !json.direction || typeof json.dictionary !== 'object')
                throw new Error('invalid argument dictionary');

            if (json.languageCode === this._currentLanguage)
                return;
            if (json.direction !== this._direction) {
                this._direction = json.direction;
                this._onDirectionChange.dispatchEvent({ direction: this._direction });
            }
            this._dictionary.merge(json.dictionary); //using merge: so we can provide an initial dict for loading and errors
            this._currentLanguage = json.languageCode.substring(0, 2);
            this._onLanguageChange.dispatchEvent({ language: this._currentLanguage });
        },
        _loadErrorHandler: function (e) {
            this.onError.dispatchEvent(e);
        },
        getLocString: function (key) {
            var string = this._dictionary[key];
            if (!string)
                return '[' + key + ']';

            return string;
        },
        getTextDirection: function (string) {
            return this._rtlRegExp.test(string) ? PocketCode.Ui.Direction.RTL : PocketCode.Ui.Direction.LTR;
        },
        /* override */
        dispose: function () {
            //static class: cannot be disposed
        },
    });

    return I18nProvider;
})();

//static class: constructor override (keeping code coverage enabled)
PocketCode.I18nProvider = new PocketCode._I18nProvider();