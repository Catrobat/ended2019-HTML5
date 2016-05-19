<?php

class SpriteDto {

  public $id;		//used for e.g. PointToBrick
  public $name;
  
  public $looks = array();	//of type LookDto : ResourceReferenceDto
  public $sounds = array();	//of type ResourceReferenceDto
  public $variables = array();
  public $lists = array();
  public $nfcTags = array();
  
  public $scripts = array();	//scripts

  
  public function __construct($id, $name) {
    $this->id = $id;
    $this->name = $name;
  }
    
}
