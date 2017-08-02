<?php
/**
 * Created by PhpStorm.
 * User: User
 * Date: 24.08.2016
 * Time: 22:24
 */


spl_autoload_register(function ($className)
{
    $SEPARATOR = "/";
    PHP_OS == "Windows" ||
    PHP_OS == "WINNT" ? $SEPARATOR = "\\" : $SEPARATOR = "/";
    $path_to_server =  dirname(__DIR__).$SEPARATOR."..".$SEPARATOR."Server".$SEPARATOR."html5".$SEPARATOR."rest".$SEPARATOR."v0.2".$SEPARATOR;
    $className = ucfirst($className);
    if(preg_match('/[a-zA-Z]+Controller$/', $className))
    {
        /** @noinspection PhpIncludeInspection */
        include $path_to_server.'controller'.$SEPARATOR . $className . '.class.php';

        return true;
    }
    elseif(preg_match('/[a-zA-Z]+Model$/', $className))
    {
        /** @noinspection PhpIncludeInspection */
        include $path_to_server.'model'.$SEPARATOR . $className . '.class.php';

        return true;
    }
    elseif(preg_match('/[a-zA-Z]+View$/', $className))
    {
        /** @noinspection PhpIncludeInspection */
        include_once $path_to_server.'view'.$SEPARATOR . $className . '.class.php';

        return true;
    }
    elseif(preg_match('/[a-zA-Z]+Dto$/', $className))
    {
        /** @noinspection PhpIncludeInspection */
        include_once $path_to_server.'dto'.$SEPARATOR . $className . '.class.php';

        return true;
    }
    elseif(preg_match('/PHPUnit[a-zA-Z | _ ]+/', $className))
    {
        return true;
    }
    elseif(preg_match('/[a-zA-Z | \\ ]*ClassLoader[a-zA-Z | \\ ]*$/',$className))
    {
        return false;
    }
    else
    {
        /** @noinspection PhpIncludeInspection */
        include_once $path_to_server.'library'.DIRECTORY_SEPARATOR . $className . '.class.php';

        return true;
    }
});