<?php

class StopScriptDto extends BaseBrickDto {

    public $value;	//all, this, otherScriptsInSprite

    public function __construct($value, $commentedOut = false) {
        parent::__construct("StopScript", $commentedOut);

        $this->value = $value;
    }

}
