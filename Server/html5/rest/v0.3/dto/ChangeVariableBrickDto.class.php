<?php

class ChangeVariableBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $value;  //type of FormulaDto

    public function __construct($resourceId, $value, $commentedOut = false) {
        parent::__construct("ChangeVariable", $commentedOut);

        $this->resourceId = $resourceId;
        $this->value = $value;
    }
}
