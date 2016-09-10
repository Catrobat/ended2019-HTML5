<?php

class ForeverBrickDto extends BaseBrickDto {

    public $bricks = array();	//inner scripts

    public function __construct($commentedOut = false) {
        parent::__construct("Forever", $commentedOut);
    }
}
