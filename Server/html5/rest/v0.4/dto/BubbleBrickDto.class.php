<?php

class BubbleBrickDto extends BaseBrickDto {

    public $bubbleType; //EBubbleType
    public $text;	    //formula
    public $duration;	//optional: formula

    public function __construct($bubbleType = $EBubbleType::SPEECH, $text, $duration = null, $commentedOut = false) {
        parent::__construct("Bubble", $commentedOut);

        $this->bubbleType = $bubbleType;
        $this->text = $text;
        $this->duration = $duration;
    }
}
