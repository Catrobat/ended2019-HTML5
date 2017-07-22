<?php

class SpeakAndWaitBrickDto extends SpeakBrickDto {

    public function __construct($text, $commentedOut = false) {
        parent::__construct($text, $commentedOut);

        $this->type = "SpeakAndWait";
    }
}
