<?php

class ThinkBrickDto extends BaseBrickDto {

    public $text;	//formula

    public function __construct($text, $commentedOut = false) {
        parent::__construct("Think", $commentedOut);

        $this->text = $text;
    }
}
