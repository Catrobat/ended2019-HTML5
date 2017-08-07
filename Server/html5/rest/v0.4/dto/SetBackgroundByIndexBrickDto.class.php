<?php

class SetBackgroundByIndexBrickDto extends BaseBrickDto {

    public $idx;

    public function __construct($idx, $commentedOut = false) {
        parent::__construct("SetBackgroundByIndex", $commentedOut);

        $this->idx = $idx;
    }
}
