//********************************************************************************************************
//Script 		Script tracker 3 - Technology Fee
//Record Types:	ALL
//
//Event: 		FAB and ASA
//
//Desc:			Whenever a fees are assessed, add an 8% technology fee before invoicing
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//			08-09-2018	Chad			Initial Draft
//			08-10-2018	Chad			Adding Lookup Logic
//********************************************************************************************************

function sumFeesAssessedBeforeAndAddTechFee () {
	logDebug("start sumFeesAssessedBeforeAndAddTechFee");

	var checkFeesArr = [], 
		techFeeTotal = 0,
		techFeeAmt = 0;
		
	checkFeesArr = loadFees();
	
	logDebug("printing check fees array -----------");
	for (var x in checkFeesArr) {
		printObjProperties(checkFeesArr[x]);
		
		// here is where we check the fee schedule and fee code and add to our own techFeeTotal
		var iFeeAmt = null, iFeeSched = null, iFeeItem = null;
		
		iFeeAmt = checkFeesArr[x].amount;
		iFeeItem = checkFeesArr[x].code;
		iFeeSched = checkFeesArr[x].sched;
		
		// build the look up search, first the "all schedule"
		// if found, skip adding the fee.
			var lookupString = iFeeSched + "|*";		
			logDebug("lookupString = " + lookupString);

			var lookupValue = lookup("TechnologyFeeIgnoredFees", lookupString);
			logDebug("lookupValue = " + lookupValue);	

			if (lookupValue) { logDebug("Ignore fee, "+lookupString+" in TechnologyFeeIgnoredFees standard choice"); continue; }
		
		// build the item look up search
		// if found, skip adding the fee.
			var lookupString = iFeeSched + "|" + iFeeItem;		
			logDebug("lookupString = " + lookupString);

			var lookupValue = lookup("TechnologyFeeIgnoredFees", lookupString);
			logDebug("lookupValue = " + lookupValue);	

			if (lookupValue) { logDebug("Ignore fee, "+lookupString+" in TechnologyFeeIgnoredFees standard choice"); continue; }
		
			techFeeTotal += iFeeAmt;
		
	}
	comment("<font color=red><b>TECH FEE TOTAL = "+techFeeTotal+"</b></font>");
	
	if (techFeeTotal > 0) {
		techFeeAmt = Number(techFeeTotal * .08).toFixed(2);

		logDebug("Calculated Tech Fee is :"+techFeeAmt);
		
	} else { logDebug("no tech fee added"); }
	
	logDebug("end sumFeesAssessedBeforeAndAddTechFee");
}
