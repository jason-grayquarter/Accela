// WTUA:Building/*/*/*

/* following block of code was in Accela but not Github... it was added by "ADMIN" 12-22-2016
if (wfTask == "Permit Issuance" && wfStatus == "Issued")
editAppSpecific("Permit Issued Date", sysDateMMDDYYYY);
if (wfTask == "Permit Issuance" && wfStatus == "Issued")
editAppSpecific("Permit Expiration Date", dateAdd(null, 180));
if (wfTask == "Permit Status" && wfStatus == "Permit Issued")
editAppSpecific("Permit Issued Date", sysDateMMDDYYYY);
if (wfTask == "Permit Status" && wfStatus == "Permit Issued")
editAppSpecific("Permit Expiration Date", dateAdd(null, 180));
if (wfTask == "Permit Issuance" && wfStatus == "Issued")
licEditExpInfo(null, AInfo["Permit Expiration Date"]);
if (wfTask == "Permit Status" && wfStatus == "Permit Issued")
licEditExpInfo(null, AInfo["Permit Expiration Date"]);
// end ADMIN code
*/
//script205_DeactivateSpecInsp();

//Script 202 - Auto create inspections for Building
/*------------------------------------------------------------------------------------------------------/
| Purpose		: Auto create inspections for building
| Notes			: Assumed the following mapping (between the approved wftask & the inspection type to be scheduled):
			 wfTask :Electrical Plan Review/ InspTypes : Electrical Final,Electrical Rough
                         wfTask :Mechanical Plan Review/ InspTypes : :Mechanical Final,:Mechanical Rough
                         wfTask :Plumbing Plan Review/ InspTypes : Plumbing Final,Plumbing Rough
                         wfTask :Structural Plan Review/ InspTypes : Framing Final,Framing Rough
| Created by	: ISRAA
| Created at	: 01/02/2018 16:19:04
|
/------------------------------------------------------------------------------------------------------*/

//**********************************************************************************
//* updates made 6/5 for automation of BLD conditions creation for plan review tasks
//* EK
createConditionForPlanReview();

//**********************************************************************************

logDebug("WTUB;Building/*/*/* ------------------------>> Status check on Event flow");
include("5074_Building_WF_Accept_Plans_Withdrawn");

if (wfTask == "Permit Issuance" && wfStatus == "Issued") {
	var tasksToCheck = [ "Mechanical Plan Review", "Electrical Plan Review", "Plumbing Plan Review", "Structural Plan Review" ];
	createAutoInspection(tasksToCheck);
}

// Script #205

if (wfTask == "Permit Issuance" && wfStatus == "Issued") {
	if(AInfo["Special Inspections"] != "Yes")
	{
		deactivateTask("Special Inspections Check","BLD_NEWCON_INSPSUB");
		deactivateTask("Special Inspections Check","BLD_MASTER_INSPSUB");
	}

	if(!isTaskStatus("Engineering Review","Approved with FEMA Cert Required"))
	{
		deactivateTask("FEMA Elevation Certification","BLD_NEWCON_INSPSUB");
		deactivateTask("FEMA Elevation Certification","BLD_MASTER_INSPSUB");
	}
	
	if(!isTaskStatus("Waste Water Review","Approved Inspection Required"))
	{
		deactivateTask("Waste Water","BLD_NEWCON_INSPSUB");
		deactivateTask("Waste Water","BLD_MASTER_INSPSUB");
	}

}

if(isTaskActive("Subtasks Complete","BLD_NEWCON_INSPSUB")&& allTasksComplete("BLD_NEWCON_INSPSUB","Subtasks Complete"))
{
    closeTask("Subtasks Complete","Complete","","", "BLD_NEWCON_INSPSUB")
}

// Script#206
if(isTaskActive("Subtasks Complete","BLD_MASTER_INSPSUB") && allTasksComplete("BLD_MASTER_INSPSUB","Subtasks Complete"))
{
	closeTask("Subtasks Complete","Complete","","", "BLD_MASTER_INSPSUB")
}

