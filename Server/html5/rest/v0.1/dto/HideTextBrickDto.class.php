s<?php

class HideTextBrickDto extends BaseBrickDto {

  public $referenceId;
  
  public function __construct($referenceId) {
	parent::__construct("HideText");

	$this->referenceId = $referenceId;
  }
  
}
