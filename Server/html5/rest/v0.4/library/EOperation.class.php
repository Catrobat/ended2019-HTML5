<?php

//this enumerable is used to specify set/change to include both (e.g. setVariable and changeVariableBy) bricks in one model and DTO
  abstract class EOperation {
    const NOT_SET = 0;  //default
    const SET = 1;
    const CHANGE = 2;
  }
