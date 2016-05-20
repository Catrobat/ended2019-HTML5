<?php

class ResourceReferenceDto {

  public $referenceId;
  public $name;

  public function __construct($referenceId, $name) {
    $this->referenceId = $referenceId;
    $this->name = $name;
  }
    
}
