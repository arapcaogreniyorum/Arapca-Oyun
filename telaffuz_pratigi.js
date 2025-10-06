// telaffuz_pratigi.js - Telaffuz Pratiği Oyunu (Web Speech API ile - Son Versiyon)

let items = []; // Kelime ve cümlelerin birleşimi
let currentItem = null;
let correctScore = 0;
let retryScore = 0;
let recognition = null; // Konuşma tanıma objesi

document.addEventListener('DOMContentLoaded', () => {
    loadData().then(data => {
        if (data) {
            window.allData = data;
            items = [...data.kelimeler, ...data.cumleler];
            shuffle(items);
            
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                initializeSpeechRecognition();
                setupListeners();
                nextItem();
            } else {
                document.getElementById('feedback').textContent = "⚠️ Üzgünüz! Tarayıcınız Konuşma Tanıma özelliğini desteklemiyor (Chrome/Edge önerilir).";
                document.getElementById('start-speech').disabled = true;
            }
        }
    });
});

function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        processSpeechResult(result);
    };

    recognition.onerror = (event) => {
        document.getElementById('feedback').textContent = `Hata oluştu: ${event.error}. Lütfen mikrofon izni verdiğinizden emin olun ve tekrar deneyin.`;
        document.getElementById('start-speech').disabled = false;
        document.getElementById('start-speech').textContent = "🎤 Başla ve Oku";
    };

    recognition.onend = () => {
        document.getElementById('start-speech').textContent = "🎤 Başla ve Oku";
    };
}

function setupListeners() {
    document.getElementById('listen-model').addEventListener('click', speakCurrentItem);
    document.getElementById('start-speech').addEventListener('click', startSpeechRecognition);
}

function nextItem() {
    if (items.length === 0) {
        endGame();
        return;
    }

    currentItem = items.pop();
    document.getElementById('word-to-read').textContent = currentItem.ar;
    document.getElementById('translation-display').textContent = `Türkçesi: ${currentItem.tr}`;
    document.getElementById('feedback').textContent = 'Okumaya hazır olduğunuzda "Başla ve Oku" butonuna basın.';
    document.getElementById('user-speech-output').textContent = '';
    
    document.getElementById('start-speech').disabled = false;
    document.getElementById('listen-model').disabled = false;
}

function speakCurrentItem() {
    if (!currentItem) return;
    const utterance = new SpeechSynthesisUtterance(currentItem.ar);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8; 
    window.speechSynthesis.speak(utterance);
}

function startSpeechRecognition() {
    if (recognition) {
        document.getElementById('feedback').textContent = 'Dinliyorum... Lütfen şimdi Arapça okuyun.';
        document.getElementById('start-speech').textContent = "🔴 Okunuyor...";
        document.getElementById('start-speech').disabled = true;
        document.getElementById('listen-model').disabled = true;
        recognition.start();
    }
}

function processSpeechResult(result) {
    document.getElementById('user-speech-output').textContent = `Sistem Algıladı: ${result}`;
    document.getElementById('start-speech').disabled = false;
    document.getElementById('listen-model').disabled = false;

    // --- KRİTİK DÜZELTME BAŞLANGICI: normalizeArabic fonksiyonu kullanılıyor ---
    
    // Sistemden gelen metin ve model metin normalize ediliyor. (utility.js'den gelen normalizeArabic)
    const normalizedResult = normalizeArabic(result);
    const normalizedModel = normalizeArabic(currentItem.ar); 
    
    // Basit ve güvenilir kontrol: Algılanan metin, model metni içeriyor mu?
    // Bu, "سياره سياره" gibi tekrarlı veya "kitap" yerine "el kitap" gibi ek kelime içeren sonuçları da kabul etmeyi kolaylaştırır.
    const isMatch = normalizedResult.includes(normalizedModel);
    
    // Ayrıca, telaffuzun çok kısa olmaması için bir uzunluk kontrolü de ekleyebiliriz (isteğe bağlı, basitleştirilmiş)
    const minLengthCheck = normalizedResult.length > normalizedModel.length * 0.5;

    if (isMatch && minLengthCheck) { 
        correctScore++;
        document.getElementById('feedback').textContent = "✅ Mükemmel! Telaffuzunuz başarılıydı. Tebrikler!";
        document.getElementById('feedback').style.color = 'var(--success-green)';
        
        // Zor kelimelerden çıkar (eğer telaffuz oyunu için zor kelime takibi yapılıyorsa)
        // updateDifficultWords(currentItem, 'remove', 'telaffuz_pratigi'); 
        
        setTimeout(nextItem, 2500);
    } else {
        retryScore++;
        document.getElementById('feedback').textContent = `❌ Tekrar Deneyin. Telaffuzunuz tam eşleşmedi. Doğru model: "${currentItem.ar}"`;
        document.getElementById('feedback').style.color = 'red';
        
        // Zor kelimelere ekle
        // updateDifficultWords(currentItem, 'add', 'telaffuz_pratigi'); 
        
        setTimeout(() => {
            document.getElementById('feedback').textContent = 'Tekrar okumayı deneyin veya doğru okunuşu dinleyin.';
            document.getElementById('feedback').style.color = 'var(--dark-text)';
        }, 3000);
    }
    // --- KRİTİK DÜZELTME SONU ---

    document.getElementById('correct-score-speech').textContent = correctScore;
    document.getElementById('retry-score-speech').textContent = retryScore;
}

function endGame() {
    const container = document.querySelector('.speech-game-container');
    
    container.innerHTML = `
        <h2>Oyun Bitti!</h2>
        <p>Başarılı Okuma Sayısı: ${correctScore}</p>
        <p>Tekrar Deneme Sayısı: ${retryScore}</p>
        <button id="restart-button" class="type-button" style="background-color: var(--primary-blue);">Baştan Başla (Tekrar Oyna)</button>
    `;
    
    // İlerleme Kaydı
    localStorage.setItem('speech_completed', 'true');
    
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

function restartGame() {
    correctScore = 0;
    retryScore = 0;
    
    // Verileri karıştırıp oyunu yeniden başlat
    shuffle(window.allData.kelimeler);
    shuffle(window.allData.cumleler);
    items = [...window.allData.kelimeler, ...window.allData.cumleler];
    shuffle(items);
    
    const container = document.querySelector('.speech-game-container');
    container.innerHTML = `<div class="score-board">
        Başarılı: <span id="correct-score-speech">0</span> | Tekrar Dene: <span id="retry-score-speech">0</span>
    </div>

    <div id="word-to-read">Yükleniyor...</div>
    <div id="translation-display"></div>
    <div id="user-speech-output"></div>

    <div class="control-buttons">
        <button id="listen-model">🔊 Doğru Okunuşu Dinle</button>
        <button id="start-speech">🎤 Başla ve Oku</button>
    </div>
    
    <div id="feedback" style="margin-top: 20px; font-size: 1.2rem;"></div>`;
    
    setupListeners();
    nextItem();
}
