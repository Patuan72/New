
document.addEventListener("DOMContentLoaded", function () {
  const unitTitle = document.getElementById("unitTitle");
  const unitSituation = document.getElementById("unitSituation");
  const conversation = document.getElementById("conversation");
  const sentencePractice = document.getElementById("sentencePractice");
  const vocabularyList = document.getElementById("vocabularyList");

  const micButton = document.getElementById("micButton");
  const replayButton = document.getElementById("replayButton");
  const saveButton = document.getElementById("saveButton");

  let currentAudio = null;

  function loadUnitFromFile(unitFile) {
    fetch(unitFile)
      .then((response) => response.json())
      .then((data) => {
        displayUnitContent(data);
      });
  }

  function displayUnitContent(data) {
    unitTitle.textContent = data.unitTitle || "";
    unitSituation.textContent = data.situation || "";

    conversation.innerHTML = "";
    data.conversation.forEach((line) => {
      const div = document.createElement("div");
      div.textContent = line;
      conversation.appendChild(div);
    });

    sentencePractice.innerHTML = "";
    data.sentence_practice.forEach((item) => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${item.vi}</strong><br>${item.en}<br><em>${item.ipa}</em><br><code>${item.vpm}</code>`;
      sentencePractice.appendChild(div);
    });

    vocabularyList.innerHTML = "";
    data.vocabulary.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.vi}</strong> – ${item.en} / <em>${item.ipa}</em> / <code>${item.vpm}</code>`;
      vocabularyList.appendChild(li);
    });
  }

  function setupLibraryList() {
    document.querySelectorAll("#downloadedList a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const unitFile = e.target.dataset.unit;
        loadUnitFromFile(unitFile);
      });
    });
  }

  micButton.addEventListener("click", () => {
    alert("🎤 Mic: Tính năng đang được phát triển.");
  });

  replayButton.addEventListener("click", () => {
    alert("🔁 Replay: Tính năng đang được phát triển.");
  });

  saveButton.addEventListener("click", () => {
    alert("💾 Save: Tính năng đang được phát triển.");
  });

  setupLibraryList();
});
