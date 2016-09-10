<?php

class ChangeSizeBrickDto extends BaseBrickDto {

    public $value;	//type of FormulaDto

    public function __construct($value, $commentedOut = false) {
        parent::__construct("ChangeSize", $commentedOut);

        $this->value = $value;
    }
}
