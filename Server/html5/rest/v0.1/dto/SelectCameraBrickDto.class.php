<?php

class SelectCameraBrickDto extends BaseBrickDto {

    public $selected;   //index
  
    public function __construct($selected = "0") {
        parent::__construct("SelectCamera");
        
        $this->selected = $selected;
    }
}
