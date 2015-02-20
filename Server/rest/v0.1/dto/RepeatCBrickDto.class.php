<?php

class RepeatCBrickDto extends BaseBrickDto {

  public $timesToRepeat;	//formula
  public $bricks = array();	//inner scripts
  
  
  public function __construct($timesToRepeat) {
	parent::__construct("Repeat");
	
	$this->timesToRepeat = $timesToRepeat;
  }
  
}

?>