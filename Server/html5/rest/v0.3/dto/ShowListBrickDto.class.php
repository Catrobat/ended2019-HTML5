<?php

class ShowListBrickDto extends ShowVariableBrickDto {

    public function __construct($resourceId, $x, $y, $commentedOut = false) {
        parent::__construct($resourceId, $x, $y, $commentedOut);

        $this->type = "ShowList";
    }
}
