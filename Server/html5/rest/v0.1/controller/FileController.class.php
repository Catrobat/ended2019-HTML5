<?php

require_once("BaseController.class.php");
require_once("ProjectsController.class.php");

/** @noinspection PhpInconsistentReturnPointsInspection */
/** @noinspection PhpUndefinedClassInspection */

class FileController extends BaseController
{
  const GOOGLE_TTS_SERVICE = "http://translate.google.com/translate_tts?";
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
    if(isset($_GET['text']))
    {
      $text = utf8_decode($_GET['text']);
    }
    if(isset($_GET['lang']))
    {
      $this->language = $_GET['lang'];
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
    if(isset($_POST['text']))
    {
      $text = utf8_decode($_POST['text']);
    }
    if(isset($_POST['lang']))
    {
      $this->language = $_POST['lang'];
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
    if(isset($_GET['base64string']))
    {
      $base64string = $_GET['base64string'];
    }

    if(isset($_POST['base64string']))
    {
      $base64string = $_POST['base64string'];
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
    $url = self::GOOGLE_TTS_SERVICE . "tl={$this->language}&q={$encoded}&client=t";
    return $url;
  }

  public function convertTTS($txt)
  {
    $this->text = $this->tokenTruncate(trim($txt), self::MAX_LETTER_COUNT);
    if(empty($this->text))
    {
      return "";
    }
    $this->mp3 = file_get_contents($this->getParsedUrl());

    /*
    $ch = curl_init();
    $timeout = 5; // 0 wenn kein Timeout
    curl_setopt($ch, CURLOPT_URL, $this->getParsedUrl());
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
    $this->mp3 = curl_exec($ch);
    curl_close($ch);
    */

    return $this->mp3;
  }

  // cut words, if text is longer than 100 letters
  public function tokenTruncate($string, $your_desired_width)
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
