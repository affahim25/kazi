// js/app.js
import { db, ref, push, get, update, remove } from "./firebase.js";
import { uploadImage }                        from "./cloudinary.js";
import {
  showToast,
  switchTab,
  setButtonLoading,
  setPhotoPreview,
  resetPhotoPreview,
  renderRecords,
  showLoadingRecords,
  showErrorRecords,
  showViewModal,
  showEditModal,
  showConfirmDelete,
} from "./ui.js";

// ── State ─────────────────────────────────────────────────────
const state = {
  groomImageUrl: null,
  brideImageUrl: null,
  allRecords:    [],
};

// ── DOM ready ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  bindTabButtons();
  bindPhotoUploads();
  bindSubmit();
  bindSearch();
});

// ── Tab navigation ────────────────────────────────────────────
function bindTabButtons() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab, loadRecords);
    });
  });
}

// ── Photo upload ──────────────────────────────────────────────
function bindPhotoUploads() {
  document.querySelectorAll(".photo-preview").forEach((preview) => {
    preview.addEventListener("click", () => {
      document.getElementById(preview.dataset.target).click();
    });
  });
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", () => handleImageSelect(input));
  });
}

async function handleImageSelect(input) {
  const file = input.files[0];
  const type = input.dataset.type;
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showToast("ছবির সাইজ ১০MB এর কম হতে হবে", "error");
    return;
  }
  try {
    const url = await uploadImage(file, type);
    setPhotoPreview(type, url);
    if (type === "groom") state.groomImageUrl = url;
    else                  state.brideImageUrl = url;
  } catch (err) {
    showToast("ছবি আপলোড ব্যর্থ: " + err.message, "error");
  }
}

// ── Form submit ───────────────────────────────────────────────
function bindSubmit() {
  document.getElementById("submit-btn").addEventListener("click", submitForm);
}

async function submitForm() {
  const groomName = document.getElementById("groom-name").value.trim();
  const brideName = document.getElementById("bride-name").value.trim();
  if (!groomName || !brideName) {
    showToast("জামাই ও বউয়ের নাম লিখতে হবে", "error");
    return;
  }
  const record = {
    groomName,
    brideName,
    groomNid:    document.getElementById("groom-nid").value.trim(),
    brideNid:    document.getElementById("bride-nid").value.trim(),
    denmahr:     document.getElementById("denmahr").value.trim(),
    pageNumber:  document.getElementById("page-number").value.trim(),
    balamNumber: document.getElementById("balam-number").value.trim(),
    osli:        document.getElementById("osli").value.trim(),
    groomImage:  state.groomImageUrl || null,
    brideImage:  state.brideImageUrl || null,
    createdAt:   new Date().toISOString(),
    timestamp:   Date.now(),
  };
  const btn = document.getElementById("submit-btn");
  setButtonLoading(btn, true);
  try {
    await push(ref(db, "nikah-records"), record);
    showToast("✓ সফলভাবে সেভ হয়েছে!", "success");
    resetForm();
  } catch (err) {
    showToast("সেভ ব্যর্থ হয়েছে: " + err.message, "error");
  } finally {
    setButtonLoading(btn, false);
  }
}

function resetForm() {
  ["groom-name", "bride-name", "groom-nid", "bride-nid", "denmahr", "page-number", "balam-number", "osli"]
    .forEach((id) => { document.getElementById(id).value = ""; });
  resetPhotoPreview("groom");
  resetPhotoPreview("bride");
  state.groomImageUrl = null;
  state.brideImageUrl = null;
}

// ── History / records ─────────────────────────────────────────
async function loadRecords() {
  showLoadingRecords();
  try {
    const snapshot = await get(ref(db, "nikah-records"));
    if (!snapshot.exists()) { state.allRecords = []; renderRecords([], handlers()); return; }
    state.allRecords = Object.entries(snapshot.val())
      .map(([id, rec]) => ({ id, ...rec }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    renderRecords(state.allRecords, handlers());
  } catch (err) {
    showErrorRecords(err.message);
  }
}

// ── Handlers ─────────────────────────────────────────────────
function handlers() {
  return {
    onView: (id) => {
      const record = state.allRecords.find((r) => r.id === id);
      if (record) showViewModal(record, {
        onDelete: (rid, rec) => showConfirmDelete(rec, deleteRecord),
      });
    },
    onEdit: (id) => {
      const record = state.allRecords.find((r) => r.id === id);
      if (record) showEditModal(record, saveEdit);
    },
  };
}

// ── Save edit ─────────────────────────────────────────────────
async function saveEdit(id, updatedFields) {
  await update(ref(db, `nikah-records/${id}`), updatedFields);
  const idx = state.allRecords.findIndex((r) => r.id === id);
  if (idx !== -1) state.allRecords[idx] = { ...state.allRecords[idx], ...updatedFields };
  rerenderList();
}

// ── Delete record ─────────────────────────────────────────────
async function deleteRecord(id) {
  await remove(ref(db, `nikah-records/${id}`));
  state.allRecords = state.allRecords.filter((r) => r.id !== id);
  rerenderList();
}

// ── Re-render (respects active search) ───────────────────────
function rerenderList() {
  const q = document.getElementById("search-input").value;
  renderRecords(
    q.trim() ? state.allRecords.filter(filterFn(q)) : state.allRecords,
    handlers()
  );
}

// ── Search ────────────────────────────────────────────────────
function filterFn(q) {
  const ql = toBengaliDigits(q.toLowerCase().trim());
  const qlEn = toEnglishDigits(q.toLowerCase().trim());
  return (r) =>
    [r.groomName, r.brideName, r.groomNid, r.brideNid, r.pageNumber, r.balamNumber]
      .some((v) => {
        const val = (v || "").toLowerCase();
        return val.includes(ql) || val.includes(qlEn);
      });
}

function toBengaliDigits(str) {
  return str.replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
}

function toEnglishDigits(str) {
  return str.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
}

function filterRecords() {
  const q = document.getElementById("search-input").value;
  renderRecords(q.trim() ? state.allRecords.filter(filterFn(q)) : state.allRecords, handlers());
}
