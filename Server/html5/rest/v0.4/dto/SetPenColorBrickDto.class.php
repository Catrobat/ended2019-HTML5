<?php

class SetPenColorBrickDto extends BaseBrickDto {

    public $r;   //formula
    public $g;   //formula
    public $b;   //formula

    public function __construct($r, $g, $b, $commentedOut = false) {
        parent::__construct("SetPenColor", $commentedOut);

        $this->r = $r;
        $this->g = $g;
        $this->b = $b;
    }
}
