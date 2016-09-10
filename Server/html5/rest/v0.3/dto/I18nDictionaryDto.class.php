<?php

class I18nDictionaryDto {

    public $languageCode;
    public $direction;
    public $dictionary;

    public function __construct($langCode, $dir, $dict)
    {
        $this->languageCode = $langCode;
        $this->direction = $dir;
        $this->dictionary = $dict;
    }
}
