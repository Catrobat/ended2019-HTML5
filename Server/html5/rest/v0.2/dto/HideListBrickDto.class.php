<?php

class HideListBrickDto extends HideVariableBrickDto
{

  public function __construct($referenceId)
  {
    parent::__construct($referenceId);

    $this->type = "HideLst";
  }
}
