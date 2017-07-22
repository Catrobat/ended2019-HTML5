<?php

class SetBackgroundBrickDto extends BaseBrickDto {

    public $lookId;

    public function __construct($lookId, $commentedOut = false) {
        parent::__construct("SetBackground", $commentedOut);

        $this->lookId = $lookId;
    }
}
