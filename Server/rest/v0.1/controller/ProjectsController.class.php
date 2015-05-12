<?php

require_once("BaseController.class.php");

  class ProjectsController extends BaseController {
  
    const CACHING_ENABLED = false;
    const INCREMENT_PROJECT_VIEW_COUNTER = false;
    public $SERVER_ROOT = "/var/www/";

    // debug flag for working on localhost
    public $LOCAL = true;

    public function __construct($request)
    {
      parent::__construct($request);

      if($this->LOCAL)
        $this->SERVER_ROOT = "D:/Dropbox/_Uni/_6. Semester/Bakk/HTML5/Server/";
    }

    public function SERVER_ROOT()
    {
      return $this->SERVER_ROOT;
    }

    public function isLocal()
    {
      return $this->LOCAL;
    }
  
    public function get() {

      //try {
        $len = count($this->request->serviceSubInfo);
        
        if ($len > 2)
        return new ServicePathViolationException($this->request->serviceName.": ".implode("/", $this->request->serviceSubInfo));
        
        else if ($len == 2 && strtoupper($this->request->serviceSubInfo[1]) === "DETAILS") {
        return $this->getProjectDetails($this->request->serviceSubInfo[0]);
        }
        
        else if ($len == 1)
        return $this->getProject($this->request->serviceSubInfo[0]);
        
        else if ($len == 0)
        return $this->getProjectList();
        
        return new ServicePathViolationException($this->request->serviceName.": ".implode("/", $this->request->serviceSubInfo));
      //}
      //catch (Exception $e) {
      //  return new Exception($e->getMessage(), $e->getCode(), $e);
      //}
	}
    
    
    private function getProjectDetails($projectId) {
      
      $data = file_get_contents("https://pocketcode.org/api/projects/getInfoById.json?id=".$projectId);
      $data = json_decode($data, false);

      try {
        $info = $data->CatrobatInformation;
        $project = $data->CatrobatProjects[0];
      }
      catch(Exception $e) {
        throw new ProjectNotFoundException($e);
      }
      $details = new ProjectDetailsDto($projectId, $project->ProjectName, $project->Description, $info->BaseUrl, $project->ScreenshotBig, $project->Author);
      
      //include data urls if requested
      if (isset($this->request->imgDataMax)) {
        //$path = $_SERVER["DOCUMENT_ROOT"] . DIRECTORY_SEPARATOR . "catroid" . DIRECTORY_SEPARATOR . $project->ScreenshotBig;
        $path = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "catroid/" . $project->ScreenshotBig);
        $res = $this->loadBase64Image($path, $this->request->imgDataMax);
        if ($res !== false)
          $details->thumbnailUrl = $res;
      }

      return $details;
    }
	
    
    private function getProject($projectId) {
      
      //$projectFilePath = str_replace("/", DIRECTORY_SEPARATOR, $_SERVER['DOCUMENT_ROOT'] . "/catroid/resources/projects/") . $projectId . ".catrobat";
      $projectFilePath = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "catroid/resources/projects/") . $projectId . ".catrobat";
      
      //load zip
      $cacheDir = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "html5/projects/" . $this->request->serviceVersion . "/" . $projectId . "/");
      //$cacheDir = str_replace("/", DIRECTORY_SEPARATOR, $_SERVER['DOCUMENT_ROOT'] . "/html5/projects/" . $this->request->serviceVersion . "/" . $projectId . "/");
      
      //if ($_SERVER["SERVER_NAME"] === $projectHost) {
        //load from local dir
        
        //check if project exists
        if (!file_exists($projectFilePath)) {
          FileHelper::deleteDirectory($cacheDir);   //delete our cache as well
          throw new ProjectNotFoundException($projectId);
        }
          
        //check if project is valid (found in DB and not masked as inappropriate)
        if (!is_a($this->getProjectDetails($projectId), "ProjectDetailsDto")) {
          FileHelper::deleteDirectory($cacheDir);   //delete our cache as well
          throw new ProjectNotFoundException($projectId);
        }
        
        //increment view counter: simulate page request
        if (self::INCREMENT_PROJECT_VIEW_COUNTER) {
          file_get_contents("https://pocketcode.org/details/" . $projectId, 0, null, 0, 1); //try to read 1 byte only
        }
        
      //}
      /*else {
        //load from server: 
        if (false === file_get_contents($projectProtocol . $projectHost . $projectUrl, 0, null, 0, 1)) //try to read 1 byte only
          throw new ProjectNotFoundException($projectId);
        
        //create cache project dir
        //$cacheDir = getcwd() . DIRECTORY_SEPARATOR . "projectCache" . DIRECTORY_SEPARATOR;
        if (!is_dir($cacheDir . $projectId)) {
          mkdir($cacheDir . $projectId, 0777, true);
        }
        
        $newfile = $cacheDir . $projectId . DIRECTORY_SEPARATOR . $projectId . ".catrobat";

        if (copy($projectProtocol . $projectHost . $projectUrl, $newfile)) {
          //success
          $projectFilePath = $newfile;
        }
        else {
          throw new ProjectNotFoundException($projectId);
        }
        
      }*/
      
      //create cache directory if not already created
      if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0777, true);
      }
      
      //project file does exist on local server now in $projectFilePath (either on same server or a copy in the cache directory)
      //create hash
      //$cacheDir = $cacheDir . $projectId . DIRECTORY_SEPARATOR;
      $hashFileName = "hash.txt";
      $hash = md5_file($projectFilePath);
      $projectChanged = true;
      
      if(file_exists($cacheDir . $hashFileName)) {
        //compare
        $exHash = file_get_contents($cacheDir . $hashFileName);
        if ($hash === $exHash) {
          $projectChanged = false;
        }
      }
      
      if(!self::CACHING_ENABLED || $projectChanged || !is_file($cacheDir . "code.cache")) {   //unzip even on $projectChanged == false to ensure file system integrity
        //save new hash + create file if not found
        $fp = fopen($cacheDir . $hashFileName, "w");
        fwrite($fp, $hash);
        fclose($fp);
        
        //delete all but hash.txt & .zip (only if remote loaded)
        $files = scandir($cacheDir);
        foreach($files as $file) {
          if (!($file === "." || $file === ".." || $file === $hashFileName || ($file === $projectId . ".catrobat"))) {  // && $_SERVER["SERVER_NAME"] !== $projectHost
            //chmod($cacheDir . $file, 0777); //get sure permissions are set
            if (is_dir($cacheDir . $file)) 
              FileHelper::deleteDirectory($cacheDir . $file);
            else
              unlink($cacheDir . $file);
          }
        }
        
        //unzip
        try {
          $zip = new ZipArchive;
          $res = $zip->open($projectFilePath);
          if ($res === TRUE) {
            // extract it to the path we determined above
            $success = $zip->extractTo($cacheDir);
            if ($success !== true)
              throw new Exception("error extracting project (zip) file");
            $zip->close();
          } 
          else {
            throw new Exception("invalid project archive or server setup");
          }
        }
        catch(Exception $e) { 
          throw new Exception("error extracting project (zip) file: " . $e);
        }
        
        //convert + save precreated project
        if (!is_file($cacheDir . "code.xml"))
          throw new Exception("code file not found: " . $cacheDir . "code.xml");
          
        $xml = simplexml_load_file($cacheDir . "code.xml"); //load
        if ($xml === false) {
          throw new FileParserException("error loading file: invalid xml");
        }
        
        try {
          $fileVersion = floatval($xml->header->catrobatLanguageVersion); //get catrobat file version
        }
        catch(Exception $e) {
          throw new FileParserException("catrobat language version not found or parsed correctly");
        }
        
        //set resource url root path to include it in the response string
        //$resUri = str_replace("projects", "projectCache", $_SERVER['REQUEST_URI']);
        //$resUri = substr($resUri, -1) === "/" ? $resUri : $resUri . "/";
        //$resourceRoot = $projectProtocol . $projectHost . $resUri;    
        if(isset($_SERVER['HTTPS']) && (strcasecmp('off', $_SERVER['HTTPS']) !== 0)) {
          $protocol = "https";
        }
        else {
          $protocol = "http";
        }

        $resourceRoot = $protocol . "://" . $_SERVER["SERVER_NAME"] . "/html5/projects/" . $this->request->serviceVersion . "/" . $projectId . "/";
        
        //load parser using catrobat file version
        $parser = null;
        if ($fileVersion >= 0.6 && $fileVersion < 0.93)
          $parser = new ProjectFileParser($projectId, $resourceRoot, $cacheDir, $xml);
        else if ($fileVersion === 0.93)
          $parser = new ProjectFileParser_v0_93($projectId, $resourceRoot, $cacheDir, $xml);
        else
          throw new FileParserException("no parser specified for catrobat language version: " . $fileVersion);
        
        $project = $parser->getProject();
        
        //save for caching
        $objData = serialize($project);
        $filePath = $cacheDir . "code.cache";
        //if (is_writable($filePath)) {
          $fp = fopen($filePath, "w"); 
          fwrite($fp, $objData); 
          fclose($fp);
        //}
      }
      else {    //load precreated project
        //load from cache
        $filePath = $cacheDir . "code.cache";           //TODO: if ($this->request->dataUrls) -> load cached? mp3 and media formats?
        if (file_exists($filePath)){
          $objData = file_get_contents($filePath);
          $project = unserialize($objData);           
        }
        else
          throw new FileParserException("project cache not found");
      }
      
      if (empty($project))
        throw new FileParserException("error loading project file: empty content");
        
      //include data urls if requested
      if (isset($this->request->imgDataMax)) {
        foreach($project->images as $img) {
          $path = $cacheDir . $img->url;
          $res = $this->loadBase64Image($path, $this->request->imgDataMax);
          if ($res !== false)
            $img->url = $res;
        }
      }
      if (isset($this->request->audioDataMax)) {
        foreach($project->sounds as $audio) {
          $path = $cacheDir . $audio->url;
          $res = $this->loadBase64Audio($path, $this->request->audioDataMax);
          if ($res !== false)
            $audio->url = $res;
        }
      }

      return $project;
    }
	
    
    private function getProjectList() {
      
      //defaults
      $offset = 0;
      $limit = 20;
      $mask = "recent";   //TODO: define and set default: downloads, views, age
      $order = "ASC";
      $total = 0;
      
      //process request paramters
      if (isset($this->request->requestParameters["offset"]))
        $offset = $this->request->requestParameters["offset"];
      
      if (isset($this->request->requestParameters["limit"]))
        $limit = $this->request->requestParameters["limit"];
      
      if (isset($this->request->requestParameters["mask"]))
        $mask = $this->request->requestParameters["mask"];
      
      //if (isset($this->request->requestParameters["order"]))  //currently not supported by webAPI
      //  $order = $this->request->requestParameters["order"];
      
      //request projects + set $total
      $featured = array();
      if ($offset === 0) {
        $data = file_get_contents("https://pocketcode.org/api/projects/featured.json?limit=3");
        $data = json_decode($data, false);
        $baseUrl = $data->CatrobatInformation->BaseUrl;
        
        foreach($data->CatrobatProjects as $project) {
          array_push($featured, new ProjectDetailsDto($project->ProjectId, $project->ProjectName, "", $baseUrl, $project->FeaturedImage, $project->Author));
        }
      }
      
      $url = "https://pocketcode.org/api/projects/";
      
      switch ($mask) {
        //case "recent":
        //  $url .= "recent.json";
        //  break;
          
        case "downloads":
          $url .= "mostDownloaded.json";
          break;
          
        case "viewed":
          $url .= "mostViewed.json";
          break;
          
        default:
          $url .= "recent.json";
          $mask = "recent";     //show correctly in response
      }
      
      $url .= "?offset=".$offset."&limit=".$limit;

      
      $data = file_get_contents($url);
      $data = json_decode($data, false);

      $info = $data->CatrobatInformation;
      $baseUrl = $info->BaseUrl;
      $projects = new ProjectListDto($offset, $limit, $mask, $info->TotalProjects);

      foreach($data->CatrobatProjects as $project) {
        array_push($projects->items, new ProjectDetailsDto($project->ProjectId, $project->ProjectName, $project->Description, $baseUrl, $project->ScreenshotSmall, $project->Author));
      }
      $projects->featured = $featured;
      
      
      //include data urls if requested
      if (isset($this->request->imgDataMax)) {
        //include data urls
        //$localPath = $_SERVER["DOCUMENT_ROOT"] . DIRECTORY_SEPARATOR . "catroid" . DIRECTORY_SEPARATOR;
        $localPath = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "catroid/");
        
        foreach($projects->featured as $p) {
          $path = $localPath . $p->thumbnailUrl;
          echo $path.", \n";
          $res = $this->loadBase64Image($path, $this->request->imgDataMax);
          if ($res !== false)
            $p->thumbnailUrl = $res;
        }
        
        foreach($projects->items as $p) {
          $path = $localPath . $p->thumbnailUrl;
          $res = $this->loadBase64Image($path, $this->request->imgDataMax);
          if ($res !== false)
            $p->thumbnailUrl = $res;
        }
      }

      return $projects;
    }
	
    //returns the resource as base64 encoded data url or false if the size limit (kB) was reached
    private function loadBase64Image($path, $maxSize) {
        
      if (file_exists($path)) {
        $bytes = filesize($path);
        if ($this->request->imgDataMax === 0 || $bytes <= (int)($maxSize * 1024 * 0.65)) {
          $imageData = base64_encode(file_get_contents($path));
          //no support for finfo_... & mime_content_type is deprecated: pathInfo meets my requirements
          return "data:image/" . pathinfo($path, PATHINFO_EXTENSION) . ";base64," . $imageData; 
        }
      }
      return false;
    }

    //returns the resource as base64 encoded data url or false if the size limit (kB) was reached
    private function loadBase64Audio($path, $maxSize) {
        
      if (file_exists($path)) {
        $bytes = filesize($path);
        if ($this->request->imgDataMax === 0 || $bytes <= (int)($maxSize * 1024 * 0.65)) {
          $imageData = base64_encode(file_get_contents($path));
          //no support for finfo_... & mime_content_type is deprecated: pathInfo meets my requirements
          $mime = "audio/";
          if (pathinfo($path, PATHINFO_EXTENSION) === "mp3")
            $mime .= "mpeg";
          else 
            $mime .= pathinfo($path, PATHINFO_EXTENSION);    //wav
            
          return "data:" . $mime . ";base64," . $imageData; 
        }
      }
      return false;
    }

  }

?>