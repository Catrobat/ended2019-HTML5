<?php

/**
 * Created by PhpStorm.
 * User: Michael Pittner
 * Date: 04.05.2015
 * Time: 18:03
 */
class FileView
{

  public function render($outputObject)
  {
    if($outputObject instanceof ExceptionDto)
    {
      // Error handling - show exception
      header('Content-Type: application/json');
      echo json_encode($outputObject);
    }
    elseif((strpos($outputObject, 'data://image') !== false))
    {
      // handle base64 encoded image
      /*
      $fp   = fopen($outputObject, 'r');
      $meta = stream_get_meta_data($fp);
      $mime_type = $meta['mediatype'];

      $outputObject = file_get_contents($outputObject);
      */

      $file_info = new finfo(FILEINFO_MIME);
      $mime_type = $file_info->buffer($outputObject);

      $outputObject = file_get_contents($outputObject);

      header("Content-Transfer-Encoding: binary");
      header("Content-Type: " . $mime_type);
      echo $outputObject;
    }
    else
    {
      // handle mp3
      $file_info = new finfo(FILEINFO_MIME);
      $mime_type = $file_info->buffer($outputObject);

      header("Content-Transfer-Encoding: binary");
      header("Content-Type: " . $mime_type);
      echo $outputObject;
    }
  }

}