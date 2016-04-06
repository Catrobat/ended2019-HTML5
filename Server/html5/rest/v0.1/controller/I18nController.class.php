<?php

require_once("BaseController.class.php");

class I18nController extends BaseController
{
  public $langCode = "";
  public $dir = "";
  public $supportedLanguages = ["en", "en-US", "en-GB",
                                "de", "de-AT", "de-DE", "de-CH"];
  public $isRTL = [];

  private $api = "https://api.crowdin.com/api/project/catrobat/download/";
  private $apiKey = CROWDIN_API_KEY;

  public function __construct($request)
  {
    parent::__construct($request);
  }

  public function get()
  {
    $len = count($this->request->serviceSubInfo);

    if($len > 1)
    {
      $servicePathViolation = ": " . implode("/", $this->request->serviceSubInfo);
      return new ServicePathViolationException($this->request->serviceName . $servicePathViolation);
    }
    else if($len == 0)
    {
      // fallback
      $requestLangs = explode(",", $_SERVER['HTTP_ACCEPT_LANGUAGE']);
      $requestLang = substr($requestLangs[0], 0, 5);
      $this->langCode = $requestLang;
    }
    else
    {
      $this->langCode = $this->request->serviceSubInfo[0];

      if($this->langCode == "supported")
      {
        $file = getcwd() . "/i18nResources/supported.json";
        if(! file_exists($file))
        {
          return new ServiceNotImplementedException($this->request->serviceName . ": no supported languages found");
        }

        $string = file_get_contents($file);
        $supported = json_decode($string);
        return new I18nSupportedLanguagesDto($supported->languages);
      }

      if($this->langCode == "update")
      {
        if(! $this->updateTranslations())
        {
          return new I18nDictionaryDto($this->langCode, "", "error updating languages...");
        }
        return new I18nDictionaryDto($this->langCode, "", "all languages successfully updated");
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

    $file = getcwd() . "/i18nResources/" . $this->langCode . ".json";
    if(! file_exists($file))
    {
      return new ServiceNotImplementedException($this->request->serviceName . ": language resource file not found");
    }

    $string = file_get_contents($file);
    $dict = json_decode($string);

    return new I18nDictionaryDto($this->langCode, $this->dir, $dict);
  }

  private function updateTranslations()
  {
    // german
    $url = $this->api . "de.zip" . $this->apiKey;
    $zipDe = file_get_contents($url);
    $file = getcwd() . "/i18nResources/de.zip";
    file_put_contents($file, $zipDe);

    $zip = new ZipArchive;
    if ($zip->open($file) === TRUE)
    {
      $dir = getcwd() . "/i18nResources/zips/";
      $zip->extractTo($dir);
      $zip->close();
    }
    else
    {
      return false;
    }

    $dir = getcwd() . "/i18nResources/zips/html5/player/de-DE.json";
    $file = getcwd() . "/i18nResources/de-DE.json";
    rename($dir, $file);

    $newFile = getcwd() . "/i18nResources/de-AT.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $newFile = getcwd() . "/i18nResources/de-CH.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $newFile = getcwd() . "/i18nResources/de.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $file = getcwd() . "/i18nResources/de.zip";
    unlink($file);

    // english
    $url = $this->api . "en-GB.zip" . $this->apiKey;
    $zipDe = file_get_contents($url);
    $file = getcwd() . "/i18nResources/en.zip";
    file_put_contents($file, $zipDe);

    $zip = new ZipArchive;
    if ($zip->open($file) === TRUE)
    {
      $dir = getcwd() . "/i18nResources/zips/";
      $zip->extractTo($dir);
      $zip->close();
    }
    else
    {
      return false;
    }

    $dir = getcwd() . "/i18nResources/zips/html5/player/en-GB.json";
    $file = getcwd() . "/i18nResources/en-GB.json";
    rename($dir, $file);

    $newFile = getcwd() . "/i18nResources/en-US.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $newFile = getcwd() . "/i18nResources/en.json";
    if (!copy($file, $newFile))
    {
      return false;
    }

    $file = getcwd() . "/i18nResources/en.zip";
    unlink($file);

    return true;
  }
}
