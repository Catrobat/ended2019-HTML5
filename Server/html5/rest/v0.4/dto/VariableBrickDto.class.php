<?php

class VariableBrickDto extends OpCodeBrickDto {

    public $resourceId;
    public $value;  //type of FormulaDto

    public function __construct($opCode, $resourceId, $value, $commentedOut = false) {
        parent::__construct($opCode, "Variable", $commentedOut);

        $this->resourceId = $resourceId;
        $this->value = $value;
    }
}
