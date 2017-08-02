<?php

//auto load includes when they are used
spl_autoload_register(function ($className)
{
  $className = ucfirst($className);
  if(preg_match('/[a-zA-Z]+Controller$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    require __DIR__ . '/controller/' . $className . '.class.php';

    return true;
  }
  elseif(preg_match('/[a-zA-Z]+Model$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    require __DIR__ . '/model/' . $className . '.class.php';

    return true;
  }
  elseif(preg_match('/[a-zA-Z]+View$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    require __DIR__ . '/view/' . $className . '.class.php';

    return true;
  }
  elseif(preg_match('/[a-zA-Z]+Dto$/', $className))
  {
    /** @noinspection PhpIncludeInspection */
    require __DIR__ . '/dto/' . $className . '.class.php';

    return true;
  }
  else
  {
    /** @noinspection PhpIncludeInspection */
    require __DIR__ . '/library/' . $className . '.class.php';

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

