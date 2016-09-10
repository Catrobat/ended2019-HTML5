<?php

class SpeakBrickDto extends BaseBrickDto {

    public $text;	//formula

    public function __construct($text, $commentedOut = false) {
        parent::__construct("Speak", $commentedOut);

        $this->text = $text;
    }
}
