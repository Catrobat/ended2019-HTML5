<?php

class RepeatBrickDto extends BaseBrickDto {

    public $timesToRepeat;	//formula
    public $bricks = array();	//inner scripts

    public function __construct($timesToRepeat, $commentedOut = false) {
        parent::__construct("Repeat", $commentedOut);

        $this->timesToRepeat = $timesToRepeat;
    }
}
