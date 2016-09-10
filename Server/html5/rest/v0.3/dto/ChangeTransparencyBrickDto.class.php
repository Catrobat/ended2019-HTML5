<?php
//ChangeGhostEffect

class ChangeTransparencyBrickDto extends ChangeGraphicEffectBrickDto {

    public function __construct($value, $commentedOut = false) {
		parent::__construct(EGraphicEffect::GHOST, $value, $commentedOut);

		$this->type = "ChangeTransparency";

    }

}
