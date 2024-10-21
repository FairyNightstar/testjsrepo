
//import libs
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('node:path');

//connect to local file
var myFile = "C:\\Games\\js2\\GDTest.xlsx";
console.log(path.dirname(myFile));
const workbook = XLSX.readFile("C:\\Games\\js2\\GDTest.xlsx", {type:'binary',cellText:false,cellDates:true});
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

//cut table by region
const CIS_data = XLSX.utils.sheet_to_json(worksheet, { raw:false,dateNF:'mm/dd/yyyy'});
const EU_data = XLSX.utils.sheet_to_json(worksheet, { raw:false,dateNF:'mm/dd/yyyy'});
const UK_data = XLSX.utils.sheet_to_json(worksheet, { raw:false,dateNF:'mm/dd/yyyy'});
const CIS_data_filtered = CIS_data.map(function(x) { return {Date:x.Date, Event:x.CIS}; })
const EU_data_filtered = EU_data.map(function(x) { return {Date:x.Date, Event:x.EU}; })
const UK_data_filtered = UK_data.map(function(x) { return {Date:x.Date, Event:x.UK}; })

//regions to periods of a particular event, base function
function checkGacha (cutArrayInit, Eventtype) {
let current = [];
const intervals = []


let cutArray = [];
for (let i= 0; i<cutArrayInit.length; i++) {
    if ((cutArrayInit[i].Event !== undefined) && (cutArrayInit[i].Event.includes(Eventtype)) ) {
        cutArray = [...cutArray, cutArrayInit[i]];
    }
}

if (cutArray.length == 0)
  {
    return;
  }
if ((cutArray[0].Event !== undefined) && (cutArray[0].Event.includes(Eventtype)))
{
current = { start_date: cutArray[0].Date }
intervals.push(current)
}

for (let i = 1; i < cutArray.length; i += 1) {
    var curd = new Date(Date.parse(cutArray[i].Date));
    var prevd = new Date(Date.parse(cutArray[i - 1].Date));
    prevd.setDate(prevd.getDate() + 1);
  if ((curd.getTime() == prevd.getTime()) && (cutArray[i].Event !== undefined) && (cutArray[i].Event.includes(Eventtype)))  {
    current.end_date = cutArray[i].Date
    current.balance = Eventtype
  } 
  else {
    if ((cutArray[i].Event !== undefined) && (cutArray[i].Event.includes(Eventtype))){
    current = { start_date: cutArray[i].Date }
    current.end_date = cutArray[i].Date
    current.balance = Eventtype
    intervals.push(current)
    }
  }
}

  return intervals

}

//call period function for every event and region
var CISresult = []
let current = [];
current = checkGacha(CIS_data_filtered, "Gacha_Base")
CISresult.push(current)
current = checkGacha(CIS_data_filtered, "Gacha_Rare")
CISresult.push(current)
current = checkGacha(CIS_data_filtered, "RouletteBase")
CISresult.push(current)
current = checkGacha(CIS_data_filtered, "RouletteEpic")
CISresult.push(current)
CISresult = CISresult.filter(Boolean);


var EUresult = []
current = checkGacha(EU_data_filtered, "Gacha_Base")
EUresult.push(current)
current = checkGacha(EU_data_filtered, "Gacha_Rare")
EUresult.push(current)
current = checkGacha(EU_data_filtered, "RouletteBase")
EUresult.push(current)
current = checkGacha(EU_data_filtered, "RouletteEpic")
EUresult.push(current)
EUresult = EUresult.filter(Boolean);


var UKresult = []
current = checkGacha(UK_data_filtered, "Gacha_Base")
UKresult.push(current)
current = checkGacha(UK_data_filtered, "Gacha_Rare")
UKresult.push(current)
current = checkGacha(UK_data_filtered, "RouletteBase")
UKresult.push(current)
current = checkGacha(UK_data_filtered, "RouletteEpic")
UKresult.push(current)
UKresult = UKresult.filter(Boolean);


var Totresult ={CIS_Balance: CISresult.flat(), EU_Balance: EUresult.flat(), UK_Balance: UKresult.flat()}
console.log(JSON.stringify(Totresult, null, '\t'))
