<?php
require("config.php");

//auto load includes when they are used
spl_autoload_register(function ($className)
{
  $className = ucfirst($className);
  if(preg_match('/[a-zA-Z]+Controller$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    include __DIR__ . '/controller/' . $className . '.class.php';

    return true;
  }
  elseif(preg_match('/[a-zA-Z]+Model$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    include __DIR__ . '/model/' . $className . '.class.php';

    return true;
  }
  elseif(preg_match('/[a-zA-Z]+View$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    include __DIR__ . '/view/' . $className . '.class.php';

    return true;
  }
  elseif(preg_match('/[a-zA-Z]+Dto$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    include __DIR__ . '/dto/' . $className . '.class.php';

    return true;
  }
  else
  {
    /** @noinspection PhpIncludeInspection */
    include __DIR__ . '/library/' . $className . '.class.php';

    return true;
  }
});

//convert warning into error- getting a stack trace to fix the warning too
//set_error_handler(function($errno, $errstr, $errfile, $errline, array $errcontext) {
set_error_handler(function ($errno, $errstr, $errfile, $errline)
{
  // error was suppressed with the @-operator
  if(0 === error_reporting())
  {
    return false;
  }

  throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

//global $request;
$request = new Request();

//route request to controller
$controllerName = $request->serviceName . 'Controller';
$result = null;

try
{
  if(class_exists($controllerName, $autoload = true))
  {
    $controller = new $controllerName($request);
    $requestMethod = strtolower($request->requestMethod);
    try
    {
      $result = $controller->$requestMethod();
    }
    catch(Exception $e)
    {
      $result = $e;
    }
  }
  else
  {
    throw new ServiceNotImplementedException($controllerName);
  }
}
catch(Exception $e)
{
  $result = new ServiceNotImplementedException($e->getMessage(), $e->getCode(), $e);
}

$view_name = ucfirst(explode('/', $request->responseType)[1]) . 'View';
//print_r($view_name);
if(class_exists($view_name))
{
  $view = new $view_name($request);

  //handle exceptions
  if(is_a($result, "Exception"))
  {   //an exception is not convertible to JSON using json_encode() & this should not be handled in the view
    switch(get_class($result))
    {
      case "ServiceNotImplementedException":
        $result = new ExceptionDto("ServiceNotImplementedException", $result->getMessage(), $result->getCode(),
                                   $result->getFile(), $result->getLine());
        break;

      case "ServiceMethodNotImplementedException":
        $result = new ExceptionDto("ServiceMethodNotImplementedException", $result->getMessage(), $result->getCode(),
                                   $result->getFile(), $result->getLine());
        break;

      case "ServiceFileMethodNotImplementedException":
        $result = new ExceptionDto("ServiceFileMethodNotImplementedException", $result->getMessage(), $result->getCode(),
                                   $result->getFile(), $result->getLine());
        break;

      case "ServicePathViolationException":
        $result = new ExceptionDto("ServicePathViolationException", $result->getMessage(), $result->getCode(), $result->getFile(),
                                   $result->getLine());
        break;

      case "InvalidProjectFileException":
        $result = new ExceptionDto("InvalidProjectFileException", $result->getMessage(), $result->getCode(), $result->getFile(),
                                   $result->getLine());
        break;

      case "ProjectNotFoundException":
        $result = new ExceptionDto("ProjectNotFoundException", $result->getMessage(), $result->getCode(), $result->getFile(),
                                   $result->getLine());
        break;

      case "FileParserException":
        $result = new ExceptionDto("FileParserException", $result->getMessage(), $result->getCode(), $result->getFile(),
                                   $result->getLine());
        break;

      case "AuthenticationException":
        $result = new ExceptionDto("AuthenticationException", $result->getMessage(), $result->getCode(), $result->getFile(),
                                   $result->getLine());
        break;

      default:    //exception
        $result = new ExceptionDto("UnhandledException", $result->getMessage(), $result->getCode(), $result->getFile(),
                                   $result->getLine());

    }
  }
  $view->render($result);
}

