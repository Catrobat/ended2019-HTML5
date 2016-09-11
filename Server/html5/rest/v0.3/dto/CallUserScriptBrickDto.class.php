<?php

class CallUserScriptBrickDto extends BaseBrickDto {

    public $id; //user script id
    public $parameters = array();   //(argumentId, formula) pair?

    public function __construct($id, $commentedOut = false) {
        parent::__construct("CallUserScript", $commentedOut);

        $this->id = $id;
    }
}
