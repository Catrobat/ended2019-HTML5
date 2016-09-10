<?php

class ProjectDetailsDto {

    public $id;
    public $title;
    public $description;
    public $baseUrl;
    public $thumbnailUrl;
    //public $languageVersion;
    public $author;
    //public $authorProfileUrl;


    public function __construct($id, $title, $description, $baseUrl, $thumbnailUrl, /*$languageVersion,*/ $author/*, $authorProfileUrl*/) {
        $this->id = $id;
        $this->title = $title;
        $this->description = $description;
        $this->baseUrl = $baseUrl;
        $this->thumbnailUrl = $thumbnailUrl;
        //$this->languageVersion = $languageVersion;
        $this->author = $author;
        //$this->authorProfileUrl = $authorProfileUrl;
    }

}
