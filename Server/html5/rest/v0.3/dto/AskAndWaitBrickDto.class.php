<?php

class AskAndWaitBrickDto extends BaseBrickDto {

    public $question;

    public function __construct($question, $commentedOut = false) {
        parent::__construct("AskAndWait", $commentedOut);
        $this->question = $question;
    }

}
