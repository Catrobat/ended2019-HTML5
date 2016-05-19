<?php

class ShowListBrickDto extends ShowVariableBrickDto
{

  public function __construct($referenceId, $x, $y)
  {
    parent::__construct($referenceId, $x, $y);

    $this->type = "ShowList";
  }
}
