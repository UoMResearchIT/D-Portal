//create a nodejs or clientjs module
if(typeof required === "undefined") { required={}; }
var iati_cook=exports;
if(typeof iati_cook  === "undefined") { iati_cook ={}; }
required["iati_cook"]=iati_cook;

var util=require('util');

var iati_xml=require('./iati_xml');
var refry=require('./refry');
var exs=require('./exs');

var ls=function(a) { console.log(util.inspect(a,{depth:null})); }


// cook the data inside this activity
// make sure that all default values are copied into the places they should be applied
// some values are also unified if it makes sense, eg planed/actual dates are diplicated to the other if only one exists
// and end dates are added if only a start date is given
// some blank tags are added so you can be sure that a given tag always exists in each activity
// some codes are expanded into text in the tag contents
// finally sort the tag order for easy display by CSS
//
// After being cooked this activity is then easier to deal with than a raw one
iati_cook.activity=function(act)
{
	var activity_date={};
	refry.tags(act,"activity-date",function(it){
		activity_date[it.type]=it
	});
	
// if we have any actifity dates, then force a start-actual to something
	if( ! activity_date["start-actual"] )
	{
		var d;
		if( activity_date["end-planned"]    ) { d=activity_date["end-planned"]["iso-date"]; }
		if( activity_date["end-actual"]     ) { d=activity_date["end-actual"]["iso-date"]; }
		if( activity_date["start-planned"]  ) { d=activity_date["start-planned"]["iso-date"]; }
		if(d)
		{
			act[1].push({0:"activity-date","type":"start-actual","iso-date":d});
		}
	}

// if we have any activity dates, then force an end-actual to something
	if( ! activity_date["end-actual"] )
	{
		var d;
		if( activity_date["start-planned"]		) { d=activity_date["start-planned"]["iso-date"]; }
		if( activity_date["start-actual"]		) { d=activity_date["start-actual"]["iso-date"]; }
		if( activity_date["end-planned"]		) { d=activity_date["end-planned"]["iso-date"]; }
		if(d)
		{
			act[1].push({0:"activity-date","type":"end-actual","iso-date":d});
		}
	}
// from now on we can ignore start-planned and end-planned and just use start-actual end-actual
// if you care about this then go back to the original XML data...


// force a currency attr on all values
	refry.tags(act,"value",function(it){
		it.currency = ( it.currency || act["default-currency"] || "USD" ).toUpperCase() ;
	});

//


	refry.tags(act,"transaction",function(it){iati_cook.transaction(act,it);});
	refry.tags(act,"budget",function(it){iati_cook.budget(act,it);});
	refry.tags(act,"planned-disbursement",function(it){iati_cook.budget(act,it);});
}

iati_cook.transaction=function(act,it)
{
}

// this function also cooks planned_transactions as they seem to be the same
iati_cook.budget=function(act,it)
{
}
