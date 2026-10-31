// Salon EyeLines - Main Interactive Engine & Appointment System
// Handles booking modal, dynamic catalog, filtering, admin portal, and WhatsApp notifications

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  renderServicesCatalog("all");
  renderHighlights();
  renderSpecialists();
  renderTestimonials();
  initBookingWizard();
  initAdminPortal();
});

// Global state for current appointment wizard
let bookingState = {
  selectedService: null,
  selectedSpecialist: null,
  selectedDate: null,
  selectedTime: null,
  clientDetails: {
    fullName: "",
    phone: "",
    email: "",
    occasion: "Regular Treatment",
    notes: ""
  },
  currentStep: 1
};

/* ==========================================================================
   1. UI INITIALIZATION & EVENT LISTENERS
   ========================================================================== */
function initUI() {
  // Sticky Header Effect
  const header = document.querySelector(".main-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const mobileNav = document.getElementById("mobileNavDrawer");
  const mobileClose = document.getElementById("mobileNavClose");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", () => {
      mobileNav.classList.add("open");
    });
  }

  if (mobileClose && mobileNav) {
    mobileClose.addEventListener("click", () => {
      mobileNav.classList.remove("open");
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      if (mobileNav) mobileNav.classList.remove("open");
    });
  });

  // Category Filter Tabs
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach(b => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const category = e.currentTarget.getAttribute("data-category");
      renderServicesCatalog(category);
    });
  });

  // Quick Hero Booking Strip
  const stripServiceSelect = document.getElementById("stripServiceSelect");
  const stripDateInput = document.getElementById("stripDateInput");
  const stripTimeSelect = document.getElementById("stripTimeSelect");
  const stripBookBtn = document.getElementById("stripBookBtn");

  // Populate strip service options
  if (stripServiceSelect) {
    SALON_SERVICES.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.name} - LKR ${s.priceLKR.toLocaleString()}`;
      stripServiceSelect.appendChild(opt);
    });
  }

  // Populate strip time slots
  if (stripTimeSelect) {
    TIME_SLOTS.forEach(time => {
      const opt = document.createElement("option");
      opt.value = time;
      opt.textContent = time;
      stripTimeSelect.appendChild(opt);
    });
  }

  // Set default min date to today
  const today = new Date().toISOString().split("T")[0];
  if (stripDateInput) {
    stripDateInput.min = today;
    stripDateInput.value = today;
  }

  if (stripBookBtn) {
    stripBookBtn.addEventListener("click", () => {
      const selectedId = stripServiceSelect ? stripServiceSelect.value : null;
      const selectedDate = stripDateInput ? stripDateInput.value : null;
      const selectedTime = stripTimeSelect ? stripTimeSelect.value : null;

      openBookingModal(selectedId, selectedDate, selectedTime);
    });
  }

  // Generic Book Now Triggers
  document.querySelectorAll("[data-open-booking]").forEach(btn => {
    btn.addEventListener("click", () => {
      openBookingModal();
    });
  });
}

/* ==========================================================================
   2. RENDERING CATALOG, HIGHLIGHTS & CONTENT
   ========================================================================== */
function renderServicesCatalog(category = "all") {
  const container = document.getElementById("servicesContainer");
  if (!container) return;

  const filtered = category === "all" 
    ? SALON_SERVICES 
    : SALON_SERVICES.filter(s => s.category === category);

  container.innerHTML = "";

  filtered.forEach(service => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.innerHTML = `
      <div class="service-card-image-wrap">
        <img src="${service.image}" alt="${service.name}" loading="lazy">
        ${service.popular ? '<span class="popular-badge">Signature Choice</span>' : ''}
      </div>
      <div class="service-card-body">
        <div class="service-meta-row">
          <span class="service-category-tag">${service.categoryName}</span>
          <span class="service-duration">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${service.duration}
          </span>
        </div>
        <h4 class="service-card-title">${service.name}</h4>
        <p class="service-card-desc">${service.description}</p>
        <div class="service-card-footer">
          <div class="service-price-block">
            <span class="price-prefix">From</span>
            <span class="price-amount">LKR ${service.priceLKR.toLocaleString()}</span>
          </div>
          <button class="btn-book-service" onclick="openBookingModal('${service.id}')">
            Select & Book
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderHighlights() {
  const container = document.getElementById("highlightsContainer");
  if (!container) return;

  container.innerHTML = "";
  SALON_HIGHLIGHTS.forEach(item => {
    const card = document.createElement("div");
    card.className = "highlight-card";
    card.innerHTML = `
      <span class="highlight-number">${item.number}</span>
      <div class="highlight-icon-circle">${item.icon}</div>
      <h4 class="highlight-card-title">${item.title}</h4>
      <span class="highlight-card-sub">${item.subtitle}</span>
      <p class="highlight-card-desc">${item.description}</p>
    `;
    container.appendChild(card);
  });
}

