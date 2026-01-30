/**
 * CODE.GS - BACKEND SPREADSHEET INTEGRATION
 */

const SPREADSHEET_ID = '1nnoY-1Hs9VvGz4jQcW_05FCrhzm_a6_mwZalTd90hcc';
const TIMEZONE = "GMT+8";

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('E-SEMPESAI')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setFaviconUrl('https://raw.githubusercontent.com/bungamien/sempesai-assets/refs/heads/main/logo.ico');
}

// Sertakan file JS/CSS jika menggunakan metode include GAS
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Logika Autentikasi User
 * PERUBAHAN DI SINI: Sekarang membaca data dari Sheet 'users' dan 'siswa'
 */
function login(username, password, nisn) {
  try {
    const ss = getSpreadsheet();
    let userFound = null;

    // 1. JIKA LOGIN SEBAGAI SISWA (Menggunakan NISN)
    if (nisn) {
      const siswaSheet = ss.getSheetByName('siswa');
      if (!siswaSheet) throw new Error("Sheet 'siswa' tidak ditemukan");
      
      const dataSiswa = siswaSheet.getDataRange().getValues();
      
      for (let i = 1; i < dataSiswa.length; i++) {
        // Kolom 0: NISN, Kolom 1: Nama, Kolom 2: Kelas
        if (dataSiswa[i][0].toString().trim() === nisn.toString().trim()) {
          userFound = {
            nama: dataSiswa[i][1],
            role: 'siswa',
            nisn: dataSiswa[i][0],
            kelas: dataSiswa[i][2],
            token: Utilities.getUuid()
          };
          break;
        }
      }
    } 
    // 2. JIKA LOGIN SEBAGAI ADMIN / GURU (Menggunakan User & Pass)
    else {
      const usersSheet = ss.getSheetByName('users');
      if (!usersSheet) throw new Error("Sheet 'users' tidak ditemukan");
      
      const dataUsers = usersSheet.getDataRange().getValues();
      
      for (let i = 1; i < dataUsers.length; i++) {
        const dbUser = dataUsers[i][0].toString().trim();
        const dbPass = dataUsers[i][1].toString().trim();
        
        if (dbUser === username.trim() && dbPass === password.trim()) {
          userFound = {
            nama: dbUser,
            role: dataUsers[i][2], // admin atau guru
            kelas: dataUsers[i][3] || '',
            token: Utilities.getUuid()
          };
          break;
        }
      }
    }

    if (userFound) {
      return { success: true, data: userFound };
    } else {
      return { success: false, message: "Kredensial tidak ditemukan atau salah. Periksa kembali NISN/Username dan Password." };
    }

  } catch (e) {
    return { success: false, message: "Kesalahan Server: " + e.toString() };
  }
}

// Fungsi-fungsi lain (Absen, Data Siswa, dll) tetap di bawah sini...
