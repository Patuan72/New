
document.addEventListener("DOMContentLoaded", function () {
  const contentBox = document.getElementById("content");

  function renderSection(title, rows, headers) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.textContent = title;
    h2.style.fontSize = "16px";
    h2.style.fontWeight = "bold";
    section.appendChild(h2);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    if (headers) {
      const headerRow = document.createElement("tr");
      headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        th.style.textAlign = "left";
        th.style.borderBottom = "1px solid #ccc";
        th.style.padding = "4px";
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);
    }

    rows.forEach(row => {
      const tr = document.createElement("tr");
      Object.values(row).forEach(text => {
        const td = document.createElement("td");
        td.textContent = text;
        td.style.padding = "4px";
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    section.appendChild(table);
    contentBox.appendChild(section);
  }

  fetch("unit1.json")
    .then(response => response.json())
    .then(data => {
      contentBox.innerHTML = "";

      if (data.tieu_de) {
        const title = document.createElement("h1");
        title.textContent = data.tieu_de;
        title.style.fontSize = "18px";
        title.style.marginBottom = "10px";
        contentBox.appendChild(title);
      }

      if (data.tinh_huong) {
        const p = document.createElement("p");
        p.textContent = "🟢 Tình huống: " + data.tinh_huong;
        p.style.fontStyle = "italic";
        p.style.marginBottom = "10px";
        contentBox.appendChild(p);
      }

      if (data.hoi_thoai) {
        renderSection("💬 Hội thoại", data.hoi_thoai, ["🇻🇳", "🇺🇸", "IPA"]);
      }

      if (data.luyen_cau) {
        renderSection("🗣️ Luyện câu", data.luyen_cau, ["🇻🇳", "🇺🇸", "IPA", "VPM"]);
      }

      if (data.tu_vung) {
        renderSection("📚 Từ vựng", data.tu_vung, ["🇻🇳", "🇺🇸", "IPA", "VPM"]);
      }
    })
    .catch(error => {
      contentBox.textContent = "Không thể tải nội dung bài học.";
      console.error("Lỗi khi tải unit1.json:", error);
    });
});