/**ACCELA CIVIC PLATFORM TO CRM SCRIPTING LOGIC 
 * Workflow automation for all Building Records 
 * @namespace WTUA:Building///
 * @requires INCLUDES_CRM
 */

//Retreive Enterprise CRM Function File 
eval(getScriptText("INCLUDES_CRM", null, false));

//logDebug("*** BEGIN process_WF_JSON_Rules for CRM (Building) ***");
// execute workflow propagation rules
//process_WF_JSON_Rules(capId, wfTask, wfStatus);
//logDebug("*** FINISH process_WF_JSON_Rules for CRM (Building) ***");

//Retreive Custom CRM Logic File
//includesCrmCustomWorkflowRules();


//Added by Gray Quarter ZenDesk #634
//START Santa Barbara Sharepoint #266
//Auto Run and attach report to record and send email notification
    if (wfTask == "Plans Coordination" && wfStatus == "Corrections Required") {
        logDebug("Correction Required");
        var toEmail = [];
        var vChangeReportName = "Review (Plan Review Distribution Count) Corrections";
        var capContactResult = aa.people.getCapContactByCapID(capId);

        if (capContactResult.getSuccess()) {
            var Contacts = capContactResult.getOutput();
            for (yy in Contacts)
                if (Contacts[yy].getEmail() != null)
                    toEmail.push("" + Contacts[yy].getEmail());

            if (toEmail.length > 0) {
                logDebug("Successfully found emails : " + toEmail);
                var fromEmail = lookup("SCRIPT_EMAIL_FROM", "AGENCY_FROM");
                var ccEmail = ""; //blank for now
                var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());
                var emailParameters = aa.util.newHashtable();
                var notificationTemplate = "BLD PLAN CHECK CORRECTIONS";
                var vFileArray = []; // empty set for the file list

                //
                var reportTemplate = "BLD Plan Check Corrections"; // needs editing
                var vRParams = aa.util.newHashtable();
                addParameter(vRParams, "PermitNum", capId.getCustomID());
                if (AInfo["Plan Review Distribution Count"] == "1") {
                    addParameter(vRParams, "Condition_Type", "1st Review");
                }
                if (AInfo["Plan Review Distribution Count"] == "2") {
                    addParameter(vRParams, "Condition_Type", "2nd Review");
                }
                if (AInfo["Plan Review Distribution Count"] == "3") {
                    addParameter(vRParams, "Condition_Type", "3rd Review");
                }
                if (AInfo["Plan Review Distribution Count"] == "4") {
                    addParameter(vRParams, "Condition_Type", "4th Review");
                }
                if (AInfo["Plan Review Distribution Count"] == "5") {
                    addParameter(vRParams, "Condition_Type", "5th Review");
                }
                if (AInfo["Plan Review Distribution Count"] == "6") {
                    addParameter(vRParams, "Condition_Type", "6th Review");
                }
                if (AInfo["Plan Review Distribution Count"] == "7") {
                    addParameter(vRParams, "Condition_Type", "7th Review");
                }
                if (AInfo["Plan Review Distribution Count"] == "8") {
                    addParameter(vRParams, "Condition_Type", "8th Review");
                }

                //
                // do report stuff JHS
                //Generate report and get report name
                vReportName = false;
                if (reportTemplate != '' && reportTemplate != null) {
                    logDebug("in the report template if statement" + vRParams);
                    //generate and get report file
                    vReportName = generateReportForASyncEmail(capId, reportTemplate, "Building", vRParams);

                    //update the report name if one was provided. this will be used to update the saved report's name
                    if (vReportName != false && vChangeReportName != null && vChangeReportName != "") {
                        vReportNameString = vReportName + "";
                        vExtStart = vReportNameString.indexOf(".");
                        if (vExtStart != -1) {
                            vFileExtension = vReportNameString.substr(vExtStart, vReportNameString.length);
                            vChangeReportName = vChangeReportName + vFileExtension;
                        }

                        if (editDocumentName(vReportName, vChangeReportName) == true) {
                            vReportName = vChangeReportName;
                        }
                    }
                }

                //Get document file for email
                if (vReportName != null && vReportName != false) {
                    logDebug("in the report document list if statement");
                    vDocumentList = aa.document.getDocumentListByEntity(capId, "CAP");
                    if (vDocumentList != null) {
                        vDocumentList = vDocumentList.getOutput();
                    }
                }

                if (vDocumentList != null) {
                    for (y = 0; y < vDocumentList.size(); y++) {
                        vDocumentModel = vDocumentList.get(y);
                        vDocumentName = vDocumentModel.getFileName();
                        if (vDocumentName == vReportName) {
                            vDownloadResult = aa.document.downloadFile2Disk(vDocumentModel, vDocumentModel.getModuleName(), null, null, true);
                            if (vDownloadResult.getSuccess()) {
                                vFile = vDownloadResult.getOutput();
                                if (vFile != null && vFile != false && vFile != "") {
                                    vFileArray.push(vFile);
                                }
                            }
                            break;
                        }
                    }
                }

                // end report stuff

                addParameter(emailParameters, "$$altID$$", cap.getCapModel().getAltID());
                addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
                // send Notification
                var sendResult = sendNotification(fromEmail, toEmail.join(","), ccEmail, notificationTemplate, emailParameters, vFileArray, capID4Email);
                if (!sendResult) {
                    logDebug("UNABLE TO SEND NOTICE!  ERROR: " + sendResult);
                } else {
                    logDebug("Sent Notification");
                }

            } else
                logDebug("Couldn't send email to, no valid email address");
			//Update workflow
		//	if (wfTask == "Plans Coordination" && wfStatus == "Corrections Required") {
		//		resultWorkflowTask("Plans Coordination","Returned to Applicant","Auto Updated by Script","Auto Updated by Script");
		//		} 
	
        }
    }

