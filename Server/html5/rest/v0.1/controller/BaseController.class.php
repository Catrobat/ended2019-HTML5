<?php

abstract class BaseController
{
  protected $request;

  public function __construct($request)
  {
    $this->request = $request;
  }

  public function get()
  {
    throw new ServiceMethodNotImplementedException($this->request->serviceName . ", method: " . $this->request->requestMethod);
  }

  public function put()
  {
    throw new ServiceMethodNotImplementedException($this->request->serviceName . ", method: " . $this->request->requestMethod);
  }

  public function post()
  {
    throw new ServiceMethodNotImplementedException($this->request->serviceName . ", method: " . $this->request->requestMethod);
  }

  public function delete()
  {
    throw new ServiceMethodNotImplementedException($this->request->serviceName . ", method: " . $this->request->requestMethod);
  }
}
