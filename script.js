
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

  let currentSentence = "";
  let currentRate = 1.0;
  let audioBlob = null;
  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;
  let targetFeatures = null;
  let meydaAnalyzer = null;
  let audioContext = null;

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
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      meydaAnalyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: source,
        bufferSize: 512,
        featureExtractors: ["rms", "zcr"],
        callback: features => {
          targetFeatures = features;
        }
      });
      meydaAnalyzer.start();

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      isRecording = true;
      transcriptBox.textContent = "🔴 Đang ghi âm... (bấm lại để dừng)";

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        isRecording = false;
        transcriptBox.textContent = "";
        meydaAnalyzer.stop();
        processAudio(audioBlob);
      };

      mediaRecorder.start();
    } else {
      mediaRecorder.stop();
    }
  });

  replayBtn.addEventListener("click", () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  });

  saveBtn.addEventListener("click", () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = audioUrl;
      a.download = "recording.wav";
      a.click();
    }
  });

  function processAudio(blob) {
    const reader = new FileReader();
    reader.onloadend = () => {
      audioContext.decodeAudioData(reader.result, buffer => {
        const offlineCtx = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(offlineCtx.destination);
        source.start(0);
        offlineCtx.startRendering().then(renderedBuffer => {
          const tempCtx = new AudioContext();
          const tempSource = tempCtx.createBufferSource();
          tempSource.buffer = renderedBuffer;
          const analyzer = Meyda.createMeydaAnalyzer({
            audioContext: tempCtx,
            source: tempCtx.createMediaStreamSource(tempCtx.createMediaStreamDestination().stream),
            bufferSize: 512,
            featureExtractors: ["rms", "zcr"],
            callback: () => {}
          });
          analyzer._m.signal = renderedBuffer.getChannelData(0);
          const userFeatures = analyzer.extract(["rms", "zcr"]);

          let score = 85;
          if (targetFeatures && userFeatures) {
            const rmsDiff = Math.abs(targetFeatures.rms - userFeatures.rms);
            const zcrDiff = Math.abs(targetFeatures.zcr - userFeatures.zcr);
            score = Math.max(0, 100 - (rmsDiff * 100 + zcrDiff * 100));
          }
          scoreBox.textContent = Math.round(score);
        });
      });
    };
    reader.readAsArrayBuffer(blob);
  }

  function speakSentence(sentence) {
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = currentRate;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  document.querySelectorAll("#downloadedList a").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      const res = await fetch(link.dataset.unit);
      const data = await res.json();
      sentenceList.innerHTML = "";

      if (data.hoi_thoai) {
        const title = document.createElement("h3");
        title.textContent = "🗣️ Hội thoại";
        sentenceList.appendChild(title);

        data.hoi_thoai.forEach(item => {
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

      if (data.luyen_cau) {
        const title = document.createElement("h3");
        title.textContent = "🎯 Luyện câu phản xạ";
        sentenceList.appendChild(title);

        data.luyen_cau.forEach(item => {
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

      if (data.tu_vung) {
        const title = document.createElement("h3");
        title.textContent = "📚 Từ vựng";
        sentenceList.appendChild(title);

        data.tu_vung.forEach(item => {
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
});
