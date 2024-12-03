// Configuration object
const CONFIG = {
  SPREADSHEET_ID: "<ID-SPREADSHEET>",
  WEBHOOK_SHEET_NAME: "webhook",
  AUTORESPONSE_SHEET_NAME: "autorespon", // New sheet for auto-responses
  IMAGE_FOLDER_ID: "<ID-Folder>",
  TIMEZONE: "Asia/Jakarta",
  DATE_FORMAT: "dd/MM/yyyy HH:mm:ss"
};

// Format Message Class - Modified to handle dynamic responses
class FormatMessage {
  static text(text, quoted = false) {
    return JSON.stringify({
      text: text,
      quoted: quoted
    });
  }

  static media(url, type, caption, quoted = false) {
    return JSON.stringify({
      url: url,
      type: type,
      caption: caption,
      filename: `file.${type}`,
      quoted: quoted
    });
  }

  static getAutoResponse(message) {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.AUTORESPONSE_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Remove header row
    const responses = data.slice(1);
    
    // Find matching response
    const response = responses.find(row => {
      const keyword = row[0].toString().toLowerCase();
      return message.toLowerCase().includes(keyword);
    });

    if (!response) return null;

    const [keyword, type, messageText, url] = response;
    
    switch(type.toLowerCase()) {
      case 'text':
        return FormatMessage.text(messageText, true);
        
      case 'image':
      case 'video':
      case 'document':
      case 'audio':
        return FormatMessage.media(url, type, messageText, true);
        
      default:
        return null;
    }
  }
}

// Handle GET requests
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Webhook is active"
  })).setMimeType(ContentService.MimeType.JSON);
}

// Main webhook handler function
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log("Incoming webhook data:", data);
    
    const response = processMessage(data);
    storeWebhookData(data);
    
    return ContentService.createTextOutput(response)
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error processing webhook:", error);
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Process incoming message and return appropriate response
function processMessage(data) {
  const message = data.message ? data.message : '';
  const from = data.from ? data.from.toLowerCase() : '';
  const bufferImage = data.bufferImage || null;

  // Get auto-response based on message
  const response = FormatMessage.getAutoResponse(message);

  // Handle image if present
  if (bufferImage) {
    const imageUrl = saveImage(bufferImage, from);
    Logger.log("Image saved:", imageUrl);
  }

  return response || JSON.stringify({ status: 'no response' });
}

// Store webhook data in spreadsheet
function storeWebhookData(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.WEBHOOK_SHEET_NAME);
  
  const timestamp = Utilities.formatDate(
    new Date(),
    CONFIG.TIMEZONE,
    CONFIG.DATE_FORMAT
  );
  
  let imageUrl = "";
  if (data.bufferImage) {
    imageUrl = saveImage(data.bufferImage, data.from);
  }
  
  const rowData = [
    timestamp,
    data.device || "",
    data.message || "",
    data.from || "",
    data.name || "",
    data.participant || "",
    imageUrl
  ];
  
  sheet.appendRow(rowData);
}

// Save image to Drive (unchanged)
function saveImage(base64Image, sender) {
  try {
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(base64Image),
      'image/jpeg',
      `WhatsApp_${sender}_${new Date().getTime()}.jpg`
    );
    
    const folder = DriveApp.getFolderById(CONFIG.IMAGE_FOLDER_ID);
    const file = folder.createFile(imageBlob);
    
    return file.getUrl();
  } catch (error) {
    Logger.log("Error saving image:", error);
    return "";
  }
}

// Setup webhook and auto-response sheets
function setupSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // Setup webhook sheet
  let webhookSheet = ss.getSheetByName(CONFIG.WEBHOOK_SHEET_NAME);
  if (!webhookSheet) {
    webhookSheet = ss.insertSheet(CONFIG.WEBHOOK_SHEET_NAME);
    const webhookHeaders = [
      "Timestamp",
      "Device",
      "Message",
      "From",
      "Name",
      "Participant",
      "Image URL"
    ];
    
    setupSheet(webhookSheet, webhookHeaders);
  }
  
  // Setup auto-response sheet
  let autoResponseSheet = ss.getSheetByName(CONFIG.AUTORESPONSE_SHEET_NAME);
  if (!autoResponseSheet) {
    autoResponseSheet = ss.insertSheet(CONFIG.AUTORESPONSE_SHEET_NAME);
    const autoResponseHeaders = [
      "Keyword",
      "Type",
      "Message",
      "URL"
    ];
    
    setupSheet(autoResponseSheet, autoResponseHeaders);
    
    // Add sample data
    const sampleData = [
      ["hi", "text", "Hello! How can I help you today?", ""],
      ["price", "image", "Here's our price list", "https://example.com/price.jpg"],
      ["catalog", "document", "Download our catalog", "https://example.com/catalog.pdf"]
    ];
    
    autoResponseSheet.getRange(2, 1, sampleData.length, sampleData[0].length)
      .setValues(sampleData);
  }
}

// Helper function to setup sheet headers
function setupSheet(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground("#4a90e2")
    .setFontColor("white")
    .setFontWeight("bold");
  
  sheet.autoResizeColumns(1, headers.length);
}

// Get webhook URL (unchanged)
function getWebhookUrl() {
  return ScriptApp.getService().getUrl();
}
