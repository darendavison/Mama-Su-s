// TODO: replace REPLACE_ME with the real Formspree form ID (also update the form action in index.html)
const FORM_ENDPOINT = "https://formspree.io/f/REPLACE_ME";

(function () {
  "use strict";

  // Signup form
  const form = document.getElementById("signup-form");
  const success = document.getElementById("signup-success");
  const status = document.getElementById("form-status");

  if (form) {
    form.noValidate = true; // we show our own messages; without JS the browser validates
    form.action = FORM_ENDPOINT;

    const checks = [
      { el: form.elements.name, err: "name-error", ok: (el) => el.value.trim() !== "" },
      { el: form.elements.email, err: "email-error", ok: (el) => el.value.trim() !== "" && el.validity.valid },
      { el: form.elements.zip, err: "zip-error", ok: (el) => el.value.trim() === "" || /^\d{5}$/.test(el.value.trim()) },
      { el: form.elements.consent, err: "consent-error", ok: (el) => el.checked },
    ];

    function setError(check, show) {
      const msg = document.getElementById(check.err);
      msg.hidden = !show;
      if (show) {
        check.el.setAttribute("aria-invalid", "true");
        check.el.setAttribute("aria-describedby", check.err);
      } else {
        check.el.removeAttribute("aria-invalid");
        check.el.removeAttribute("aria-describedby");
      }
    }

    function validate() {
      let firstBad = null;
      checks.forEach((c) => {
        const good = c.ok(c.el);
        setError(c, !good);
        if (!good && !firstBad) firstBad = c.el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    // Clear an error as soon as the person fixes it
    checks.forEach((c) => {
      c.el.addEventListener("input", () => { if (c.ok(c.el)) setError(c, false); });
      c.el.addEventListener("change", () => { if (c.ok(c.el)) setError(c, false); });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.hidden = true;
      if (!validate()) return;

      const button = form.querySelector('button[type="submit"]');
      const label = button.textContent;
      button.disabled = true;
      button.textContent = "Sending…";

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("Bad response: " + res.status);
        form.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (err) {
        status.textContent = "Hmm, that didn't go through. Please check your connection and try again.";
        status.hidden = false;
        button.disabled = false;
        button.textContent = label;
      }
    });
  }

  // Swap photo placeholders for real images once they exist in /images
  document.querySelectorAll(".ph[data-img]").forEach((ph) => {
    const img = new Image();
    img.alt = ph.dataset.alt || "";
    img.loading = "lazy";
    img.onload = () => {
      ph.textContent = "";
      ph.appendChild(img);
      ph.classList.add("has-img");
    };
    img.src = ph.dataset.img;
  });

  // Fade and slide up on scroll
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }
})();
