<?php

require_once("BaseController.class.php");
require_once("ProjectsController.class.php");

class TtsController extends BaseController
{
  const GOOGLE_TTS_SERVICE = "http://translate.google.com/translate_tts?";
  const AUDIO_ROOT = "https://web-test.catrob.at/html5/audio/";
  const MAX_LETTER_COUNT = 100;

  public $text;
  public $language;
  public $mp3;
  public $path;

  public function __construct($lang = "en")
  {
    parent::__construct($lang);

    $this->language = $lang;
  }

  private function getParsedUrl()
  {
    $encoded = urlencode($this->text);
    $url = self::GOOGLE_TTS_SERVICE . "tl={$this->language}&q={$encoded}";
    return $url;
  }

  public function convertTTS($txt)
  {
    $this->text = $this->tokenTruncate( trim($txt), MAX_LETTER_COUNT );
    if(empty($this->text))
      return null;

    $hash = md5($this->text . $this->language);
    $this->path = ProjectsController::SERVER_ROOT . "html5/audio/";

    $file = $this->path . $hash . ".mp3";
    if(!file_exists($file))
    {
      $this->mp3 = file_get_contents($this->getParsedUrl());
      file_put_contents($file, $this->mp3);
    }
    return self::AUDIO_ROOT . $hash . ".mp3";
  }

  public function tokenTruncate( $string, $your_desired_width ) {
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