const API_KEY = "xq4ja9vdXKPpqHNyabZJd8sdWgSoHeAf0W44Mje5";
const API_URL = "https://api.nasa.gov/planetary/apod";

const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const fetchButton = document.querySelector(".filters button");
const gallery = document.getElementById("gallery");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const modalVideo = document.getElementById("modalVideo");
const modalVideoLink = document.getElementById("modalVideoLink");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");
const modalClose = document.getElementById("modalClose");

const funFactText = document.getElementById("funFactText");

// ---------- Random "Did You Know?" space fact ----------

const SPACE_FACTS = [
  "A day on Venus is longer than its year — it takes 243 Earth days to rotate once, but only 225 to orbit the Sun.",
  "Neutron stars are so dense that a single teaspoon of their material would weigh about a billion tons on Earth.",
  "There are more stars in the observable universe than grains of sand on every beach on Earth.",
  "The footprints left by Apollo astronauts on the Moon will likely last millions of years since there's no wind or water to erode them.",
  "Saturn's moon Titan has lakes and rivers, but they're made of liquid methane and ethane, not water.",
  "One million Earths could fit inside the Sun.",
  "Space is completely silent because sound waves need a medium like air or water to travel through.",
  "The largest known star, UY Scuti, is so big that it would take a commercial jet over 1,000 years to fly around it.",
  "A full NASA spacesuit costs around $12 million, though most of that is the backpack and control module.",
  "Jupiter's Great Red Spot is a storm big enough to fit two or three Earths inside it.",
  "Because of the time light takes to travel, when you look at the Sun you're seeing it as it was about 8 minutes ago.",
  "The International Space Station travels at roughly 17,500 mph, orbiting Earth about every 90 minutes.",
  "Olympus Mons on Mars is the tallest volcano in the solar system — nearly three times the height of Mount Everest.",
  "There is a giant cloud of alcohol floating in space near the center of our galaxy, spanning hundreds of billions of miles.",
  "Astronauts can grow up to 2 inches taller in space because microgravity lets the spine stretch out.",
];

function showRandomFact() {
  const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
  funFactText.innerHTML = `<strong>Did you know?</strong> ${fact}`;
}

showRandomFact();

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

  // thumbs=true asks the API for a thumbnail_url on video entries,
  // since videos don't otherwise have a static image to display.
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

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

  // Only image and video entries are shown — APOD occasionally has other
  // types, but these two cover the vast majority of days.
  const displayItems = items.filter(
    (item) => item.media_type === "image" || item.media_type === "video"
  );

  if (displayItems.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No entries found for that date range. Try different dates.</p>
      </div>
    `;
    return;
  }

  // Newest first.
  displayItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  displayItems.forEach((item) => {
    const isVideo = item.media_type === "video";

    // Videos usually come with a thumbnail_url (thanks to thumbs=true).
    // If one isn't provided, fall back to a plain placeholder background —
    // the play badge still makes it clear it's a video.
    const thumbSrc = isVideo ? item.thumbnail_url : item.url;

    const card = document.createElement("div");
    card.className = "gallery-item";
    card.tabIndex = 0;

    const mediaHtml = thumbSrc
      ? `<img src="${thumbSrc}" alt="${item.title}" loading="lazy" />`
      : `<div class="video-placeholder"></div>`;

    card.innerHTML = `
      <div class="gallery-item-media">
        ${mediaHtml}
        ${isVideo ? `
          <span class="media-type-tag">Video</span>
          <span class="video-badge"><span class="video-badge-icon">▶</span></span>
        ` : ""}
      </div>
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
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;

  if (item.media_type === "video") {
    // Show the embedded player (works for YouTube/Vimeo embed URLs,
    // which is what APOD returns for most video entries) and always
    // provide a direct link too, in case the source blocks embedding.
    modalImage.style.display = "none";
    modalImage.src = "";

    modalVideo.style.display = "block";
    modalVideo.src = item.url;

    modalVideoLink.style.display = "block";
    modalVideoLink.href = item.url;
  } else {
    modalVideo.style.display = "none";
    modalVideo.src = "";

    modalVideoLink.style.display = "none";

    modalImage.style.display = "block";
    modalImage.src = item.hdurl || item.url;
    modalImage.alt = item.title;
  }

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
  modalImage.src = "";
  modalVideo.src = ""; // stops playback
}

modalClose.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});