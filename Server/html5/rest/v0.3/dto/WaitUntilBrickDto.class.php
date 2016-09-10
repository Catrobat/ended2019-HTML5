<?php

class WaitUntilBrickDto extends BaseBrickDto {

    public $condition;	//formula
    public $bricks = array(); //inner scripts: always empty

    public function __construct($condition, $commentedOut = false) {
        parent::__construct("WaitUntil", $commentedOut);

        $this->condition = $condition;
    }

}
