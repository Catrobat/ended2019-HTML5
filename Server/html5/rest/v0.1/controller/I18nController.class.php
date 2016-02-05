<?php

require_once("BaseController.class.php");

class I18nController extends BaseController
{
  public $langCode = "";
  public $dir = "";
  public $supportedLanguages = ["en", "en-US", "en-GB",
                                "de", "de-AT", "de-DE", "de-CH"];
  public $isRTL = [];

  public function __construct($request)
  {
    parent::__construct($request);
  }

  public function get()
  {
    $len = count($this->request->serviceSubInfo);
    $servicePathViolation = ": " . implode("/", $this->request->serviceSubInfo);

    if($len > 1)
    {
      return new ServicePathViolationException($this->request->serviceName . $servicePathViolation);
    }
    else if($len == 0)
    {
      // fallback
      $this->langCode = "en";
    }
    else
    {
      $this->langCode = $this->request->serviceSubInfo[0];

      if($this->langCode == "supported")
      {
        $file = getcwd() . "/i18n/supported.json";
        if(! file_exists($file))
        {
          return new ServiceNotImplementedException($this->request->serviceName . $servicePathViolation);
        }

        $string = file_get_contents($file);
        $supported = json_decode($string);
        return new SupportedLanguagesDto($supported);
      }
    }

    if(! in_array($this->langCode, $this->supportedLanguages))
    {
      // fallback
      $this->langCode = "en";
    }

    $this->dir = "LTR";
    if(in_array($this->langCode, $this->isRTL))
    {
      $this->dir = "RTL";
    }

    $file = getcwd() . "/i18n/" . $this->langCode . ".json";
    if(! file_exists($file))
    {
      return new ServiceNotImplementedException($this->request->serviceName . $servicePathViolation);
    }

    $string = file_get_contents($file);
    $dict = json_decode($string);

    return new I18nDto($this->langCode, $this->dir, $dict);
  }
}
