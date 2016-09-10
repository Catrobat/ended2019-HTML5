<?php
//ChangeGhostEffect

class ChangeGraphicEffectBrickDto extends BaseBrickDto {

    public $value;	//type of FormulaDto
    public $effect;


    public function __construct($effect, $value, $commentedOut = false) {
		parent::__construct("ChangeGraphicEffect", $commentedOut);

		$this->effect = $effect;
		$this->value = $value;
    }

}
