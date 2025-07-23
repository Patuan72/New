
fetch("unit1.json")
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("unit-title").textContent = data.title || "Bài học";
    const box = document.getElementById("content-box");
    box.innerHTML = data.sentences.map(s => 
      `<p><strong>${s.en}</strong><br><em>${s.vi}</em><br>${s.ipa}<br>${s.vpm}</p>`
    ).join("");

    if (data.audio_base64) {
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))
      ], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      document.getElementById("play-audio").onclick = () => audio.play();
    }
  });
