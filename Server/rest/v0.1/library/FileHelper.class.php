<?php

class FileHelper {

  static function deleteDirectory($dir){
    if (!is_dir($dir))
      return true;
      
    $result = false;
    if ($handle = opendir($dir)){
        $result = true;
        while ((($file=readdir($handle))!==false) && ($result)){
            if ($file!='.' && $file!='..'){
                if (is_dir($dir . DIRECTORY_SEPARATOR . $file)){
                    $result = self::deleteDirectory($dir . DIRECTORY_SEPARATOR . $file);
                } else {
                    $result = unlink($dir . DIRECTORY_SEPARATOR . $file);
                }
            }
        }
        closedir($handle);
        if ($result){
            $result = rmdir($dir);
        }
    }
    return $result;
  }

}

?>