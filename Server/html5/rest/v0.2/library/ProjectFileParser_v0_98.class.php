<?php

require_once __DIR__ . DIRECTORY_SEPARATOR . "ProjectFileParser_v0_94.class.php";

class ProjectFileParser_v0_98 extends ProjectFileParser_v0_94
{

    public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml)
    {
        parent::__construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml);
    }

    protected function parseForeverBrick($brickList, $idx)
    {
        $brick = new ForeverBrickDto();
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
        $ttr = $script->timesToRepeat;
        $brick = new RepeatBrickDto($this->parseFormula($ttr->formulaTree));

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
        $brick = new RepeatUntilBrickDto($this->parseFormula($condition->formula));
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

    protected function parseIfThenLogicBeginBrick($brickList, $idx)
    {
        $script = $brickList[$idx];
        $condition = $script->formulaList;
        array_push($this->cpp, $condition);
        $brick = new IfThenElseBrickDto($this->parseFormula($condition->formula), false);
        array_pop($this->cpp);

        $nestedCounter = 0;
        $parsed = false;

        //search for associated end brick
        $innerIfBricks = [];
        $inElse = false;
        while($idx < count($brickList) - 1)
        {
            //skip begin brick
            $idx++;

            $name = $this->getBrickType($brickList[$idx]);
            if($name === "IfThenLogicBeginBrick")
            {
                $nestedCounter++;
            }
            else if($name === "IfThenLogicEndBrick")
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
                    $brick = $this->getBrickType($script);
                    throw new InvalidProjectFileException($brick . ": referenced brick");
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
                        $result = $this->parseIfThenLogicBeginBrick($brickList, $idx);
                        array_push($bricks, $result["brick"]);
                        $idx = $result["idx"];
                        break;

                    case "IfLogicBeginBrick":
                        $result = $this->parseIfLogicBeginBrick($brickList, $idx);
                        array_push($bricks, $result["brick"]);
                        $idx = $result["idx"];
                        break;

                    default:
                        array_push($bricks, $this->parseScript($script));
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

    protected function parseFirstLevelBricks($brickType, $script)
    {
        switch($brickType)
        {
            case "StartScript":
                $brick = new WhenProgramStartBrickDto($this->getNewId());
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            case "BroadcastScript":
                $msg = (string)$script->receivedMessage;
                $res = $this->findItemInArrayByName($msg, $this->broadcasts);
                if($res === false)
                {
                    $id = $this->getNewId();
                    array_push($this->broadcasts, new VariableDto($id, $msg));
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

            case "WhenScript":
                $brick = new WhenActionBrickDto($this->getNewId(), (string)$script->action);
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            case "WhenTouchDownScript":
                $brick = new WhenActionBrickDto($this->getNewId(), "TouchStart");
                $brickList = $script->brickList;
                array_push($this->cpp, $brickList);

                $this->bricksCount += count($brickList->children()) + 1;
                $brick->bricks = $this->parseInnerBricks($brickList->children());

                array_pop($this->cpp);
                break;

            //physics
            case "CollisionScript":
                $msg = (string)$script->receivedMessage;
                $items = explode("<->", $msg);
                $name = $items[1];
                //$brick;
                if ($name == "ANYTHING")
                    $brick = new WhenCollisionBrickDto($this->getNewId());
                else if ($name == "Background")
                    $brick = new WhenCollisionBrickDto($this->getNewId(), $this->background->id);
                else {
                    //find sprite by name
                    for($i = 0; $i < count($this->sprites); $i++)
                    {
                        if($this->sprites[$i]->name == $name)
                        {
                            $id = $this->sprites[$i]->id;
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

            default:
                return false;
        }
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
                    array_push($this->broadcasts, new VariableDto($id, $msg));
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
                    array_push($this->broadcasts, new VariableDto($id, $msg));
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

            case "WaitUntilBrick":
                $condition = $script->formulaList;
                array_push($this->cpp, $condition);
                $brick = new WaitUntilBrickDto($this->parseFormula($condition->formula));
                array_pop($this->cpp);
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

            case "SetRotationStyleBrick":
                $brick = new SetRotationStyleBrickDto();
                TODO: $brick->selected = (string)$script->selection;
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
                $brick = new PointInDirectionBrickDto($degrees);
                break;

            case "VibrationBrick":    /*name changed?*/
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
                $brick = new PointToBrickDto($spriteId);
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
                    else
                    {
                        if($cat === "PHYSICS_VELOCITY_Y")
                        {
                            $y = $this->parseFormula($formula);
                        }
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
                $brick = new TurnLeftSpeedBrickDto($value);
                break;

            case "TurnRightSpeedBrick":
                $fl = $script->formulaList;
                array_push($this->cpp, $fl);
                $value = $this->parseFormula($fl->formula);

                $brick = new TurnRightSpeedBrickDto($value);
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
                    else
                    {
                        if($cat === "PHYSICS_GRAVITY_Y")
                        {
                            $y = $this->parseFormula($formula);
                        }
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

            case "FlashBrick":    /*name changed*/
                $brick = new FlashBrickDto();   //spinnerSelectionID = 0/1 (off/on)
                $brick->selected = (string)$script->spinnerSelectionID;
                break;

            // case "LedOnBrick":    /*name changed*/
            // $brick = new LedOnBrickDto();
            // break;

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
}

