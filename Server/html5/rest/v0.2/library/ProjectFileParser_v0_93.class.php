<?php

require_once __DIR__ . DIRECTORY_SEPARATOR . "ProjectFileParser.class.php";

class ProjectFileParser_v0_93 extends ProjectFileParser
{
    public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml)
    {
        parent::__construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml);
    }

    protected function getName($script)
    {
        return (string)$script["name"];
    }

    protected function getBrickType($script)
    {
        return (string)$script["type"];
    }

    protected function includeGlobalData()
    {
        $vars = $this->simpleXml->variables;
        array_push($this->cpp, $vars);
        array_push($this->cpp, $vars->programVariableList);

        foreach($vars->programVariableList->children() as $userVar)
        {
            $userVar = $this->getObject($userVar, $this->cpp);
            array_push($this->variables, new IdNameDto($this->getNewId(), (string)$userVar));
        }

        array_pop($this->cpp);
        array_pop($this->cpp);
    }

    protected function parseRepeatBrickScript($script)
    {
        $ttr = $script->formulaList;
        array_push($this->cpp, $ttr);
        $brick = new RepeatBrickDto($this->parseFormula($ttr->formula));
        array_pop($this->cpp);
        return $brick;
    }

    protected function parseIfLogicBeginBrickScript($script)
    {
        $condition = $script->formulaList;
        array_push($this->cpp, $condition);
        $brick = new IfThenElseBrickDto($this->parseFormula($condition->formula));
        array_pop($this->cpp);
        return $brick;
    }

    protected function parseControlBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "WaitBrick":
                $duration = $script->formulaList;
                array_push($this->cpp, $duration);
                $brick = new WaitBrickDto($this->parseFormula($duration->formula));
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

            case "NoteBrick":
                $brick = new NoteBrickDto((string)$script->note);
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
                    else
                    {
                        if($cat === "Y_POSITION")
                        {
                            $y = $this->parseFormula($formula);
                        }
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

            case "Vibration":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $duration = $this->parseFormula($fl->formula);
                array_pop($this->cpp);
                $brick = new VibrationBrickDto($duration);
                break;

            case "PointToBrick":
                if(property_exists($script, "pointedObject"))
                {
                    //type of Sprite = <object />
                    $pointedTo = $this->getObject($script->pointedObject, $this->cpp);
                    $name = $this->getName($pointedTo);

                    //detect id by object name (unique): all sprites are already pre-parsed with id and name
                    foreach($this->sprites as $s)
                    {
                        if($s->name === $name)
                        {
                            $spriteId = $s->id;
                            break;
                        }
                    }
                }
                else
                {
                    $spriteId = null;
                }

                /** @noinspection PhpUndefinedVariableInspection */
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
                    else
                    {
                        if($cat === "Y_DESTINATION")
                        {
                            $yDestination = $this->parseFormula($formula);
                        }
                        else
                        {
                            if($cat === "DURATION_IN_SECONDS")
                            {
                                $duration = $this->parseFormula($formula);
                            }
                        }
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
                if(!property_exists($script, "sound"))
                {
                    //play sound brick is initial set to "New.." and has no child tags per default
                    $brick = new PlaySoundBrickDto(null);
                    break;
                }

                $sound = $this->getObject($script->sound, $this->cpp);
                $res = $this->findItemInArrayByUrl("sounds/" . (string)$sound->fileName, $this->sounds, true);

                if($res === false)	//will only return false on invalid projects, as resources are registered already
                    throw new InvalidProjectFileException("sound file '" . (string)$sound->fileName . "' does not exist");

                $id = $res->id;
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
                $brick = new SpeakBrickDto($this->parseFormula($fl->formula));
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
            case "SetLookBrick":
                if(!property_exists($script, "look"))
                {
                    // when no look set, look => empty
                    $brick = new SetLookBrickDto(null);
                    break;
                }

                $look = $this->getObject($script->look, $this->cpp);
                $res = $this->findItemInArrayByUrl("images/" . (string)$look->fileName, $this->images, true);

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
                $id = $lookObject->id;
                $brick = new SetLookBrickDto($id);
                break;

            case "NextLookBrick":
                $brick = new NextLookBrickDto();
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

            case "SetTransparencyBrick":    /*name changed*/
            case "SetGhostEffectBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $transparency = $fl->formula;
                $brick = new SetTransparencyBrickDto($this->parseFormula($transparency));
                array_pop($this->cpp);
                break;

            case "ChangeTransparencyByNBrick":    /*name changed*/
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
                $brick = new FlashBrickDto("0");
                break;

            case "LedOnBrick":
                $brick = new FlashBrickDto("1");
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

            default:
                return false;
        }
        return $brick;
    }
}
