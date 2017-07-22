<?php

class WaitUntilBrickDto extends BaseBrickDto {

  public $condition;	//formula
  public $bricks = array(); //inner scripts: always empty

  public function __construct($condition) {
	parent::__construct("WaitUntil");

	$this->condition = $condition;
  }

}
