<?php

class NoteBrickDto extends BaseBrickDto {

    public $text;

    public function __construct($text, $commentedOut = false) {
        parent::__construct("Note", $commentedOut);

        $this->text = $text;
    }
}
