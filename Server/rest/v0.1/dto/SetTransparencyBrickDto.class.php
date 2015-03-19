<?php
//SetGhostEffect

class SetTransparencyBrickDto extends SetGraphicEffectBrickDto {

  public function __construct($percentage) {
		parent::__construct(EGraphicEffect.GHOST, $percentage);
		
		$this->type = "SetTransparency";

  }

}

?>