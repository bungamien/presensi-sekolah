/**
 * APP.JS - LOGIKA SISTEM ABSENSI PINTAR
 * Seluruh fungsi frontend, event listeners, dan integrasi backend.
 */

// ==========================================================================
// 1. GLOBAL STATE & CONFIG
// ==========================================================================
let currentUser = null;
let html5QrCode = null;
let currentCameraId = null;
let tableState = {
  riwayat: { fullData: [], filtered: [], currentPage: 1 },
  siswa: { fullData: [], filtered: [], currentPage: 1 },
  guru: { fullData: [], filtered: [], currentPage: 1 },
};
const ITEMS_PER_PAGE = 10;

// ==========================================================================
// 2. INITIALIZATION
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  checkSession();
  setupEventListeners();
}

function setupEventListeners() {
  // Menu Mobile
  document.getElementById("btnMobileMenu")?.addEventListener("click", toggleSidebar);
}

// ==========================================================================
// 3. AUTHENTICATION & SESSION
// ==========================================================================
function checkSession() {
  const savedUser = localStorage.getItem("absensi_user");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUIForUser();
    loadDashboard();
  } else {
    renderLoginPage();
  }
}

function handleLogin(e) {
  e.preventDefault();
  const role = document.getElementById("loginRole").value;
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const nisn = document.getElementById("nisnLogin")?.value;

  showLoading();

  google.script.run
    .withSuccessHandler((response) => {
      hideLoading();
      if (response.success) {
        currentUser = response.data;
        localStorage.setItem("absensi_user", JSON.stringify(currentUser));
        updateUIForUser();
        loadDashboard();
        showAlert("success", "Selamat datang, " + currentUser.nama);
      } else {
        showAlert("error", response.message);
      }
    })
    .withFailureHandler((err) => {
      hideLoading();
      showAlert("error", "Terjadi kesalahan server: " + err);
    })
    .login(user, pass, nisn);
}

function logout() {
  Swal.fire({
    title: "Keluar Aplikasi?",
    text: "Anda harus login kembali untuk mengakses data.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Ya, Keluar",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("absensi_user");
      currentUser = null;
      location.reload();
    }
  });
}

// ==========================================================================
// 4. UI RENDERING & ROUTING
// ==========================================================================
function updateUIForUser() {
  document.getElementById("userName").textContent = currentUser.nama;
  document.getElementById("userRole").textContent = currentUser.role;
  document.getElementById("sidebar").classList.remove("hidden");
  renderNavigation();
}

function renderNavigation() {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-chart-line", roles: ["admin", "guru", "siswa"] },
    { id: "scan", label: "Scan Absen", icon: "fas fa-qrcode", roles: ["admin", "guru"] },
    { id: "riwayat", label: "Riwayat", icon: "fas fa-history", roles: ["admin", "guru", "siswa"] },
    { id: "siswa", label: "Data Siswa", icon: "fas fa-users", roles: ["admin", "guru"] },
    { id: "guru", label: "Akses Guru", icon: "fas fa-user-shield", roles: ["admin"] },
  ];

  const allowed = navItems.filter((item) => item.roles.includes(currentUser.role));

  // Desktop Sidebar
  const desktopNav = document.getElementById("desktopNav");
  desktopNav.innerHTML =
    allowed
      .map(
        (item) => `
        <button onclick="navigate('${item.id}')" id="nav-${item.id}" class="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl">
            <i class="${item.icon} text-lg w-6"></i>
            <span class="font-medium">${item.label}</span>
        </button>
    `
      )
      .join("") +
    `
        <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 mt-8 transition-all rounded-xl">
            <i class="fas fa-sign-out-alt text-lg w-6"></i>
            <span class="font-medium">Keluar</span>
        </button>
    `;

  // Mobile Bottom Nav
  const mobileNav = document.getElementById("mobileNav");
  mobileNav.innerHTML = allowed
    .map(
      (item) => `
        <button onclick="navigate('${item.id}')" id="mnav-${item.id}" class="flex flex-col items-center gap-1 text-slate-400 py-1 px-3">
            <i class="${item.icon} text-lg"></i>
            <span class="text-[10px] font-medium">${item.label}</span>
        </button>
    `
    )
    .join("");
}

function navigate(pageId) {
  // Logic ganti konten berdasarkan pageId...
  console.log("Navigating to:", pageId);
  // [Implementasi detail render per halaman di sini]
}

// ==========================================================================
// UTILS
// ==========================================================================
function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}
function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}
function showAlert(icon, title) {
  Swal.fire({ icon, title, timer: 2000, showConfirmButton: false });
}
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("-translate-x-full");
}
