<?php

class SpeakAndWaitBrickDto extends BaseBrickDto {

    public $text;	//formula

    public function __construct($text, $commentedOut = false) {
        parent::__construct("SpeakAndWait", $commentedOut);

        $this->text = $text;
    }
}
