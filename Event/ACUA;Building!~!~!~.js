// ********************************************************************************************************
// Script 		ACUA:Building/~/~/~.js
// Record Types: all
//
// Event: 	ACAA	
//
// Desc:	this script is for app submit global actions
//
// Created By: Silver Lining Solutions
// ********************************************************************************************************
// Change Log
//         		Date		Name		Modification
//				06/18/2018	Eric		Orig
//
// ********************************************************************************************************
logDebug("START of ACUA Building/*/*/* !");

logDebug("******* Condition Info *********************");
logDebug("       Condition Type = " + conditionType);
logDebug("	   Condition Status = " + conditionStatus);
logDebug("Condition Description = " + conditionObj.getConditionDescription());

/* get the condition name and remove everything before the colon */
var lengthDesc = conditionObj.getConditionDescription().length;
var startPos = conditionObj.getConditionDescription().indexOf(":");
logDebug("length = " + lengthDesc);
logDebug("startPos = " + startPos);


var conditionName = conditionObj.getConditionDescription().substr(startPos,lengthDesc-startPos);

var task = lookup("BLD_CONDITION_WFTASK_MAP", conditionName);

printObjProperties(conditionObj);


logDebug("END of ACUA Building/*/*/* !");