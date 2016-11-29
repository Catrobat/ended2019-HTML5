<?php

class CallUserScriptBrickDto extends BaseBrickDto {

    public $id; //user script id
    public $parameters = array();

    public function __construct($id) {
        parent::__construct("CallUserScript");

        $this->id = $id;
    }

}
