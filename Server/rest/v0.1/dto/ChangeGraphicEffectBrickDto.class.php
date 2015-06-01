<?php
//ChangeGhostEffect

class ChangeGraphicEffectBrickDto extends BaseBrickDto {

  public $value;	//type of FormulaDto
  public $effect;
	
  
  public function __construct($effect, $value) {
		parent::__construct("ChangeGraphicEffect");

		$this->effect = $effect;
		$this->value = $value;
  }

}
