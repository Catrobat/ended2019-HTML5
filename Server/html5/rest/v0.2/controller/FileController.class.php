<?php
require_once("BaseController.class.php");
require_once("ProjectsController.class.php");

/** @noinspection PhpInconsistentReturnPointsInspection */
/** @noinspection PhpUndefinedClassInspection */

class FileController extends BaseController
{
    const GOOGLE_TTS_SERVICE = "https://translate.google.com/translate_tts?";
    const GOOGLE_LANG_RECO_SERVICE = "https://translate.google.com/translate_a/single?";//https://translate.google.com/translate_a/single?client=tw-ob&sl=auto&tl=en&hl=de&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&ssel=3&tsel=0&kc=0&q=das%20ist%20ein%20test-text.
    const MAX_LETTER_COUNT = 100;

    public $language;
    //https://cloud.google.com/translate/v2/translate-reference
    public $supportedLanguages = ["af", "sq", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "ny", "zh-CN", "zh-TW", "hr", "cs", "da", "nl", "en", "eo", "et", "tl", "fi", "fr", "gl", "ka", "de", "el", "gu", "ht", "ha", "iw", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", "kk", "km", "ko", "lo", "la", "lv", "lt", "mk", "mg", "ms", "ml", "mt", "mi", "mr", "mn", "my", "ne", "no", "fa", "pl", "pt", "ma", "ro", "ru", "sr", "st", "si", "sk", "sl", "so", "es", "su", "sw", "sv", "tg", "ta", "te", "th", "tr", "uk", "ur", "uz", "vi", "cy", "yi", "yo", "zu"];
    public $mp3;

    public function __construct($request)
    {
        // call parent constructor to set request method
        parent::__construct($request);

        //default lang
        $this->language = "en";

        // Override default responseType => to get FileView
        $request->responseType = "application/file";
    }

    public function get()
    {
        // Variable Initialization
        $text = "";
        if(isset($this->request->requestParameters['text']))
        {
            $text = $this->request->requestParameters['text'];    //do not use utf8_decode()
        }
        if(isset($this->request->requestParameters['lang']))
        {
            $this->language = $this->request->requestParameters['lang'];
        }

        // Error handling if only ../file/ is given
        $len = count($this->request->serviceSubInfo);
        if($len == 0)
        {
            return new ServicePathViolationException("No Parameter is set after 'file'");
        }

        // type of file params
        switch($this->request->serviceSubInfo[0])
        {
            case "tts":
                $this->convertTTS($text);
                return $this->mp3;
                break;

            case "screenshot":
                return $this->convertImage();
                break;

            default:
                return new ServiceFileMethodNotImplementedException("File-Method not found: " . implode("/", $this->request->serviceSubInfo));
                break;
        }
    }

    public function post()
    {
        return $this->get();    //url enabled for post and get
    }

    private function convertImage()
    {
        $base64string = "";
        if(isset($this->request->requestParameters['base64string']))
        {
            $base64string = $this->request->requestParameters['base64string'];
        }

        if(empty($base64string))
        {
            throw new Exception('missing request parameter: base64string');
        }

        //php needs "data://" canvas toDataURL() provides "data:" only
        $base64string = 'data://' . substr($base64string, 5);

        //If you want to save data that is derived from a Javascript canvas.toDataURL() function,
        // you have to convert blanks into pluses. If you do not do that, the decoded data is corrupted
        $encodedData = str_replace(' ', '+', $base64string);
        return $encodedData;
    }

    public function convertTTS($txt)
    {
        $txt = trim($txt);//$this->tokenTruncate(trim($txt), self::MAX_LETTER_COUNT);
        if(empty($txt))
        {
            return "";
        }

        $opts = array(
            'http' => array(
            'method' => "GET",
            'header' => "accept-language:de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4" .
                "pragma:no-cache\r\n" .
                "referer:https://translate.google.com/" .
                "user-agent:Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36"
            )
        );
        $context = stream_context_create($opts);
        $encoded = urlencode($txt);
        //try {
        //    $langArray = file_get_contents(self::GOOGLE_LANG_RECO_SERVICE . "client=tw-ob&sl=auto&tl=en&hl=de&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&ssel=3&tsel=0&kc=0&q=$encoded", false, $context);  //client=tw-ob&sl=auto&q=should%20not%20be%20a%20problem%20at%20all
        //    $language = $langArray[2];
        //    if (in_array($language, $this->supportedLanguages))
        //        $this->language = $language;
        //}
        //catch(Exception $e)
        //{
        //    //silent catch
        //}
        $this->mp3 = file_get_contents(self::GOOGLE_TTS_SERVICE . "ie=UTF-8&client=tw-ob&q=$encoded&tl=$this->language", false, $context);
        return $this->mp3;
    }

}
