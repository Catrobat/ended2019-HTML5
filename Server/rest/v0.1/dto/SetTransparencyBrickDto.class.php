<?php
//SetGhostEffect

class SetTransparencyBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($value) {
		parent::__construct(EGraphicEffect.GHOST, $value);
		
		$this->type = "SetTransparency";

  }

}

?>