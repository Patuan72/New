
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
  
  const downloadedList = document.getElementById("downloadedList");
  downloadedList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const unitFile = link.dataset.unit;

      try {
        const res = await fetch(unitFile);
        const data = await res.json();

        // Gọi hàm hiển thị câu
        renderSentences(data);
        libraryPanel.classList.add("hidden");

        transcriptBox.textContent = `📝 Đã tải: ${data.title || unitFile}`;
      } catch (err) {
        transcriptBox.textContent = `❌ Lỗi tải ${unitFile}`;
      }
    });
  });
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
          const arrayBuffer = reader.result;
          const originalContext = new AudioContext();
          const buffer = await originalContext.decodeAudioData(arrayBuffer);

          const offlineCtx = new OfflineAudioContext(
            buffer.numberOfChannels,
            buffer.length,
            buffer.sampleRate
          );

          const source = offlineCtx.createBufferSource();
          source.buffer = buffer;

          const featuresArray = [];

          const analyser = Meyda.createMeydaAnalyzer({
            audioContext: offlineCtx,
            source: source,
            bufferSize: 512,
            featureExtractors: ['rms', 'zcr', 'spectralFlatness', 'spectralCentroid', 'mfcc'],
            callback: features => {
              featuresArray.push(features);
            }
          });

          analyser.start();
          source.start();

          await offlineCtx.startRendering();

          function mean(arr) {
            return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
          }

          let rmsList = featuresArray.map(f => f.rms || 0);
          let zcrList = featuresArray.map(f => f.zcr || 0);
          let flatList = featuresArray.map(f => f.spectralFlatness || 0);
          let centroidList = featuresArray.map(f => f.spectralCentroid || 0);
          let mfccList = featuresArray.map(f => f.mfcc || []);

          const avg = {
            rms: mean(rmsList),
            zcr: mean(zcrList),
            flat: mean(flatList),
            centroid: mean(centroidList),
            mfcc: mean(mfccList.map(m => m.length ? mean(m) : 0))
          };

          let rmsScore = Math.min(1, avg.rms / 0.05) * 20;
          let zcrScore = Math.max(0, 1 - avg.zcr / 0.2) * 15;
          let flatScore = Math.max(0, 1 - avg.flat / 0.5) * 15;
          let centroidScore = (avg.centroid > 200 && avg.centroid < 2000) ? 20 : 10;
          let mfccScore = avg.mfcc > 0 ? 10 : 0;

          const score = rmsScore + zcrScore + flatScore + centroidScore + mfccScore;
          scoreBox.textContent = Math.round(score);

          const audio = new Audio(URL.createObjectURL(audioBlob));
          transcriptBox.textContent = "🔊 Đang phát lại...";
          replayIcon.className = "bi bi-volume-up";
          audio.play();
          audio.onended = () => {
            replayIcon.className = "bi bi-arrow-repeat";
            transcriptBox.textContent = "";
          };
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
unitData.sentences.forEach((sentence, index) => {
  const item = document.createElement("li");
  item.innerHTML = `
    <b>${sentence.en}</b><br>
    <i>${sentence.vi}</i><br>
    /${sentence.ipa}/ – ${sentence.vpm}
  `;
  sentenceList.appendChild(item);
});

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

  function renderSentences(unitData) {
    sentenceList.innerHTML = '';
    unitData.sentences.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = 'sentence-item';
      div.textContent = typeof s === 'string' ? s : s.text;
      div.dataset.index = idx;

      div.addEventListener('click', () => {
        const items = document.querySelectorAll('.sentence-item');
        items.forEach(item => item.classList.remove('selected'));
        div.classList.add('selected');

        currentSentence = div.textContent;
        transcriptBox.textContent = `✅ Đã chọn: ${currentSentence}`;
      });

      sentenceList.appendChild(div);
    });
  }

  const downloadedList = document.getElementById("downloadedList");
  downloadedList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      const unitFile = link.dataset.unit;

      try {
        const res = await fetch(unitFile);
        const data = await res.json();

        renderSentences(data);
        libraryPanel.classList.add("hidden");
        transcriptBox.textContent = `📝 Đã tải: ${data.title || unitFile}`;
      } catch (err) {
        transcriptBox.textContent = `❌ Lỗi tải ${unitFile}`;
      }
    });
  });

});
