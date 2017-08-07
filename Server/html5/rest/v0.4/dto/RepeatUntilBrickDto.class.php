<?php

class RepeatUntilBrickDto extends BaseBrickDto {

    public $condition;	//formula
    public $bricks = array();	//inner scripts

    public function __construct($condition, $commentedOut = false) {
        parent::__construct("RepeatUntil", $commentedOut);

        $this->condition = $condition;
    }
}
