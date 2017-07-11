<?php

class SetVariableBrickDto extends BaseBrickDto {

    public $resourceId;
    public $value;	//type of FormulaDto

    public function __construct($resourceId, $value, $commentedOut = false) {
        parent::__construct("SetVariable", $commentedOut);

        $this->resourceId = $resourceId;
        $this->value = $value;
    }

}
