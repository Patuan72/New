
document.addEventListener("DOMContentLoaded", () => {
  const micBtn = document.getElementById("mic");
  const replayBtn = document.getElementById("replay");
  const saveBtn = document.getElementById("save");
  const transcriptBox = document.getElementById("transcript");
  const scoreBox = document.querySelector(".score");
  const sentenceList = document.getElementById("sentenceList");
  const menuBtn = document.getElementById("menuBtn");
  const libraryPanel = document.getElementById("library");
  const backBtn = document.getElementById("backBtn");
  const micIcon = micBtn.querySelector("i");
  const replayIcon = replayBtn.querySelector("i");
  const downloadedList = document.getElementById("downloadedList");

  let currentSentence = "";
  let currentRate = 1.0;
  let audioBlob = null;
  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;

  menuBtn.addEventListener("click", () => {
    libraryPanel.classList.remove("hidden");
  });

  backBtn.addEventListener("click", () => {
    libraryPanel.classList.add("hidden");
  });

  // Danh sách file cố định
  const unitFiles = ["unit1.json", "unit2.json"];
  downloadedList.innerHTML = "";
  unitFiles.forEach(async (file) => {
    try {
      const res = await fetch(file);
      const data = await res.json();
      const title = data.tieu_de || data.title || file;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = title;
      a.addEventListener("click", async (e) => {
        e.preventDefault();
        sentenceList.innerHTML = "";
        const response = await fetch(file);
        const unitData = await response.json();
        if (Array.isArray(unitData.luyen_cau)) {
          unitData.luyen_cau.forEach((item, i) => {
            const div = document.createElement("div");
            div.className = "sentence-item";
            div.innerHTML = `<b>${i + 1}. ${item.en}</b><br/><small>${item.vi}</small>`;
            div.addEventListener("click", () => {
              currentSentence = item.en;
              speakSentence(item.en);
            });
            sentenceList.appendChild(div);
          });
        } else if (Array.isArray(unitData.sentences)) {
          unitData.sentences.forEach((sentence, i) => {
            const div = document.createElement("div");
            div.className = "sentence-item";
            div.textContent = (i + 1) + ". " + sentence;
            div.addEventListener("click", () => {
              currentSentence = sentence;
              speakSentence(sentence);
            });
          });
        }
        libraryPanel.classList.add("hidden");
      });
      li.appendChild(a);
      downloadedList.appendChild(li);
    } catch (err) {
      console.error("Lỗi khi tải file:", file, err);
    }
  });

  function speakSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.rate = currentRate;
    speechSynthesis.speak(utterance);
  }

  micBtn.addEventListener("click", async () => {
    if (!currentSentence) {
      alert("Hãy chọn một câu trước khi ghi âm.");
      return;
    }

    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      transcriptBox.textContent = "🔴 Đang ghi âm... (bấm để dừng)";
      isRecording = true;
      micIcon.className = "bi bi-record-circle";

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        isRecording = false;
        micIcon.className = "bi bi-mic";
        transcriptBox.textContent = "⏳ Đang chấm điểm...";
        const audioBlobTemp = new Blob(audioChunks, { type: "audio/wav" });
        audioBlob = audioBlobTemp;

        const reader = new FileReader();
        reader.onload = async () => {
          const audioContext = new AudioContext();
          const buffer = await audioContext.decodeAudioData(reader.result);
          const offlineSource = audioContext.createBufferSource();
          offlineSource.buffer = buffer;
          const analyser = Meyda.createMeydaAnalyzer({
            audioContext: audioContext,
            source: offlineSource,
            bufferSize: 1024,
            featureExtractors: ['rms', 'zcr', 'spectralFlatness', 'spectralCentroid', 'mfcc']
          });

          offlineSource.connect(audioContext.destination);
          setTimeout(() => {
            const features = analyser.get();
            const safe = x => (typeof x === "number" && !isNaN(x)) ? x : 0;
            let score = 0;
            score += Math.min(1, safe(features.rms) / 0.05) * 20;
            score += Math.max(0, 1 - safe(features.zcr) / 0.2) * 15;
            score += Math.max(0, 1 - safe(features.spectralFlatness) / 0.5) * 15;
            score += (safe(features.spectralCentroid) > 200 && safe(features.spectralCentroid) < 2000) ? 20 : 10;
            score += Array.isArray(features.mfcc) ? 10 : 0;
            scoreBox.textContent = Math.round(score);

            const audio = new Audio(URL.createObjectURL(audioBlob));
            transcriptBox.textContent = "🔊 Đang phát lại...";
            replayIcon.className = "bi bi-volume-up";
            audio.play();
            audio.onended = () => {
              replayIcon.className = "bi bi-arrow-repeat";
              transcriptBox.textContent = "";
            };

            stream.getTracks().forEach(track => track.stop());
          }, 1000);
        };
        reader.readAsArrayBuffer(audioBlob);
      };
      mediaRecorder.start();
    } else {
      mediaRecorder.stop();
    }
  });

  replayBtn.addEventListener("click", () => {
    if (!audioBlob) return alert("Chưa có bản ghi.");
    const audio = new Audio(URL.createObjectURL(audioBlob));
    transcriptBox.textContent = "🔊 Đang phát lại...";
    replayIcon.className = "bi bi-volume-up";
    audio.play();
    audio.onended = () => {
      replayIcon.className = "bi bi-arrow-repeat";
      transcriptBox.textContent = "";
    };
  });

  saveBtn.addEventListener("click", () => {
    if (!audioBlob) return alert("Chưa có bản ghi để lưu.");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "recording.wav";
    a.click();
  });

  document.querySelectorAll(".dot").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      document.querySelectorAll(".dot").forEach(d => d.classList.remove("selected"));
      dot.classList.add("selected");
      currentRate = [0.6, 1.0, 1.4][index];
    });
  });
});