<?php

class StopScriptBrickDto extends BaseBrickDto {

    public $scriptType;	//all, this, other(ScriptsInSprite)

    public function __construct($scriptType, $commentedOut = false) {
        parent::__construct("StopScript", $commentedOut);

        $this->scriptType = $scriptType;
    }
}
