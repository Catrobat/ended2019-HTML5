<?php

require_once("BaseController.class.php");
require_once("ProjectsController.class.php");

class FileController extends BaseController
{
  const GOOGLE_TTS_SERVICE = "http://translate.google.com/translate_tts?";
  const AUDIO_ROOT = "https://localhost/html5/audio/";
  const MAX_LETTER_COUNT = 100;

  public $text;
  public $language;
  public $mp3;

  public function __construct($request)
  {
    parent::__construct($request); // call parent constructor to set request method
    $this->language = "en"; //default lang
    $request->responseType = "application/file"; // Overide default responsetype => to get FileView
  }

  public function get()
  {
    // Variable Initialization
    $text = "";
    if (isset($_GET['text'])) {
      $text = utf8_decode( $_GET['text'] );
    }
    if (isset($_GET['lang'])) {
      $this->language = $_GET['lang'];
    }

    // Error handling if only ../file/ is given
    $len = count($this->request->serviceSubInfo);
    if ( $len == 0 )
      return new ServicePathViolationException("No Parameter is set after 'file'");

    // type of file params
    switch( $this->request->serviceSubInfo[0] )
    {
      case "tts":
        $this->convertTTS( $text );
        return $this->mp3;
        break;
      case "screenshot":
        // TODO
        return new ServiceFileMethodNotImplementedException( "File-Method not found: ".implode("/", $this->request->serviceSubInfo) );
        break;
      default:
        return new ServiceFileMethodNotImplementedException( "File-Method not found: " . implode("/", $this->request->serviceSubInfo) );
        break;
    }
  }

  private function getParsedUrl()
  {
    // get Google Speech
    $encoded = urlencode($this->text);
    $url = self::GOOGLE_TTS_SERVICE . "tl={$this->language}&q={$encoded}";
    return $url;
  }

  public function convertTTS($txt)
  {
    $this->text = $this->tokenTruncate( trim($txt), self::MAX_LETTER_COUNT );
    if(empty($this->text))
      return "";
    $this->mp3 = file_get_contents($this->getParsedUrl());
  }

  // Cut words, that text is under 100 letter
  public function tokenTruncate( $string, $your_desired_width )
  {
    $parts = preg_split('/([\s\n\r]+)/', $string, null, PREG_SPLIT_DELIM_CAPTURE);
    $parts_count = count($parts);

    $length = 0;
    $last_part = 0;
    for (; $last_part < $parts_count; ++$last_part) {
      $length += strlen($parts[$last_part]);
      if ($length > $your_desired_width) { break; }
    }
    return implode(array_slice($parts, 0, $last_part));
  }
}



?>