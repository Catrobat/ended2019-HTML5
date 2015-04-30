<?php

require_once("BaseController.class.php");
require_once("ProjectsController.class.php");

class TtsController extends BaseController
{
  const GOOGLE_TTS_SERVICE = "http://translate.google.com/translate_tts?";
  const AUDIO_ROOT = "https://web-test.catrob.at/html5/audio/";

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
    $this->text = trim($txt);
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
}

?>