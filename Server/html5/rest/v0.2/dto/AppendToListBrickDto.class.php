<?php

include_once "BaseBrickDto.class.php";

class AppendToListBrickDto extends BaseBrickDto
{
    public $resourceId;
    public $value;  //type of FormulaDto

    public function __construct($resourceId, $value)
    {
        parent::__construct("AppendToList");

        $this->resourceId = $resourceId;
        $this->value = $value;
    }
}
