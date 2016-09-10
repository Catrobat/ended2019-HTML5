<?php

class AppendToListBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $value;  //type of FormulaDto

    public function __construct($resourceId, $value, $commentedOut = false) {
        parent::__construct("AppendToList", $commentedOut);

        $this->resourceId = $resourceId;
        $this->value = $value;
    }
}
