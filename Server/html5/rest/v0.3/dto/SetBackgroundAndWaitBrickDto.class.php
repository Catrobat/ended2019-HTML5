<?php

class SetBackgroundAndWaitBrickDto extends SetBackgroundBrickDto {

    public $lookId;

    public function __construct($lookId, $commentedOut = false) {
        parent::__construct($lookId, $commentedOut);

        $this->type = "SetBackgroundAndWait";
    }
}
