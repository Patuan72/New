
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
            function safeNumber(x) {
              return (typeof x === "number" && !isNaN(x)) ? x : 0;
            }

            if (features) {
              const rms = safeNumber(features.rms);
              const zcr = safeNumber(features.zcr);
              const flat = safeNumber(features.spectralFlatness);
              const centroid = safeNumber(features.spectralCentroid);
              const mfcc = Array.isArray(features.mfcc) ? features.mfcc : [];
              let score = 0;

              let rmsScore = Math.min(1, rms / 0.05) * 20;
              let zcrScore = Math.max(0, 1 - zcr / 0.2) * 15;
              let flatScore = Math.max(0, 1 - flat / 0.5) * 15;
              let centroidScore = (centroid > 200 && centroid < 2000) ? 20 : 10;
              let mfccScore = mfcc.length > 0 ? 10 : 0;

              score = rmsScore + zcrScore + flatScore + centroidScore + mfccScore;
              scoreBox.textContent = Math.round(score);
            } else {
              scoreBox.textContent = "0";
            }

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

  document.querySelectorAll("#downloadedList a").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const res = await fetch(link.dataset.unit);
      const data = await res.json();
      sentenceList.innerHTML = "";
      data.sentences.forEach((sentence, i) => {
        const div = document.createElement("div");
        div.textContent = (i + 1) + ". " + sentence;
        div.className = "sentence-item";
        div.addEventListener("click", () => {
          currentSentence = sentence;
          speakSentence(sentence);
        });
        sentenceList.appendChild(div);
      });
      libraryPanel.classList.add("hidden");
    });
  });

  function speakSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = "en-US";
    utterance.rate = currentRate;
    speechSynthesis.speak(utterance);
  }
});
