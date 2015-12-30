<?php

require_once("BaseController.class.php");

class I18nController extends BaseController
{
  public $language = "";
  public $supportedLanguages = ["en", "de"];

  public function __construct($request)
  {
    parent::__construct($request);
  }

  public function get()
  {
    $len = count($this->request->serviceSubInfo);
    $servicePathViolation = ": " . implode("/", $this->request->serviceSubInfo);

    if($len != 1)
    {
      return new ServicePathViolationException($this->request->serviceName . $servicePathViolation);
    }

    $this->language = $this->request->serviceSubInfo[0];

    if(! in_array($this->language, $this->supportedLanguages))
    {
      return new ServiceMethodNotImplementedException($this->request->serviceName . $servicePathViolation);
    }

    switch($this->language)
    {
      case "en":
        return new I18nEnDto();
        break;
      case "de":
        return new I18nDeDto();
        break;

      default:
        return new ServiceMethodNotImplementedException($this->request->serviceName . $servicePathViolation);
    }
  }
}
