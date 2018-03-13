<?php

class GeoLocationController extends BaseController
{
    private $ip = "";

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
    }

    public function get()
    {

        //request data as xml
        $string = file_get_contents("http://freegeoip.net/json/".$this->ip);
        if($string == false) {
            return new ServiceNotImplementedException($this->request->serviceName . ": geo lookup denied");
        }

        $json = json_decode($string);
        $geoLocation = new GeoLocationDto($json->latitude, $json->longitude);

        return $geoLocation;
    }

}
