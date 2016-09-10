<?php
//SetGhostEffect

class SetTransparencyBrickDto extends SetGraphicEffectBrickDto {

    public function __construct($value, $commentedOut = false) {
		parent::__construct(EGraphicEffect::GHOST, $value, $commentedOut);

		$this->type = "SetTransparency";

    }

}
