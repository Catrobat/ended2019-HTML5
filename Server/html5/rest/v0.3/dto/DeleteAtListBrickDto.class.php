<?php

class DeleteAtListBrickDto extends BaseBrickDto {

    public $resourceId;
    public $index;  //type of FormulaDto

    public function __construct($resourceId, $index, $commentedOut = false) {
        parent::__construct("DeleteAtList", $commentedOut);

        $this->resourceId = $resourceId;
        $this->index = $index;
    }
}
