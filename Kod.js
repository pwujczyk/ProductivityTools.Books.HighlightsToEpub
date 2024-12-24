function RemoveAllEpubs(bookhighligthsEPubDirectory) {
  while (bookhighligthsEPubDirectory.getFiles().hasNext()) {
    const file = bookhighligthsEPubDirectory.getFiles().next();
    Logger.log('Moving file to trash: ', file.getName());
    //file.setTrashed(true);
    // Delete File
    Drive.Files.remove(file.getId())
  }
}

function createEPubFile(fileId, filename, bookhighligthsEPub) {
  var mimeType = 'application/epub+zip';
  var exportLink = Drive.Files.get(fileId).exportLinks[mimeType];
  const params = { headers: { authorization: `Bearer ${ScriptApp.getOAuthToken()}` } };
  const blob = UrlFetchApp.fetch(exportLink, params).getBlob().setName(`${filename}.epub`);
  const createdFileId = bookhighligthsEPub.createFile(blob).getId();
  console.log(createdFileId)
}

function convert(fileId) {
  const exportLink = "https://docs.google.com/feeds/download/documents/export/Export?exportFormat=epub&id=" + fileId;

  var link = Drive.Files.get(fileId).exportLinks["application/epub+zip"];
  var response = UrlFetchApp.fetch(exportLink, {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    }
  });
  DriveApp.createFile(response.getBlob()).setName("pwfile.epub");
}

function createResultFile() {

}


function mergeGoogleDocs(destId, docIDs) {
  //var docIDs = ['xxxx' , 'xxxx', 'xxxx'];
  var baseDoc = DocumentApp.openById(destId);

  var body = baseDoc.getActiveSection();
  // Clear existing content in the master document
  baseDoc.getBody().clear();

  for (var i = 0; i < docIDs.length; ++i) {
    var otherBody = DocumentApp.openById(docIDs[i]).getActiveSection();
    var totalElements = otherBody.getNumChildren();
    for (var j = 0; j < totalElements; ++j) {
      var element = otherBody.getChild(j).copy();
      var type = element.getType();
      if (type == DocumentApp.ElementType.PARAGRAPH) { body.appendParagraph(element); }
      else if (type == DocumentApp.ElementType.TABLE) { body.appendTable(element); }
      else if (type == DocumentApp.ElementType.LIST_ITEM) { body.appendListItem(element.asListItem().getText()).setAttributes(element.getAttributes()); }
      else throw new Error('Unknown element type: ' + type);
    }
  }
}

function processDirectory() {
  var bookhighligthsDirectory = DriveApp.getFoldersByName("Book highligths").next();
  var bookhighligthsEPubDirectory = DriveApp.getFoldersByName("Book highligths epub").next();
  var bookhighligthsFiles = bookhighligthsDirectory.getFiles()

  const mergedFilename="HighlightsMerged"

  //RemoveAllEpubs(bookhighligthsEPubDirectory)

  var docIds = []
  var resultId = undefined;
  while (bookhighligthsFiles.hasNext()) {
    file = bookhighligthsFiles.next();
    sourceFileName = file.getName();
    if (sourceFileName == mergedFilename) {
      resultId = file.getId();
    }
    else {
      var id = file.getId();
      docIds.push(id);
      console.log(sourceFileName);
    }
    
  }
  if(resultId==undefined){
    var resultDoc= DocumentApp.create(mergedFilename);
    var resultId=resultDoc.getId();
    var fileResultDoc=  DriveApp.getFileById(resultId);
    fileResultDoc.moveTo(bookhighligthsDirectory);
    

  }
  mergeGoogleDocs(resultId, docIds)
  highlightsDoc = createEPubFile(resultId, mergedFilename,  bookhighligthsDirectory);
  //processDokument(file, bookhighligthsEPubDirectory);
  console.log(resultId)
  convert(resultId)
}


function myFunction() {
  processDirectory();
}