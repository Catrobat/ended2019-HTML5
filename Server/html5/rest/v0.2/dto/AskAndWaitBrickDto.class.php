<?php

class AskAndWaitBrickDto extends BaseBrickDto {

  public $question;
  
  public function __construct($question) {
	parent::__construct("AskAndWait");
	$this->question = $question;
  }
  
}
