<?php

class NoteBrickDto extends BaseBrickDto {

  public $text;
  
  
  public function __construct($text) {
	parent::__construct("Note");

	$this->text = $text;
  }
  
}
