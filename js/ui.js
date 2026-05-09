// js/ui.js — UI helpers: toast, tabs, timeline record rendering

let toastTimer = null;

export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  clearTimeout(toastTimer);
  void toast.offsetWidth;
  requestAnimationFrame(() => toast.classList.add("show"));
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

export function switchTab(tabId, onHistory) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".section").forEach((sec) => {
    sec.classList.toggle("active", sec.id === `tab-${tabId}`);
  });
  if (tabId === "history" && typeof onHistory === "function") onHistory();
}

export function setButtonLoading(btnEl, loading) {
  btnEl.disabled = loading;
  btnEl.classList.toggle("loading", loading);
}

export function setPhotoPreview(type, url) {
  document.getElementById(`${type}-preview`).innerHTML =
    `<img src="${url}" alt="${type}">`;
}

export function resetPhotoPreview(type) {
  document.getElementById(`${type}-preview`).innerHTML = `
    <div class="photo-placeholder-icon">👤</div>
    <div class="photo-placeholder-text">ছবি আপলোড করুন</div>`;
  document.getElementById(`${type}-progress`).classList.remove("active");
  document.getElementById(`${type}-bar`).style.width = "0%";
  document.getElementById(`${type}-file`).value = "";
}

export function renderRecords(records, { onView, onEdit } = {}) {
  const list = document.getElementById("record-list");

  if (!records.length) {
    list.innerHTML = `
      <div class="no-records">
        <span class="no-records-icon">📂</span>
        কোনো রেকর্ড পাওয়া যায়নি
      </div>`;
    return;
  }

  const items = records.map((r, i) => {
    const date = r.createdAt
      ? new Date(r.createdAt).toLocaleDateString("bn-BD", { year:"numeric", month:"long", day:"numeric" })
      : "";

    const groomPhoto = r.groomImage
      ? `<img class="couple-photo" src="${r.groomImage}" alt="জামাই">`
      : `<div class="couple-photo photo-empty">👤</div>`;

    const bridePhoto = r.brideImage
      ? `<img class="couple-photo" src="${r.brideImage}" alt="বউ">`
      : `<div class="couple-photo photo-empty">👤</div>`;

    return `
      <div class="tl-item" style="animation-delay:${i * 0.08}s" data-id="${r.id}">
        <div class="tl-dot"><div class="tl-dot-ring"></div></div>
        <div class="tl-card">

          <div class="tl-top-bar">
            ${r.balamNumber ? `<span class="tl-page-badge">বালাম নং ${r.balamNumber}</span>` : "<span></span>"}
            ${r.pageNumber ? `<span class="tl-page-badge">পেইজ ${r.pageNumber}</span>` : "<span></span>"}
            <div class="tl-top-right">
              ${date ? `<span class="tl-date">${date}</span>` : ""}
              <div class="tl-action-btns">
                <button class="tl-btn tl-btn-view" data-id="${r.id}" title="বিস্তারিত দেখুন">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  ভিউ
                </button>
                <button class="tl-btn tl-btn-edit" data-id="${r.id}" title="সম্পাদনা করুন">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  এডিট
                </button>
              </div>
            </div>
          </div>

          <div class="tl-couple-row">
            <div class="tl-person">
              <div class="tl-photo-wrap groom-wrap">${groomPhoto}</div>
              <div class="tl-person-meta">
                <span class="tl-role groom-label">জামাই</span>
                <span class="tl-pname">${r.groomName}</span>
                ${r.groomNid ? `<span class="tl-nid">${r.groomNid}</span>` : ""}
              </div>
            </div>

            <div class="tl-middle">
              <div class="tl-hline"></div>
              <div class="tl-moon">☽</div>
              <div class="tl-hline"></div>
            </div>

            <div class="tl-person tl-person-r">
              <div class="tl-photo-wrap bride-wrap">${bridePhoto}</div>
              <div class="tl-person-meta">
                <span class="tl-role bride-label">বউ</span>
                <span class="tl-pname">${r.brideName || "—"}</span>
                ${r.brideNid ? `<span class="tl-nid">${r.brideNid}</span>` : ""}
              </div>
            </div>
          </div>

            ${r.denmahr ? `
            <div class="tl-footer-bar" style="display:flex; justify-content:space-between; align-items:center;">
           <div>
                <span class="tl-denmahr-tag">💰 দেনমোহর</span>
                <span class="tl-denmahr-val">${r.denmahr}</span>
           </div>
  <div>
    <span class="tl-osli-tag">📜 ওসলি</span>
    <span class="tl-osli-val">${r.osli}</span>
  </div>
</div>` : ""}
        </div>
      </div>`;
  }).join("");

  list.innerHTML = `<div class="timeline">${items}</div>`;

  // Bind action buttons
  list.querySelectorAll(".tl-btn-view").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof onView === "function") onView(btn.dataset.id);
    });
  });

  list.querySelectorAll(".tl-btn-edit").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof onEdit === "function") onEdit(btn.dataset.id);
    });
  });
}

export function showLoadingRecords() {
  document.getElementById("record-list").innerHTML =
    '<div class="loading-records">⏳ লোড হচ্ছে...</div>';
}

export function showErrorRecords(msg) {
  document.getElementById("record-list").innerHTML = `
    <div class="no-records">
      <span class="no-records-icon">⚠️</span>
      লোড ব্যর্থ: ${msg}
    </div>`;
}

