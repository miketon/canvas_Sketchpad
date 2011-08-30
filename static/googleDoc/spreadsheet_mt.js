function onOpen() {
  var ss          = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ { name: "stringToFloat", functionName: "stringToFloat" } ,
                      { name: "chartData", functionName: "chartData"         } ];
  ss.addMenu("mtonFunc", menuEntries);
}

function stringToFloat(){
  var ss      = SpreadsheetApp.getActiveSpreadsheet() ;
  var sheet   = ss.getActiveSheet()                   ;
  var curSel  = ss.getActiveSelection()               ;
  var rowInit = curSel.getRow()                       ;
  var rowLast = curSel.getLastRow()                   ;
  var colInit = curSel.getColumn()                    ;
  var colLast = curSel.getLastColumn()                ;

  for(var i = colInit; i<=colLast; i++){
    for(var j = rowInit; j<=rowLast; j++){
      var curEntry = sheet.getRange(j, i);
      if(typeof(curEntry.getValue())!='number'){
        if(!isNaN(parseFloat(curEntry.getValue()))){  //if result is NaN, don't parse
          curEntry.setValue(parseFloat(curEntry.getValue()));
        }
      }
    }
  }
}

function chartData() {
  Browser.msgBox("chartingData Here:");
}

// For Debugging
function selectionLogger() {
  var ss     = SpreadsheetApp.getActiveSpreadsheet()                   ;
  var sheet  = ss.getSheets()[0]                                       ;
  var curSel = ss.getActiveSelection()                                 ;
  //curSel.clear()                                                     ;
  var curVal = curSel.getValues()                                      ;
  Logger.log("CurrVal : " + curVal)                                    ;
  Logger.log("CurrNot : " + curSel.getA1Notation())                    ;
  Logger.log("CurrRow : " + curSel.getNumRows() + curVal.length)       ;
  Logger.log("CurrCol : " + curSel.getNumColumns() + curVal[0].length) ;

  for(var i = 0; i < curVal.length; i++){
    for(var j = 0; j < curVal[0].length; j++){
      Logger.log('Loop: ' + typeof(curVal[i][j]) + curVal[i][j]);
    }
  }
}
