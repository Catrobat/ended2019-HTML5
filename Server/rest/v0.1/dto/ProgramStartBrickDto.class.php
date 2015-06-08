<?php

class ProgramStartBrickDto extends BaseBrickDto {

  public $bricks = array();	//inner scripts
  
  
  public function __construct() {
	parent::__construct("ProgramStart");
  }
  
}
