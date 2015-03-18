<?php
//SetGhostEffect

class SetGraphicEffectBrickDto extends BaseBrickDto {

  public $percentage;	//type of FormulaDto
  public $effect;

  
  public function __construct($effect, $percentage) {
		parent::__construct("SetGraphicEffect");

		$this->effect = $effect;
		$this->percentage = $percentage;
  }

}

?>