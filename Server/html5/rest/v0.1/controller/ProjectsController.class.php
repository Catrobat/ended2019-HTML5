<?php

require_once("BaseController.class.php");

class ProjectsController extends BaseController
{
  const CACHING_ENABLED = true;//false;
  const INCREMENT_PROJECT_VIEW_COUNTER = false;

  const DEPLOY_API = "https://share.catrob.at/";
  const TEST_API = "https://web-test.catrob.at/";

  public $SERVER_ROOT = "/var/www/";
  public $API = self::TEST_API;
  public $BASE_URL = "";

  public function __construct($request)
  {
    parent::__construct($request);
    $this->BASE_URL = $this->API;
    $this->API = $this->API . "pocketcode/";

    if(in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1']))
    {
      // is localhost
      $local_path = str_replace("html5\\rest\\v0.1", "", getcwd());
      $this->SERVER_ROOT = $local_path;
    }
  }

  public function SERVER_ROOT()
  {
    return $this->SERVER_ROOT;
  }

  public function get()
  {
    $len = count($this->request->serviceSubInfo);
    $servicePathViolation = ": " . implode("/", $this->request->serviceSubInfo);

    if($len > 2)
    {
      return new ServicePathViolationException($this->request->serviceName . $servicePathViolation);
    }

    if($len == 2 && strtoupper($this->request->serviceSubInfo[1]) === "DETAILS")
    {
      return $this->getProjectDetails($this->request->serviceSubInfo[0]);
    }

    if($len == 1)
    {
      return $this->getProject($this->request->serviceSubInfo[0]);
    }

    if($len == 0)
    {
      return $this->getProjectList();
    }

    return new ServicePathViolationException($this->request->serviceName . $servicePathViolation);
  }

  private function getProjectDetails($projectId)
  {
    $data = file_get_contents($this->API . "api/projects/getInfoById.json?id=" . $projectId);
    $data = json_decode($data, false);

    try
    {
      $info = $data->CatrobatInformation;
      $project = $data->CatrobatProjects[0];
    } catch(Exception $e)
    {
      throw new ProjectNotFoundException($e);
    }
    $details = new ProjectDetailsDto($projectId, $project->ProjectName, $project->Description, $info->BaseUrl,
      $project->ScreenshotBig, $project->Author);

    //include data urls if requested
    if(isset($this->request->imgDataMax))
    {
      $path = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "webtest/shared/web/" . $project->ScreenshotBig);
      $res = $this->loadBase64Image($path, $this->request->imgDataMax);
      if($res !== false)
      {
        $details->thumbnailUrl = $res;
        $details->baseUrl = ""; //delete base url to avoid error (wrong url) due to client side concatenation
      }
    }
    print_r($details);

    return $details;
  }

  //zip file helper methods
  private function extractFilenames(\ZipArchive $zipArchive)
  {
    $filenames = array();
    $fileCount = $zipArchive->numFiles;
    for($i = 0; $i < $fileCount; $i++)
    {
      if(($filename = $this->extractFilename($zipArchive, $i)) !== false)
      {
        $filenames[] = $filename;
      }
    }
    return $filenames;
  }

  private function extractFilename(\ZipArchive $zipArchive, $fileIndex)
  {
    $entry = $zipArchive->statIndex($fileIndex);
    // convert Windows directory separator to Unix style
    $filename = str_replace('\\', '/', $entry['name']);
    if($this->isValidPath($filename))
    {
      return $filename;
    }
    throw new \Exception('Invalid filename path in zip archive');
  }

  private function isValidPath($path)
  {
    $pathParts = explode('/', $path);
    if(!strncmp($path, '/', 1) ||
      array_search('..', $pathParts) !== false ||
      strpos($path, ':') !== false
    )
    {
      return false;
    }
    return true;
  }


  private function getProject($projectId)
  {
    $projectsRoot = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "webtest/shared/web/resources/programs/");
    $projectFilePath = $projectsRoot . $projectId . ".catrobat";

