<?php

class SpriteDto {

  public $id;		//used for e.g. PointToBrick
  public $name;
  
  public $looks = array();	//of type ResourceDto
  public $sounds = array();	//of type ResourceDto
  public $variables = array();
  public $lists = array();
  
  public $bricks = array();	//scripts

  
  public function __construct($id, $name) {
    $this->id = $id;
    $this->name = $name;
  }
    
}
