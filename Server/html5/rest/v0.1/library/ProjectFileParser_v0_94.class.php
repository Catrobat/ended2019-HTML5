<?php

require_once __DIR__ . DIRECTORY_SEPARATOR . "ProjectFileParser_v0_93.class.php";

class ProjectFileParser_v0_94 extends ProjectFileParser_v0_93
{

  public function __construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml)
  {
    parent::__construct($projectId, $resourceBaseUrl, $cacheDir, $simpleXml);
  }

  protected function includeGlobalData()
  {
    $data = $this->simpleXml->data;
    array_push($this->cpp, $data);

    // parse global lists
    array_push($this->cpp, $data->programListOfLists);
    foreach($data->programListOfLists->children() as $userList)
    {
      $userList = $this->getList($userList);
      array_push($this->lists, new ListDto($this->getNewId(), (string)$userList));
    }
    array_pop($this->cpp);

    // parse global vars
    array_push($this->cpp, $data->programVariableList);
    foreach($data->programVariableList->children() as $userVar)
    {
      $userVar = $this->getObject($userVar, $this->cpp);
      array_push($this->variables, new VariableDto($this->getNewId(), (string)$userVar));
    }
    array_pop($this->cpp);

    array_pop($this->cpp);
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
        array_push($obj->lists, new ListDto($id, $name));

        return $id;
      }
    }

    return $res->id;
  }

  protected function parseDataBricks($brickType, $script)
  {
    switch($brickType)
    {
      case "SetVariableBrick":
        $var = $this->getObject($script->userVariable, $this->cpp);
        $id = $this->getVariableId((string)$var);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new SetVariableBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "ChangeVariableBrick":
        $var = $this->getObject($script->userVariable, $this->cpp);
        $id = $this->getVariableId((string)$var);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new ChangeVariableBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "AddItemToUserListBrick":
        $lst = $this->getList($script->userList);
        $id = $this->getListId((string)$lst);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new AppendToListBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "DeleteItemOfUserListBrick":
        $lst = $this->getList($script->userList);
        $id = $this->getListId((string)$lst);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new DeleteAtListBrickDto($id, $this->parseFormula($fl->formula));
        array_pop($this->cpp);
        break;

      case "InsertItemIntoUserListBrick":
        $lst = $this->getList($script->userList);
        $id = $this->getListId((string)$lst);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new InsertAtListBrickDto($id, $this->parseFormula($fl->formula[0]), $this->parseFormula($fl->formula[1]));
        array_pop($this->cpp);
        break;

      case "ReplaceItemInUserListBrick":
        $lst = $this->getList($script->userList);
        $id = $this->getListId((string)$lst);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new ReplaceAtListBrickDto($id, $this->parseFormula($fl->formula[1]),
                                           $this->parseFormula($fl->formula[0]));
        array_pop($this->cpp);
        break;

      case "ShowTextBrick":
        $var = $this->getObject($script->userVariable, $this->cpp);
        $id = $this->getVariableId((string)$var);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new ShowTextBrickDto($id, $this->parseFormula($fl->formula[1]), $this->parseFormula($fl->formula[0]));
        array_pop($this->cpp);
        break;

      case "HideTextBrick":
        $var = $this->getObject($script->userVariable, $this->cpp);
        $id = $this->getVariableId((string)$var);
        $fl = $script->formulaList;
        array_push($this->cpp, $fl);
        $brick = new HideTextBrickDto($id);
        array_pop($this->cpp);
        break;

      default:
        return false;
    }

    return $brick;
  }

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