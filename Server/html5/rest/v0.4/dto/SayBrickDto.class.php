<?php

class SayBrickDto extends BaseBrickDto {

    public $text;	//formula

    public function __construct($text, $commentedOut = false) {
        parent::__construct("Say", $commentedOut);

        $this->text = $text;
    }
}
