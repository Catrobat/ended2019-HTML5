<?php

class SetDirectionBrickDto extends BaseBrickDto {

    public $degrees;	//FormulaDto

    public function __construct($degrees, $commentedOut = false) {
        parent::__construct("SetDirection", $commentedOut);

        $this->degrees = $degrees;
    }
}
