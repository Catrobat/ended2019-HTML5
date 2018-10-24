<?php

class GraphicEffectBrickDto extends OpCodeBrickDto {

    public $value;	//type of FormulaDto
    public $effect;

    public function __construct($opCode, $effect, $value, $commentedOut = false) {
		parent::__construct($opCode, "GraphicEffect", $commentedOut);

		$this->effect = $effect;
		$this->value = $value;
    }
}
