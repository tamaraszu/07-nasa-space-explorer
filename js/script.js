const API_KEY = "xq4ja9vdXKPpqHNyabZJd8sdWgSoHeAf0W44Mje5";
const API_URL = "https://api.nasa.gov/planetary/apod";

const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const fetchButton = document.querySelector(".filters button");
const gallery = document.getElementById("gallery");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");
const modalClose = document.getElementById("modalClose");

fetchButton.addEventListener("click", () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert("Please select both a start and an end date.");
    return;
  }

  if (startDate > endDate) {
    alert("Start date must be before the end date.");
    return;
  }

  fetchApodData(startDate, endDate);
});

async function fetchApodData(startDate, endDate) {
  showLoading();

  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // If start_date === end_date, the API returns a single object
    // instead of an array — normalize it either way.
    const items = Array.isArray(data) ? data : [data];

    renderGallery(items);
  } catch (error) {
    console.error("Failed to fetch APOD data:", error);
    showError();
  }
}

function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder is-loading">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;
}

function showError() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">⚠️</div>
      <p>Something went wrong fetching data from NASA. Please try again.</p>
    </div>
  `;
}

function renderGallery(items) {
  gallery.innerHTML = "";

  // Videos don't have a static image to show in the grid, so skip them.
  const imageItems = items.filter((item) => item.media_type === "image");

  if (imageItems.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No images found for that date range. Try different dates.</p>
      </div>
    `;
    return;
  }

  // Newest first.
  imageItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  imageItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "gallery-item";
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${item.url}" alt="${item.title}" loading="lazy" />
      <p class="item-title">${item.title}</p>
      <p class="item-date">${item.date}</p>
    `;

    card.addEventListener("click", () => openModal(item));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(item);
      }
    });

    gallery.appendChild(card);
  });
}

function openModal(item) {
  modalImage.src = item.hdurl || item.url;
  modalImage.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
  modalImage.src = "";
}

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});