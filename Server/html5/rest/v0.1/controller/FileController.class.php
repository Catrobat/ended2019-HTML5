<?php
require_once("BaseController.class.php");
require_once("ProjectsController.class.php");

/** @noinspection PhpInconsistentReturnPointsInspection */
/** @noinspection PhpUndefinedClassInspection */

class FileController extends BaseController
{
  const GOOGLE_TTS_SERVICE = "https://translate.google.com/translate_tts?";
  const MAX_LETTER_COUNT = 100;

  public $text;
  public $language;
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
      $text = utf8_decode($this->request->requestParameters['text']);
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
    // Variable Initialization
    $text = "";
    if(isset($this->request->requestParameters['text']))
    {
      $text = utf8_decode($this->request->requestParameters['text']);
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

  private function getParsedUrl()
  {
    $encoded = urlencode($this->text);
    $textlen = strlen($this->text);
    $tk = $this->calcGoogleTtsToken($this->text);
    
    $url = self::GOOGLE_TTS_SERVICE . "tl={$this->language}&q={$encoded}&client=t&total=1&idx=0&tk={$tk}&textlen={$textlen}";
    return $url;
  }

  public function convertTTS($txt)
  {
    $this->text = $this->tokenTruncate(trim($txt), self::MAX_LETTER_COUNT);
    if(empty($this->text))
    {
      return "";
    }
    
    $opts = array(
        'http' => array(
        'method' => "GET",
        'header' => "accept-language:de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4\r\n" .
            "pragma:no-cache\r\n" .
            "referer:https://translate.google.com/\r\n" .
            "user-agent:Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36\r\n"
        )
    );
    $context = stream_context_create($opts);

    $this->mp3 = file_get_contents($this->getParsedUrl(), false, $context);
    return $this->mp3;
  }
  
   /**
     * Generate a valid Google Translate request token.
     * @param string $a text to translate
     *
     * @return string
     *
     * based on http://stackoverflow.com/questions/9893175/google-text-to-speech-api/34687566#34687566
     * and https://github.com/Boudewijn26/gTTS/blob/master/gtts/token.py
     */
  private function calcGoogleTtsToken($a)
  {
    //number of hours elapsed, since 1st of January 1970.
    $start = new DateTime('1970-01-01');
    $now = new DateTime('now');
    $diff = $now->diff($start);
    $b = $diff->h + ($diff->days * 24);

    //generate
    for ($d = [], $e = 0, $f = 0; $f < mb_strlen($a, 'UTF-8'); $f++) {
        $g = $this->charCodeAt($a, $f);
        if (128 > $g) {
            $d[$e++] = $g;
        } else {
            if (2048 > $g) {
                $d[$e++] = $g >> 6 | 192;
            } else {
                if (55296 == ($g & 64512) && $f + 1 < mb_strlen($a, 'UTF-8') && 56320 == ($this->charCodeAt($a, $f + 1) & 64512)) {
                    $g = 65536 + (($g & 1023) << 10) + ($this->charCodeAt($a, ++$f) & 1023);
                    $d[$e++] = $g >> 18 | 240;
                    $d[$e++] = $g >> 12 & 63 | 128;
                } else {
                    $d[$e++] = $g >> 12 | 224;
                    $d[$e++] = $g >> 6 & 63 | 128;
                }
            }
            $d[$e++] = $g & 63 | 128;
        }
    }
    $a = $b;
    for ($e = 0; $e < count($d); $e++) {
        $a += $d[$e];
        $a = $this->RL($a, '+-a^+6');
    }
    $a = $this->RL($a, '+-3^+b+-f');
    if (0 > $a) {
        $a = ($a & 2147483647) + 2147483648;
    }
    $a = fmod($a, pow(10, 6));
    return $a.'.'.($a ^ $b);
  }

  /* helper methods for token generation */
    /**
     * Process token data by applying multiple operations.
     *
     * @param $a
     * @param $b
     *
     * @return int
     */
    private function RL($a, $b)
    {
        for ($c = 0; $c < strlen($b) - 2; $c += 3) {
            $d = $b{$c + 2};
            $d = $d >= 'a' ? $this->charCodeAt($d, 0) - 87 : intval($d);
            $d = $b{$c + 1}
            == '+' ? $this->shr32($a, $d) : $a << $d;
            $a = $b{$c}
            == '+' ? ($a + $d & 4294967295) : $a ^ $d;
        }
        return $a;
    }
    
    /**
     * Crypto function.
     *
     * @param $x
     * @param $bits
     *
     * @return number
     */
    private function shr32($x, $bits)
    {
        if ($bits <= 0) {
            return $x;
        }
        if ($bits >= 32) {
            return 0;
        }
        $bin = decbin($x);
        $l = strlen($bin);
        if ($l > 32) {
            $bin = substr($bin, $l - 32, 32);
        } elseif ($l < 32) {
            $bin = str_pad($bin, 32, '0', STR_PAD_LEFT);
        }
        return bindec(str_pad(substr($bin, 0, 32 - $bits), 32, '0', STR_PAD_LEFT));
    }
    /**
     * Get the Unicode of the character at the specified index in a string.
     *
     * @param string $str
     * @param int    $index
     *
     * @return null|number
     */
    private function charCodeAt($str, $index)
    {
        $char = mb_substr($str, $index, 1, 'UTF-8');
        if (mb_check_encoding($char, 'UTF-8')) {
            $ret = mb_convert_encoding($char, 'UTF-32BE', 'UTF-8');
            $result = hexdec(bin2hex($ret));
            return $result;
        }
        return;
    }
  /* end: helper methods for tts token generation */
  
  
  // cut words, if text is longer than 100 letters
  private function tokenTruncate($string, $your_desired_width)
  {
    $parts = preg_split('/([\s\n\r]+)/', $string, null, PREG_SPLIT_DELIM_CAPTURE);
    $parts_count = count($parts);

    $length = 0;
    $last_part = 0;
    for(; $last_part < $parts_count; ++$last_part)
    {
      $length += strlen($parts[$last_part]);
      if($length > $your_desired_width)
      {
        break;
      }
    }

    return implode(array_slice($parts, 0, $last_part));
  }
}
