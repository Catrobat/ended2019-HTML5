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
    elseif((strpos($outputObject, 'data://image/') !== false))
    {
      // handle base64 encoded image
      $fp   = fopen($outputObject, 'r');
      $meta = stream_get_meta_data($fp);
      $mime_type = $meta['mediatype'];

      $extension = str_replace( "image/", "", $mime_type );
      $filename = "screenshot." . $extension;

      header('Content-Disposition: attachment; filename=' . $filename );
      header("Content-Type: " . $mime_type);
      //header('Content-Type:application/force-download');
      header("Content-Transfer-Encoding: binary");
      $outputObject = file_get_contents($outputObject);
      echo $outputObject;
    }
    else
    {
      // write return header: generic version
			$file_info = new finfo(FILEINFO_MIME);
			$mime_type = $file_info->buffer($outputObject);
			
      header("Content-Transfer-Encoding: binary");
      header("Content-Type: " . $mime_type);
      echo $outputObject;
    }
  }

}