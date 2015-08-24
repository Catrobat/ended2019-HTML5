<?php

class ProjectDto {

  public $id;
  public $header;
  
  public $background;			//object
  public $sprites = array();	//objects
  public $resourceBaseUrl;		
  
  public $images = array();
  public $sounds =  array();
  public $variables =  array();
  public $broadcasts =  array();
  
  
  public function __construct($id, $resourceBaseUrl) {
    $this->id = $id;
    $this->resourceBaseUrl = $resourceBaseUrl;
  }
    
}
