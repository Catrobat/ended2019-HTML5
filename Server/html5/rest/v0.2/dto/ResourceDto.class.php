<?php

class ResourceDto {

  public $id;
  public $url;
  public $size;
  
  public function __construct($id, $url, $size) {
    $this->id = $id;
    $this->url = $url;
	$this->size = $size;
  }
    
}
