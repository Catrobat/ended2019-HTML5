<?php

class LookDto extends ResourceReferenceDto {

  public $id;
  public $rotationCenterX;
  public $rotationCenterY;

  public function __construct($id, $imageId, $name, $rotationCenterX = null, $rotationCenterY = null) {
    parent::__construct($imageId, $name);

    $this->id = $id;
    $this->rotationCenterX = $rotationCenterX;
    $this->rotationCenterY = $rotationCenterY;
  }

}
