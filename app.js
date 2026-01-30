const API_URL = "PASTE_URL_APPS_SCRIPT_DI_SINI";
let sessionToken = localStorage.getItem("token") || null;

function login(e) {
  e.preventDefault();

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      username: username.value,
      password: password.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "ok") {
        localStorage.setItem("token", data.token);
        loginPage.classList.add("hidden");
        dashboard.classList.remove("hidden");
      } else {
        Swal.fire("Gagal", data.message, "error");
      }
    });
}

function getGPS() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err)
    );
  });
}

function getPhoto() {
  return navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    const video = document.createElement("video");
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 240;
        canvas.getContext("2d").drawImage(video, 0, 0);
        stream.getTracks().forEach((t) => t.stop());
        resolve(canvas.toDataURL("image/jpeg"));
      };
    });
  });
}

async function absenMasuk() {
  const gps = await getGPS();
  const photo = await getPhoto();

  kirimPresensi("MASUK", gps, photo);
}

async function absenPulang() {
  const gps = await getGPS();
  const photo = await getPhoto();

  kirimPresensi("PULANG", gps, photo);
}

function kirimPresensi(jenis, gps, photo) {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "presensi",
      token: localStorage.getItem("token"),
      jenis,
      lat: gps.latitude,
      lng: gps.longitude,
      photo,
    }),
  })
    .then((r) => r.json())
    .then((d) => {
      Swal.fire(d.status === "ok" ? "Berhasil" : "Gagal", d.message, d.status);
    });
}
