<?php

class ResourceDto {

  public $id;
  public $url;
  
  
  public function __construct($id, $url) {
    $this->id = $id;
    $this->url = $url;
  }
    
}

?>