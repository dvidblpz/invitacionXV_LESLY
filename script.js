/* =========================================================
   XV AÑOS DE LESLY · FUNCIONES
   Configuración centralizada, accesibilidad y experiencia móvil.
   ========================================================= */
const CONFIG = {
  // Fecha local del evento: noviembre es el mes 10 en JavaScript.
  eventDate: new Date(2026, 10, 14, 20, 0, 0),
  // Completa el teléfono en formato internacional, solo dígitos y sin +.
  // Ejemplo de México: 528441234567. Se deja vacío hasta recibir el número correcto.
  whatsappNumber: "8441751398",
  whatsappMessage: "¡Hola! Quiero confirmar mi asistencia a los XV años de Lesly Itzayana Peña García, el sábado 14 de noviembre de 2026 a las 8:00 p. m.",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Recepciones+San+Antonio+Bulevar+Cedros+Bulevar+Revolucion+Mirasierra",
  wazeUrl: "https://www.waze.com/ul?q=Recepciones%20San%20Antonio%2C%20Bulevar%20Cedros%20y%20Bulevar%20Revoluci%C3%B3n%2C%20Colonia%20Mirasierra&navigate=yes",
  // Cuando te entreguen las fotos, escribe aquí las rutas relativas, por ejemplo:
  // photos: ["images/lesly-01.jpg", "images/lesly-02.jpg"]
  photos: ["images/lesly-01.jpg", "images/lesly-02.jpg", "images/lesly-03.jpg", "images/lesly-04.jpg"]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const splash = $("#splash");
const invitation = $("#invitation");
const startButton = $("#startButton");
const backgroundMusic = $("#backgroundMusic");
const musicToggle = $("#musicToggle");
const musicToggleLabel = $("#musicToggleLabel");
const rsvpButton = $("#rsvpButton");
const galleryGrid = $("#galleryGrid");
let activePhotoIndex = 0;
let galleryPhotos = [];

// Abre la invitación. La música solo se intenta iniciar tras una acción humana.
startButton.addEventListener("click", async () => {
  splash.classList.add("fade-out");
  invitation.classList.remove("is-hidden");
  window.setTimeout(() => {
    splash.classList.add("is-hidden");
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, 450);
  try {
    await backgroundMusic.play();
    setMusicState(true);
  } catch (_) {
    // La invitación sigue funcionando aunque no exista el MP3 o el navegador bloquee el audio.
  }
});

// Intento de reproducción automática. Los navegadores pueden exigir interacción del usuario.
async function tryAutoplayMusic() {
  if (!backgroundMusic || !backgroundMusic.paused) return;
  try {
    await backgroundMusic.play();
    setMusicState(true);
  } catch (_) {
    // Política del navegador: se reintentará al primer gesto del usuario.
  }
}
document.addEventListener("DOMContentLoaded", tryAutoplayMusic, { once: true });
["pointerdown", "keydown", "touchstart"].forEach((type) => {
  document.addEventListener(type, tryAutoplayMusic, { once: true, passive: true });
});

// Cuenta regresiva: toma la hora local del dispositivo del invitado.
const countdownNodes = { days: $("#days"), hours: $("#hours"), minutes: $("#minutes"), seconds: $("#seconds") };
const countdownHeading = $(".countdown-section h2");
function updateCountdown() {
  const difference = CONFIG.eventDate.getTime() - Date.now();
  if (difference <= 0) {
    Object.values(countdownNodes).forEach((node) => { node.textContent = "0"; });
    countdownHeading.textContent = "¡Hoy celebramos la magia!";
    return;
  }
  const totalSeconds = Math.floor(difference / 1000);
  countdownNodes.days.textContent = Math.floor(totalSeconds / 86400).toLocaleString("es-MX");
  countdownNodes.hours.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
  countdownNodes.minutes.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  countdownNodes.seconds.textContent = String(totalSeconds % 60).padStart(2, "0");
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

// Navegación a mapas. El enlace actual es una búsqueda; reemplázalo por un pin confirmado si lo comparten.
$("#mapsButton").href = CONFIG.mapsUrl;
$("#wazeButton").href = CONFIG.wazeUrl;

// Crear archivo de calendario .ics descargable sin depender de servicios externos.
$("#calendarButton").addEventListener("click", () => {
  const pad = (n) => String(n).padStart(2, "0");
  const date = CONFIG.eventDate;
  const localStamp = `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  const escapeICS = (value) => value.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
  const event = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dulce Invitacion//XV Lesly//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `DTSTART:${localStamp}`, `DTEND:${localStamp.replace(/T(\d{2})(\d{2})00$/, (_,h,m) => `T${pad((Number(h)+1)%24)}${m}00`)}`,
    `SUMMARY:${escapeICS("XV años de Lesly Itzayana Peña García")}`,
    `LOCATION:${escapeICS("Recepciones San Antonio, Bulevar Cedros y Bulevar Revolución, Colonia Mirasierra s/n")}`,
    `DESCRIPTION:${escapeICS("Celebración de XV años de Lesly. Sábado 14 de noviembre de 2026 a las 8:00 p. m.")}`,
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([event], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "XV-Lesly-14-noviembre-2026.ics";
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Galería: muestra 10 espacios mientras no se hayan recibido las fotos.
function buildGallery() {
  galleryGrid.replaceChildren();
  galleryPhotos = CONFIG.photos.filter(Boolean);
  for (let index = 0; index < 4; index += 1) {
    const source = CONFIG.photos[index];
    if (source) {
      const button = document.createElement("button");
      button.type = "button"; button.className = "photo-slot has-photo";
      button.setAttribute("aria-label", `Ampliar fotografía ${index + 1} de Lesly`);
      const image = document.createElement("img");
      image.src = source; image.alt = `Fotografía ${index + 1} de Lesly`;
      image.loading = "lazy"; image.decoding = "async";
      image.addEventListener("error", () => {
        button.replaceChildren(); button.classList.remove("has-photo"); button.classList.add("placeholder"); button.disabled = true;
        const holder = document.createElement("div"); const num = document.createElement("span"); const label = document.createElement("small");
        num.textContent = String(index + 1).padStart(2,"0"); label.textContent = "FOTO POR AGREGAR"; holder.append(num,label); button.append(holder);
      }, { once: true });
      button.append(image);
      button.addEventListener("click", () => openLightbox(index));
      galleryGrid.append(button);
    } else {
      const slot = document.createElement("div"); slot.className = "photo-slot placeholder";
      const holder = document.createElement("div"); const number = document.createElement("span"); const label = document.createElement("small");
      number.textContent = String(index + 1).padStart(2,"0"); label.textContent = "FOTO POR AGREGAR"; holder.append(number,label); slot.append(holder); galleryGrid.append(slot);
    }
  }
}
buildGallery();

// Visor de fotos: navegación por botones y flechas del teclado.
const lightbox = $("#lightbox");
const lightboxImage = $("#lightboxImage");
const lightboxCaption = $("#lightboxCaption");
function openLightbox(index) {
  activePhotoIndex = index;
  renderLightboxPhoto();
  if (typeof lightbox.showModal === "function") lightbox.showModal();
  else window.open(galleryPhotos[index], "_blank", "noopener");
}
function renderLightboxPhoto() {
  const photo = galleryPhotos[activePhotoIndex];
  if (!photo) return;
  lightboxImage.src = photo;
  lightboxImage.alt = `Fotografía ${activePhotoIndex + 1} de Lesly`;
  lightboxCaption.textContent = `Recuerdo ${activePhotoIndex + 1} de ${galleryPhotos.length}`;
  const hasSeveral = galleryPhotos.length > 1;
  $("#lightboxPrev").hidden = !hasSeveral;
  $("#lightboxNext").hidden = !hasSeveral;
}
function moveLightbox(direction) {
  if (galleryPhotos.length < 2) return;
  activePhotoIndex = (activePhotoIndex + direction + galleryPhotos.length) % galleryPhotos.length;
  renderLightboxPhoto();
}
$("#lightboxClose").addEventListener("click", () => lightbox.close());
$("#lightboxPrev").addEventListener("click", () => moveLightbox(-1));
$("#lightboxNext").addEventListener("click", () => moveLightbox(1));
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});

// Carga bajo demanda con reintento y CDN alternativo para evitar fallos por un único servidor.
function loadTicketBackground() {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context || !canvas.width || !canvas.height) throw new Error("Fondo no válido");
        context.drawImage(image, 0, 0); resolve(canvas.toDataURL("image/jpeg", 0.86));
      } catch (error) { reject(error); }
    };
    image.onerror = () => reject(new Error("No se encontró images/fondo-boleto-lesly.jpg"));
    image.src = new URL("images/fondo-boleto-lesly.jpg", document.baseURI).href;
  });
}

// Carga jsPDF bajo demanda. El proyecto no utiliza biblioteca QR.
// Se prueba una segunda fuente si la primera falla; cada intento fallido se elimina.
function loadJsPdf() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (window.__jsPdfLoading) return window.__jsPdfLoading;
  const sources = [
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js"
  ];
  window.__jsPdfLoading = (async () => {
    let lastError;
    for (const src of sources) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = () => window.jspdf?.jsPDF ? resolve() : reject(new Error("jsPDF cargó sin exponer su API"));
          script.onerror = () => { script.remove(); reject(new Error(`No se pudo cargar jsPDF desde ${src}`)); };
          document.head.appendChild(script);
        });
        return window.jspdf.jsPDF;
      } catch (error) { lastError = error; }
    }
    window.__jsPdfLoading = null;
    throw lastError || new Error("No se pudo cargar jsPDF");
  })();
  return window.__jsPdfLoading;
}

// Confirmación de asistencia: genera un boleto PDF en el navegador.
const rsvpDialog = $("#rsvpDialog");
const rsvpForm = $("#rsvpForm");
const rsvpClose = $("#rsvpClose");
rsvpButton.addEventListener("click", () => {
  if (typeof rsvpDialog.showModal === "function") rsvpDialog.showModal();
  else alert("Tu navegador no permite abrir el formulario. Actualiza el navegador e inténtalo de nuevo.");
});
rsvpClose.addEventListener("click", () => rsvpDialog.close());
rsvpDialog.addEventListener("click", (event) => {
  if (event.target === rsvpDialog) rsvpDialog.close();
});

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const guestName = $("#guestName").value.trim().replace(/\\s+/g, " ");
  const guestCount = Number($("#guestCount").value);
  if (!guestName || guestName.length > 90 || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 5) {
    alert("Revisa el nombre y la cantidad de personas.");
    return;
  }
  // Solo se necesita jsPDF; no se genera ni se carga ningún QR.
  let jsPDF;
  try {
    jsPDF = await loadJsPdf();
  } catch (error) {
    console.error("No se pudo cargar la biblioteca PDF:", error);
    alert("No se pudo cargar la biblioteca PDF. Comprueba tu conexión e inténtalo de nuevo.");
    return;
  }
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });
  const ticketId = `LES-${Date.now().toString(36).toUpperCase()}`;
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Boleto editorial de lujo: fondo ilustrado, panel principal y talón desprendible.
  const drawTicket = (backgroundData = null, qrData = null) => {
    if (backgroundData) {
      pdf.addImage(backgroundData, backgroundData.startsWith("data:image/jpeg") ? "JPEG" : "PNG", 0, 0, pageW, pageH, "ticket-background", "FAST");
    } else {
      pdf.setFillColor(37, 14, 52);
      pdf.rect(0, 0, pageW, pageH, "F");
    }

    // Paneles translúcidos para mantener contraste sin perder la ilustración.
    pdf.setGState(new pdf.GState({ opacity: 0.48 }));
    pdf.setFillColor(38, 12, 49);
    pdf.roundedRect(8, 8, 142, 132, 3, 3, "F");
    pdf.setFillColor(32, 8, 43);
    pdf.roundedRect(153, 8, 49, 132, 3, 3, "F");
    pdf.setGState(new pdf.GState({ opacity: 1 }));

    // Marco doble y línea de corte del talón.
    pdf.setDrawColor(240, 207, 131);
    pdf.setLineWidth(0.65);
    pdf.roundedRect(5, 5, pageW - 10, pageH - 10, 4, 4, "S");
    pdf.setDrawColor(245, 218, 157);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(8, 8, pageW - 16, pageH - 16, 3, 3, "S");
    pdf.setLineDash([1.5, 1.5], 0);
    pdf.line(151, 12, 151, pageH - 12);
    pdf.setLineDash([], 0);

    // Encabezado con jerarquía tipográfica.
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("times", "normal");
    pdf.setFontSize(9);
    pdf.text("D U L C E   I N V I T A C I Ó N", 79, 20, { align: "center" });
    pdf.setDrawColor(240, 207, 131);
    pdf.line(35, 24, 123, 24);
    pdf.setFont("times", "normal");
    pdf.setFontSize(13);
    pdf.text("MIS XV AÑOS", 79, 33, { align: "center" });
    pdf.setFont("times", "italic");
    pdf.setFontSize(32);
    pdf.text("Lesly", 79, 48, { align: "center" });
    pdf.setFont("times", "italic");
    pdf.setFontSize(13);
    pdf.setTextColor(255, 249, 255);
    pdf.text("Itzayana Peña García", 79, 57, { align: "center" });
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("times", "normal");
    pdf.setFontSize(8);
    pdf.text("✦  UNA NOCHE DE CUENTO  ✦", 79, 64, { align: "center" });

    // Nombre del invitado destacado en una placa propia.
    pdf.setFillColor(255, 239, 207);
    pdf.roundedRect(22, 71, 114, 17, 2, 2, "F");
    pdf.setTextColor(74, 30, 75);
    pdf.setFont("times", "normal");
    pdf.setFontSize(7);
    pdf.text("INVITADO ESPECIAL", 79, 76, { align: "center" });
    pdf.setFont("times", "italic");
    pdf.setFontSize(13);
    pdf.text(guestName, 79, 83, { align: "center", maxWidth: 106 });

    // Franja de datos del evento.
    pdf.setFillColor(44, 12, 53);
    pdf.setGState(new pdf.GState({ opacity: 0.91 }));
    pdf.roundedRect(13, 94, 132, 35, 2, 2, "F");
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text("SÁBADO", 20, 102);
    pdf.text("HORA", 64, 102);
    pdf.text("LUGAR", 91, 102);
    pdf.setTextColor(255, 249, 255);
    pdf.setFont("times", "normal");
    pdf.setFontSize(9);
    pdf.text("14 NOV 2026", 20, 109);
    pdf.text("8:00 P. M.", 64, 109);
    pdf.setFontSize(8);
    pdf.text(["Recepciones", "San Antonio"], 91, 108);
    pdf.setDrawColor(240, 207, 131);
    pdf.setLineWidth(0.3);
    pdf.line(59, 99, 59, 115);
    pdf.line(86, 99, 86, 115);
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(`PASE VÁLIDO PARA ${guestCount} ${guestCount === 1 ? "PERSONA" : "PERSONAS"}`, 79, 119, { align: "center" });
    pdf.setFont("times", "italic");
    pdf.setFontSize(7);
    pdf.text("Tu presencia hará esta noche inolvidable", 79, 126, { align: "center" });

    // Talón lateral con folio destacado; no se presenta como QR validable.
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("times", "normal");
    pdf.setFontSize(9);
    pdf.text("BOLETO DE", 177, 22, { align: "center" });
    pdf.text("ASISTENCIA", 177, 28, { align: "center" });
    pdf.setDrawColor(240, 207, 131);
    pdf.line(160, 32, 194, 32);
    pdf.setTextColor(255, 249, 255);
    pdf.setFont("times", "italic");
    pdf.setFontSize(10);
    pdf.text(["Una noche", "de cuento"], 177, 42, { align: "center" });
    if (qrData) {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(165, 35, 24, 24, 1, 1, "F");
      pdf.addImage(qrData, "PNG", 167, 37, 20, 20, undefined, "FAST");
    }
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text("FOLIO PERSONAL", 177, 65, { align: "center" });
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    pdf.text(ticketId, 177, 73, { align: "center" });
    // Código de barras decorativo asociado al folio (no sustituye validación central).
    let x = 160;
    const barcodeSeed = ticketId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    for (let i = 0; i < 38 && x < 194; i += 1) {
      const barWidth = ((barcodeSeed + i * 7) % 3 + 1) * 0.22;
      const gap = 0.42 + ((barcodeSeed + i) % 2) * 0.16;
      pdf.setFillColor(255, 226, 157);
      pdf.rect(x, 82, barWidth, 13, "F");
      x += barWidth + gap;
    }
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.text(`PASE PARA ${guestCount} ${guestCount === 1 ? "PERSONA" : "PERSONAS"}`, 177, 101, { align: "center" });
    pdf.setTextColor(255, 249, 255);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.text("PRESENTA ESTE BOLETO", 177, 108, { align: "center" });
    pdf.text("AL LLEGAR AL EVENTO", 177, 113, { align: "center" });
    pdf.setTextColor(255, 226, 157);
    pdf.setFont("times", "italic");
    pdf.setFontSize(8);
    pdf.text("Lesly", 177, 124, { align: "center" });
  };

  const safeName = guestName.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "invitado";
  // El boleto se genera sin QR; el folio aparece impreso como referencia.
  loadTicketBackground().then((backgroundData) => {
    drawTicket(backgroundData, null);
    pdf.save(`Boleto-XV-Lesly-${safeName}.pdf`);
    rsvpDialog.close();
    sendWhatsAppConfirmation(guestName, ticketId, guestCount);
  }).catch((error) => {
    console.error("No se pudo cargar el fondo del boleto:", error);
    // El boleto sigue disponible con diseño alternativo si falla un recurso externo/local.
    drawTicket(null, null);
    pdf.save(`Boleto-XV-Lesly-${safeName}.pdf`);
    rsvpDialog.close();
    sendWhatsAppConfirmation(guestName, ticketId, guestCount);
  });
});


function sendWhatsAppConfirmation(guestName, ticketId, guestCount) {
  const whatsappNumber = CONFIG.whatsappNumber.replace(/\D/g, "");

  if (whatsappNumber.length < 10) {
    alert("El boleto se descargó, pero falta configurar el teléfono de WhatsApp.");
    return;
  }

  const message =
    `¡Hola! Confirmo que asistiré a los XV años de Lesly Itzayana Peña García el sábado 14 de noviembre de 2026 a las 8:00 p. m.\n` +
    `Invitado: ${guestName}.\n` +
    `Cantidad de personas: ${guestCount}.\n` +
    `Folio del boleto: ${ticketId}.`;

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}


// Control de música. No interrumpe la navegación si el archivo MP3 aún no está agregado.
function setMusicState(isPlaying) {
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Activar música");
  musicToggleLabel.textContent = isPlaying ? "Pausar música" : "Activar música";
}
async function toggleMusic() {
  if (backgroundMusic.paused) {
    try { await backgroundMusic.play(); setMusicState(true); }
    catch (_) { alert("No se pudo reproducir la música. Coloca el archivo MP3 en audio/musica-princesa.mp3 y vuelve a intentarlo."); }
  } else { backgroundMusic.pause(); setMusicState(false); }
}
musicToggle.addEventListener("click", toggleMusic);
backgroundMusic.addEventListener("ended", () => setMusicState(false));
backgroundMusic.addEventListener("pause", () => setMusicState(false));
backgroundMusic.addEventListener("play", () => setMusicState(true));

// Nota: no se bloquean selección, clic derecho ni atajos del navegador; hacerlo perjudica
// accesibilidad y no evita capturas de pantalla ni inspección del código fuente.

// Controles extra del visor de galería: guardar, compartir y deslizar en móvil.
const lightboxDownload = $("#lightboxDownload");
const lightboxShare = $("#lightboxShare");
let touchStartX = 0;
function syncLightboxActions() {
  const photo = galleryPhotos[activePhotoIndex];
  if (!photo) return;
  lightboxDownload.href = photo;
  lightboxDownload.download = `recuerdo-lesly-${activePhotoIndex + 1}.jpg`;
}
const originalRenderLightboxPhoto = renderLightboxPhoto;
// La función original actualiza imagen y pie; esta envoltura sincroniza también el botón de descarga.
renderLightboxPhoto = function () {
  originalRenderLightboxPhoto();
  syncLightboxActions();
};
lightboxShare.addEventListener("click", async () => {
  const photo = galleryPhotos[activePhotoIndex];
  if (!photo) return;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Un recuerdo de Lesly", text: "Mira este recuerdo de los XV años de Lesly.", url: photo });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(new URL(photo, document.baseURI).href);
      lightboxShare.innerHTML = "<span aria-hidden=\"true\">✓</span> Enlace copiado";
      window.setTimeout(() => { lightboxShare.innerHTML = "<span aria-hidden=\"true\">↗</span> Compartir"; }, 1800);
    } else {
      window.prompt("Copia el enlace de la fotografía:", new URL(photo, document.baseURI).href);
    }
  } catch (error) {
    if (error?.name !== "AbortError") console.warn("No se pudo compartir la fotografía.", error);
  }
});
lightboxImage.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });
lightboxImage.addEventListener("touchend", (event) => {
  const delta = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) > 45) moveLightbox(delta < 0 ? 1 : -1);
}, { passive: true });


// Minijuego "Atrapa las estrellas" — sin dependencias externas.
(() => {
  const canvas = document.querySelector("#starGameCanvas");
  const startButton = document.querySelector("#starGameStart");
  const leftButton = document.querySelector("#starGameLeft");
  const rightButton = document.querySelector("#starGameRight");
  const scoreOutput = document.querySelector("#starScore");
  const timeOutput = document.querySelector("#starTime");
  const messageOutput = document.querySelector("#starGameMessage");
  if (!canvas || !startButton || !scoreOutput || !timeOutput || !messageOutput) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    messageOutput.textContent = "Tu navegador no permite iniciar este juego. Puedes disfrutar el resto de la invitación.";
    startButton.disabled = true;
    return;
  }

  const W = 800, H = 420, GOAL = 10, GAME_SECONDS = 25;
  let basketX = W / 2, score = 0, remaining = GAME_SECONDS;
  let stars = [], sparkles = [], running = false, lastFrame = 0, spawnClock = 0, endAt = 0, rafId = 0;
  let pointerDown = false, lastDirection = 0;
  const rand = (min, max) => min + Math.random() * (max - min);

  function paintBackground() {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#321746"); gradient.addColorStop(.55, "#4a235d"); gradient.addColorStop(1, "#241035");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 48; i++) {
      const x = (i * 137 + 29) % W, y = (i * 71 + 19) % H;
      ctx.globalAlpha = .2 + ((i % 4) * .12); ctx.fillStyle = "#ffe7a1";
      ctx.beginPath(); ctx.arc(x, y, i % 7 === 0 ? 2.2 : 1.1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(240,207,131,.3)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H - 24); ctx.quadraticCurveTo(W/2, H - 52, W, H - 24); ctx.stroke();
  }

  function drawStar(x, y, radius, rotation = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      const r = i % 2 === 0 ? radius : radius * .44;
      const px = Math.cos(angle) * r, py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fillStyle = "#ffdc7b"; ctx.shadowColor = "#ffcf56"; ctx.shadowBlur = 15; ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = "#fff2c5"; ctx.lineWidth = 1.1; ctx.stroke(); ctx.restore();
  }

  function drawBasket() {
    const y = H - 45;
    ctx.save(); ctx.translate(basketX, y);
    ctx.shadowColor = "rgba(240,207,131,.45)"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#d8a94c"; ctx.beginPath(); ctx.moveTo(-38, -13); ctx.lineTo(38, -13); ctx.lineTo(29, 13); ctx.quadraticCurveTo(0, 25, -29, 13); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = "#fff0b9"; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = "rgba(94,48,103,.8)"; ctx.lineWidth = 2;
    for (let x = -20; x <= 20; x += 10) { ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x * .72, 13); ctx.stroke(); }
    ctx.restore();
  }

  function render(now = 0) {
    paintBackground();
    // Pequeño castillo ornamental al fondo.
    ctx.globalAlpha = .25; ctx.strokeStyle = "#e8c7ff"; ctx.lineWidth = 2;
    ctx.strokeRect(82, H - 110, 42, 86); ctx.strokeRect(676, H - 125, 42, 101);
    ctx.beginPath(); ctx.moveTo(82,H-110);ctx.lineTo(103,H-136);ctx.lineTo(124,H-110);ctx.moveTo(676,H-125);ctx.lineTo(697,H-151);ctx.lineTo(718,H-125);ctx.stroke();ctx.globalAlpha=1;
    stars.forEach(star => drawStar(star.x, star.y, star.r, star.spin));
    sparkles.forEach(s => { ctx.globalAlpha = Math.max(0, s.life); ctx.fillStyle = "#fff0b8"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill(); });
    ctx.globalAlpha = 1; drawBasket();
    if (!running && score === 0) {
      ctx.fillStyle = "rgba(24,7,34,.42)"; ctx.fillRect(190, 150, 420, 72);
      ctx.fillStyle = "#fff0bd"; ctx.textAlign = "center"; ctx.font = "bold 24px Georgia,serif"; ctx.fillText("✦  Atrapa la magia  ✦", W/2, 180);
      ctx.font = "16px Georgia,serif"; ctx.fillText("Pulsa “Comenzar a jugar”", W/2, 205);
    }
  }

  function updateHud() { scoreOutput.textContent = String(score); timeOutput.textContent = String(remaining); }
  function finishGame() {
    running = false; cancelAnimationFrame(rafId); startButton.disabled = false; startButton.textContent = "Jugar otra vez";
    if (score >= GOAL) {
      messageOutput.textContent = `✨ ¡Lo lograste! Reuniste ${score} estrellas. Que la magia de esta noche te acompañe y que cada deseo brille tan bonito como los XV años de Lesly. 💜`;
    } else {
      messageOutput.textContent = `🌟 ¡Reuniste ${score} estrellas! La magia siempre da otra oportunidad. Inténtalo de nuevo y llena de luz la noche de Lesly. 💜`;
    }
    render();
  }

  function frame(timestamp) {
    if (!running) return;
    const delta = Math.min(40, timestamp - (lastFrame || timestamp)); lastFrame = timestamp;
    spawnClock += delta;
    if (spawnClock > 520) { spawnClock = 0; stars.push({ x: rand(22, W-22), y: -20, r: rand(8,13), speed: rand(105,175), spin: rand(-1,1) }); }
    const secondsLeft = Math.max(0, Math.ceil((endAt - performance.now()) / 1000));
    if (secondsLeft !== remaining) { remaining = secondsLeft; updateHud(); }
    stars.forEach(star => { star.y += star.speed * delta / 1000; star.spin += .025; });
    const basketY = H - 45;
    stars = stars.filter(star => {
      if (star.y > basketY - 12 && star.y < basketY + 20 && Math.abs(star.x - basketX) < 42) {
        score++; for (let i=0;i<7;i++) sparkles.push({x:star.x,y:star.y,r:rand(1.5,3.5),life:1,vx:rand(-70,70),vy:rand(-100,-20)});
        updateHud(); return false;
      }
      return star.y < H + 20;
    });
    sparkles.forEach(s => { s.x += s.vx * delta/1000; s.y += s.vy * delta/1000; s.life -= delta/650; });
    sparkles = sparkles.filter(s => s.life > 0);
    if (score >= GOAL || remaining <= 0) { finishGame(); return; }
    render(timestamp); rafId = requestAnimationFrame(frame);
  }

  function startGame() {
    cancelAnimationFrame(rafId); stars=[];sparkles=[];score=0;remaining=GAME_SECONDS;basketX=W/2;spawnClock=0;lastFrame=0;
    running=true;endAt=performance.now()+GAME_SECONDS*1000;startButton.textContent="Partida en curso…";startButton.disabled=true;
    messageOutput.textContent="¡Atrapa 10 estrellas para desbloquear tu mensaje mágico!";updateHud();canvas.focus({preventScroll:true});rafId=requestAnimationFrame(frame);
  }
  function moveBasket(direction) { basketX = Math.max(42, Math.min(W-42, basketX + direction * 34)); if (!running) render(); }
  function pointerToGame(event) {
    const rect=canvas.getBoundingClientRect(); basketX=Math.max(42,Math.min(W-42,((event.clientX-rect.left)/rect.width)*W));
    if (!running) render();
  }
  canvas.addEventListener("pointerdown", event => { pointerDown=true; canvas.setPointerCapture?.(event.pointerId); pointerToGame(event); });
  canvas.addEventListener("pointermove", event => { if(pointerDown) pointerToGame(event); });
  canvas.addEventListener("pointerup", () => { pointerDown=false; });
  canvas.addEventListener("pointercancel", () => { pointerDown=false; });
  canvas.addEventListener("keydown", event => {
    if (["ArrowLeft","ArrowRight","a","A","d","D"].includes(event.key)) { event.preventDefault(); moveBasket(event.key === "ArrowLeft" || event.key.toLowerCase() === "a" ? -1 : 1); }
  });
  startButton.addEventListener("click", startGame);
  leftButton?.addEventListener("click", () => moveBasket(-1)); rightButton?.addEventListener("click", () => moveBasket(1));
  document.addEventListener("visibilitychange", () => { if (document.hidden && running) { running=false; cancelAnimationFrame(rafId); startButton.disabled=false; startButton.textContent="Jugar otra vez"; messageOutput.textContent="La partida se pausó mientras la invitación estaba en segundo plano. Pulsa para iniciar una nueva partida."; } });
  // Bloqueo de selección/copia para textos de la invitación; no afecta a los campos del formulario.
  document.addEventListener("selectstart", event => { if (!event.target.closest("input,textarea,select,[contenteditable='true']")) event.preventDefault(); });
  document.addEventListener("copy", event => { if (!event.target.closest("input,textarea,select,[contenteditable='true']")) event.preventDefault(); });
  document.addEventListener("cut", event => { if (!event.target.closest("input,textarea,select,[contenteditable='true']")) event.preventDefault(); });
  render(); updateHud();
})();
