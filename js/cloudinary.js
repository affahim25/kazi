// js/cloudinary.js
// Handles image upload to Cloudinary

const CLOUD_NAME    = "dbotalnzq";
const UPLOAD_PRESET = "r5tja05h";
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload a File object to Cloudinary.
 *
 * @param {File}   file   - The image file to upload.
 * @param {string} type   - "groom" | "bride" — used to target progress UI.
 * @returns {Promise<string>} Resolves with the secure_url of the uploaded image.
 */
export async function uploadImage(file, type) {
  const progressEl = document.getElementById(`${type}-progress`);
  const barEl      = document.getElementById(`${type}-bar`);
  const statusEl   = document.getElementById(`${type}-status`);

  progressEl.classList.add("active");
  barEl.style.width = "10%";
  statusEl.textContent = "আপলোড শুরু হচ্ছে...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "nikah-registry");

  try {
    barEl.style.width = "40%";
    statusEl.textContent = "আপলোড হচ্ছে...";

    const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });

    barEl.style.width = "80%";

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    barEl.style.width = "100%";
    statusEl.textContent = "✓ সফলভাবে আপলোড হয়েছে";

    return data.secure_url;
  } catch (err) {
    barEl.style.width = "0%";
    statusEl.textContent = "✗ আপলোড ব্যর্থ হয়েছে";
    throw err;
  }
}
