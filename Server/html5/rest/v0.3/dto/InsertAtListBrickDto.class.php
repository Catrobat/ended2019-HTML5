<?php

class InsertAtListBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $index;  //type of FormulaDto
    public $value;  //type of FormulaDto

    public function __construct($resourceId, $index, $value, $commentedOut = false) {
        parent::__construct("InsertAtList", $commentedOut);

        $this->resourceId = $resourceId;
        $this->index = $index;
        $this->value = $value;
    }
}
