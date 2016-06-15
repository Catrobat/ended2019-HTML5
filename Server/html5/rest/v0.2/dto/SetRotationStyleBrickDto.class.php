<?php

class SetRotationStyleBrickDto extends BaseBrickDto {

  public $selected;   //index
  
  public function __construct($selected = "1") {
	parent::__construct("SetRotationStyle");
	
    $this->selected = $selected;	//{0: left-right, 1: all around, 2: don't rotate}
  }
  
}
