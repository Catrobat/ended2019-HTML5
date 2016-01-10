<?php

require_once("BaseController.class.php");

class I18nController extends BaseController
{
  public $language = "";
  public $supportedLanguages = ["en", "de"];
  public $region = "";

  public function __construct($request)
  {
    parent::__construct($request);
  }

  public function get()
  {
    $len = count($this->request->serviceSubInfo);
    $servicePathViolation = ": " . implode("/", $this->request->serviceSubInfo);

    if($len < 1 || $len > 2)
    {
      return new ServicePathViolationException($this->request->serviceName . $servicePathViolation);
    }

    $this->language = $this->request->serviceSubInfo[0];

    if(! in_array($this->language, $this->supportedLanguages))
    {
      return new ServiceNotImplementedException($this->request->serviceName . $servicePathViolation);
    }

    if(isset($this->request->serviceSubInfo[1]))
    {
      $this->region = strtolower($this->request->serviceSubInfo[1]);
    }

    $file = getcwd() . "/i18n/" . $this->language . ".json";
    if(! file_exists($file))
    {
      return new ServiceNotImplementedException($this->request->serviceName . $servicePathViolation);
    }

    $string = file_get_contents($file);
    $json = json_decode($string);

    switch($this->language)
    {
      case "en":
        //return new I18nEnDto($this->region);
        return $json;
        break;
      case "de":
        //return new I18nDeDto($this->region);
        return $json;
        break;

      default:
        return new ServiceMethodNotImplementedException($this->request->serviceName . $servicePathViolation);
    }
  }
}
