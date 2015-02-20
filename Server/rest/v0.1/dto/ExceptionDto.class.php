<?php

class ExceptionDto {

  public $type;
  public $message;
  public $code;
  public $file;
  public $line;
  
  
  public function __construct($type, $message = "", $code = "", $file = "", $line = 0) {
    $this->type = $type;
    $this->message = $message;
    $this->code = $code;
    $this->file = $file;
    $this->line = $line;
    
  }
    
}

?>