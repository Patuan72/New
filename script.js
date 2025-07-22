
document.addEventListener("DOMContentLoaded", () => {
  const unitSelector = document.getElementById("unitSelector");
  const contentArea = document.getElementById("content");

  const loadUnit = async (unitFile) => {
    const res = await fetch(unitFile);
    const data = await res.json();

    let html = `<h2>${data.ten_bai}</h2>`;
    html += `<h3>Tình huống:</h3><p>${data.tinh_huong}</p>`;

    html += `<h3>Hội thoại:</h3><ul>`;
    data.hoi_thoai_tieng_viet.forEach((tv, i) => {
      html += `<li>${tv}<br><i>${data.hoi_thoai_tieng_anh[i]}</i></li>`;
    });
    html += `</ul>`;

    html += `<h3>Luyện câu:</h3><ul>`;
    data.luyen_cau.forEach(item => {
      html += `<li><b>${item.tieng_viet}</b><br>${item.tieng_anh} /${item.phien_am}/<br><code>${item.vpm}</code></li>`;
    });
    html += `</ul>`;

    html += `<h3>Từ vựng:</h3><table border="1" cellpadding="5" cellspacing="0">
      <tr><th>Tiếng Việt</th><th>Tiếng Anh</th><th>IPA</th><th>VPM</th></tr>`;
    data.tu_vung.forEach(word => {
      html += `<tr><td>${word.tieng_viet}</td><td>${word.tieng_anh}</td><td>/${word.phien_am}/</td><td>${word.vpm}</td></tr>`;
    });
    html += `</table>`;

    contentArea.innerHTML = html;
  };

  unitSelector.addEventListener("change", (e) => {
    loadUnit(e.target.value);
  });

  // Load default
  loadUnit("unit1.json");
});