function renderSpecialists() {
  const container = document.getElementById("specialistsContainer");
  if (!container) return;

  container.innerHTML = "";
  SALON_SPECIALISTS.forEach(spec => {
    const card = document.createElement("div");
    card.className = "specialist-card";
    const initials = spec.name.split(" ").map(n => n[0]).slice(0, 2).join("");
    
    card.innerHTML = `
      <div class="specialist-avatar-circle">${initials}</div>
      <h4 class="specialist-name">${spec.name}</h4>
      <p class="specialist-role">${spec.role}</p>
      <p class="specialist-bio">${spec.bio}</p>
      <div class="specialist-tags">
        ${spec.specialties.map(t => `<span class="spec-tag">${t}</span>`).join("")}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderTestimonials() {
  const container = document.getElementById("testimonialsContainer");
  if (!container) return;

  container.innerHTML = "";
  SALON_TESTIMONIALS.forEach(item => {
    const card = document.createElement("div");
    card.className = "testimonial-card";
    card.innerHTML = `
      <div class="testimonial-stars">★★★★★</div>
      <p class="testimonial-text">"${item.review}"</p>
      <div class="client-meta">
        <div>
          <h5 class="client-name">${item.clientName}</h5>
          <span class="client-location">${item.location} • ${item.date}</span>
        </div>
        <span class="client-service-tag">${item.service}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ==========================================================================
   3. APPOINTMENT BOOKING WIZARD ENGINE
   ========================================================================== */
function initBookingWizard() {
  const backdrop = document.getElementById("bookingModalBackdrop");
  const closeBtn = document.getElementById("modalCloseBtn");
  const prevBtn = document.getElementById("wizardPrevBtn");
  const nextBtn = document.getElementById("wizardNextBtn");

  if (closeBtn && backdrop) {
    closeBtn.addEventListener("click", () => {
      closeBookingModal();
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeBookingModal();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (bookingState.currentStep > 1) {
        goToStep(bookingState.currentStep - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      validateAndNextStep();
    });
  }

  // Populate date picker default in modal
  const modalDate = document.getElementById("modalDateInput");
  if (modalDate) {
    const today = new Date().toISOString().split("T")[0];
    modalDate.min = today;
    modalDate.value = today;
    bookingState.selectedDate = today;

    modalDate.addEventListener("change", (e) => {
      bookingState.selectedDate = e.target.value;
      renderTimeSlots();
    });
  }

  // Service Search Filter in Modal
  const searchInput = document.getElementById("modalServiceSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderModalServicesList(e.target.value.toLowerCase());
    });
  }
}

function openBookingModal(preselectedServiceId = null, preselectedDate = null, preselectedTime = null) {
  const backdrop = document.getElementById("bookingModalBackdrop");
  if (!backdrop) return;

  // Reset or preset state
  if (preselectedServiceId) {
    bookingState.selectedService = SALON_SERVICES.find(s => s.id === preselectedServiceId) || null;
  }
  if (preselectedDate) {
    bookingState.selectedDate = preselectedDate;
    const dateInput = document.getElementById("modalDateInput");
    if (dateInput) dateInput.value = preselectedDate;
  }
  if (preselectedTime) {
    bookingState.selectedTime = preselectedTime;
  }

  backdrop.classList.add("active");
  document.body.style.overflow = "hidden";

  // If service preselected, start at step 2 or 3
  if (bookingState.selectedService && bookingState.selectedDate && bookingState.selectedTime) {
    goToStep(4);
  } else if (bookingState.selectedService) {
    goToStep(2);
  } else {
    goToStep(1);
  }

  renderModalServicesList();
  renderModalSpecialists();
  renderTimeSlots();
}

function closeBookingModal() {
  const backdrop = document.getElementById("bookingModalBackdrop");
  if (backdrop) {
    backdrop.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function goToStep(stepNumber) {
  bookingState.currentStep = stepNumber;

  // Update step indicators
  document.querySelectorAll(".step-indicator-item").forEach((ind, idx) => {
    const stepNum = idx + 1;
    ind.classList.remove("active", "completed");
    if (stepNum === stepNumber) {
      ind.classList.add("active");
    } else if (stepNum < stepNumber) {
      ind.classList.add("completed");
    }
  });

  // Switch panes
  document.querySelectorAll(".wizard-step-pane").forEach((pane, idx) => {
    pane.classList.remove("active");
    if (idx + 1 === stepNumber) {
      pane.classList.add("active");
    }
  });

  // Update Footer Buttons
  const prevBtn = document.getElementById("wizardPrevBtn");
  const nextBtn = document.getElementById("wizardNextBtn");

  if (prevBtn) {
    prevBtn.style.visibility = stepNumber === 1 || stepNumber === 5 ? "hidden" : "visible";
  }

  if (nextBtn) {
    if (stepNumber === 4) {
      nextBtn.innerHTML = `Confirm & Reserve <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (stepNumber === 5) {
      nextBtn.style.display = "none";
    } else {
      nextBtn.style.display = "inline-flex";
      nextBtn.innerHTML = `Continue <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
    }
  }

  // If step 5 (confirmation), generate the receipt
  if (stepNumber === 5) {
    buildBookingConfirmation();
  }
}

function validateAndNextStep() {
  const step = bookingState.currentStep;

  if (step === 1) {
    if (!bookingState.selectedService) {
      showToast("Please choose a treatment service to proceed.");
      return;
    }
    goToStep(2);
  } else if (step === 2) {
    // Specialist can default to Any Available
    if (!bookingState.selectedSpecialist) {
      bookingState.selectedSpecialist = { name: "Any Available Senior Artist", role: "Salon EyeLines Senior Specialist" };
    }
    goToStep(3);
  } else if (step === 3) {
    if (!bookingState.selectedDate) {
      showToast("Please select your preferred appointment date.");
      return;
    }
    if (!bookingState.selectedTime) {
      showToast("Please select a convenient time slot.");
      return;
    }
    const conflict = checkSlotConflict(bookingState.selectedTime, bookingState.selectedDate, bookingState.selectedSpecialist, bookingState.selectedService);
    if (conflict) {
      showToast(`This slot is already booked for ${conflict.specialist || conflict.staffName || "this specialist"}. Please pick another.`);
      bookingState.selectedTime = null;
      renderTimeSlots();
      return;
    }
    goToStep(4);
  } else if (step === 4) {
    // Validate Form Fields
    const fullName = document.getElementById("clientNameInput").value.trim();
    const phone = document.getElementById("clientPhoneInput").value.trim();
    const email = document.getElementById("clientEmailInput").value.trim();
    const occasion = document.getElementById("clientOccasionSelect").value;
    const notes = document.getElementById("clientNotesInput").value.trim();

    if (!fullName || fullName.length < 3) {
      showToast("Please enter your full name.");
      document.getElementById("clientNameInput").focus();
      return;
    }
    if (!phone || phone.length < 9) {
      showToast("Please enter a valid phone number for appointment confirmations.");
      document.getElementById("clientPhoneInput").focus();
      return;
    }

    const conflict = checkSlotConflict(bookingState.selectedTime, bookingState.selectedDate, bookingState.selectedSpecialist, bookingState.selectedService);
    if (conflict) {
      showToast(`Double-booking prevented: Slot was already reserved. Please select another time.`);
      goToStep(3);
      return;
    }

    bookingState.clientDetails = {
      fullName,
      phone,
      email,
      occasion,
      notes
    };

    saveBookingRecord();
    goToStep(5);
  }
}

function renderModalServicesList(searchQuery = "") {
  const container = document.getElementById("modalServicesList");
  if (!container) return;

  const filtered = SALON_SERVICES.filter(s => 
    s.name.toLowerCase().includes(searchQuery) || 
    s.categoryName.toLowerCase().includes(searchQuery)
  );

  container.innerHTML = "";

  filtered.forEach(s => {
    const isSelected = bookingState.selectedService && bookingState.selectedService.id === s.id;
    const item = document.createElement("div");
    item.className = `selectable-service-item ${isSelected ? 'selected' : ''}`;
    item.innerHTML = `
      <div class="item-left">
        <span class="item-name">${s.name}</span>
        <span class="item-sub">${s.categoryName} • ${s.duration}</span>
      </div>
      <div class="item-right">
        <span class="item-price">LKR ${s.priceLKR.toLocaleString()}</span>
        <input type="radio" name="selectedServiceRadio" ${isSelected ? 'checked' : ''}>
      </div>
    `;

    item.addEventListener("click", () => {
      bookingState.selectedService = s;
      renderModalServicesList(searchQuery);
    });

    container.appendChild(item);
  });
}

function renderModalSpecialists() {
  const container = document.getElementById("modalSpecialistsList");
  if (!container) return;

  container.innerHTML = "";

  // Add "Any Available" option first
  const anyCard = document.createElement("div");
  const isAnySelected = !bookingState.selectedSpecialist || bookingState.selectedSpecialist.name.startsWith("Any");
  anyCard.className = `selectable-stylist-card ${isAnySelected ? 'selected' : ''}`;
  anyCard.innerHTML = `
    <div class="stylist-avatar-mini">✨</div>
    <h5 style="font-size:0.95rem; margin-bottom:4px;">Any Senior Specialist</h5>
    <span style="font-size:0.75rem; color:var(--color-text-muted);">Quickest Availability</span>
  `;
  anyCard.addEventListener("click", () => {
    bookingState.selectedSpecialist = { name: "Any Available Senior Artist", role: "Salon EyeLines Senior Specialist" };
    renderModalSpecialists();
  });
  container.appendChild(anyCard);

  SALON_SPECIALISTS.forEach(spec => {
    const isSelected = bookingState.selectedSpecialist && bookingState.selectedSpecialist.id === spec.id;
    const card = document.createElement("div");
    card.className = `selectable-stylist-card ${isSelected ? 'selected' : ''}`;
    const initials = spec.name.split(" ").map(n => n[0]).slice(0, 2).join("");

    card.innerHTML = `
      <div class="stylist-avatar-mini">${initials}</div>
      <h5 style="font-size:0.95rem; margin-bottom:4px;">${spec.name}</h5>
      <span style="font-size:0.75rem; color:var(--color-gold-deep);">${spec.role}</span>
    `;

    card.addEventListener("click", () => {
      bookingState.selectedSpecialist = spec;
      renderModalSpecialists();
    });

    container.appendChild(card);
  });
}

function checkSlotConflict(timeSlot, date, specialist, service) {
  if (!timeSlot || !date) return null;
  try {
    const bookings = JSON.parse(localStorage.getItem("salon_eyelines_bookings") || "[]");
    return bookings.find(b => {
      const status = (b.status || "").toUpperCase();
      if (status === "CANCELLED") return false;
      if (b.date !== date) return false;
      if (b.time !== timeSlot) return false;

      const bStylist = (b.specialist || b.staffName || "").toLowerCase();
      const selStylist = specialist ? (specialist.name || "").toLowerCase() : "";

      if (selStylist && !selStylist.startsWith("any")) {
        if (bStylist === selStylist) return true;
      }

      const bService = (b.service || b.serviceName || "").toLowerCase();
      const selService = service ? (service.name || "").toLowerCase() : "";
      if (bService && selService && bService === selService && (bStylist === selStylist || selStylist.startsWith("any"))) {
        return true;
      }

      return false;
    }) || null;
  } catch (e) {
    return null;
  }
}

function renderTimeSlots() {
  const container = document.getElementById("modalTimeSlotsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (bookingState.selectedTime) {
    const isConflicted = !!checkSlotConflict(bookingState.selectedTime, bookingState.selectedDate, bookingState.selectedSpecialist, bookingState.selectedService);
    if (isConflicted) {
      bookingState.selectedTime = null;
    }
  }

  TIME_SLOTS.forEach(time => {
    const isConflict = !!checkSlotConflict(time, bookingState.selectedDate, bookingState.selectedSpecialist, bookingState.selectedService);
    const isSelected = bookingState.selectedTime === time;

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `time-slot-pill ${isSelected ? 'selected' : ''} ${isConflict ? 'booked' : ''}`;
    pill.disabled = isConflict;

    if (isConflict) {
      pill.innerHTML = `<span>${time}</span><span class="slot-badge-booked">Booked</span>`;
      pill.title = "Time slot is already reserved for this specialist.";
    } else {
      pill.innerHTML = `<span>${time}</span><span class="slot-badge-avail">Available</span>`;
      pill.addEventListener("click", () => {
        bookingState.selectedTime = time;
        renderTimeSlots();
      });
    }

    container.appendChild(pill);
  });
}

function buildBookingConfirmation() {
  const container = document.getElementById("bookingConfirmationSummary");
  if (!container) return;

  const refCode = "EL-" + Math.floor(100000 + Math.random() * 900000);
  const s = bookingState.selectedService;
  const c = bookingState.clientDetails;

  const formattedDate = new Date(bookingState.selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Construct WhatsApp Message
  const waText = encodeURIComponent(
    `Hello Salon EyeLines!\n\n` +
    `I have booked an appointment online:\n` +
    `Booking Ref: ${refCode}\n` +
    `Client: ${c.fullName}\n` +
    `Phone: ${c.phone}\n` +
    `Service: ${s.name}\n` +
    `Stylist: ${bookingState.selectedSpecialist.name}\n` +
    `Date: ${formattedDate}\n` +
    `Time: ${bookingState.selectedTime}\n` +
    `Total: LKR ${s.priceLKR.toLocaleString()}\n` +
    `Occasion: ${c.occasion}\n` +
    `Notes: ${c.notes || 'None'}\n\n` +
    `Please confirm my reservation. Thank you!`
  );

  const waLink = `https://wa.me/94775474996?text=${waText}`;

  container.innerHTML = `
    <div class="confirmation-success-card">
      <div class="success-icon-gold">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3 class="serif-title" style="font-size:2rem; margin-bottom:4px;">Appointment Reserved!</h3>
      <p style="color:var(--color-text-muted); font-size:0.9rem;">Thank you, ${c.fullName}. We look forward to pampering you.</p>
      
      <div class="booking-ref-badge">Reference: ${refCode}</div>

      <div class="summary-receipt-box">
        <div class="receipt-row">
          <span style="color:var(--color-text-muted);">Treatment Service</span>
          <span style="font-weight:600;">${s.name}</span>
        </div>
        <div class="receipt-row">
          <span style="color:var(--color-text-muted);">Duration</span>
          <span>${s.duration}</span>
        </div>
        <div class="receipt-row">
          <span style="color:var(--color-text-muted);">Specialist</span>
          <span>${bookingState.selectedSpecialist.name}</span>
        </div>
        <div class="receipt-row">
          <span style="color:var(--color-text-muted);">Date & Time</span>
          <span>${formattedDate} at ${bookingState.selectedTime}</span>
        </div>
        <div class="receipt-row">
          <span style="color:var(--color-text-muted);">Salon Studio</span>
          <span>48, Ganegama Road, Aluthgama</span>
        </div>
        <div class="receipt-row">
          <span style="color:var(--color-text-muted);">Total Payable at Salon</span>
          <span style="color:var(--color-gold-deep);">LKR ${s.priceLKR.toLocaleString()}</span>
        </div>
      </div>

      <div class="confirmation-actions-row">
        <a href="${waLink}" target="_blank" class="btn-whatsapp-confirm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Send to Salon WhatsApp
        </a>
        <button class="btn-gold-primary" onclick="window.print()">
          Print / Save Receipt
        </button>
        <button class="btn-gold-outline" onclick="closeBookingModal()">
          Close
        </button>
      </div>
    </div>
  `;
}

function saveBookingRecord() {
  const newBooking = {
    id: "EL-" + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    service: bookingState.selectedService.name,
    category: bookingState.selectedService.categoryName,
    price: bookingState.selectedService.priceLKR,
    specialist: bookingState.selectedSpecialist.name,
    date: bookingState.selectedDate,
    time: bookingState.selectedTime,
    client: bookingState.clientDetails.fullName,
    phone: bookingState.clientDetails.phone,
    email: bookingState.clientDetails.email,
    occasion: bookingState.clientDetails.occasion,
    status: "Confirmed"
  };

  try {
    const existing = JSON.parse(localStorage.getItem("salon_eyelines_bookings") || "[]");
    existing.unshift(newBooking);
    localStorage.setItem("salon_eyelines_bookings", JSON.stringify(existing));
    renderAdminBookings();
  } catch (e) {
    console.error("Storage error", e);
  }
}

/* ==========================================================================
   4. SALON MANAGER / ADMIN PORTAL
   ========================================================================== */
function initAdminPortal() {
  const adminToggle = document.getElementById("adminPortalToggle");
  const adminDrawer = document.getElementById("adminDrawer");
  const adminClose = document.getElementById("adminDrawerClose");

  if (adminToggle && adminDrawer) {
    adminToggle.addEventListener("click", () => {
      adminDrawer.classList.add("open");
      renderAdminBookings();
    });
  }

  if (adminClose && adminDrawer) {
    adminClose.addEventListener("click", () => {
      adminDrawer.classList.remove("open");
    });
  }

  // Pre-seed sample bookings if empty or migrate older records
  const stored = localStorage.getItem("salon_eyelines_bookings");
  if (!stored) {
    const seed = [
      {
        id: "EL-849201",
        createdAt: new Date().toISOString(),
        service: "Royal Kandyan Bridal Dressing Package",
        category: "Bridal Couture Suite",
        price: 75000,
        specialist: "Nayani Munasinghe",
        date: "2026-10-18",
        time: "08:30 AM",
        client: "Chamari Dissanayake",
        phone: "077 123 4567",
        status: "Confirmed",
        occasion: "Bridal Wedding"
      },
      {
        id: "EL-521934",
        createdAt: new Date().toISOString(),
        service: "Signature Precision Eyeliner Definition",
        category: "Eyelines & Lash Lounge",
        price: 3500,
        specialist: "Dilini Senanayake",
        date: "2026-10-12",
        time: "10:45 AM",
        client: "Nethmi Wickrama",
        phone: "071 987 6543",
        status: "Confirmed",
        occasion: "Everyday Glam"
      }
    ];
    localStorage.setItem("salon_eyelines_bookings", JSON.stringify(seed));
  } else if (stored.includes("Nirmala")) {
    const updated = stored.replace(/Aunty Nirmala Munasingha/g, "Nayani Munasinghe").replace(/Aunty Nirmala/g, "Nayani Munasinghe");
    localStorage.setItem("salon_eyelines_bookings", updated);
  }
}

function renderAdminBookings() {
  const container = document.getElementById("adminBookingsList");
  if (!container) return;

  const bookings = JSON.parse(localStorage.getItem("salon_eyelines_bookings") || "[]");
  container.innerHTML = "";

  if (bookings.length === 0) {
    container.innerHTML = `<p style="color:var(--color-text-muted); text-align:center; padding:30px;">No appointments recorded yet.</p>`;
    return;
  }

  bookings.forEach((b, idx) => {
    const item = document.createElement("div");
    item.className = "admin-booking-card";
    item.innerHTML = `
      <div class="admin-card-header">
        <span>${b.client}</span>
        <span class="status-tag status-confirmed">${b.status}</span>
      </div>
      <div style="font-size:0.82rem; color:var(--color-gold-deep); font-weight:600;">
        ${b.service}
      </div>
      <div style="font-size:0.78rem; color:var(--color-text-muted);">
        📅 ${b.date} at ${b.time} • 👤 ${b.specialist}
      </div>
      <div style="font-size:0.78rem; color:var(--color-text-muted);">
        📞 ${b.phone} • Ref: <strong>${b.id}</strong> • LKR ${b.price.toLocaleString()}
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:6px;">
        <button onclick="deleteBooking(${idx})" style="background:none; color:#C62828; font-size:0.75rem; cursor:pointer;">Cancel</button>
      </div>
    `;
    container.appendChild(item);
  });
}

window.deleteBooking = function(index) {
  if (confirm("Cancel this appointment record?")) {
    const bookings = JSON.parse(localStorage.getItem("salon_eyelines_bookings") || "[]");
    bookings.splice(index, 1);
    localStorage.setItem("salon_eyelines_bookings", JSON.stringify(bookings));
    renderAdminBookings();
    showToast("Appointment status updated.");
  }
};

/* ==========================================================================
   5. TOAST UTILITY
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById("toastNotification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.className = "toast-notification";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span>${message}</span>
  `;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}
