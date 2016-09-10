<?php

class SetGravityBrickDto extends BaseBrickDto {

    public $x;		//FormulaDto
    public $y;		//FormulaDto

    public function __construct($x, $y, $commentedOut = false) {
        parent::__construct("SetGravity", $commentedOut);
        $this->x = $x;
        $this->y = $y;
    }
}
