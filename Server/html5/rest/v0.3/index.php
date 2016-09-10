<?php
require("config.php");
require("autoloader.php");

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

