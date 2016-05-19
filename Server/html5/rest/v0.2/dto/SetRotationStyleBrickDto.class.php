<?php

class SetRotationStyleBrickDto extends BaseBrickDto {

  public $style;	//"left-right", "don't rotate", "all around"
  
  public function __construct($style) {
	parent::__construct("SetRotationStyle");
	
	$this->style = $style;
  }
  
}
