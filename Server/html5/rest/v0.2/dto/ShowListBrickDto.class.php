<?php

class ShowListBrickDto extends ShowVariableBrickDto
{

    public function __construct($resourceId, $x, $y)
    {
        parent::__construct($resourceId, $x, $y);

        $this->type = "ShowList";
    }
}
