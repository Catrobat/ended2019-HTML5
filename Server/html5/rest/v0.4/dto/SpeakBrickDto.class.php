<?php

class SpeakBrickDto extends BaseBrickDto {

    public $text;	//formula
    public $andWait = false;

    public function __construct($text, $andWait = false, $commentedOut = false) {
        parent::__construct("Speak", $commentedOut);

        $this->text = $text;
        $this->andWait = $andWait;
    }
}
