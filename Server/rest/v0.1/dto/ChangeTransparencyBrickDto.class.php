<?php
//ChangeGhostEffect

class ChangeTransparencyBrickDto extends ChangeGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect::GHOST, $value);
		
		$this->type = "ChangeTransparency";
		
  }

}
