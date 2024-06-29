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
}

function convert(fileId) {
  const exportLink = "https://docs.google.com/feeds/download/documents/export/Export?exportFormat=epub&id=" + fileId;

  var link = Drive.Files.get(fileId).exportLinks["application/epub+zip"];
  var response = UrlFetchApp.fetch(exportLink, {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    }
  });
  DriveApp.createFile(response.getBlob()).setName("file.epub");
}

function processDirectory() {
  var bookhighligthsDirectory = DriveApp.getFoldersByName("Book highligths").next();
  var bookhighligthsEPubDirectory = DriveApp.getFoldersByName("Book highligths epub").next();
  var bookhighligthsFiles = bookhighligthsDirectory.getFiles()

  RemoveAllEpubs(bookhighligthsEPubDirectory)


  while (bookhighligthsFiles.hasNext()) {
    file = bookhighligthsFiles.next();
    sourceFileName = file.getName();
    console.log(sourceFileName);

    highlightsDoc = createEPubFile(file.getId(), sourceFileName, bookhighligthsEPubDirectory);
    //processDokument(file, bookhighligthsEPubDirectory);
    console.log(file.getId())
    //convert(file.getId())
  }
}


function myFunction() {
  processDirectory();
}