function generateReportForASyncEmail(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var vAltId;
    var user = currentUserID; // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    var permit;
    var reportResult;
    var reportOutput;
    var vReportName;
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap);
    report.setReportParameters(parameters);

    vAltId = itemCap.getCustomID();
    report.getEDMSEntityIdModel().setAltId(vAltId);

    permit = aa.reportManager.hasPermission(reportName, user);
    if (permit.getOutput().booleanValue()) {
        reportResult = aa.reportManager.getReportResult(report);
        if (!reportResult.getSuccess()) {
            logDebug("System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        } else {
            reportOutput = reportResult.getOutput();
            vReportName = reportOutput.getName();
            logDebug("Report " + vReportName + " generated for record " + itemCap.getCustomID() + ". " + parameters);
            return vReportName;
        }
    } else {
        logDebug("Permissions are not set for report " + reportName + ".");
        return false;
    }
}

//Edit document name locally
function editDocumentName(vOrgDocumentName, vNewDocumentName) {
	var vDocumentList;
	var y;
	var vDocumentModel;
	var vDocumentName;
	var vSaveResult;
	
	vDocumentList = aa.document.getDocumentListByEntity(capId, "CAP");
	if (vDocumentList != null) {
		vDocumentList = vDocumentList.getOutput();
	}
	else {
		return false;
	}

	if (vDocumentList != null) {
		for (y = 0; y < vDocumentList.size(); y++) {
			vDocumentModel = vDocumentList.get(y);
			vDocumentName = vDocumentModel.getFileName();
			logDebug("Doc Name: " + vDocumentName);
			if (vDocumentName == vOrgDocumentName) {
				//edit document name in accela
				vDocumentModel.setFileName(vNewDocumentName);
				vSaveResult = aa.document.updateDocument(vDocumentModel);
				if (vSaveResult.getSuccess()) {
					logDebug("Renamed document " + vDocumentName + " to " + vNewDocumentName);					
					return true;
				} else {
					logDebug("Failed to update document name");
					logDebug("Error: " + vSaveResult.getErrorMessage());
					return false;
				}
			}
		}
		logDebug("Unable to find existing document match");
	}
	return false;
}
//END Santa Barbara Sharepoint #266	
