// telaffuz_pratigi.js - Telaffuz Pratiği Oyunu (Web Speech API ile - Son Versiyon)

let items = []; // Kelime ve cümlelerin birleşimi (Mevcut Seviyeye Göre Filtrelenmiş)
let currentItem = null;
let retryScore = 0; // Doğru skor artık Local Storage'dan yönetilecek
let recognition = null; // Konuşma tanıma objesi

document.addEventListener('DOMContentLoaded', () => {
    loadData().then(data => {
        if (data) {
            window.allData = data;
            
            // YENİ: Başlangıçta sadece mevcut seviyedeki öğeleri çek
            filterAndShuffleItems(); 
            
            // YENİ EKLENEN KISIM: MEVCUT SEVİYEYİ HTML'e yaz
            const currentLevel = getCurrentGlobalLevel();
            const levelDisplay = document.getElementById('current-global-level');
            if (levelDisplay) {
                levelDisplay.textContent = currentLevel;
            }
            
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                initializeSpeechRecognition();
                setupListeners();
                
                // Başlangıç skorlarını Local Storage'dan yükle
                document.getElementById('correct-score-speech').textContent = getGameScore('telaffuz');
                
                nextItem();
            } else {
                document.getElementById('feedback').textContent = "⚠️ Üzgünüz! Tarayıcınız Konuşma Tanıma özelliğini desteklemiyor (Chrome/Edge önerilir).";
                document.getElementById('start-speech').disabled = true;
            }
        }
    });
});

// YENİ FONKSİYON: Veriyi mevcut seviyeye göre filtreler ve karıştırır
function filterAndShuffleItems() {
    // getCurrentGlobalLevel utility.js'den gelir
    const currentLevel = getCurrentGlobalLevel(); 
    
    // Sadece kullanıcının mevcut seviyesine kadar olan verileri filtrele
    const filteredKelimeler = window.allData.kelimeler.filter(item => item.seviye <= currentLevel);
    const filteredCumleler = window.allData.cumleler.filter(item => item.seviye <= currentLevel);
    
    // Filtrelenmiş kelime ve cümleleri birleştir ve karıştır
    items = [...filteredKelimeler, ...filteredCumleler];
    shuffle(items);
    
    if (items.length === 0) {
        document.getElementById('feedback').textContent = "👏 Tebrikler! Bu seviyedeki tüm kelimeleri bitirdiniz. Yeni seviyeye geçmek için diğer oyunları da oynamayı deneyin!";
    }
}

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
        // Tüm seviye kelimeleri bittiyse, listeyi tekrar yükle ve karıştır.
        filterAndShuffleItems();
        if (items.length === 0) {
             endGame(); // Hala sıfırsa oyunu bitir (Bu, data.js'te veri eksikliği anlamına gelebilir)
             return;
        }
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

    // --- KRİTİK VE SIKI EŞLEŞTİRME DÜZELTMESİ BAŞLANGICI ---
    
    // Model ve Sonucu normalizeArabic ile temizle (utility.js'deki son, en agresif temizleyici)
    const normalizedResult = normalizeArabic(result);
    const normalizedModel = normalizeArabic(currentItem.ar); 
    
    // Modeli ve sonucu kelime dizilerine ayır
    const modelWords = normalizedModel.split(' ').filter(w => w.length > 0);
    const resultWords = normalizedResult.split(' ').filter(w => w.length > 0); 

    let successfulMatches = 0;
    
    // Eğer beklenen tek bir kelimeyse:
    if (modelWords.length === 1) {
        const perfectMatch = normalizedResult.includes(normalizedModel);
        if (perfectMatch) {
            successfulMatches = 1; 
        }
    
    // Eğer beklenen birden fazla kelimeden oluşan bir cümle ise:
    } else {
        const matchedIndices = new Set();
        
        modelWords.forEach(mWord => {
            const resultIndex = resultWords.findIndex((rWord, index) => 
                !matchedIndices.has(index) && (rWord === mWord || rWord.includes(mWord) || mWord.includes(rWord))
            );

            if (resultIndex !== -1) {
                successfulMatches++;
                matchedIndices.add(resultIndex);
            }
        });
        
        // Eşleşme sayısını, model kelime sayısının en az %60'ı olmalıdır.
        if (successfulMatches < modelWords.length * 0.6) {
            successfulMatches = 0;
        }
    }
    // --- KRİTİK VE SIKI EŞLEŞTİRME DÜZELTMESİ SONU ---

    if (successfulMatches > 0) { 
        // YENİ: utility.js'deki fonksiyon ile skoru kaydet ve seviye atlamayı kontrol et
        updateGameScore('telaffuz', true); 
        
        document.getElementById('feedback').textContent = "✅ Mükemmel! Telaffuzunuz başarılıydı. Tebrikler!";
        document.getElementById('feedback').style.color = 'var(--success-green)';
        
        // Zor kelime takibi için:
        // updateDifficultWords(currentItem, 'remove', 'telaffuz_pratigi'); 
        
        setTimeout(nextItem, 2500);
    } else {
        retryScore++;
        document.getElementById('feedback').textContent = `❌ Tekrar Deneyin. Telaffuzunuz tam eşleşmedi. Doğru model: "${currentItem.ar}"`;
        document.getElementById('feedback').style.color = 'red';
        
        // Zor kelimelere ekle:
        // updateDifficultWords(currentItem, 'add', 'telaffuz_pratigi'); 
        
        setTimeout(() => {
            document.getElementById('feedback').textContent = 'Tekrar okumayı deneyin veya doğru okunuşu dinleyin.';
            document.getElementById('feedback').style.color = 'var(--dark-text)';
        }, 3000);
    }

    // YENİ: correctScore artık Local Storage'dan çekiliyor
    document.getElementById('correct-score-speech').textContent = getGameScore('telaffuz');
    document.getElementById('retry-score-speech').textContent = retryScore;
}

function endGame() {
    const container = document.querySelector('.speech-game-container');
    
    container.innerHTML = `
        <h2>Oyun Bitti!</h2>
        <p>Başarılı Okuma Sayısı: ${getGameScore('telaffuz')}</p>
        <p>Tekrar Deneme Sayısı: ${retryScore}</p>
        <button id="restart-button" class="type-button" style="background-color: var(--primary-blue);">Baştan Başla (Tekrar Oyna)</button>
    `;
    
    // İlerleme Kaydı
    localStorage.setItem('speech_completed', 'true');
    
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

function restartGame() {
    retryScore = 0;
    
    // YENİ: Verileri tekrar filtreleyip karıştır
    filterAndShuffleItems();
    
    const container = document.querySelector('.speech-game-container');
    container.innerHTML = `
    <div id="current-global-level-display">
        ⭐ Mevcut Seviye: <span id="current-global-level">${getCurrentGlobalLevel()}</span>
    </div>
    
    <div class="score-board">
        Başarılı: <span id="correct-score-speech">${getGameScore('telaffuz')}</span> | Tekrar Dene: <span id="retry-score-speech">0</span>
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
