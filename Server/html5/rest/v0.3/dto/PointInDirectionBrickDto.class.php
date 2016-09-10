<?php

class PointInDirectionBrickDto extends BaseBrickDto {

    public $degrees;	//FormulaDto

    public function __construct($degrees, $commentedOut = false) {
        parent::__construct("PointInDirection", $commentedOut);

        $this->degrees = $degrees;
    }

}
