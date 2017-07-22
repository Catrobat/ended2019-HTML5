<?php

class SayForBrickDto extends SayBrickDto {

    public $duration;	//formula

    public function __construct($text, $duration, $commentedOut = false) {
        parent::__construct($text, $commentedOut);

        $this->type = "SayFor";
        $this->duration = $duration;
    }
}