// ── View Modal ────────────────────────────────────────────────
export function showViewModal(record) {
  removeModal();

  const date = record.createdAt
    ? new Date(record.createdAt).toLocaleDateString("bn-BD", { year:"numeric", month:"long", day:"numeric" })
    : "—";

  const groomPhoto = record.groomImage
    ? `<img class="modal-photo" style="border:3px solid #5b8dd9" src="${record.groomImage}" alt="জামাই">`
    : `<div class="modal-photo photo-empty-lg">👤</div>`;

  const bridePhoto = record.brideImage
    ? `<img class="modal-photo" style="border:3px solid #d97b9b" src="${record.brideImage}" alt="বউ">`
    : `<div class="modal-photo photo-empty-lg">👤</div>`;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "app-modal";
  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <div class="modal-header-ornament">☽</div>
        <h2 class="modal-title">নিকাহ বিবরণ</h2>
        <div class="modal-header-ornament">☾</div>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-meta-row">
          ${record.pageNumber ? `<div class="modal-page-badge">পেইজ ${record.pageNumber}</div>` : ""}
          <div class="modal-date">📅 ${date}</div>
        </div>

        <div class="modal-couple">
          <div class="modal-person">
            ${groomPhoto}
            <span class="tl-role groom-label" style="margin-top:10px">জামাই</span>
            <span class="modal-name">${record.groomName}</span>
            ${record.groomNid ? `<span class="modal-nid">NID: ${record.groomNid}</span>` : ""}
          </div>

          <div class="modal-divider">
            <div class="modal-vline"></div>
            <div class="modal-moon-big">☽</div>
            <div class="modal-vline"></div>
          </div>

          <div class="modal-person">
            ${bridePhoto}
            <span class="tl-role bride-label" style="margin-top:10px">বউ</span>
            <span class="modal-name">${record.brideName || "—"}</span>
            ${record.brideNid ? `<span class="modal-nid">NID: ${record.brideNid}</span>` : ""}
          </div>
        </div>

        ${record.denmahr ? `
        <div class="modal-info-row">
          <span class="modal-info-label">💰 দেনমোহর</span>
          <span class="modal-info-val">${record.denmahr}</span>
        </div>` : ""}

        <button class="btn-modal-close-bottom" id="modal-close-bottom">বন্ধ করুন</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("modal-visible"));

  document.getElementById("modal-close-btn").addEventListener("click", removeModal);
  document.getElementById("modal-close-bottom").addEventListener("click", removeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) removeModal(); });
}

// ── Edit Modal ────────────────────────────────────────────────
export function showEditModal(record, onSave) {
  removeModal();

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "app-modal";
  modal.innerHTML = `
    <div class="modal-box modal-box-edit">
      <div class="modal-header">
        <div class="modal-header-ornament">☽</div>
        <h2 class="modal-title">রেকর্ড সম্পাদনা</h2>
        <div class="modal-header-ornament">☾</div>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        <div class="edit-form-grid">
          <div class="form-group">
            <label>জামাই নাম *</label>
            <input type="text" id="edit-groom-name" value="${escHtml(record.groomName)}" placeholder="জামাইয়ের নাম" />
          </div>
          <div class="form-group">
            <label>বউ নাম *</label>
            <input type="text" id="edit-bride-name" value="${escHtml(record.brideName)}" placeholder="বউয়ের নাম" />
          </div>
          <div class="form-group">
            <label>জামাই এনআইডি</label>
            <input type="text" id="edit-groom-nid" value="${escHtml(record.groomNid)}" placeholder="এনআইডি নম্বর" />
          </div>
          <div class="form-group">
            <label>বউ এনআইডি</label>
            <input type="text" id="edit-bride-nid" value="${escHtml(record.brideNid)}" placeholder="এনআইডি নম্বর" />
          </div>
          <div class="form-group">
            <label>দেনমোহর</label>
            <input type="text" id="edit-denmahr" value="${escHtml(record.denmahr)}" placeholder="দেনমোহর পরিমাণ" />
          </div>
          <div class="form-group">
            <label>পেইজ নাম্বার</label>
            <input type="text" id="edit-page-number" value="${escHtml(record.pageNumber)}" placeholder="পেইজ নং" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-modal-cancel" id="modal-cancel-btn">বাতিল</button>
          <button class="btn-modal-save" id="modal-save-btn">
            <span class="btn-text">সেভ করুন</span>
            <div class="spinner"></div>
          </button>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("modal-visible"));

  document.getElementById("modal-close-btn").addEventListener("click", removeModal);
  document.getElementById("modal-cancel-btn").addEventListener("click", removeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) removeModal(); });

  document.getElementById("modal-save-btn").addEventListener("click", async () => {
    const groomName = document.getElementById("edit-groom-name").value.trim();
    const brideName = document.getElementById("edit-bride-name").value.trim();
    if (!groomName || !brideName) {
      showToast("জামাই ও বউয়ের নাম আবশ্যক", "error");
      return;
    }
    const updated = {
      groomName,
      brideName,
      groomNid:   document.getElementById("edit-groom-nid").value.trim(),
      brideNid:   document.getElementById("edit-bride-nid").value.trim(),
      denmahr:    document.getElementById("edit-denmahr").value.trim(),
      pageNumber: document.getElementById("edit-page-number").value.trim(),
    };
    const saveBtn = document.getElementById("modal-save-btn");
    setButtonLoading(saveBtn, true);
    try {
      await onSave(record.id, updated);
      showToast("✓ সফলভাবে আপডেট হয়েছে!", "success");
      removeModal();
    } catch (err) {
      showToast("আপডেট ব্যর্থ: " + err.message, "error");
      setButtonLoading(saveBtn, false);
    }
  });
}

function removeModal() {
  const existing = document.getElementById("app-modal");
  if (existing) {
    existing.classList.remove("modal-visible");
    setTimeout(() => existing.remove(), 300);
  }
}

function escHtml(val) {
  return (val || "").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
