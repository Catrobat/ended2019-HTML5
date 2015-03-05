<?php

class ProjectFileParser {

  protected $projectId = null;
  protected $resourceBaseUrl = "";
  protected $cacheDir = "";
	
  protected $simpleXml = null;  //simpleXml Object
  
  protected $sprites = array();
  protected $bricksCount = 0; 
  protected $images = array();
  protected $sounds = array();
  protected $variables = array();
  protected $broadcasts = array();
  
  private $id = 1;  //generate ids starting with id = 1
  protected function getNewId() {
    return "s" . $this->id++;
  }
  
  //text to speeech provider
  protected $tts = null;
  
  //current parser path: this is an array monitoring the current parser position
  //like a directory structure: each entry is a link to an simpleXmlObjectReference
  //this is used to follow relative references as simpleXml does not provide a parent reference
  protected $cpp = array();
  
  //the object (sprite) the parser is currently parsing
  protected $currentSprite = null;
  
  public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml) { 
    $this->projectId = $projectId;
    $this->resourceBaseUrl = $resourceBaseUrl;
    $this->cacheDir = $cacheDir;
		
    $this->tts = new TextToSpeechProvider($projectId);

    $this->simpleXml = $simpleXml;
    array_push($this->cpp, $simpleXml); //[0]: rrot path 
  }


  protected function includeGlobalVariables() {
    
    $vars = $this->simpleXml->variables;
    array_push($this->cpp, $vars);
    array_push($this->cpp, $vars->programVariableList);
      
    foreach($vars->programVariableList->children() as $userVar) {
      /*Test$userVar = $vars->programVariableList->children()[0];*/
      $userVar = $this->getObject($userVar, $this->cpp);
      array_push($this->variables, new VariableDto($this->getNewId(), (string)$userVar->name));
    }
      
    array_pop($this->cpp);
    array_pop($this->cpp);
            
  }
 
  public function getProject() {
    
    try {
      $project = new ProjectDto(intval($this->projectId), $this->resourceBaseUrl);

      //header
      $project->header = $this->parseHeader(); 
	
    
      //global variables
      $this->includeGlobalVariables();
      $project->variables = $this->variables;
      

      //sprites
      array_push($this->cpp, $this->simpleXml->objectList);
      
      //init all objects including new id and name to achive referencing objects during parsing:
      $bg = true;   //1st entry = background
      foreach($this->simpleXml->objectList->children() as $sprite) {
        $sprite = $this->getObject($sprite, $this->cpp);    //take care: this can be a referenced object as well
        
        if ($bg === true) {
          $project->background = new SpriteDto($this->getNewId(), $this->getName($sprite));
          $bg = false;
        }
        else
          array_push($this->sprites, new SpriteDto($this->getNewId(), $this->getName($sprite)));
      }
      
      //parse sprites
      $bg = true;   //1st entry = background
      foreach($this->simpleXml->objectList->children() as $sprite) {
        $sprite = $this->getObject($sprite, $this->cpp);    //take care: this can be a referenced object as well
        
        if ($bg === true) {
          $project->background = $this->parseSprite($sprite, $project->background->id);
          $bg = false;
        }
        else {
          //find
          $name = $this->getName($sprite);
          $idx = -1;
          $len = count($this->sprites);
          
          for ($i = 0; $i < $len; $i++) {
            if ($this->sprites[$i]->name === $name) {
              $idx = $i;
              break;
            }
          }

          $id = $this->sprites[$idx]->id;
          //override existing object with completly parsed sprite
          $this->sprites[$idx] = $this->parseSprite($sprite, $id);  
        }
      }
      
      array_pop($this->cpp);
      
      $project->sprites = $this->sprites;
    
      //set total number of bricks in header
      $project->header->bricksCount = $this->bricksCount; 
    
      //resources
      $project->images = $this->images;
      $project->sounds = $this->sounds;
      $project->broadcasts = $this->broadcasts;
    
	  return $project;
    }
    //catch(FileParserException $e) {
    //  return $e;
    //}
    catch(Exception $e) {
      return new FileParserException($e);
    }
  }
  
  //method included to override it in v0.93
  protected function getName($script) {
    return (string)$script->name;
  }
  
  //this method is used to access properties not defined in all supported language versions 
  protected function getProperty($object, $pName) {
    if (property_exists($object, $pName))
      return $object->$pName;
    
    return null;
  }
  
  protected function parseHeader() {
    $xmlh = $this->simpleXml->header;
    //device 
    $device = new ProjectDeviceDto(intval($xmlh->screenHeight), intval($xmlh->screenWidth), (string)$this->getProperty($xmlh, "screenMode"));
    
    //header
    $header = new ProjectHeaderDto((string)$xmlh->programName, (string)$xmlh->description, floatval($xmlh->catrobatLanguageVersion), (string)$xmlh->userHandle, (string)$xmlh->url);
    $header->device = $device;
    
    return $header;
  }

  //resource already registered
  protected function findResourceInArray($url, $array) {
    foreach($array as $res) {
      if ($res->url === $url)
        return $res;
    }
    return false;
  }

  //global variable?
  protected function findVariableInArray($name, $array) {
    foreach($array as $var) {
      if ($var->name === $name)
        return $var;
    }
    return false;
  }
  
  //search global and local variable by name and add local variable if not found
  protected function getVariableId($name) {
    //handle unset variable = "New..:" = null
    if (!isset($name) || (string)$name === "")
      return null;
    
    $res = $this->findVariableInArray($name, $this->variables); //= false, if not found: global search
    if($res === false) {    //not global
      $obj = $this->currentSprite;  //dto to insert
      $res = $this->findVariableInArray($name, $obj->variables); //local search
      if($res === false) {    //not defined yet
          $id = $this->getNewId();
          array_push($obj->variables, new VariableDto($id, $name));
          return $id;
      }
    }
    return $res->id;
  }

  //returns a simpleXml object of an original object handling references
  //returns the object itself if there is no reference attribute set, else: resolve object by reference
  protected function getObject($object, $cpp) {
    $c = $object;   //current object in tree
     
    if(isset($c["reference"])) { 
      //DEBUG:    echo " REF: ".$c["reference"]."\n";
      $path = explode("/", $c["reference"]);//$c->attributes()->reference);

      //$cp represents a local clone of cpp to not effect the parser when following references
      //if ($cpp === $this->cpp) { //do not override global path
        $lcp = array_merge(array(), $cpp);
      //}
      //else {
      //  $lcp = $cpp;    //this is necessary due to memory consumption on cloning the reference path
      //}

      foreach($path as $ref) {
        if ($ref === "..") {
          $c = array_pop($lcp); //c = c->parent()
        }
        else {
          array_push($lcp, $c); //add node
          //resolve current path, e.g. object[2]
          //more than one xml tag of the same type (->getName()) can occur in one parent tag,
          //these tags are name as "name" meaning name[0] and "name[2..n]" which should have the indices [1..(n-1)]
          $idx = 0;
          $regex = "/([^\[]+)(\[)(\d+)(\])/";
          if (preg_match($regex, $ref)) {   //if there is a match we increment the index to get an array conform index
            $idx = intval(preg_replace($regex, "$3", $ref)) - 1;
            $ref = preg_replace($regex, "$1", $ref);
          }
          
          //get the i-th entry with the current name from a mixed child list
          $found = false;
          foreach($c->children() as $i) {
            if ($i->getName() === $ref) {
              if ($idx === 0) {
                $found = true;
                $c = $i;    //item found
                break;
              }
              else
                $idx--;     //increment the counter to get the item we're searching for
            }
          }
          if ($found == false)
           throw new Exception("path not found");
        }
      }  
      //recursive recall to get ref of ref of .. or object
      //DEBUG: echo "c= ". $c->asXML()."\n\n";
      return $this->getObject($c, $lcp);    //$c;// 
    }
    else
      return $object;
  }
  
  protected function parseSprite($sprite, $spriteId) {
    $sprite = $this->getObject($sprite, $this->cpp);
    $sp = new SpriteDto($spriteId, $this->getName($sprite));
    $this->currentSprite = $sp;
    
    array_push($this->cpp, $sprite);
    
    //looks
    array_push($this->cpp, $sprite->lookList);
    
    foreach($sprite->lookList->children() as $look) {
      $look = $this->getObject($look, $this->cpp);
      
      $res = $this->findResourceInArray("images/" . (string)$look->fileName, $this->images); //= false, if not found
      if($res === false) {
        $id = $this->getNewId();
				$size = filesize($this->cacheDir . "images" . DIRECTORY_SEPARATOR . (string)$look->fileName);	//str_replace("/", DIRECTORY_SEPARATOR, 
        array_push($this->images, new ResourceDto($id, "images/" . (string)$look->fileName, $size));
      }
      else {
        $id = $res->id;
      }
      
      array_push($sp->looks, new ResourceReferenceDto($id, $this->getName($look)));
    }
    array_pop($this->cpp);
    
    //sounds: property either reference or name $fileName (handle this for looks too)
    array_push($this->cpp, $sprite->soundList);
    
    foreach($sprite->soundList->children() as $sound) {
      $sound = $this->getObject($sound, $this->cpp);
      
      $res = $this->findResourceInArray("sounds" . DIRECTORY_SEPARATOR . (string)$sound->fileName, $this->sounds); //= false, if not found
      if($res === false) {
        $id = $this->getNewId();
				$size = filesize($this->cacheDir . "sounds/" . (string)$sound->fileName);
        array_push($this->sounds, new ResourceDto($id, "sounds/" . (string)$sound->fileName, $size));
      }
      else 
        $id = $res->id;
        
      array_push($sp->sounds, new ResourceReferenceDto($id, $this->getName($sound)));
    }
    array_pop($this->cpp);
    
    //bricks, including broadcasts and variables
    if (property_exists($sprite, "scriptList")) {
      array_push($this->cpp, $sprite->scriptList);
      
      foreach($sprite->scriptList->children() as $script) {
        array_push($sp->bricks, $this->parseScript($script));
      }
      
      array_pop($this->cpp);
      array_pop($this->cpp);
    }
    
    return $sp;
  }

  protected function getBrickName($script) {
    return ucFirst($script->getName());
  }
  
  //this method is used to handle bricks like if-then-else, which are a single container brick according to our definition 
  //but split up into several bricks in the catrobat file format
  protected function parseInnerBricks($brickList) {
	  try {
			$bricks = array();
			
			$idx = 0;
			$length = count($brickList);
			
			while ($idx < $length) {
				//special logic for loops: forever, repeat and if-then-else
				//to restructure the *.catrobat/code.xml document to our needs
				$script = $brickList[$idx];
				switch ($this->getBrickName($script)) {
					
					case "ForeverBrick":      //"loopEndlessBrick"
						//$loopEndBrick = $script->loopEndBrick;
						$brick = new ForeverBrickDto();
						$nestedCounter = 0;   //use a counter ob nested elements with same name as comparison of objects using eqaul or operator (===) is not available in simleXML
						$idx++;
						
						//search for associated end brick
						$innerBricks = array();
						while ($idx < $length) {
							$name = $this->getBrickName($brickList[$idx]);
							if($name === "ForeverBrick") {
								$nestedCounter++;
							}
							
							if($name === "LoopEndlessBrick") {
								if ($nestedCounter === 0) {
									$brick->bricks = $this->parseInnerBricks($innerBricks);  //parse recursive
									array_push($bricks, $brick);
									$this->bricksCount -= 1;
									//$idx++;
									break;
								}
								else {
									$nestedCounter--;
									array_push($innerBricks, $brickList[$idx]);  //add inner loop as sub brick
								}
							}
							else
								array_push($innerBricks, $brickList[$idx]);  //add sub bricks
							
							$idx++;
						}
						
						break;
						
					case "RepeatBrick":       //"loopEndBrick"
						$ttr = $script->timesToRepeat;
						$brick = new RepeatBrickDto($this->parseFormula($ttr->formulaTree));
						
						$nestedCounter = 0;
						$idx++;
						//search for associated end brick
						$innerBricks = array();
						while ($idx < $length) {
							$name = $this->getBrickName($brickList[$idx]);
							if($name === "RepeatBrick") {
								$nestedCounter++;
							}
								
							if($name === "LoopEndBrick") {
								if ($nestedCounter === 0) {
									$brick->bricks = $this->parseInnerBricks($innerBricks);  //parse recursive
									array_push($bricks, $brick);
									$this->bricksCount -= 1;
									//$idx++;
									break;;
								}
								else {
									$nestedCounter--;
									array_push($innerBricks, $brickList[$idx]);  //add inner loop as sub brick
								}
							}
							else
								array_push($innerBricks, $brickList[$idx]);  //add sub bricks
							
							$idx++;
						}
						
						break;
					
					case "IfLogicBeginBrick": //"ifLogicElseBrick", "ifLogicEndBrick"
						$condition = $script->ifCondition;
						$brick = new IfThenElseBrickDto($this->parseFormula($condition->formulaTree));
						
						$nestedCounter = 0;
						$idx++;   //skip begin brick
						
						//search for associated end brick
						$innerIfBricks = array();
						$innerElseBricks = array();
						$inElse = false;
						
						while ($idx < $length) {
							$name = $this->getBrickName($brickList[$idx]);
							if($name === "IfLogicBeginBrick") {
								$nestedCounter++;
							}
								
							if($name === "IfLogicElseBrick" && $nestedCounter === 0) {
								$inElse = true;
								$idx++;
								continue; //skip parsing else brick
							}
							
							if($name === "IfLogicEndBrick") {
								if ($nestedCounter === 0) {
									$brick->ifBricks = $this->parseInnerBricks($innerIfBricks);  //parse recursive
									$brick->elseBricks = $this->parseInnerBricks($innerElseBricks);  //parse recursive
									array_push($bricks, $brick);
									$this->bricksCount -= 2;
									break;
								}
								else {
									$nestedCounter--;
									if ($inElse === false)
										array_push($innerIfBricks, $brickList[$idx]);  //add inner loop as sub brick
									else
										array_push($innerElseBricks, $brickList[$idx]);
								}
							}
							else {
								if ($inElse === false)
									array_push($innerIfBricks, $brickList[$idx]);  //add inner loop as sub brick
								else
									array_push($innerElseBricks, $brickList[$idx]);
							}
							$idx++;
						}
						
						break;
						
					default:
						array_push($bricks, $this->parseScript($script));
				}

				$idx++;
			}
    
			return $bricks;
		}
		catch (FileParserException $e) {
			throw $e;
		}
		catch (Exception $e) {
			throw new FileParserException($e . ", xml: " . $script->asXML());
		}
  }
  
  protected function parseScript($script) {
    try {
	
			array_push($this->cpp, $script);

			switch ($this->getBrickName($script)) {
				
				/*1st level bricks*/
				case "StartScript":
					$brick = new ProgramStartBrickDto();
					$brickList = $script->brickList;
					array_push($this->cpp, $brickList);
					
					$this->bricksCount += count($brickList->children()) + 1;
					$brick->bricks = $this->parseInnerBricks($brickList->children());
					
					array_pop($this->cpp);
					break;
					
				case "BroadcastScript":
					$msg = (string)$script->receivedMessage;
					$res = $this->findVariableInArray($msg, $this->broadcasts); //= false, if not found
					if($res === false) {
						$id = $this->getNewId();
						array_push($this->broadcasts, new VariableDto($id, $msg));
					}
					else {
						$id = $res->id;
					}
				
					$brick = new BroadcastReceiveBrickDto($id);

					$brickList = $script->brickList;
					array_push($this->cpp, $brickList);
					
					$this->bricksCount += count($brickList->children()) + 1;
					$brick->bricks = $this->parseInnerBricks($brickList->children());
					
					array_pop($this->cpp);
					break;
					
				case "WhenScript":
					//$action = $script->action;
					$brick = new WhenActionBrickDto((string)$script->action);
					$brickList = $script->brickList;
					array_push($this->cpp, $brickList);
					
					$this->bricksCount += count($brickList->children()) + 1;
					$brick->bricks = $this->parseInnerBricks($brickList->children());
					
					array_pop($this->cpp);
					break;
				
				
				/*other control bricks*/
				case "WaitBrick":
					$duration = $script->timeToWaitInSeconds;
					$brick = new WaitBrickDto($this->parseFormula($duration->formulaTree));
					break;
					
				case "BroadcastBrick":
					$msg = (string)$script->broadcastMessage;
					$res = $this->findVariableInArray($msg, $this->broadcasts); //= false, if not found
					if($res === false) {
						$id = $this->getNewId();
						array_push($this->broadcasts, new VariableDto($id, $msg));
					}
					else {
						$id = $res->id;
					}

					$brick = new BroadcastBrickDto($id);
					break;
					
				case "BroadcastWaitBrick":
					$msg = (string)$script->broadcastMessage;
					$res = $this->findVariableInArray($msg, $this->broadcasts); //= false, if not found
					if($res === false) {
						$id = $this->getNewId();
						array_push($this->broadcasts, new VariableDto($id, $msg));
					}
					else {
						$id = $res->id;
					}

					$brick = new BroadcastAndWaitBrickDto($id);
					break;
					
				case "NoteBrick":
					$brick = new NoteBrickDto((string)$script->note);
					break;
					
				/*looping is handled in: $this->parseInnerBricks due to restructuring the code structure
				//more than one brick is handled at a time
				case "foreverBrick":      //"loopEndlessBrick"
					$brick = null;
					break;
					
				case "ifLogicBeginBrick": //"ifLogicElseBrick", "ifLogicEndBrick"
					$brick = null;
					break;
					
				case "repeatBrick":       //"loopEndBrick"
					$brick = null;
					break;
				*/
					
				
				/*motion bricks*/
				case "PlaceAtBrick":
					$x = $this->parseFormula($script->xPosition->formulaTree);
					$y = $this->parseFormula($script->yPosition->formulaTree);
					$brick = new PlaceAtBrickDto($x, $y);
					break;
					
				case "SetXBrick":
					$x = $this->parseFormula($script->xPosition->formulaTree);
					$brick = new SetXBrickDto($x);
					break;
					
				case "SetYBrick":
					$y = $this->parseFormula($script->yPosition->formulaTree);
					$brick = new SetYBrickDto($y);
					break;
					
				case "ChangeXByNBrick":
					$x = $this->parseFormula($script->xMovement->formulaTree);
					$brick = new ChangeXBrickDto($x);
					break;
					
				case "ChangeYByNBrick":
					$y = $this->parseFormula($script->yMovement->formulaTree);
					$brick = new ChangeYBrickDto($y);
					break;
					
				case "IfOnEdgeBounceBrick":
					$brick = new IfOnEdgeBounceBrickDto();
					break;
					
				case "MoveNStepsBrick":
					$steps = $this->parseFormula($script->steps->formulaTree);
					$brick = new ChangeYBrickDto($steps);
					break;
					
				case "TurnLeftBrick":
					$degrees = $this->parseFormula($script->degrees->formulaTree);
					$brick = new TurnLeftBrickDto($degrees);
					break;
					
				case "TurnRightBrick":
					$degrees = $this->parseFormula($script->degrees->formulaTree);
					$brick = new TurnRightBrickDto($degrees);
					break;
					
				case "PointInDirectionBrick":
					$degrees = $this->parseFormula($script->degrees->formulaTree);
					$brick = new PointInDirectionBrickDto($degrees);
					break;
					
				case "PointToBrick":
				if (property_exists($script, "pointedObject")) {
						$pointedTo = $this->getObject($script->pointedObject, $this->cpp);  //type of Sprite = <object />
						$name = $this->getName($pointedTo);
						//detect id by object name (unique): all sprites are already pre-parsed with id and name
						foreach($this->sprites as $s) {
							if ($s->name === $name) {
								$spriteId = $s->id;
								break;
							}
						}
			}
			else
				$spriteId = null;
				
					$brick = new PointToBrickDto($spriteId);
					break;
					
				case "GlideToBrick":
					$duration = $this->parseFormula($script->durationInSeconds->formulaTree);
					$xDestination = $this->parseFormula($script->xDestination->formulaTree);
					$yDestination = $this->parseFormula($script->yDestination->formulaTree);

					$brick = new GlideToBrickDto($xDestination, $yDestination, $duration);
					break;
					
				case "GoNStepsBackBrick":
					$layers = $this->parseFormula($script->steps->formulaTree);
					$brick = new GoBackBrickDto($layers);
					break;
					
				case "ComeToFrontBrick":
					$brick = new ComeToFrontBrickDto();
					break;
								
				
				/*sound bricks*/
				case "PlaySoundBrick":
					$id = null;
					if (property_exists($script, "sound")) {   //play sound brick is initial set to "New.." and has no child tags per default
						$sound = $this->getObject($script->sound, $this->cpp);
						$fileName = (string)$sound->fileName;
						
						$res = $this->findResourceInArray("sounds/" . $fileName, $this->sounds);
						/*if($res === false) {
							$id = $this->getNewId();
							array_push($this->sounds, new ResourceDto($id, "sounds/" . $fileName));
						}
						else*/
							$id = $res->id;
					}
					$brick = new PlaySoundBrickDto($id);
					break;
					
				case "StopAllSoundsBrick":
					$brick = new StopAllSoundsBrickDto();
					break;
					
				case "SetVolumeToBrick":
					$volume = $script->volume;
					$brick = new SetVolumeBrickDto($this->parseFormula($volume->formulaTree));
					break;
					
				case "ChangeVolumeByNBrick":
					$volume = $script->volume;
					$brick = new ChangeVolumeBrickDto($this->parseFormula($volume->formulaTree));
					break;
					
				case "SpeakBrick":
					$text = (string)$script->text;   
					$f = new FormulaDto("STRING", $text); //to make this brick compatible with v0.93
						 
					/*$fileName = md5($text).".mp3";
					//speak mp3 preloading
					$res = $this->findResourceInArray("tts/" . $fileName, $this->sounds); //= false, if not found
					if($res === false) {
						$id = $this->getNewId();
						array_push($this->sounds, new ResourceDto($id, "tts/" . $fileName));
					}
					else 
						$id = $res->id;
					
					$this->tts->loadSoundFile($text);*/
					
					
					$brick = new SpeakBrickDto($f);
					break;
					
				
				/*look bricks*/
				case "SetLookBrick":
					$look = $this->getObject($script->look, $this->cpp); //look from bricks look list
					$res = $this->findResourceInArray("images/" . (string)$look->fileName, $this->images); //= false, if not found
					
					$id = $res->id;   //the image has already been included in the resources
					$brick = new SetLookBrickDto($id);
					break;
				
				case "NextLookBrick":
					$brick = new NextLookBrickDto();
					break;
				
				case "SetSizeToBrick":
					$size = $script->size;
					$brick = new SetSizeToBrickDto($this->parseFormula($size->formulaTree));
					break;
				
				case "ChangeSizeByNBrick":
					$size = $script->size;
					$brick = new ChangeSizeBrickDto($this->parseFormula($size->formulaTree));
					break;
				
				case "HideBrick":
					$brick = new HideBrickDto();
					break;
				
				case "ShowBrick":
					$brick = new ShowBrickDto();
					break;
				
				case "SetGhostEffectBrick":
					$transparency = $script->transparency;
					$brick = new SetTransparencyBrickDto($this->parseFormula($transparency->formulaTree));
					break;
				
				case "ChangeGhostEffectByNBrick":
					$transparency = $script->changeGhostEffect;
					$brick = new ChangeTransparencyBrickDto($this->parseFormula($transparency->formulaTree));
					break;
				
				case "SetBrightnessBrick":
					$brightness = $script->brightness;
					$brick = new SetBrightnessBrickDto($this->parseFormula($brightness->formulaTree));
					break;
				
				case "ChangeBrightnessByNBrick":
					$brightness = $script->changeBrightness;
					$brick = new ChangeBrightnessBrickDto($this->parseFormula($brightness->formulaTree));
					break;
				
				case "ClearGraphicEffectBrick":
					$brick = new ClearGraphicEffectBrickDto();
					break;
				
				
				/*variable bricks*/
				case "SetVariableBrick":
					$var = $this->getObject($script->userVariable, $this->cpp); //variable definition
					//echo $var->asXML();
					$id = $this->getVariableId((string)$var->name);
					
					$formula = $script->variableFormula;
					
					$brick = new SetVariableBrickDto($id, $this->parseFormula($formula->formulaTree));
					break;
				
				case "ChangeVariableBrick":
					//echo "VAR: ".$script->asXML();
					$var = $this->getObject($script->userVariable, $this->cpp); //variable definition
					//echo "VAR: ".$var;
					//exit(0);
					$id = $this->getVariableId((string)$var->name);
					
					$formula = $script->variableFormula;
					
					$brick = new ChangeVariableBrickDto($id, $this->parseFormula($formula->formulaTree));
					break;
				
				/*default: return xml to verify which brick implementation is missing without generating a parser error*/
				default:
					$brick = new UnsupportedBrickDto($script->asXML(), (string)$script->name);
			}
			
			array_pop($this->cpp);
			return $brick;

		}
		catch (FileParserException $e) {
			throw $e;
		}
		catch (Exception $e) {
			throw new FileParserException($e . ", xml: " . $script->asXML());
		}
  }
  
  
  //formula parser: using <formula> in v0.93
  protected function parseFormula(/*formulaTree*/$formula) {

    $type = (string)$formula->type;
    if ($type === "USER_VARIABLE")
      $value = $this->getVariableId((string)$formula->value);
    else
      $value = (string)$this->getProperty($formula, "value");
      
    $f = new FormulaDto($type, $value);

    if (property_exists($formula, "leftChild"))
      $f->left = $this->parseFormula($formula->leftChild);
    if (property_exists($formula, "rightChild"))
      $f->right = $this->parseFormula($formula->rightChild);

    return $f;
  }
  
}

?>
