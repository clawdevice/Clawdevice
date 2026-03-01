const listEl = document.getElementById("meetingList");
const dialog = document.getElementById("meetingDialog");
const closeDialog = document.getElementById("closeDialog");
const prevBtn = document.getElementById("prevWeek");
const nextBtn = document.getElementById("nextWeek");
const aboutToggle = document.getElementById("aboutToggle");
const aboutDialog = document.getElementById("aboutDialog");
const closeAbout = document.getElementById("closeAbout");

let meetings = [];
let weekOffset = 0;

fetch("data/meetings.json")
  .then((res) => res.json())
  .then((data) => {
    meetings = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    render();
  })
  .catch((err) => {
    listEl.innerHTML = `<p class="error">Couldn't load meetings: ${err.message}</p>`;
  });

const formatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

function render() {
  const start = startOfWeek(addDays(new Date(), weekOffset * 7));
  const end = addDays(start, 6);

  const filtered = meetings.filter((meeting) => {
    const date = new Date(meeting.date);
    return date >= start && date <= end;
  });

  if (!filtered.length) {
    listEl.innerHTML = `<p class="muted">No meetings scheduled for this week yet.</p>`;
    return;
  }

  listEl.innerHTML = filtered
    .map(
      (meeting) => `
      <article class="meeting-card" data-date="${meeting.date}">
        <p class="eyebrow">${formatter.format(new Date(meeting.date))}</p>
        <h3>${meeting.title}</h3>
        <p class="muted">${meeting.time} · ${meeting.location}</p>
        <span class="tag">${meeting.tag}</span>
      </article>`
    )
    .join("");

  document.querySelectorAll(".meeting-card").forEach((card) => {
    card.addEventListener("click", () => {
      const meeting = meetings.find((m) => m.date === card.dataset.date);
      if (!meeting) return;
      document.getElementById("dialogDate").textContent = formatter.format(
        new Date(meeting.date)
      );
      document.getElementById("dialogTitle").textContent = meeting.title;
      document.getElementById(
        "dialogMeta"
      ).textContent = `${meeting.time} · ${meeting.location}`;
      document.getElementById("dialogDescription").textContent =
        meeting.description;
      dialog.showModal();
    });
  });
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  return new Date(d.setDate(diff));
}

prevBtn.addEventListener("click", () => {
  weekOffset -= 1;
  render();
});

nextBtn.addEventListener("click", () => {
  weekOffset += 1;
  render();
});

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

aboutToggle.addEventListener("click", () => aboutDialog.showModal());
closeAbout.addEventListener("click", () => aboutDialog.close());
aboutDialog.addEventListener("click", (event) => {
  if (event.target === aboutDialog) aboutDialog.close();
});
