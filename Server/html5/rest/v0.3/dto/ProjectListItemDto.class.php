<?php

class ProjectListItemDto {

    public $id;
    public $title;
    public $titleShort;
    public $thumbnailUrl;
    public $totalDownloads;
    public $totalViews;
    public $fileSize;
    public $uploadDateTime;

    public function __construct($id, $title, $titleShort, $thumbnailUrl, $totalDownloads, $totalViews, $fileSize, $uploadDateTime) {
        $this->id = $id;
        $this->title = $title;
        $this->titleShort = $titleShort;
        $this->thumbnailUrl = $thumbnailUrl;
        $this->totalDownloads = $totalDownloads;
        $this->totalViews = $totalViews;
        $this->fileSize = $fileSize;
        $this->uploadDateTime = $uploadDateTime;
    }
}
