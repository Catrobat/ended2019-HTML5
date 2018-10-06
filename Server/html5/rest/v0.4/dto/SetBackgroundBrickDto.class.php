<?php

class SetBackgroundBrickDto extends BaseBrickDto {

    public $lookId;
    public $andWait = false;

    public function __construct($lookId, $andWait = false, $commentedOut = false) {
        parent::__construct("SetBackground", $commentedOut);

        $this->lookId = $lookId;
        $this->andWait = $andWait;
    }
}
