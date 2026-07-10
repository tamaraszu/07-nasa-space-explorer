// Sets sensible default values for the start/end date pickers:
// end date = today, start date = 8 days before today.
// Wrapped in an IIFE so its variables don't leak into the global
// scope and collide with script.js.
(function () {
  const startInput = document.getElementById("startDate");
  const endInput = document.getElementById("endDate");

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  const today = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(today.getDate() - 8);

  const todayStr = formatDate(today);
  const defaultStartStr = formatDate(defaultStart);

  // NASA has no images for future dates, so cap both pickers at today.
  startInput.max = todayStr;
  endInput.max = todayStr;

  startInput.value = defaultStartStr;
  endInput.value = todayStr;
})();
