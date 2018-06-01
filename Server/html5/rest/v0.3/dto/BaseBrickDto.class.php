<?php

class BaseBrickDto {

    public $type;
    public $commentedOut;

    public function __construct($type, $commentedOut = false) {
        $this->type = $type;
        $this->commentedOut = $commentedOut;
    }
}
