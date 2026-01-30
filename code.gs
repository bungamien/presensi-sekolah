const SHEET_USERS = "users";
const SHEET_ABSEN = "absensi";

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (data.action === "login") return login(data);
  if (data.action === "presensi") return presensi(data);

  return out({ status: "error", message: "Aksi tidak dikenal" });
}

function login(d) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_USERS);
  const rows = sh.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == d.username && rows[i][1] == d.password) {
      const token = Utilities.getUuid();
      CacheService.getScriptCache().put(token, d.username, 21600);
      return out({ status: "ok", token });
    }
  }
  return out({ status: "error", message: "Login gagal" });
}

function presensi(d) {
  const user = CacheService.getScriptCache().get(d.token);
  if (!user) return out({ status: "error", message: "Session habis" });

  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_ABSEN);
  const blob = Utilities.newBlob(Utilities.base64Decode(d.photo.split(",")[1]), "image/jpeg", `${user}_${Date.now()}.jpg`);

  const file = DriveApp.createFile(blob);

  sh.appendRow([new Date(), user, d.jenis, d.lat, d.lng, file.getUrl()]);

  return out({ status: "ok", message: "Presensi berhasil" });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
