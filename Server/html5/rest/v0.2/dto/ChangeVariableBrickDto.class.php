<?php

class ChangeVariableBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $value;  //type of FormulaDto

    public function __construct($resourceId, $value)
    {
        parent::__construct("ChangeVariable");

        $this->resourceId = $resourceId;
        $this->value = $value;
    }
}