    //load zip
    $cacheRoot = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "html5/projects/");
    $cacheDir = $cacheRoot . $this->request->serviceVersion . DIRECTORY_SEPARATOR . $projectId . DIRECTORY_SEPARATOR;

    //check if project exists
    if(!file_exists($projectFilePath))
    {
      //delete our cache as well
      FileHelper::deleteDirectory($cacheDir);
      throw new ProjectNotFoundException($projectId);
    }

    //check if project is valid (found in DB and not masked as inappropriate)
    /*if(!is_a($this->getProjectDetails($projectId), "ProjectDetailsDto"))
    {
      //delete our cache as well
      FileHelper::deleteDirectory($cacheDir);
      throw new ProjectNotFoundException($projectId);
    }*/

    //increment view counter: simulate page request
    if(self::INCREMENT_PROJECT_VIEW_COUNTER)
    {
      //try to read 1 byte only
      file_get_contents($this->API . "details/" . $projectId, 0, null, 0, 1);
    }

    //create cache directory if not already created
    if(!is_dir($cacheDir))
    {
      mkdir($cacheDir, 0777, true);
    }

    // project file does exist on local server now in $projectFilePath
    // (either on same server or a copy in the cache directory)
    // create hash of project file
    $hashFileName = "hash.txt";
    $hash = md5_file($projectFilePath);
    $projectChanged = true;

    // compare hashes of local and remote file - if changed
    if(file_exists($cacheDir . $hashFileName))
    {
      $exHash = file_get_contents($cacheDir . $hashFileName);
      if($hash === $exHash)
      {
        $projectChanged = false;
      }
    }

    if(!self::CACHING_ENABLED || $projectChanged || !is_file($cacheDir . "code.cache"))
    {
      //unzip even on $projectChanged == false to ensure file system integrity
      //save new hash + create file if not found
      $fp = fopen($cacheDir . $hashFileName, "w");
      fwrite($fp, $hash);
      fclose($fp);

      //delete all but hash.txt & .zip (only if remote loaded)
      $files = scandir($cacheDir);
      foreach($files as $file)
      {
        if(!($file === "." || $file === ".." || $file === $hashFileName || ($file === $projectId . ".catrobat")))
        {
          if(is_dir($cacheDir . $file))
          {
            FileHelper::deleteDirectory($cacheDir . $file);
          }
          else
          {
            unlink($cacheDir . $file);
          }
        }
      }

      //unzip
      try
      {
        $zip = new ZipArchive;
        $res = $zip->open($projectFilePath);
        //for( $i = 0; $i < $zip->numFiles; $i++ )
        //{
        //  $filename = $zip->getNameIndex( $i );
        //  $filename = str_replace("images/", "", $filename);
        //  $filename = str_replace("sounds/", "", $filename);

        //  if($filename != ".nomedia")
        //    $filename = preg_replace('/\\.[^.\\s]{3,4}$/', '', $filename);

        //  if( ! mb_detect_encoding( $filename, 'ASCII' ) || preg_match( '/[^A-Za-z0-9 _ .-]/', $filename ))
        //  {
        //    throw new Exception("error extracting invalid file name '" . $filename . "' in (zip) file");
        //  }
        //}
        if($res === true)
        {
          //extract file names
          $fileNames = $this->extractFilenames($zip);

          // extract it to the path we determined above
          $success = $zip->extractTo($cacheDir, $fileNames);
          if($success !== true)
          {
            throw new InvalidProjectFileException("error extracting project -> (zip) file");
          }
          $zip->close();
        }
        else
        {
          throw new InvalidProjectFileException("invalid project archive or server setup");
        }
      } catch(Exception $e)
      {
        throw new Exception("error extracting project (zip) file: " . $e);
      }

      //convert + save pre-created project
      if(!is_file($cacheDir . "code.xml"))
      {
        throw new Exception("code file not found: " . $cacheDir . "code.xml");
      }

      // load code.xml of project
      $xml = simplexml_load_file($cacheDir . "code.xml");
      if($xml === false)
      {
        throw new FileParserException("error loading file: invalid xml");
      }

      try
      {
        //get catrobat file version
        $fileVersion = floatval($xml->header->catrobatLanguageVersion);
      } catch(Exception $e)
      {
        throw new FileParserException("catrobat language version not found or parsed correctly");
      }

      //set resource url root path to include it in the response string
      if(isset($_SERVER['HTTPS']) && (strcasecmp('off', $_SERVER['HTTPS']) !== 0))
      {
        $protocol = "https";
      }
      else
      {
        $protocol = "http";
      }

      //$server_base = $protocol . "://" . $_SERVER["SERVER_NAME"];
      $resourceRoot = $this->BASE_URL . "html5/projects/" . $this->request->serviceVersion . "/" . $projectId . "/";

      // load parser using catrobat file version
      $parser = null;
      if($fileVersion >= 0.6 && $fileVersion < 0.93)
      {
        $parser = new ProjectFileParser($projectId, $resourceRoot, $cacheDir, $xml);
      }
      else
      {
        switch($fileVersion)
        {
          case 0.93:
            $parser = new ProjectFileParser_v0_93($projectId, $resourceRoot, $cacheDir, $xml);
            break;
          case 0.94:
          case 0.95:
          case 0.96:
          case 0.97:
            $parser = new ProjectFileParser_v0_94($projectId, $resourceRoot, $cacheDir, $xml);
            break;
          default:
            throw new FileParserException("no parser specified for catrobat language version: " . $fileVersion);
            break;
        }
      }

      $project = $parser->getProject();
      if($project instanceof Exception)
      {
        //delete our cache
        try
        {
          FileHelper::deleteDirectory($cacheDir);
        } catch(Exception $e)
        {
          //silent catch: an unhandled exception might be thown if the zip archive was not valid
        }
        //$objData = serialize(new ExceptionDto("Exception", $project->getMessage(), $project->getCode(), $project->getFile(), $project->getLine()));
        //$filePath = $cacheDir . "code.cache";
        //$fp = fopen($filePath, "w");
        //fwrite($fp, $objData);
        //fclose($fp);

        return $project;
      }

      //save for caching
      $objData = serialize($project);
      $filePath = $cacheDir . "code.cache";
      $fp = fopen($filePath, "w");
      fwrite($fp, $objData);
      fclose($fp);
    }
    else
    {
      //load pre-created project from cache
      $filePath = $cacheDir . "code.cache";
      if(file_exists($filePath))
      {
        $objData = file_get_contents($filePath);
        $project = unserialize($objData);
      }
      else
      {
        throw new FileParserException("project not found in cache");
      }
    }

    if(empty($project))
    {
      throw new FileParserException("error loading project file: empty content");
    }

    //include data urls if requested
    if(isset($this->request->imgDataMax))
    {
      foreach($project->images as $img)
      {
        $path = $cacheDir . $img->url;
        $res = $this->loadBase64Image($path, $this->request->imgDataMax);
        if($res !== false)
        {
          $img->url = $res;
        }
      }
    }
    if(isset($this->request->audioDataMax))
    {
      foreach($project->sounds as $audio)
      {
        $path = $cacheDir . $audio->url;
        $res = $this->loadBase64Audio($path, $this->request->audioDataMax);
        if($res !== false)
        {
          $audio->url = $res;
        }
      }
    }

    //save json
    //$project_json = json_encode($project);
    //$filePath = $cacheDir . "code.json";
    //$fp = fopen($filePath, "w");
    //fwrite($fp, $project_json);
    //fclose($fp);

    return $project;
  }

  private function getProjectList()
  {
    //defaults
    $offset = 0;
    $limit = 20;
    $mask = "recent";

    //process request parameters
    if(isset($this->request->requestParameters["offset"]))
    {
      $offset = $this->request->requestParameters["offset"];
    }

    if(isset($this->request->requestParameters["limit"]))
    {
      $limit = $this->request->requestParameters["limit"];
    }

    if(isset($this->request->requestParameters["mask"]))
    {
      $mask = $this->request->requestParameters["mask"];
    }

    //request projects + set $total
    $featured = [];
    if($offset === 0)
    {
      $data = file_get_contents($this->API . "api/projects/featured.json?limit=3");
      $data = json_decode($data, false);
      $baseUrl = $data->CatrobatInformation->BaseUrl;

      foreach($data->CatrobatProjects as $project)
      {
        array_push($featured, new ProjectDetailsDto($project->ProjectId, $project->ProjectName, "", $baseUrl,
          $project->FeaturedImage, $project->Author));
      }
    }

    $url = $this->API . "api/projects/";

    switch($mask)
    {
      case "downloads":
        $url .= "mostDownloaded.json";
        break;

      case "viewed":
        $url .= "mostViewed.json";
        break;

      case "recent":
        $url .= "recent.json";
        break;

      default:
        throw new ServiceNotImplementedException("mask '" . $mask . "' not supported!");
    }

    $url .= "?offset=" . $offset . "&limit=" . $limit;

    $data = file_get_contents($url);
    $data = json_decode($data, false);

    $info = $data->CatrobatInformation;
    $baseUrl = $info->BaseUrl;
    $projects = new ProjectListDto($offset, $limit, $mask, $info->TotalProjects);

    foreach($data->CatrobatProjects as $project)
    {
      array_push($projects->items,
        new ProjectDetailsDto($project->ProjectId, $project->ProjectName, $project->Description, $baseUrl,
          $project->ScreenshotSmall, $project->Author));
    }
    $projects->featured = $featured;

    //include data urls if requested
    if(isset($this->request->imgDataMax))
    {
      //include data urls
      $localPath = str_replace("/", DIRECTORY_SEPARATOR, $this->SERVER_ROOT() . "webtest/shared/web/");

      foreach($projects->featured as $p)
      {
        $path = $localPath . $p->thumbnailUrl;
        echo $path . ", \n";
        $res = $this->loadBase64Image($path, $this->request->imgDataMax);
        if($res !== false)
        {
          $p->thumbnailUrl = $res;
        }
      }

      foreach($projects->items as $p)
      {
        $path = $localPath . $p->thumbnailUrl;
        $res = $this->loadBase64Image($path, $this->request->imgDataMax);
        if($res !== false)
        {
          $p->thumbnailUrl = $res;
        }
      }
    }

    return $projects;
  }

  //returns the resource as base64 encoded data url or false if the size limit (kB) was reached
  private function loadBase64Image($path, $maxSize)
  {
    if(file_exists($path))
    {
      $bytes = filesize($path);
      if($this->request->imgDataMax === 0 || $bytes <= (int)($maxSize * 1024 * 0.65))
      {
        $imageData = base64_encode(file_get_contents($path));

        //no support for finfo_... & mime_content_type is deprecated: pathInfo meets my requirements
        return "data:image/" . pathinfo($path, PATHINFO_EXTENSION) . ";base64," . $imageData;
      }
    }

    return false;
  }

  //returns the resource as base64 encoded data url or false if the size limit (kB) was reached
  private function loadBase64Audio($path, $maxSize)
  {
    if(file_exists($path))
    {
      $bytes = filesize($path);
      if($this->request->imgDataMax === 0 || $bytes <= (int)($maxSize * 1024 * 0.65))
      {
        $imageData = base64_encode(file_get_contents($path));

        //no support for finfo_... & mime_content_type is deprecated: pathInfo meets my requirements
        $mime = "audio/";
        if(pathinfo($path, PATHINFO_EXTENSION) === "mp3")
        {
          $mime .= "mpeg";
        }
        else
        {
          $mime .= pathinfo($path, PATHINFO_EXTENSION);
        }

        return "data:" . $mime . ";base64," . $imageData;
      }
    }

    return false;
  }

}
