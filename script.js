const sentenceList = document.getElementById("sentenceList");
const libraryPanel = document.getElementById("library");
let currentSentence = "";

document.getElementById("menuBtn").addEventListener("click", () => {
  libraryPanel.classList.remove("hidden");
});
document.getElementById("backBtn").addEventListener("click", () => {
  libraryPanel.classList.add("hidden");
});

function speakSentence(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

document.querySelectorAll("#downloadedList a").forEach(link => {
  link.addEventListener("click", async e => {
    e.preventDefault();
    const res = await fetch(link.dataset.unit);
    const data = await res.json();

    sentenceList.innerHTML = "";

    // Hiển thị hội thoại
    if (data.hoi_thoai) {
      const title = document.createElement("h3");
      title.textContent = "🗣️ Hội thoại";
      sentenceList.appendChild(title);

      data.hoi_thoai.forEach((item, i) => {
        const div = document.createElement("div");
        div.innerHTML = `<b>${item.nhan_vat}:</b> ${item.cau}<br><i>${item.tv}</i>`;
        div.className = "sentence-item";
        div.addEventListener("click", () => {
          currentSentence = item.cau;
          speakSentence(item.cau);
        });
        sentenceList.appendChild(div);
      });
    }

    // Hiển thị luyện câu phản xạ
    if (data.luyen_cau) {
      const title = document.createElement("h3");
      title.textContent = "🎯 Luyện câu phản xạ";
      sentenceList.appendChild(title);

      data.luyen_cau.forEach((item, i) => {
        const div = document.createElement("div");
        div.innerHTML = `<b>${item.ta}</b><br><i>${item.tv}</i><br>/${item.ipa}/ – ${item.vpm}`;
        div.className = "sentence-item";
        div.addEventListener("click", () => {
          currentSentence = item.ta;
          speakSentence(item.ta);
        });
        sentenceList.appendChild(div);
      });
    }

    // Hiển thị từ vựng
    if (data.tu_vung) {
      const title = document.createElement("h3");
      title.textContent = "📚 Từ vựng";
      sentenceList.appendChild(title);

      data.tu_vung.forEach((item, i) => {
        const div = document.createElement("div");
        div.innerHTML = `<b>${item.ta}</b> – ${item.tv}<br>/${item.ipa}/ – ${item.vpm}`;
        div.className = "sentence-item";
        div.addEventListener("click", () => {
          currentSentence = item.ta;
          speakSentence(item.ta);
        });
        sentenceList.appendChild(div);
      });
    }

    libraryPanel.classList.add("hidden");
  });
});