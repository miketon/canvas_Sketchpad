function onOpen() {
  var ss          = SpreadsheetApp.getActiveSpreadsheet();
  var menuEntries = [ { name: "stringToFloat", functionName: "stringToFloat" } ,
                      { name: "chartData", functionName: "chartData"         } ];
  ss.addMenu("mtonFunc", menuEntries);
}

function stringToFloat(){
  var ss      = SpreadsheetApp.getActiveSpreadsheet() ;
  var sheet   = ss.getActiveSheet()                   ;
  var doc     = getDocInfo(sheet, true)               ;
  
  for(var i=doc.colInit; i<=doc.colLast; i++){
    for(var j=doc.rowInit; j<=doc.rowLast; j++){
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
  var ss      = SpreadsheetApp.getActiveSpreadsheet() ;
  var sheet   = ss.getActiveSheet()                   ;
  // Browser.msgBox("chartingData Here:")             ;
  var data = Charts.newDataTable()
  .addColumn(Charts.ColumnType.STRING, "Month")
  .addColumn(Charts.ColumnType.NUMBER, "In Store")
  .addColumn(Charts.ColumnType.NUMBER, "Online")
  .addRow(["January", 10, 1])
  .addRow(["February", 12, 1])
  .addRow(["March", 20, 2])
  .addRow(["April", 25, 3])
  .addRow(["May", 30, 4])
  .build();

  var chart = Charts.newBarChart()
  .setDataTable(data)
  .setStacked()
  .setRange(0, 40)
  .setTitle("Sales per Month")
  .build();

  var uiApp = UiApp.createApplication().setTitle("Mton Chart") ;
  //uiApp.setHeight(500)                                       ;
  uiApp.add(chart)                                             ;
  ss.show(uiApp)                                               ;
}

function getDocInfo(sheet, sel){
  var activeC = sheet.getDataRange();
  if(sel==true){
    activeC = sheet.getActiveSelection();
  }
  var docInfo = {rowInit:'', rowLast:'', colInit:'', colLast:''};
  docInfo.rowInit = activeC.getRow();
  docInfo.rowLast = activeC.getLastRow();
  docInfo.colInit = activeC.getColumn();
  docInfo.colLast = activeC.getLastColumn();

  // Browser.msgBox('getDocInfo: '+docInfo.rowInit+docInfo.rowLast+docInfo.colInit+docInfo.colLast);
  return docInfo;
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
