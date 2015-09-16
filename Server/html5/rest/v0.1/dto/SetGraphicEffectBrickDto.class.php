<?php
//SetGhostEffect

class SetGraphicEffectBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  public $effect;

  
  public function __construct($effect, $value) {
		parent::__construct("SetGraphicEffect");

		$this->effect = $effect;
		$this->value = $value;
  }

}
