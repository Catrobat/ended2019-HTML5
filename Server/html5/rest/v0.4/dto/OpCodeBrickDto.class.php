<?php

//every brick supporting set + change is derived from this class
class OpCodeBrickDto extends BaseBrickDto {

    public $opCode;   //of EOperation

    public function __construct($opCode = 0, $type, $commentedOut) {
        parent::__construct($type, $commentedOut);

        $this->opCode = $opCode;
    }
}
