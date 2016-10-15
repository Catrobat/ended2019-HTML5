<?php

class AskBrickDto extends BaseBrickDto {

  public $question;
  
  public function __construct($question) {
	parent::__construct("Ask");
	$this->question = $question;
  }
  
}
