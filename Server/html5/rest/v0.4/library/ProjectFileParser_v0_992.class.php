<?php

class ProjectFileParser_v0_992
{
    protected $projectId = null;
    protected $resourceBaseUrl = "";
    protected $cacheDir = "";
    protected $simpleXml = null;

    protected $scenes = [];
    protected $currentScene = null;

    //protected $background = null;
    //protected $sprites = [];
    protected $bricksCount = 0;
    protected $images = [];
    protected $sounds = [];
    protected $soundInUse = [];
    protected $variables = [];
    protected $lists = [];
    protected $broadcasts = [];

    //generate ids starting with id = 1
    private $id = 1;

    protected function getNewId()
    {
        return "s" . $this->id++;
    }

    //text to speech provider
    protected $tts = null;

    //current parser path: this is an array monitoring the current parser position
    //like a directory structure: each entry is a link to an simpleXmlObjectReference
    //this is used to follow relative references as simpleXml does not provide a parent reference
    protected $cpp = [];

    //the object (sprite) the parser is currently parsing
    protected $currentSprite = null;

    public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml)
    {
        $this->projectId = intval($projectId);
        $this->resourceBaseUrl = $resourceBaseUrl;
        $this->cacheDir = $cacheDir;
        $this->simpleXml = $simpleXml;

        $this->tts = new TextToSpeechProvider($projectId);
        //[0]: root path
        array_push($this->cpp, $simpleXml);
    }

    //helper methods
    protected function findItemInArrayByUrl($url, $array, $checkInUse = false)
    {
        foreach($array as $item)
        {
            if($item->url === $url)
            {
                if($checkInUse && !in_array($url, $this->soundInUse))
                    array_push($this->soundInUse, $url);
                return $item;
            }
        }
        return false;
    }

    protected function findItemInArrayByName($name, $array)
    {
        foreach($array as $item)
        {
            if($item->name === $name)
            {
                return $item;
            }
        }

        return false;
    }

    protected function findLookByResourceId($resourceId, $looks = null)
    {
        if ($looks == null)
            $looks = $this->currentSprite->looks;   //set current sprite looks as default

        foreach($looks as $item)
        {
            if($item->resourceId === $resourceId)
                return $item;
        }
        return false;
    }

    protected function checkSoundInUse()
    {
        $tmp = [];
        foreach($this->sounds as $sound)
        {
            if(in_array($sound->url, $this->soundInUse))
            {
                array_push($tmp, $sound);
            }
        }
        $this->sounds = $tmp;
    }

    protected function getName($script)
    {
        return (string)$script["name"];
    }

    protected function getSoundName($script)
    {
        return (string)$script->name;
    }

    protected function getBrickType($script)
    {
        return (string)$script["type"];
    }

    protected function getSceneDirName()
    {
        //TODO: name encoding for scene name eg. "//!;;:'...;-):'("
        return $this->currentScene->name;
    }

    //search global and local variable by name and add local variable if not found
    protected function getVariableId($name)
    {
        //handle unset variable = "New..:" = null
        if(!isset($name) || (string)$name === "")
        {
            return null;
        }

		//local search
		$res = $this->findItemInArrayByName($name, $this->currentSprite->variables);
        //global search
		if($res === false)
			$res = $this->findItemInArrayByName($name, $this->variables);
        if($res === false)
        {
			//not defined yet: add to local scope
			$id = $this->getNewId();
			array_push($this->currentSprite->variables, new IdNameDto($id, $name));
			return $id;
        }

        return $res->id;
    }

    // parses list from userList-ref
    protected function getList($userList)
    {
        if(isset($userList->name))
        {
            //list init
            return (string)$userList->name[0];
        }
        else
        {
            //list ref
            $lst = $this->getObject($userList, $this->cpp);
            return (string)$lst->name[0];
        }
    }

    //search global and local lists by name and add local list if not found
    protected function getListId($name)
    {
        //handle unset list = "New..:" = null
        if(!isset($name) || (string)$name === "")
        {
            return null;
        }

        // global search
        $res = $this->findItemInArrayByName($name, $this->lists);
        if($res === false)
        {
            //dto to insert
            $obj = $this->currentSprite;
            //local search
            $res = $this->findItemInArrayByName($name, $obj->lists);
            if($res === false)
            {
                //not defined yet
                $id = $this->getNewId();
                array_push($obj->lists, new IdNameDto($id, $name));

                return $id;
            }
        }

        return $res->id;
    }

    //returns a simpleXml object of an original object handling references
    //returns the object itself if there is no reference attribute set, else: resolve object by reference
    //followCpp: indicates, if $this->cpp should be modified- needed for sprite references
    protected function getObject($object, $cpp, $followCpp = false)
    {
        $c = $object;   //current object in tree

        if(isset($c["reference"]))
        {
            $path = explode("/", $c["reference"]);
            $lcp = array_merge([], $cpp);

            foreach($path as $ref)
            {
                if($ref === "..")
                {
                    $c = array_pop($lcp);
                }
                else
                {
                    //add node
                    array_push($lcp, $c);
                    //resolve current path, e.g. object[2]
                    //more than one xml tag of the same type (->getName()) can occur in one parent tag,
                    //these tags are named as "name" meaning name[0] and "name[2..n]" which should have the indices [1..(n-1)]
                    $idx = 0;
                    $regex = "/([^\[]+)(\[)(\d+)(\])/";
                    if(preg_match($regex, $ref))
                    {
                        //if there is a match we increment the index to get an array conform index
                        $idx = intval(preg_replace($regex, "$3", $ref)) - 1;
                        $ref = preg_replace($regex, "$1", $ref);
                    }

                    //get the i-th entry with the current name from a mixed child list
                    $found = false;

                    if( !is_object( $c ) )
                    {
                        throw new InvalidProjectFileException("invalid reference: ".$object["reference"]);
                        //throw new Exception( "No Object" );
                    }

                    foreach ($c->children() as $i) {
                        if ($i->getName() === $ref) {
                            if ($idx === 0) {
                                $found = true;
                                $c = $i;
                                break;
                            } else {
                                $idx--;
                            }
                            //increment the counter to get the item we're searching for
                        }
                    }
                    if($found == false)
                    {
                        continue;
                        // throw new Exception("path not found");
                    }
                }
            }
            //recursive recall to get ref of ref of .. or object
            return $this->getObject($c, $lcp, $followCpp);
        }
        else
        {
            if ($followCpp)
                $this->cpp = $cpp;    //update global path to ensure we parse internal references correctly
            return $object;
        }
    }

    //this method is used to access properties not defined in all supported language versions
    protected function getProperty($object, $pName)
    {
        if(property_exists($object, $pName))
        {
            return $object->$pName;
        }

        return null;
    }

    //public getter: parser functions below
    public function getProject()
    {
        try
        {
            $project = new ProjectDto($this->projectId, $this->resourceBaseUrl, $this->parseHeader());

            //globla vars & lists
            $this->parseGlobalData();
            $project->variables = $this->variables;
            $project->lists = $this->lists;

            //scenes
            array_push($this->cpp, $this->simpleXml->scenes);

            //init scene objects for references
            foreach($this->simpleXml->scenes->children() as $scene)
            {
                $scene = $this->getObject($scene, $this->cpp);
                array_push($this->scenes, new SceneDto($this->getNewId(), (string)$scene->name, intval($scene->originalWidth), intval($scene->originalHeight)));
            }

            $xmlScenes = $this->simpleXml->scenes->children();
            for($i = 0; $i < count($xmlScenes); $i++)
            {
                $this->currentScene = $this->scenes[$i];
                $this->parseSceneSprites($xmlScenes[$i]);   //stored to background and sprites[] in currentScene
                array_push($project->scenes, $this->currentScene);
            }

            array_pop($this->cpp);  //scenes

            //set total number of bricks in header
            $project->header->bricksCount = $this->bricksCount;

            //resources
            $this->checkSoundInUse();
            $project->images = $this->images;
            $project->sounds = $this->sounds;
            $project->broadcasts = $this->broadcasts;

            return $project;
        }
        catch(FileParserException $e)
        {
            return $e;
        }
        catch(InvalidProjectFileException $e)
        {
            return $e;
        }
        catch(Exception $e)
        {
            return new FileParserException($e);
        }
    }

    protected function parseHeader()
    {
        $xmlh = $this->simpleXml->header;

        //device
        $device = new ProjectDeviceDto(intval($xmlh->screenHeight), intval($xmlh->screenWidth), (string)$xmlh->screenMode);

        //header
        $header = new ProjectHeaderDto((string)$xmlh->programName, (string)$xmlh->description,
                                       floatval($xmlh->catrobatLanguageVersion), (string)$xmlh->userHandle, (string)$xmlh->url);
        $header->device = $device;
        return $header;
    }

    protected function parseGlobalData()
    {
        // parse global vars
        if(property_exists($this->simpleXml, "programVariableList"))
        {
            array_push($this->cpp, $this->simpleXml->programVariableList);
            foreach($this->simpleXml->programVariableList->children() as $userVar)
            {
                $userVar = $this->getObject($userVar, $this->cpp);
                array_push($this->variables, new IdNameDto($this->getNewId(), (string)$userVar));
            }
            array_pop($this->cpp);
        }

        // parse global lists
        if(property_exists($this->simpleXml, "programListOfLists"))
        {
            array_push($this->cpp, $this->simpleXml->programListOfLists);
            foreach($this->simpleXml->programListOfLists->children() as $userList)
            {
                $userList = $this->getList($userList);
                array_push($this->lists, new IdNameDto($this->getNewId(), (string)$userList));
            }
            array_pop($this->cpp);
        }
    }

    //stores background $ sprites to $this.currentScene->background/sprites[]
    protected function parseSceneSprites($xmlScene)
    {
        array_push($this->cpp, $xmlScene);

        //sprites
        array_push($this->cpp, $xmlScene->objectList);

        //init all objects including new id and name to archive referencing objects during parsing:
        //1st entry = background
        $bg = true;
        foreach($xmlScene->objectList->children() as $sprite)
        {
            //take care: this can be a referenced object as well
            $sprite = $this->getObject($sprite, $this->cpp);

            if($bg === true)
            {
                $this->currentScene->background = new SpriteDto($this->getNewId(), $this->getName($sprite));
                //$project->scenes[0]->background = $this->background;
                $bg = false;
            }
            else
            {
                if((string)$sprite["type"] == "GroupSprite") {
                    continue;
                }
                array_push($this->currentScene->sprites, new SpriteDto($this->getNewId(), $this->getName($sprite)));
            }
        }

        //parse sprites
        $spriteGroups = [];
        $currentSpriteGroup = null;

        //1st entry = background
        $bg = true;
        $cppSaved = array_merge([], $this->cpp); //store path to reset after parsing

        foreach($xmlScene->objectList->children() as $sprite)
        {
            $this->cpp = $cppSaved; //restore path

            //take care: this can be a referenced object as well
            $sprite = $this->getObject($sprite, $this->cpp, true);

            if($bg === true)
            {
                $this->currentScene->background = $this->parseSprite($sprite, $this->currentScene->background->id);
                $bg = false;
            }
            else if ((string)$sprite["type"] == "GroupSprite") {
                $currentSpriteGroup = new IdNameDto($this->getNewId(), $this->getName($sprite));
                array_push($spriteGroups, $currentSpriteGroup);
            }
            else
            {
                $name = $this->getName($sprite);
                $idx = -1;
                $len = count($this->currentScene->sprites);

                for($i = 0; $i < $len; $i++)
                {
                    if($this->currentScene->sprites[$i]->name === $name)
                    {
                        $idx = $i;
                        break;
                    }
                }

                $id = $this->currentScene->sprites[$idx]->id;

                //override existing object with completely parsed sprite
                $this->currentScene->sprites[$idx] = $this->parseSprite($sprite, $id);
                if (isset($currentSpriteGroup))
                    $this->currentScene->sprites[$idx]->groupId = $currentSpriteGroup->id;
            }
        }
        $this->currentScene->spriteGroups = $spriteGroups;
        $this->cpp = $cppSaved; //restore path

        array_pop($this->cpp);

        array_pop($this->cpp);  //scene
    }

    protected function parseSprite($sprite, $spriteId)
    {
        //$sprite = $this->getObject($sprite, $this->cpp, true);
        $sp = new SpriteDto($spriteId, $this->getName($sprite));
        $this->currentSprite = $sp;

        array_push($this->cpp, $sprite);
        array_push($this->cpp, $sprite->lookList);

        foreach($sprite->lookList->children() as $look)
        {
            $look = $this->getObject($look, $this->cpp);

            $url = $this->getSceneDirName() . "/images/" . (string)$look->fileName;
            $res = $this->findItemInArrayByUrl($url, $this->images);
            if($res === false)
            {
                $imageId = $this->getNewId();
                $path = $this->cacheDir . $this->getSceneDirName() . DIRECTORY_SEPARATOR . "images" . DIRECTORY_SEPARATOR . (string)$look->fileName;
                if(is_file($path))
                {
                    $size = filesize($path);
                }
                else
                {
                    //$size = 0;  //TODO: this is a fix until encoding was specified
                    throw new InvalidProjectFileException("image file '" . $path . "' does not exist");
                }
                array_push($this->images, new ResourceDto($imageId, $url, $size));
            }
            else
            {
                $imageId = $res->id;
            }

            array_push($sp->looks, new LookDto($this->getNewId(), $imageId, $this->getName($look)));
        }
        array_pop($this->cpp);

        //sounds: property either reference or name $fileName (handle this for looks too)
        array_push($this->cpp, $sprite->soundList);

        foreach($sprite->soundList->children() as $sound)
        {
            $sound = $this->getObject($sound, $this->cpp);

            //= false, if not found
            $url = $this->getSceneDirName() . "/sounds/" . (string)$sound->fileName;
            $res = $this->findItemInArrayByUrl($url, $this->sounds, true);
            if($res === false)
            {
                $id = $this->getNewId() . "_" . $this->projectId;
                $path = $this->cacheDir . $this->getSceneDirName() . DIRECTORY_SEPARATOR . "sounds" . DIRECTORY_SEPARATOR . (string)$sound->fileName;
                if(is_file($path))
                {
                    $size = filesize($path);
                    array_push($this->sounds, new ResourceDto($id, $url, $size));
                }
                else
                    continue;
            }
            else
            {
                $id = $res->id;
            }
            array_push($sp->sounds, new ResourceReferenceDto($id, $this->getSoundName($sound)));
        }
        array_pop($this->cpp);

        //user script definitions
        array_push($this->cpp, $sprite->userBricks);

        //store path to continue each definition request with the same root
        $storedPath = $this->cpp;

        foreach($sprite->userBricks->children() as $userScript)
        {
            array_push($this->cpp, $userScript);

            $id = $this->getNewId();
            $brick = new UserScriptBrickDto($id);
            //$string = (string) $userScript->definitionBrick->asXML();
            $definition = $this->getObject($userScript->definitionBrick, $this->cpp, true); //follow path to parse internal scripts correctly
            $definition->addAttribute("userScriptId", $id);
            //$string = (string) $definition->asXML();

            foreach ($definition->userBrickElements->children() as $headerItem)
            {
                switch ((string)$headerItem->elementType) {
                    case "TEXT":
                        array_push($brick->header, new UserScriptHeaderItemDto("text", (string)$headerItem->text));
                        break;
                    case "VARIABLE":
                        $varId = $this->getNewId();
                        $headerItem->addAttribute("variableId", $varId);
                        array_push($brick->header, new UserScriptHeaderItemDto("var", (string)$headerItem->text, $varId));
                        break;
                    case "LINEBREAK":
                        array_push($brick->header, new UserScriptHeaderItemDto("linebreak"));
                        break;
                }
            }

            array_push($this->cpp, $definition);
            $script = $definition->script;
            array_push($this->cpp, $script);
            $brickList = $script->brickList;
            array_push($this->cpp, $brickList);

            $this->bricksCount += count($brickList->children()) + 1;
            $brick->bricks = $this->parseInnerBricks($brickList->children());

            array_pop($this->cpp);

            array_pop($this->cpp);
            array_pop($this->cpp);

            array_push($sp->userScripts, $brick);
            array_pop($this->cpp);  //not really necessary

            $this->cpp = $storedPath;   //restore after userScript definitions parsed
        }
        array_pop($this->cpp);

        //bricks, including broadcasts and variables
        if(property_exists($sprite, "scriptList"))
        {
            array_push($this->cpp, $sprite->scriptList);

            foreach($sprite->scriptList->children() as $script)
            {
                array_push($sp->scripts, $this->parseBrick($script));
            }

            array_pop($this->cpp);
            array_pop($this->cpp);
        }

        return $sp;
    }

    protected function parseBrick($script)
    {
        try
        {
            array_push($this->cpp, $script);
            $brickType = $this->getBrickType($script);
            if(isset($script["reference"]))
                throw new InvalidProjectFileException("referenced brick found");//: $brickType");

            $brick = $this->parseEventBricks($brickType, $script);

            if(!$brick)
                $brick = $this->parseControlBricks($brickType, $script);

            if(!$brick)
                $brick = $this->parseMotionBricks($brickType, $script);

            if(!$brick)
                $brick = $this->parseSoundBricks($brickType, $script);

            if(!$brick)
                $brick = $this->parseLookBricks($brickType, $script);

            if(!$brick)
                $brick = $this->parsePenBricks($brickType, $script);

            if(!$brick)
                $brick = $this->parseDataBricks($brickType, $script);

            if(!$brick)
                $brick = $this->parseUserBricks($brickType, $script);

			//default: not found
            if(!$brick) {
				$endBricks = array("LoopEndlessBrick", "LoopEndBrick", "IfThenLogicEndBrick", "IfLogicEndBrick");
				if (in_array($brickType, $endBricks))
					throw new InvalidProjectFileException("end brick: $brickType detected at wrong code position- broken code encapsulation");

				$brick = new UnsupportedBrickDto($script->asXML(), $brickType);
			}

            array_pop($this->cpp);

            //global handling of comment out
            $brick->commentedOut = (string)$script->commentedOut == "true";

            return $brick;
        }
        catch(FileParserException $e)
        {
            throw $e;
        }
        catch(InvalidProjectFileException $e)
        {
            throw $e;
        }
        catch(Exception $e)
        {
            throw new FileParserException($e . ", xml: " . $script->asXML());
        }
    }

    //parse bricks: helper
    protected function parseInnerBricks($brickList)
    {
        try
        {
            $bricks = [];
            $idx = 0;

            while($idx < count($brickList))
            {
                //special logic for loops: forever, repeat and if-then-else
                //to restructure the *.catrobat/code.xml document to our needs
                $script = $brickList[$idx];
                if(isset($script["reference"]))
                {
                    //$brickType = $this->getBrickType($script);
                    throw new InvalidProjectFileException("referenced brick found");//: $brickType");
                }

                switch($this->getBrickType($script))
                {
                    case "ForeverBrick":
                        $result = $this->parseForeverBrick($brickList, $idx);
                        array_push($bricks, $result["brick"]);
                        $idx = $result["idx"];
                        break;

                    case "RepeatBrick":
                        $result = $this->parseRepeatBrick($brickList, $idx);
                        array_push($bricks, $result["brick"]);
                        $idx = $result["idx"];
                        break;

                    case "RepeatUntilBrick":
                        $result = $this->parseRepeatUntilBrick($brickList, $idx);
                        array_push($bricks, $result["brick"]);
                        $idx = $result["idx"];
                        break;

                    case "IfThenLogicBeginBrick":
                        $result = $this->parseIfThenBrick($brickList, $idx);
                        array_push($bricks, $result["brick"]);
                        $idx = $result["idx"];
                        break;

                    case "IfLogicBeginBrick":
                        $result = $this->parseIfBrick($brickList, $idx);
                        array_push($bricks, $result["brick"]);
                        $idx = $result["idx"];
                        break;

                    default:
                        array_push($bricks, $this->parseBrick($script));
                }

                $idx++;
            }

            return $bricks;
        }
        catch(FileParserException $e)
        {
            throw $e;
        }
        catch(InvalidProjectFileException $e)
        {
            throw $e;
        }
        catch(Exception $e)
        {
            /** @noinspection PhpUndefinedVariableInspection */
            throw new FileParserException($e . ", xml: " . $script->asXML());
        }
    }

    //parse bricks
    protected function parseEventBricks($brickType, $script)
    {
        switch($brickType)
        {
            //WhenProgramStart
            case "StartScript":
                $brick = new WhenProgramStartBrickDto($this->getNewId());
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            case "WhenScript":
                $brick = new WhenActionBrickDto($this->getNewId(), EUserActionType::SPRITE_TOUCHED);//lcfirst((string)$script->action));    //action = "tapped"
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            //WhenTouchDown
            case "WhenTouchDownScript":
                $brick = new WhenActionBrickDto($this->getNewId(), EUserActionType::TOUCH_START);
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

			//WhenBroadcastReceive
            case "BroadcastScript":
                $msg = (string)$script->receivedMessage;
                $res = $this->findItemInArrayByName($msg, $this->broadcasts);
                if($res === false)
                {
                    $id = $this->getNewId();
                    array_push($this->broadcasts, new IdNameDto($id, $msg));
                }
                else
                {
                    $id = $res->id;
                }

                $brick = new WhenBroadcastReceiveBrickDto($this->getNewId(), $id);

                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

			case "BroadcastBrick":
                $msg = (string)$script->broadcastMessage;
                $res = $this->findItemInArrayByName($msg, $this->broadcasts);
                if($res === false)
                {
                    $id = $this->getNewId();
                    array_push($this->broadcasts, new IdNameDto($id, $msg));
                }
                else
                {
                    $id = $res->id;
                }

                $brick = new BroadcastBrickDto($id);
                break;

            // Verschicke und warte
            case "BroadcastWaitBrick":
                $msg = (string)$script->broadcastMessage;
                $res = $this->findItemInArrayByName($msg, $this->broadcasts);
                if($res === false)
                {
                    $id = $this->getNewId();
                    array_push($this->broadcasts, new IdNameDto($id, $msg));
                }
                else
                {
                    $id = $res->id;
                }

                $brick = new BroadcastAndWaitBrickDto($id);
                break;

            //WhenConditionMet, e.g. when x<y becomes true
            case "WhenConditionScript":
                $condition = $script->formulaMap;
                array_push($this->cpp, $condition);
                $brick = new WhenConditionMetBrickDto($this->getNewId(), $this->parseFormula($condition->formula));
                array_pop($this->cpp);

                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            //physics: WhenCollision
            case "CollisionScript":
                $msg = (string)$script->receivedMessage;
                $items = explode(">", $msg);  //"<->"
                $name = $items[1];
                //$brick;
                if (strpos($name, "ANYTHING") !== false)   //\tANYTHING\t   ->found
                    $brick = new WhenCollisionBrickDto($this->getNewId());
                else if (strpos($name, "Background") !== false)
                    $brick = new WhenCollisionBrickDto($this->getNewId(), $this->background->id);
                else {
                    //find sprite by name
                    for($i = 0; $i < count($this->currentScene->sprites); $i++)
                    {
                        if($this->currentScene->sprites[$i]->name == $name)
                        {
                            $id = $this->currentScene->sprites[$i]->id;
                            $brick = new WhenCollisionBrickDto($this->getNewId(), $id);
                            break;
                        }
                    }

                    if(!isset($brick))
                        throw new InvalidProjectFileException("physics collision ref $name not found");
                }
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            //WhenBackgroundChanges
            case "WhenBackgroundChangesScript":
                $lookId = null; //if not defined

                if(property_exists($script, "look"))
                {
                    $look = $this->getObject($script->look, $this->cpp);
                    $res = $this->findItemInArrayByUrl($this->getSceneDirName() . "/images/" . (string)$look->fileName, $this->images, true);

                    if($res === false)	//will only return false on invalid projects, as resources are registered already
                    {
                        throw new InvalidProjectFileException("image file '" . (string)$look->fileName . "' does not exist");
                    }
                    else {
                        //find id in sprite->looks[]
                        $lookObject = $this->findLookByResourceId($res->id, $this->currentScene->background->looks);
                        if($lookObject === false)	//will only return false on invalid projects, as resources are registered already
                            //{
						    //echo $this->getSceneDirName() . "/images/" . (string)$look->fileName;
							//exit();
						    throw new InvalidProjectFileException("look '" . (string)$look->fileName . "' not defined in this sprite");
						//}
                    }

                    //the image has already been included in the resources & look[]
                    $lookId = $lookObject->id;
                }

                $brick = new WhenBackgroundChangesToBrickDto($this->getNewId(), $lookId);
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            default:
                return false;
        }
        return $brick;
    }

    protected function parseForeverBrick($brickList, $idx)
    {
        $brick = new ForeverBrickDto((string)$brickList[$idx]->commentedOut == "true");
        //use a counter to compare nested elements with same names, as objects using equal
        // or operator (===) is not available in simpleXML
        $nestedCounter = 0;
        $parsed = false;

        //search for associated end brick
        $innerBricks = [];
        while($idx < count($brickList) - 1)
        {
            $idx++;

            $name = $this->getBrickType($brickList[$idx]);
            if($name === "ForeverBrick")
            {
                $nestedCounter++;
            }
            else if($name === "LoopEndlessBrick")
            {
                if($nestedCounter === 0)
                {
                    //parse recursive
                    $brick->bricks = $this->parseInnerBricks($innerBricks);
                    $parsed = true;
                    $this->bricksCount -= 1;
                    break;
                }
                else
                {
                    $nestedCounter--;
                    //add inner loop as sub brick
                    array_push($innerBricks, $brickList[$idx]);
                }
            }
            else
            {
                //add sub bricks
                array_push($innerBricks, $brickList[$idx]);
            }
        }

        if(!$parsed)
        {
            throw new InvalidProjectFileException("ForeverBrick: missing LoopEndlessBrick");
        }

        return array("brick" => $brick, "idx" => $idx);
    }

    protected function parseRepeatBrick($brickList, $idx)
    {
        $script = $brickList[$idx];
        $ttr = $script->formulaList;
        array_push($this->cpp, $ttr);
        $brick = new RepeatBrickDto($this->parseFormula($ttr->formula), (string)$script->commentedOut == "true");
        array_pop($this->cpp);

        $nestedCounter = 0;
        $parsed = false;

        //search for associated end brick
        $innerBricks = [];
        while($idx < count($brickList) - 1)
        {
            $idx++;

            $name = $this->getBrickType($brickList[$idx]);
            if($name === "RepeatBrick" || $name === "RepeatUntilBrick")
            {
                $nestedCounter++;
            }

            if($name === "LoopEndBrick")
            {
                if($nestedCounter === 0)
                {
                    //parse recursive
                    $brick->bricks = $this->parseInnerBricks($innerBricks);
                    $parsed = true;
                    $this->bricksCount -= 1;
                    break;
                }
                else
                {
                    $nestedCounter--;
                    //add inner loop as sub brick
                    array_push($innerBricks, $brickList[$idx]);
                }
            }
            else
            {
                //add sub bricks
                array_push($innerBricks, $brickList[$idx]);
            }
        }

        if (!$parsed)
            throw new InvalidProjectFileException("RepeatBrick: missing LoopEndBrick");

        return array("brick" => $brick, "idx" => $idx);
    }

    protected function parseRepeatUntilBrick($brickList, $idx)
    {
        $script = $brickList[$idx];
        $condition = $script->formulaList;
        array_push($this->cpp, $condition);
        $brick = new RepeatUntilBrickDto($this->parseFormula($condition->formula), (string)$script->commentedOut == "true");
        array_pop($this->cpp);

        $nestedCounter = 0;
        $parsed = false;

        //search for associated end brick
        $innerBricks = [];
        while($idx < count($brickList) - 1)
        {
            $idx++;

            $name = $this->getBrickType($brickList[$idx]);
            if($name === "RepeatBrick" || $name === "RepeatUntilBrick")
            {
                $nestedCounter++;
            }
            else if($name === "LoopEndBrick")
            {
                if($nestedCounter === 0)
                {
                    //parse recursive
                    $brick->bricks = $this->parseInnerBricks($innerBricks);
                    $parsed = true;
                    $this->bricksCount -= 1;
                    break;
                }
                else
                {
                    $nestedCounter--;
                    //add inner loop as sub brick
                    array_push($innerBricks, $brickList[$idx]);
                }
            }
            else
            {
                //add sub bricks
                array_push($innerBricks, $brickList[$idx]);
            }
        }

        if (!$parsed)
            throw new InvalidProjectFileException("RepeatUntilBrick: missing LoopEndBrick");

        return array("brick" => $brick, "idx" => $idx);
    }

    protected function parseIfThenBrick($brickList, $idx)
    {
        $script = $brickList[$idx];
        $condition = $script->formulaList;
        array_push($this->cpp, $condition);
        $brick = new IfThenElseBrickDto($this->parseFormula($condition->formula), false, (string)$script->commentedOut == "true");
        array_pop($this->cpp);

        $nestedCounter = 0;
        $parsed = false;

        //search for associated end brick
        $innerIfBricks = [];
        while($idx < count($brickList) - 1)
        {
            //skip begin brick
            $idx++;

            $name = $this->getBrickType($brickList[$idx]);
            if($name === "IfThenLogicBeginBrick")
            {
                $nestedCounter++;
            }

            if($name === "IfThenLogicEndBrick")
            {
                if($nestedCounter === 0)
                {
                    //parse recursive
                    $brick->ifBricks = $this->parseInnerBricks($innerIfBricks);
                    $parsed = true;
                    $this->bricksCount -= 1;
                    break;
                }
                else
                {
                    $nestedCounter--;
                    array_push($innerIfBricks, $brickList[$idx]);
                }
            }
            else
            {
                array_push($innerIfBricks, $brickList[$idx]);
            }
        }

        if (!$parsed)
            throw new InvalidProjectFileException("IfThenLogicBeginBrick: missing IfThenLogicEndBrick");

        return array("brick" => $brick, "idx" => $idx);
    }

    protected function parseIfBrick($brickList, $idx)
    {
        $script = $brickList[$idx];
        $condition = $script->formulaList;
        array_push($this->cpp, $condition);
        $brick = new IfThenElseBrickDto($this->parseFormula($condition->formula), true, (string)$script->commentedOut == "true");
        array_pop($this->cpp);

        $nestedCounter = 0;
        $parsed = false;

        //search for associated end brick
        $innerIfBricks = [];
        $innerElseBricks = [];
        $inElse = false;
        while($idx < count($brickList) - 1)
        {
            //skip begin brick
            $idx++;

            $name = $this->getBrickType($brickList[$idx]);
            if($name === "IfLogicBeginBrick")
            {
                $nestedCounter++;
            }

            if($name === "IfLogicElseBrick" && $nestedCounter === 0)
            {
                $inElse = true;
                continue;
            }

            if($name === "IfLogicEndBrick")
            {
                if($nestedCounter === 0)
                {
                    //parse recursive
                    $brick->ifBricks = $this->parseInnerBricks($innerIfBricks);
                    $brick->elseBricks = $this->parseInnerBricks($innerElseBricks);
                    $parsed = true;
                    $this->bricksCount -= 2;
                    break;
                }
                else
                {
                    $nestedCounter--;
                    if($inElse === false)
                    {
                        //add inner loop as sub brick
                        array_push($innerIfBricks, $brickList[$idx]);
                    }
                    else
                    {
                        array_push($innerElseBricks, $brickList[$idx]);
                    }
                }
            }
            else
            {
                if($inElse === false)
                {
                    //add inner loop as sub brick
                    array_push($innerIfBricks, $brickList[$idx]);
                }
                else
                {
                    array_push($innerElseBricks, $brickList[$idx]);
                }
            }
        }

        if (!$parsed)
            throw new InvalidProjectFileException("IfLogicBeginBrick: missing IfLogicEndBrick");

        return array("brick" => $brick, "idx" => $idx);
    }


    protected function parseControlBricks($brickType, $script)
    {
        switch($brickType)
        {
            // Warte x Sekunden - Brick
            case "WaitBrick":
                $duration = $script->formulaList;
                array_push($this->cpp, $duration);
                $brick = new WaitBrickDto($this->parseFormula($duration->formula));
                array_pop($this->cpp);
                break;

            // Notiz - Brick
            case "NoteBrick":
                $brick = new NoteBrickDto((string)$script->note);
                break;

            // Wiederhole fortlaufend

            // Wenn x<y whar ist, dann ... sonst ...

            // Wenn x<y wahr ist, dann

            // Warte bis - Brick
            case "WaitUntilBrick":
                $condition = $script->formulaList;
                array_push($this->cpp, $condition);
                $brick = new WaitUntilBrickDto($this->parseFormula($condition->formula));
                array_pop($this->cpp);
                break;

            // Continue scene
            case "SceneTransitionBrick":
                $sceneId = null;
                $sceneName = (string)$script->sceneForTransition;
                foreach($this->scenes as $scene)
                {
                    if ($scene->name == $sceneName) {
                        $sceneId = $scene->id;
                        break;
                    }
                }

                if(!$sceneId)
                    throw new InvalidProjectFileException("SceneTransitionBrick: invalid properties");

                $brick = new SceneTransitionBrickDto($sceneId);
                break;

            // Start scene
            case "SceneStartBrick":
                $sceneId = null;
                $sceneName = (string)$script->sceneToStart;
                foreach($this->scenes as $scene)
                {
                    if ($scene->name == $sceneName) {
                        $sceneId = $scene->id;
                        break;
                    }
                }

                if(!$sceneId)
                    throw new InvalidProjectFileException("SceneStartBrick: invalid properties");

                $brick = new StartSceneBrickDto($sceneId);
                break;

            // When I start as a clone
            case "WhenClonedScript":
                $brick = new WhenStartAsCloneBrickDto($this->getNewId());
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            // Create clone of
            case "CloneBrick":
                $brick = new CloneBrickDto();
                if(property_exists($script, "objectToClone")) {
                    $spriteXml = $this->getObject($script->objectToClone, $this->cpp);
					$name = $this->getName($spriteXml);
					foreach($this->currentScene->sprites as $s) {
						if($s->name === $name)
						{
							$brick->spriteId = $s->id;
							break;
						}
					}
                }
                else {
                    $brick->ofMyself = true;
                }
                break;

            // Delete this clone
            case "DeleteThisCloneBrick":
                $brick = new DeleteCloneBrickDto();
                break;

            // stop script/s
            case "StopScriptBrick":
                $scriptType = (string)$script->spinnerSelection;
                $type = -1;

                switch($scriptType) {
                    case "0":   //this
                        $type = EStopType::THIS_SCRIPT;
                        break;
                    case "1":   //all
                        $type = EStopType::ALL;
                        break;
                    case "2":   //other
                        $type = EStopType::OTHER_SCRIPTS;
                        break;
                    default:    //invalid if not one of the above
                        throw new InvalidProjectFileException("StopBrick: invalid properties");
                }

                $brick = new StopBrickDto($type);
                break;

            default:
                return false;
        }
        return $brick;
    }

    protected function parseMotionBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "PlaceAtBrick":
                $x = null;
                $y = null;
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat === "X_POSITION")
                    {
                        $x = $this->parseFormula($formula);
                    }
                    else if($cat === "Y_POSITION")
                    {
                        $y = $this->parseFormula($formula);
                    }
                }
                array_pop($this->cpp);
                $brick = new GoToPositionBrickDto($x, $y);
                break;

            case "SetXBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $x = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new SetXBrickDto($x);
                break;

            case "SetYBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $y = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new SetYBrickDto($y);
                break;

            case "ChangeXByNBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $x = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new ChangeXBrickDto($x);
                break;

            case "ChangeYByNBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $y = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new ChangeYBrickDto($y);
                break;

            case "GoToBrick":
                $destinationType = null; //"mouseTouchPointer", "random", "sprite"
                $spriteId = null;

                switch((string)$script->spinnerSelection) {
                    case "80":
                        $destinationType = "pointer";
                        break;
                    case "81":
                        $destinationType = "random";
                        break;
                    case "82":
                        $destinationType = "sprite";
                        $pointedTo = $this->getObject($script->destinationSprite, $this->cpp);
                        $name = $this->getName($pointedTo);

                        //detect id by object name (unique): all sprites are already pre-parsed with id and name
                        foreach($this->currentScene->sprites as $s)
                        {
                            if($s->name === $name)
                            {
                                $spriteId = $s->id;
                                break;
                            }
                        }
                        break;
                }

                if(!$destinationType || ($destinationType == "sprite" && !$spriteId))
                    throw new InvalidProjectFileException("GoToBrick: invalid properties");

                $brick = new GoToBrickDto($destinationType, $spriteId);
                break;

            case "SetRotationStyleBrick":
                $brick = new SetRotationStyleBrickDto((string)$script->selection);
                break;

            case "IfOnEdgeBounceBrick":
                $brick = new IfOnEdgeBounceBrickDto();
                break;

            case "MoveNStepsBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $steps = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new MoveNStepsBrickDto($steps);
                break;

            case "TurnLeftBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $degrees = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new TurnLeftBrickDto($degrees);
                break;

            case "TurnRightBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $degrees = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new TurnRightBrickDto($degrees);
                break;

            case "PointInDirectionBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $degrees = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new SetDirectionBrickDto($degrees);
                break;

            case "VibrationBrick":    /*name changed?*/
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $duration = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new VibrationBrickDto($duration);
                break;

            case "PointToBrick":
                $spriteId = null;
                if(property_exists($script, "pointedObject"))
                {
                    //type of Sprite = <object />
                    $pointedTo = $this->getObject($script->pointedObject, $this->cpp);
                    $name = $this->getName($pointedTo);

                    //detect id by object name (unique): all sprites are already pre-parsed with id and name
                    foreach($this->currentScene->sprites as $s)
                    {
                        if($s->name === $name)
                        {
                            $spriteId = $s->id;
                            break;
                        }
                    }
                }

                $brick = new SetDirectionToBrickDto($spriteId);
                break;

            case "GlideToBrick":
                $duration = null;
                $xDestination = null;
                $yDestination = null;

                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat === "X_DESTINATION")
                    {
                        $xDestination = $this->parseFormula($formula);
                    }
                    else if($cat === "Y_DESTINATION")
                    {
                        $yDestination = $this->parseFormula($formula);
                    }
                    else if($cat === "DURATION_IN_SECONDS")
                    {
                        $duration = $this->parseFormula($formula);
                    }
                }

                array_pop($this->cpp);
                $brick = new GlideToBrickDto($xDestination, $yDestination, $duration);
                break;

            case "GoNStepsBackBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $layers = $this->parseFormula($fl->formula);

                array_pop($this->cpp);
                $brick = new GoBackBrickDto($layers);
                break;

            case "ComeToFrontBrick":
                $brick = new ComeToFrontBrickDto();
                break;

            //physics
            case "SetPhysicsObjectTypeBrick":
                //$type = (string)$script->type; //"DYNAMIC", "FIXED", "NONE"
                $brick = new SetPhysicsObjectTypeBrickDto((string)$script->type);
                break;

            case "SetVelocityBrick":    //PHYSICS_VELOCITY_X, PHYSICS_VELOCITY_Y
                $x = null;
                $y = null;
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat === "PHYSICS_VELOCITY_X")
                    {
                        $x = $this->parseFormula($formula);
                    }
                    else if($cat === "PHYSICS_VELOCITY_Y")
                    {
                        $y = $this->parseFormula($formula);
                    }
                }
                array_pop($this->cpp);
                $brick = new SetVelocityBrickDto($x, $y);
                break;

            case "TurnLeftSpeedBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $value = $this->parseFormula($fl->formula);

                array_pop($this->cpp);
                $brick = new RotationSpeedLeftBrickDto($value);
                break;

            case "TurnRightSpeedBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $value = $this->parseFormula($fl->formula);

                $brick = new RotationSpeedRightBrickDto($value);
                break;

            case "SetGravityBrick": //PHYSICS_GRAVITY_X, PHYSICS_GRAVITY_Y
                $x = null;
                $y = null;
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat === "PHYSICS_GRAVITY_X")
                    {
                        $x = $this->parseFormula($formula);
                    }
                    else if($cat === "PHYSICS_GRAVITY_Y")
                    {
                        $y = $this->parseFormula($formula);
                    }
                }
                array_pop($this->cpp);
                $brick = new SetGravityBrickDto($x, $y);
                break;

            case "SetMassBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $value = $this->parseFormula($fl->formula);

                $brick = new SetMassBrickDto($value);
                break;

            case "SetBounceBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $percentage = $this->parseFormula($fl->formula);

                $brick = new SetBounceFactorBrickDto($percentage);
                break;

            case "SetFrictionBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $percentage = $this->parseFormula($fl->formula);

                $brick = new SetFrictionBrickDto($percentage);
                break;

            default:
                return false;
        }
        return $brick;
    }

    protected function parseSoundBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "PlaySoundBrick":
            case "PlaySoundAndWaitBrick":
                if ($brickType == "PlaySoundBrick")
                    $brick = new PlaySoundBrickDto(null);
                else
                    $brick = new PlaySoundAndWaitBrickDto(null);

                if(!property_exists($script, "sound"))  //play sound brick is initial set to "New.." and has no child tags per default
                    break;

                $sound = $this->getObject($script->sound, $this->cpp);
                $res = $this->findItemInArrayByUrl($this->getSceneDirName() . "/sounds/" . (string)$sound->fileName, $this->sounds, true);

                if($res === false)	//will only return false on invalid projects, as resources are registered already
                    throw new InvalidProjectFileException("sound file '" . (string)$sound->fileName . "' does not exist");

                $brick->resourceId = $res->id;
                break;

            case "StopAllSoundsBrick":
                $brick = new StopAllSoundsBrickDto();
                break;

            case "SetVolumeToBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $volume = $fl->formula;
                $brick = new SetVolumeBrickDto($this->parseFormula($volume));
                array_pop($this->cpp);
                break;

            case "ChangeVolumeByNBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $volume = $fl->formula;
                $brick = new ChangeVolumeBrickDto($this->parseFormula($volume));
                array_pop($this->cpp);
                break;

            case "SpeakBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new SpeakBrickDto($this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "SpeakAndWaitBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new SpeakAndWaitBrickDto($this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            default:
                return false;
        }
        return $brick;
    }

    protected function parseLookBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "SetBackgroundBrick":
            case "SetBackgroundAndWaitBrick":
                if ($brickType == "SetBackgroundBrick")
                    $brick = new SetBackgroundBrickDto(null);
                else
                    $brick = new SetBackgroundAndWaitBrickDto(null);

                if(!property_exists($script, "look"))   // when no look set, look => empty
                    break;

                $look = $this->getObject($script->look, $this->cpp);
                $res = $this->findItemInArrayByUrl($this->getSceneDirName() . "/images/" . (string)$look->fileName, $this->images, true);

                if($res === false)	//will only return false on invalid projects, as resources are registered already
                {
                    throw new InvalidProjectFileException("image file '" . (string)$look->fileName . "' does not exist");
                }
                else {
                    //find id in sprite->looks[]
                    $lookObject = $this->findLookByResourceId($res->id, $this->currentScene->background->looks);
                    if($lookObject === false)	//will only return false on invalid projects, as resources are registered already
                        throw new InvalidProjectFileException("look '" . (string)$look->fileName . "' not defined in this sprite");
                }

                //the image has already been included in the resources & look[]
                $brick->lookId = $lookObject->id;
                break;

            case "SetBackgroundByIndexBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new SetBackgroundByIndexBrickDto($this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "SetLookBrick":
                $brick = new SetLookBrickDto(null);
                if(!property_exists($script, "look"))   // when no look set, look => empty
                    break;

                $look = $this->getObject($script->look, $this->cpp);
                $res = $this->findItemInArrayByUrl($this->getSceneDirName() . "/images/" . (string)$look->fileName, $this->images, true);

                if($res === false)	//will only return false on invalid projects, as resources are registered already
                {
                    throw new InvalidProjectFileException("image file '" . (string)$look->fileName . "' does not exist");
                }
                else {
                    //find id in sprite->looks[]
                    $lookObject = $this->findLookByResourceId($res->id);
                    if($lookObject === false)	//will only return false on invalid projects, as resources are registered already
                        throw new InvalidProjectFileException("look '" . (string)$look->fileName . "' not defined in this sprite");
                }

                //the image has already been included in the resources & look[]
                $brick->lookId = $lookObject->id;
                break;

            case "SetLookByIndexBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new SetLookByIndexBrickDto($this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "NextLookBrick":
                $brick = new NextLookBrickDto();
                break;

            case "PreviousLookBrick":
                $brick = new PreviousLookBrickDto();
                break;

            case "SetSizeToBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $size = $fl->formula;
                $brick = new SetSizeBrickDto($this->parseFormula($size));
                array_pop($this->cpp);
                break;

            case "ChangeSizeByNBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $size = $fl->formula;
                $brick = new ChangeSizeBrickDto($this->parseFormula($size));
                array_pop($this->cpp);
                break;

            case "HideBrick":
                $brick = new HideBrickDto();
                break;

            case "ShowBrick":
                $brick = new ShowBrickDto();
                break;

            case "AskBrick":
            case "AskSpeechBrick":
				$var = null;
				if(property_exists($script, "userVariable")) {
					$varXml = $this->getObject($script->userVariable, $this->cpp);
					$var = $this->getVariableId((string)$script->userVariable);
				}
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                if ($brickType == "AskBrick")
                    $brick = new AskBrickDto($this->parseFormula($fl->formula), $var);
                else
                    $brick = new AskSpeechBrickDto($this->parseFormula($fl->formula), $var);
                array_pop($this->cpp);
                break;

            case "SayBubbleBrick":
            case "ThinkBubbleBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                if ($brickType == "SayBubbleBrick")
                    $brick = new SayBrickDto($this->parseFormula($fl->formula));
                else
                    $brick = new ThinkBrickDto($this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "SayForBubbleBrick":
            case "ThinkForBubbleBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);

                $text = null;   //formulas
                $duration = null;
                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat == "STRING")
                    {
                        $text = $this->parseFormula($formula);
                    }
                    else if($cat == "DURATION_IN_SECONDS")
                    {
                        $duration = $this->parseFormula($formula);
                    }
                }

                array_pop($this->cpp);
                if(!$text || !$duration)
                    throw new InvalidProjectFileException("SayForBubbleBrick, ThinkForBubbleBrick: invalid properties");

                if ($brickType == "SayForBubbleBrick")
                    $brick = new SayForBrickDto($text, $duration);
                else
                    $brick = new ThinkForBrickDto($text, $duration);
                break;

            case "SetTransparencyBrick":    /*name changed*/
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $transparency = $fl->formula;
                $brick = new SetTransparencyBrickDto($this->parseFormula($transparency));
                array_pop($this->cpp);
                break;

            case "ChangeTransparencyByNBrick":    /*name changed*/
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $transparency = $fl->formula;
                $brick = new ChangeTransparencyBrickDto($this->parseFormula($transparency));
                array_pop($this->cpp);
                break;

            case "SetBrightnessBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brightness = $fl->formula;
                $brick = new SetBrightnessBrickDto($this->parseFormula($brightness));
                array_pop($this->cpp);
                break;

            case "ChangeBrightnessByNBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brightness = $fl->formula;
                $brick = new ChangeBrightnessBrickDto($this->parseFormula($brightness));
                array_pop($this->cpp);
                break;

            case "SetColorBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $color = $fl->formula;
                $brick = new SetColorEffectBrickDto($this->parseFormula($color));
                array_pop($this->cpp);
                break;

            case "ChangeColorByNBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $color = $fl->formula;
                $brick = new ChangeColorEffectBrickDto($this->parseFormula($color));
                array_pop($this->cpp);
                break;

            case "ClearGraphicEffectBrick":
                $brick = new ClearGraphicEffectBrickDto();
                break;

            case "FlashBrick":
                $brick = new FlashBrickDto();   //spinnerSelectionID = 0/1 (off/on)
                $brick->selected = (string)$script->spinnerSelectionID;
                break;

            case "CameraBrick":    /*new*/
                $brick = new CameraBrickDto();   //spinnerSelectionID = 0/1 (off/on)
                $brick->selected = (string)$script->spinnerSelectionID;
                break;

            case "ChooseCameraBrick":    /*new*/
                $brick = new SelectCameraBrickDto();   //spinnerSelectionID = 0/1 (back/front)
                $brick->selected = (string)$script->spinnerSelectionID;
                break;

            default:
                return false;
        }
        return $brick;
    }

    protected function parsePenBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "PenDownBrick":
                $brick = new PenDownBrickDto();
                break;

            case "PenUpBrick":
                $brick = new PenUpBrickDto();
                break;

            case "SetPenSizeBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new SetPenSizeBrickDto($this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "SetPenColorBrick":
                $r = null;
                $g = null;
                $b = null;

                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat == "PHIRO_LIGHT_RED")
                    {
                        $r = $this->parseFormula($formula);
                    }
                    else if($cat == "PHIRO_LIGHT_GREEN")
                    {
                        $g = $this->parseFormula($formula);
                    }
                    else if($cat == "PHIRO_LIGHT_BLUE")
                    {
                        $b = $this->parseFormula($formula);
                    }
                }

                array_pop($this->cpp);
                if(!$r || !$g|| !$b)
                    throw new InvalidProjectFileException("InsertItemIntoUserListBrick: invalid properties");
                $brick = new SetPenColorBrickDto($r, $g, $b);
                break;

            case "StampBrick":
                $brick = new StampBrickDto();
                break;

            case "ClearBackgroundBrick":
                $brick = new ClearBackgroundBrickDto();
                break;

            default:
                return false;
        }
        return $brick;
    }

    protected function parseDataBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "SetVariableBrick":
                $id = null;
                if(property_exists($script, "userVariable"))
                {
                    $var = $this->getObject($script->userVariable, $this->cpp);
                    $id = $this->getVariableId((string)$var);
                }
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new SetVariableBrickDto($id, $this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "ChangeVariableBrick":
                $id = null;
                if(property_exists($script, "userVariable"))
                {
                    $var = $this->getObject($script->userVariable, $this->cpp);
                    $id = $this->getVariableId((string)$var);
                }
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new ChangeVariableBrickDto($id, $this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "AddItemToUserListBrick":
                $id = null;
                if(property_exists($script, "userList"))
                {
                    $lst = $this->getList($script->userList);
                    $id = $this->getListId((string)$lst);
                }
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new AppendToListBrickDto($id, $this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "DeleteItemOfUserListBrick":
                $id = null;
                if(property_exists($script, "userList"))
                {
                    $lst = $this->getList($script->userList);
                    $id = $this->getListId((string)$lst);
                }
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $brick = new DeleteAtListBrickDto($id, $this->parseFormula($fl->formula));
                array_pop($this->cpp);
                break;

            case "InsertItemIntoUserListBrick":
                $id = null;
                if(property_exists($script, "userList"))
                {
                    $lst = $this->getList($script->userList);
                    $id = $this->getListId((string)$lst);
                }
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);

                $index = null;
                $value = null;

                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat == "INSERT_ITEM_INTO_USERLIST_INDEX")
                    {
                        $index = $this->parseFormula($formula);
                    }
                    else if($cat == "INSERT_ITEM_INTO_USERLIST_VALUE")
                    {
                        $value = $this->parseFormula($formula);
                    }
                }

                if(!$index || !$value)
                    throw new InvalidProjectFileException("InsertItemIntoUserListBrick: invalid properties");

                $brick = new InsertAtListBrickDto($id, $index, $value);
                array_pop($this->cpp);
                break;

            case "ReplaceItemInUserListBrick":
                $id = null;
                if(property_exists($script, "userList"))
                {
                    $lst = $this->getList($script->userList);
                    $id = $this->getListId((string)$lst);
                }
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);

                $index = null;
                $value = null;

                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat == "REPLACE_ITEM_IN_USERLIST_INDEX")
                    {
                        $index = $this->parseFormula($formula);
                    }
                    else if($cat == "REPLACE_ITEM_IN_USERLIST_VALUE")
                    {
                        $value = $this->parseFormula($formula);
                    }
                }

                if(! $index || ! $value)
                    throw new InvalidProjectFileException("InsertItemIntoUserListBrick: invalid properties");

                $brick = new ReplaceAtListBrickDto($id, $index, $value);
                array_pop($this->cpp);
                break;

            case "ShowTextBrick":
            case "ShowVariableBrick":
                $id = null;
                if(property_exists($script, "userVariable"))
                {
                    $var = $this->getObject($script->userVariable, $this->cpp);
                    $id = $this->getVariableId((string)$var);
                }
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);

                $x = null;
                $y = null;

                foreach($fl->children() as $formula)
                {
                    $cat = (string)$formula["category"];
                    if($cat == "X_POSITION")
                    {
                        $x = $this->parseFormula($formula);
                    }
                    else if($cat == "Y_POSITION")
                    {
                        $y = $this->parseFormula($formula);
                    }
                }

                if(! $x || ! $y)
                    throw new InvalidProjectFileException("ShowTextBrick: invalid properties");

                $brick = new ShowVariableBrickDto($id, $x, $y);
                array_pop($this->cpp);
                break;

            case "HideTextBrick":
            case "HideVariableBrick":
                $id = null;
                if(property_exists($script, "userVariable"))
                {
                    $var = $this->getObject($script->userVariable, $this->cpp);
                    $id = $this->getVariableId((string)$var);
                }
                $fl = $script->formulaList;
                $brick = new HideVariableBrickDto($id);
                break;

            default:
                return false;
        }

        return $brick;
    }

    protected function parseUserBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "UserBrick":
                $definition = $this->getObject($script->definitionBrick, $this->cpp);

                $storedPath = $this->cpp;   //store path to navigate to element reference
                $parameters = $this->getObject($script->userBrickParameters, $this->cpp, true);
                array_push($this->cpp, $parameters);

                $brick = new CallUserScriptBrickDto((string)$definition["userScriptId"]);

                foreach ($parameters->children() as $parameter) {
                    array_push($this->cpp, $parameter);
                    $variable = $this->getObject($parameter->element, $this->cpp);

                    $fl = $parameter->formulaList;
                    array_push($this->cpp, $fl);
                    //add
                    array_push($brick->parameters, new UserScriptArgumentDto((string)$variable["variableId"], $this->parseFormula($fl->formula)));
                    array_pop($this->cpp);

                    array_pop($this->cpp);
                }

                array_pop($this->cpp);  //to root: not necessars due to restore
                //restore
                $this->cpp = $storedPath;

                break;

			default:
                return false;
        }
        return $brick;
    }

    //formula
    protected function parseFormula($formula)
    {
        $type = (string)$formula->type;
        if($type === "USER_VARIABLE")
        {
            $value = $this->getVariableId((string)$formula->value);
        }
        else if($type === "USER_LIST")
        {
            $value = $this->getListId((string)$formula->value);
        }
        else if($type === "COLLISION_FORMULA")
        {
            $name = (string)$formula->value;   //either 'sp1 touches sp2' (v0.992) or 'sp1' (v0.993 - ?)
            $spriteNames = explode(" touches ", $name);
            if(count($spriteNames) == 2)    //v0.992
            {
                $name = $spriteNames[1];
            }
            else if(count($spriteNames) == 1)   //v0.993
            {
                $name = $spriteNames[0];
            }
            else
            {
                throw new InvalidProjectFileException("Formula type error: COLLISION_FORMULA: value = $name");
            }

            //detect id by object name (unique): all sprites are already pre-parsed with id and name
            $value = "";
            foreach($this->currentScene->sprites as $s)
            {
                if($s->name === $name)
                {
                    $value = $s->id;
                    break;
                }
            }

            if ($value == "")
                throw new InvalidProjectFileException("Formula type error: COLLISION_FORMULA: sprite with name = $name not found.");
        }
        else
        {
            $value = (string)$this->getProperty($formula, "value");
        }

        $f = new FormulaDto($type, $value);

        if(property_exists($formula, "leftChild"))
        {
            $f->left = $this->parseFormula($formula->leftChild);
        }
        if(property_exists($formula, "rightChild"))
        {
            $f->right = $this->parseFormula($formula->rightChild);
        }

        return $f;
    }

}
