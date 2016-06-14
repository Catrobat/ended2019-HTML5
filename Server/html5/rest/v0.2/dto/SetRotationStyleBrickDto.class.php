<?php

class SetRotationStyleBrickDto extends BaseBrickDto {

  public $selected;   //index
  //public $style;	//"left-right", "don't rotate", "all around"
  
  public function __construct($selected) {
	parent::__construct("SetRotationStyle");
	
    $this->selected = $selected;	//{1: all around, 2: left-right, 3: don't rotate}
  }
  
}
