<?php

class ThinkForBrickDto extends ThinkBrickDto {

    public $duration;	//formula

    public function __construct($text, $duration, $commentedOut = false) {
        parent::__construct($text, $commentedOut);

        $this->type = "ThinkFor";
        $this->duration = $duration;
    }
}
