<?php

class GoToPositionBrickDto extends BaseBrickDto {

    public $x;		//FormulaDto
    public $y;		//FormulaDto

    public function __construct($x, $y, $commentedOut = false) {
        parent::__construct("GoToPosition", $commentedOut);

        $this->x = $x;
        $this->y = $y;
    }
}
