function RemoveAllEpubs(bookhighligthsEPubDirectory) {
  while (bookhighligthsEPubDirectory.getFiles().hasNext()) {
    const file = bookhighligthsEPubDirectory.getFiles().next();
    Logger.log('Moving file to trash: ', file.getName());
    //file.setTrashed(true);
    // Delete File
    Drive.Files.remove(file.getId())
  }
}

function createEPubFile(mergedFileId, filename, bookhighligthsEPub) {

  var mimeType = 'application/epub+zip';
  var x=DocumentApp.openById(mergedFileId);
  var body=x.getBody().getText();

  var exportLink = Drive.Files.get(mergedFileId).exportLinks[mimeType];
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
  // Clear existing content in the master document//
  baseDoc.getBody().clear();

  for (var i = 0; i < docIDs.length; ++i) {
    var otherBody = DocumentApp.openById(docIDs[i]).getActiveSection();
    var totalElements = otherBody.getNumChildren();
    for (var j = 0; j < totalElements; ++j) {
      console.log(j)
      var element = otherBody.getChild(j).copy();
      var type = element.getType();
      if (type == DocumentApp.ElementType.PARAGRAPH) { body.appendParagraph(element); }
      else if (type == DocumentApp.ElementType.TABLE) { body.appendTable(element); }
      else if (type == DocumentApp.ElementType.LIST_ITEM) { body.appendListItem(element.asListItem().getText()).setAttributes(element.getAttributes()); }
      else throw new Error('Unknown element type: ' + type);
    }
  }
  baseDoc.saveAndClose();
}

function processDirectory() {
  var bookhighligthsDirectory = DriveApp.getFoldersByName("Book highligths").next();
  var bookhighligthsEPubDirectory = DriveApp.getFoldersByName("Book highligths epub").next();
  var bookhighligthsFiles = bookhighligthsDirectory.getFiles()

  const mergedFilename="HighlightsMerged"

  //RemoveAllEpubs(bookhighligthsEPubDirectory)

  var docIds = []
  var mergedFileId = undefined;
  while (bookhighligthsFiles.hasNext()) {
    file = bookhighligthsFiles.next();
    sourceFileName = file.getName();
    if (sourceFileName == mergedFilename) {
      mergedFileId = file.getId();
    }
    else {
      var id = file.getId();
      docIds.push(id);
      console.log(sourceFileName);
    }
    
  }
  if(mergedFileId==undefined){
    var resultDoc= DocumentApp.create(mergedFilename);
    var mergedFileId=resultDoc.getId();
    var fileResultDoc=  DriveApp.getFileById(mergedFileId);
    fileResultDoc.moveTo(bookhighligthsDirectory);
    

  }
  mergeGoogleDocs(mergedFileId, docIds)
  var x=DocumentApp.openById(mergedFileId)
  var body=x.getBody().getText()
  console.log(mergedFileId)
  console.log("files merged");
  highlightsDoc = createEPubFile(mergedFileId, mergedFilename,  bookhighligthsDirectory);
  console.log(mergedFileId)
}

function CreateEpub()
{
var mergedFileId="19prvjEGt3MWrd5i1kmnhcf78_ZhoQx8yJwxXi9u8y8g";
var mergedFilename="fdasfa"
var bookhighligthsDirectory = DriveApp.getFoldersByName("Book highligths").next();

highlightsDoc = createEPubFile(mergedFileId, mergedFilename,  bookhighligthsDirectory);
  
}


function myFunction() {
  processDirectory();
}