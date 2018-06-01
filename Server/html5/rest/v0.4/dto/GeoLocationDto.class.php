<?php

class GeoLocationDto {

    public $latitude = 0;
    public $longitude = 0;
    public $altitude = 0;
    public $accuracy = 0;


    public function __construct($latitude, $longitude) {

        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }
}
