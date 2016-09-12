<?php

class CallUserScriptBrickDto extends BaseBrickDto {

    public $userScriptId;
    public $parameters = array();   //UserScriptArgumentDto

    public function __construct($userScriptId, $commentedOut = false) {
        parent::__construct("CallUserScript", $commentedOut);

        $this->userScriptId = $userScriptId;
    }
}
