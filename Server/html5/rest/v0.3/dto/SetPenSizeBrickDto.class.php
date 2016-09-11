<?php

class SetPenSizeBrickDto extends BaseBrickDto {

    public $size;   //formula

    public function __construct($size, $commentedOut = false) {
        parent::__construct("SetPenSize", $commentedOut);

        $this->size = $size;
    }
}
