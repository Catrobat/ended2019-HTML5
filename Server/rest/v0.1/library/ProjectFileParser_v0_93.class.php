<?php

class ProjectFileParser_v0_93 extends ProjectFileParser {

    
  public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml) {
    parent::__construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml);
  
  }

  protected function getName($script) {
    return (string)$script["name"];
  }

  protected function getBrickName($script) {
    return (string)$script["type"];
  }
  

  protected function includeGlobalVariables() {
    
    $vars = $this->simpleXml->variables;
    array_push($this->cpp, $vars);
    array_push($this->cpp, $vars->programVariableList);
      
    foreach($vars->programVariableList->children() as $userVar) {
      /*Test$userVar = $vars->programVariableList->children()[0];*/
      $userVar = $this->getObject($userVar, $this->cpp);
      array_push($this->variables, new VariableDto($this->getNewId(), (string)$userVar));
    }
      
    array_pop($this->cpp);
    array_pop($this->cpp);
            
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
						$ttr = $script->formulaList;
						array_push($this->cpp, $ttr);
						$brick = new RepeatBrickDto($this->parseFormula($ttr->formula));
						array_pop($this->cpp);
						
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
						$condition = $script->formulaList;
						array_push($this->cpp, $condition);
						$brick = new IfThenElseBrickDto($this->parseFormula($condition->formula));
						array_pop($this->cpp);
						
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
					$duration = $script->formulaList;
					array_push($this->cpp, $duration);
					$brick = new WaitBrickDto($this->parseFormula($duration->formula));
					array_pop($this->cpp);
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
					$x = null; 
					$y = null;
					$fl = $script->formulaList;
					array_push($this->cpp, $fl);
					foreach($fl->children() as $formula) {
						$cat = (string)$formula["category"];
						if ($cat === "X_POSITION")
							$x = $this->parseFormula($formula);
						else if ($cat === "Y_POSITION")
							$y = $this->parseFormula($formula);
					}
					array_pop($this->cpp);
					$brick = new PlaceAtBrickDto($x, $y);
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
					
				case "IfOnEdgeBounceBrick":
					$brick = new IfOnEdgeBounceBrickDto();
					break;
					
				case "MoveNStepsBrick":
					$fl = $script->formulaList;
					array_push($this->cpp, $fl);
					$steps = $this->parseFormula($fl->formula);
					array_pop($this->cpp);
					$brick = new ChangeYBrickDto($steps);
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
					$brick = new PointInDirectionBrickDto($degrees);
					break;

        case "Vibration":
          $fl = $script->formulaList;
          array_push($this->cpp, $fl);
          $duration = $this->parseFormula($fl->formula);
          array_pop($this->cpp);
          $brick = new VibrationBrickDto($duration);
          break;
					
				case "PointToBrick":
				if (property_exists($script, "pointedObject")) {
						$pointedTo = $this->getObject($script->pointedObject, $this->cpp);  //type of Sprite = <object />
						$name = $this->getName($pointedTo);
						//detect id by object name (unique): all spritees are already pre-parsed with id and name
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
					$duration = null; 
					$xDestination = null;
					$yDestination = null;
					
					$fl = $script->formulaList;
					array_push($this->cpp, $fl);
					foreach($fl->children() as $formula) {
						$cat = (string)$formula["category"];
						if ($cat === "X_DESTINATION")
							$xDestination = $this->parseFormula($formula);
						else if ($cat === "Y_DESTINATION")
							$yDestination = $this->parseFormula($formula);
						else if ($cat === "DURATION_IN_SECONDS")
							$duration = $this->parseFormula($formula);
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
								
				
				/*sound bricks*/
				case "PlaySoundBrick":
					$id = null;
					if (property_exists($script, "sound")) {   //play sound brick is initial set to "New.." and has no child tags per default
						$sound = $this->getObject($script->sound, $this->cpp);
						
						$res = $this->findResourceInArray("sounds/" . (string)$sound->fileName, $this->sounds);
						$id = $res->id;
					}
					$brick = new PlaySoundBrickDto($id);
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
					/*$text = (string)$script->formulaList->formula->value;
					$fileName = md5($text).".mp3";
					//speak mp3 preloading
					$res = $this->findResourceInArray("tts/" . $fileName, $this->sounds); //= false, if not found
					if($res === false) {
						$id = $this->getNewId();
						array_push($this->sounds, new ResourceDto($id, "tts/" . $fileName));
					}
					else 
						$id = $res->id;
					
					$this->tts->loadSoundFile($text);*/
					$brick = new SpeakBrickDto($this->parseFormula($fl->formula));
					array_pop($this->cpp);
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
					$fl = $script->formulaList;
					array_push($this->cpp, $fl);
					$size = $fl->formula;
					$brick = new SetSizeToBrickDto($this->parseFormula($size));
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
				
				case "SetGhostEffectBrick":
					$fl = $script->formulaList;
					array_push($this->cpp, $fl);
					$transparency = $fl->formula;
					$brick = new SetTransparencyBrickDto($this->parseFormula($transparency));
					array_pop($this->cpp);
					break;
				
				case "ChangeGhostEffectByNBrick":
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
				
				case "ClearGraphicEffectBrick":
					$brick = new ClearGraphicEffectBrickDto();
					break;

        case "LedOffBrick":
          $brick = new LedOffBrickDto();
          break;

        case "LedOnBrick":
          $brick = new LedOnBrickDto();
          break;

				/*variable bricks*/
				case "SetVariableBrick":
					$var = $this->getObject($script->userVariable, $this->cpp); //variable definition
					$id = $this->getVariableId((string)$var);
					
					$fl = $script->formulaList;
					array_push($this->cpp, $fl);
					$brick = new SetVariableBrickDto($id, $this->parseFormula($fl->formula));
					array_pop($this->cpp);
					break;
				
				case "ChangeVariableBrick":
					$var = $this->getObject($script->userVariable, $this->cpp); //variable definition
					$id = $this->getVariableId((string)$var);
					
					$fl = $script->formulaList;
					array_push($this->cpp, $fl);
					$brick = new ChangeVariableBrickDto($id, $this->parseFormula($fl->formula));
					array_pop($this->cpp);
					break;
				
				/*default: return xml to verify which brick implementation is missing without generating a parser error*/
				default:
					$brick = new UnsupportedBrickDto($script->asXML(), (string)$script["type"]);
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
    
}

?>