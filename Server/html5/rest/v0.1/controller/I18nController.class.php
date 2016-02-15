<?php

require_once("BaseController.class.php");

class I18nController extends BaseController
{
  public $langCode = "";
  public $dir = "";
  public $supportedLanguages = ["en", "en-US", "en-GB",
                                "de", "de-AT", "de-DE", "de-CH"];
  public $isRTL = [];

  public $api = "https://api.crowdin.com/api/project/catrobat/download/";
  public $apiKey = "?key=6c9a3f10bd747ea3198c0bb9b651d9ab";

  // https://api.crowdin.com/api/project/catrobat/download/de.zip?key=6c9a3f10bd747ea3198c0bb9b651d9ab
  // https://api.crowdin.com/api/project/catrobat/download/en-GB.zip?key=6c9a3f10bd747ea3198c0bb9b651d9ab

  // yaml_parse_file($filename) ==> array
  // json_encode(array) ==> json


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
      $requestLang = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
      $requestLang = substr($requestLang, 0, 5);
      $this->langCode = $requestLang;
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

      if($this->langCode == "update")
      {
        if(! $this->updateTranslations())
        {
          return new I18nDto($this->langCode, "", "error updating languages...");
        }
        return new I18nDto($this->langCode, "", "all languages successfully updated");
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

  private function updateTranslations()
  {
    // german
    $url = $this->api . "de.zip" . $this->apiKey;
    $zipDe = file_get_contents($url);
    $file = getcwd() . "/i18n/de.zip";
    file_put_contents($file, $zipDe);

    $zip = new ZipArchive;
    if ($zip->open($file) === TRUE)
    {
      $dir = getcwd() . "/i18n/zips/";
      $zip->extractTo($dir);
      $zip->close();
    }
    else
    {
      return false;
    }

    $dir = getcwd() . "/i18n/zips/html5/player/de-DE.json";
    $file = getcwd() . "/i18n/de-DE.json";
    rename($dir, $file);

    $newFile = getcwd() . "/i18n/de-AT.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $newFile = getcwd() . "/i18n/de-CH.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $newFile = getcwd() . "/i18n/de.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $file = getcwd() . "/i18n/de.zip";
    unlink($file);

    // english
    $url = $this->api . "en-GB.zip" . $this->apiKey;
    $zipDe = file_get_contents($url);
    $file = getcwd() . "/i18n/en.zip";
    file_put_contents($file, $zipDe);

    $zip = new ZipArchive;
    if ($zip->open($file) === TRUE)
    {
      $dir = getcwd() . "/i18n/zips/";
      $zip->extractTo($dir);
      $zip->close();
    }
    else
    {
      return false;
    }

    $dir = getcwd() . "/i18n/zips/html5/player/en-GB.json";
    $file = getcwd() . "/i18n/en-GB.json";
    rename($dir, $file);

    $newFile = getcwd() . "/i18n/en-US.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $newFile = getcwd() . "/i18n/en.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $file = getcwd() . "/i18n/en.zip";
    unlink($file);

    return true;
  }
}
