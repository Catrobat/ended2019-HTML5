<?php

class AskSpeechBrickDto extends AskBrickDto {

    public function __construct($question, $resourceId, $commentedOut = false) {
        parent::__construct($question, $resourceId, $commentedOut);

        $this->type = "AskSpeech";
    }
}
