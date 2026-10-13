const btnToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

function toggleMenu() {
  if (!btnToggle || !navLinks) return;
  const isOpen = navLinks.classList.toggle("nav-open");
  btnToggle.setAttribute("aria-expanded", String(isOpen));
  btnToggle.setAttribute(
    "aria-label",
    isOpen ? "Fermer le menu" : "Ouvrir le menu"
  );
}

if (btnToggle && navLinks) {
  btnToggle.addEventListener("click", toggleMenu);
}

// Thème clair / sombre
const themeToggle = document.querySelector(".theme-toggle");
const root = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {}
  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Passer au thème clair" : "Passer au thème sombre"
    );
    const label = themeToggle.querySelector(".theme-label");
    if (label) label.textContent = isDark ? "Clair" : "Sombre";
  }
  if (themeMeta) {
    themeMeta.setAttribute("content", theme === "dark" ? "#0b1220" : "#007bff");
  }
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {}
  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
    return;
  }
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

initTheme();

// Formulaire de contact — 100% frontend (pas de backend)
const contactForm = document.querySelector("#contactForm");
const contactSubmit = document.querySelector("#contactSubmit");
const formStatus = document.querySelector("#formStatus");

function setFieldError(input, errorEl, message) {
  if (!input || !errorEl) return;
  if (message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.setAttribute("aria-invalid", "true");
  } else {
    errorEl.textContent = "";
    errorEl.hidden = true;
    input.removeAttribute("aria-invalid");
  }
}

function setFormStatus(message, variant) {
  if (!formStatus) return;
  if (!message) {
    formStatus.textContent = "";
    formStatus.hidden = true;
    formStatus.removeAttribute("data-variant");
    return;
  }
  formStatus.textContent = message;
  formStatus.setAttribute("data-variant", variant);
  formStatus.hidden = false;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    setFormStatus(null);

    const name = contactForm.querySelector("#name");
    const email = contactForm.querySelector("#email");
    const subject = contactForm.querySelector("#subject");
    const message = contactForm.querySelector("#message");
    const consent = contactForm.querySelector("#consent");
    const honeypot = contactForm.querySelector("#company");

    // Anti-spam : bot détecté → succès silencieux, rien n'est envoyé
    if (honeypot && honeypot.value.trim() !== "") {
      setFormStatus("Message envoyé. Nous revenons vers vous rapidement.", "success");
      contactForm.reset();
      return;
    }

    let firstInvalid = null;
    const check = (input, errorId, valid, msg) => {
      const err = contactForm.querySelector("#" + errorId);
      setFieldError(input, err, valid ? null : msg);
      if (!valid && !firstInvalid) firstInvalid = input;
      return valid;
    };

    const nameOk = check(
      name,
      "name-error",
      name && name.value.trim().length >= 2,
      "Veuillez saisir votre nom (2 caractères minimum)."
    );
    const emailOk = check(
      email,
      "email-error",
      email && emailPattern.test(email.value.trim()),
      "Veuillez saisir une adresse email valide."
    );
    const subjectOk = check(
      subject,
      "subject-error",
      subject && subject.value.trim().length >= 3,
      "Veuillez préciser le sujet (3 caractères minimum)."
    );
    const messageOk = check(
      message,
      "message-error",
      message && message.value.trim().length >= 10,
      "Votre message doit contenir au moins 10 caractères."
    );
    const consentOk = check(
      consent,
      "consent-error",
      consent && consent.checked,
      "Vous devez accepter d'être recontacté pour envoyer le message."
    );

    if (!(nameOk && emailOk && subjectOk && messageOk && consentOk)) {
      setFormStatus("Veuillez corriger les champs indiqués ci-dessus.", "error");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Simulation d'envoi + repli messagerie (aucun backend sur ce site)
    if (contactSubmit) {
      contactSubmit.disabled = true;
      contactSubmit.textContent = "Envoi…";
    }
    const to = "contact@benintechlabs.bj";
    const mailto =
      "mailto:" + to +
      "?subject=" + encodeURIComponent("[Site] " + subject.value.trim()) +
      "&body=" + encodeURIComponent(
        "Nom : " + name.value.trim() +
        "\nEmail : " + email.value.trim() +
        "\n\n" + message.value.trim()
      );

    window.setTimeout(() => {
      if (contactSubmit) {
        contactSubmit.disabled = false;
        contactSubmit.textContent = "Envoyer";
      }
      contactForm.reset();
      setFormStatus(
        "Message préparé. Aucun backend n'est configuré : cliquez sur ce lien pour l'envoyer via votre messagerie : " + to,
        "success"
      );
      // Lien mailto ajouté sous le statut pour finaliser l'envoi côté utilisateur
      if (formStatus) {
        const link = document.createElement("a");
        link.href = mailto;
        link.textContent = "Envoyer via ma messagerie";
        link.style.display = "inline-block";
        link.style.marginTop = "0.5rem";
        formStatus.appendChild(document.createElement("br"));
        formStatus.appendChild(link);
        link.focus();
      }
    }, 700);
  });

  // Efface l'erreur du champ dès que l'utilisateur corrige
  contactForm.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      const described = el.getAttribute("aria-describedby");
      if (described) {
        const err = contactForm.querySelector("#" + described);
        if (err && !err.hidden) setFieldError(el, err, null);
      }
      if (formStatus && formStatus.getAttribute("data-variant") === "error") {
        setFormStatus(null);
      }
    });
  });
}
