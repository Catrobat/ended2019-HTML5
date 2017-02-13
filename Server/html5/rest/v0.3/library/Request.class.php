<?php

class Request
{

    public $serviceSubInfo = array();       //includes path properties used within a request url
    public $responseType = EContentType::JSON;      //default

    public $serviceName = "";               //used to load specific controller for request handling
    public $serviceVersion = "unversioned";         //used for caching: default set to avoid errors (unset dir name)
    public $requestMethod = ERequestMethod::GET;    //used for method calls defined in the individual service controllers
    //public $dataUrls = false;                     //boolean: resource URLs are passed as text (default) or base64 encoded data
    public $imgDataMax = null;
    public $audioDataMax = null;

    public $jsonpCallbackFunction = null;   //is set if jsonp request was triggered

    public $requestParameters = array();    //array of all (not already handled) request parameters (GET = url and POST = form)


    public function __construct()
    {

        /*if (isset($_SERVER['PATH_INFO']))
        $this->serviceSubInfo = explode('/', $_SERVER['PATH_INFO']);
        if ($this->serviceSubInfo[count($this->serviceSubInfo)-1] === "")   //make sure there is no pending "/" in the url
        array_pop($this->serviceSubInfo);

        if (sizeof($this->serviceSubInfo) >= 2) {
        $this->serviceName = $this->serviceSubInfo[1];
        array_splice($this->serviceSubInfo, 0, 2);
        }*/

        //init request method using request header
        if(isset($_SERVER['REQUEST_METHOD']))
            $this->setRequestMethod($_SERVER['REQUEST_METHOD']);
        else
            $this->setRequestMethod(ERequestMethod::GET);

        //set the response type based on requirements
        //if (isset($_SERVER['HTTP_ACCEPT']) && $_SERVER['HTTP_ACCEPT'] == EContentType::XML)
        //  $this->responseType = EContentType::XML;
        //else default = JSON	//default

        $this->parseGlobalRequestParameters();
    }

    private function parseGlobalRequestParameters()
    {

        //defining a HTML <form> element using method="POST" can be overridden e.g. action="[url]?method=PUT"
        //or <input type="hidden" name="method">PUT</input>
        foreach($_GET as $field => $value)
        {
            if(strlen($value) > 0)  //do not use empty() here as it will return true for 0 as well
                $this->requestParameters[$field] = $value;
            unset($_GET[$field]);
        }

        //while GET & DELETE use the query string only, POST and PUT have properties included in the request body
        $body = file_get_contents("php://input");
        $content_type = false;

        if(isset($_SERVER['CONTENT_TYPE']))
        {
            $content_type = $_SERVER['CONTENT_TYPE'];
        }

        switch($content_type)
        {
            case "application/json":
                //TODO: this is a sample only (untested) & currently not in user
                var_dump($body);
                $body_params = json_decode($body);

                if($body_params)
                {
                    foreach($body_params as $key => $value)
                    {
                        $parameters[$key] = $value;
                    }
                }
                break;

            //case "application/xml":
            //  //TODO:
            //break;

            default:  //"application/x-www-form-urlencoded", "text/plain; charset=UTF-8""
                foreach($_POST as $field => $value)
                {
                    if(strlen($value) > 0)  //do not use empty() here as it will return true for 0 as well
                        $this->requestParameters[$field] = $value;
                    unset($_POST[$field]);
                }

        }

        //TODO: how does a JSON/XML form look like if needed?

        //parse service url
        if(isset($this->requestParameters['servicePath']))
        {
            $this->serviceSubInfo = explode('/', $this->requestParameters['servicePath']);
            if(count($this->serviceSubInfo) > 0 && $this->serviceSubInfo[count($this->serviceSubInfo) - 1] === "")   //make sure there is no pending "/" in the url
                array_pop($this->serviceSubInfo);

            if(sizeof($this->serviceSubInfo) >= 1)
            {
                $this->serviceName = $this->serviceSubInfo[0];
                array_splice($this->serviceSubInfo, 0, 1);
            }
            unset($this->requestParameters['servicePath']);
        }
        //get service version
        if(isset($this->requestParameters['version']))
        {
            $this->serviceVersion = $this->requestParameters['version'];
            unset($this->requestParameters['version']);
        }
        //check if response type is overridden
        //parameters parsed and type checked are mapped to request properties and therefore removed from parameter array
        if(isset($this->requestParameters['method']))
        {
            $this->setRequestMethod($this->requestParameters['method']);
            unset($this->requestParameters['method']);
        }
        if(isset($this->requestParameters['imgDataMax']))
        {
            $this->imgDataMax = @(int)$this->requestParameters['imgDataMax'];
            unset($this->requestParameters['imgDataMax']);
        }
        if(isset($this->requestParameters['audioDataMax']))
        {
            $this->audioDataMax = @(int)$this->requestParameters['audioDataMax'];
            unset($this->requestParameters['audioDataMax']);
        }
        //check jsonp request
        if(isset($this->requestParameters['jsonpCallback']))
        {
            $this->jsonpCallbackFunction = $this->requestParameters['jsonpCallback'];
            unset($this->requestParameters['jsonpCallback']);
        }
    }

    private function setRequestMethod($method)
    {

        if(in_array(strtoupper($method), array(ERequestMethod::GET, ERequestMethod::PUT, ERequestMethod::POST, ERequestMethod::DELETE)))
            $this->requestMethod = strtoupper($method);
        //else: default
        //  $this->requestMethod = ERequestMethod::GET;
    }

}
