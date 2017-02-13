<?php

class ProjectDetailsDto {

    public $id;
    public $title;
    public $description;
    public $baseUrl;
    public $thumbnailUrl;
    public $author;

    public function __construct($id, $title, $description, $baseUrl, $thumbnailUrl, $author) {
        $this->id = $id;
        $this->title = $title;
        $this->description = $description;
        $this->baseUrl = $baseUrl;
        $this->thumbnailUrl = $thumbnailUrl;
        $this->author = $author;
    }
}
