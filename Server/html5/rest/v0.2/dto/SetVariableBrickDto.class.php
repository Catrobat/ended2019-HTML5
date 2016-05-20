<?php

class SetVariableBrickDto extends BaseBrickDto {

    public $resourceId;
    public $value;	//type of FormulaDto

    public function __construct($resourceId, $value) {
        parent::__construct("SetVariable");

        $this->resourceId = $resourceId;
        $this->value = $value;
    }

}
