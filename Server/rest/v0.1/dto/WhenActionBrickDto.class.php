<?php

class WhenActionBrickDto extends BaseBrickDto {

  public $action;
  public $bricks = array();	//inner scripts
  
  
  public function __construct($action) {
	parent::__construct("WhenAction");
	$this->action = $action;
  }
  
}

?>