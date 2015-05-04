<?php
/**
 * Created by PhpStorm.
 * User: Michael Pittner
 * Date: 04.05.2015
 * Time: 18:03
 */

class FileView {

  public function render($outputObject)
  {
    if( $outputObject instanceof ExceptionDto )
    {
      // Error handling - show exception
      header('Content-Type: application/json');
      echo json_encode( $outputObject );
    }
    else
    {
      // Play mp3
      header("Content-Transfer-Encoding: binary");
      header("Content-Type: audio/mpeg");
      echo $outputObject;
    }
  }

}