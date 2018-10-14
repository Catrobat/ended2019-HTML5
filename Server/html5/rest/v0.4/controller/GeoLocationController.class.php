<?php

class GeoLocationController extends BaseController
{
    private $ip = "";
    private $defaultGeoLocation = "";

    public function __construct($request)
    {
        parent::__construct($request);

        if (!empty($_SERVER["HTTP_CLIENT_IP"])) {
            $this->ip = $_SERVER["HTTP_CLIENT_IP"];
        } elseif (!empty($_SERVER["HTTP_X_FORWARDED_FOR"])) {
            $this->ip = $_SERVER["HTTP_X_FORWARDED_FOR"];
        } else {
            $this->ip = $_SERVER["REMOTE_ADDR"];
        }

        $this->defaultGeoLocation = new GeoLocationDto(47.058662, 15.458973); // default: TU Graz Infeldgasse 16b
    }

    public function get()
    {
        try {
            $string = file_get_contents('http://ip-api.com/json/' . $this->ip);
            if($string == false) {
                return $this->defaultGeoLocation;
            }

            $json = json_decode($string);

            if(!isset($json->status) || !isset($json->lat) || !isset($json->lon) || $json->status != "success") {
                return $this->defaultGeoLocation;
            }

            return new GeoLocationDto($json->lat, $json->lon);
        } catch (Exception $e) {
            return $this->defaultGeoLocation;
        }
    }

}
