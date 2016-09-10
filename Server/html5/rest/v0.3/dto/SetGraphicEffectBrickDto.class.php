<?php
//SetGhostEffect

class SetGraphicEffectBrickDto extends BaseBrickDto {

    public $value;	//type of FormulaDto
    public $effect;

    public function __construct($effect, $value, $commentedOut = false) {
		parent::__construct("SetGraphicEffect", $commentedOut);

		$this->effect = $effect;
		$this->value = $value;
    }

}
