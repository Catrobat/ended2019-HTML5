<?php

class SetLookByIndexBrickDto extends BaseBrickDto {

    public $idx;

    public function __construct($idx, $commentedOut = false) {
        parent::__construct("SetLookByIndex", $commentedOut);

        $this->idx = $idx;
    }
}
