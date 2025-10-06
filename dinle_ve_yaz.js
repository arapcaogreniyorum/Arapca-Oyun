// ==========================================================
// DİNLE VE YAZ OYUNU
// ==========================================================

// Yeni Veri Çekme Yapısı (Tüm JS dosyalarında aynı)
let ALL_WORDS_DATA = [];
let ALL_SENTENCES_DATA = [];
let ALL_FILL_SENTENCES = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP hata kodu: ${response.status}`);
        }
        const data = await response.json();
        ALL_WORDS_DATA = data.kelimeler;
        ALL_SENTENCES_DATA = data.cumleler;
        ALL_FILL_SENTENCES = data.eksik_kelime_cumleleri;
        console.log("Veri başarıyla yüklendi. Kelime sayısı:", ALL_WORDS_DATA.length);
        
        startGame(); 

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        alert("Üzgünüz, oyun verileri yüklenemedi. Lütfen sayfayı yenileyin.");
    }
}

// Oyun Değişkenleri
const speakerButton = document.getElementById('speaker-button');
const checkButton = document.getElementById('check-button');
const userInput = document.getElementById('user-input');
const feedbackDisplay = document.getElementById('feedback');
const correctScoreDisplay = document.getElementById('correct-score-listen');
const wrongScoreDisplay = document.getElementById('wrong-score-listen');

let currentItem = null;
let correctScore = 0;
let wrongScore = 0;

// Seslendirme Fonksiyonu
function speak(text, lang = 'ar-SA', rate = 1.0) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    speechSynthesis.speak(utterance);
}

// Oyunu Başlatma
function startGame() {
    if (ALL_WORDS_DATA.length === 0 && ALL_SENTENCES_DATA.length === 0) {
        feedbackDisplay.textContent = 'Veri bulunamadı.';
        return;
    }
    
    nextItem();
    
    // Olay Dinleyicileri
    speakerButton.addEventListener('click', () => speak(currentItem.ar, 'ar-SA', currentItem.ar.length > 10 ? 0.9 : 1.0));
    checkButton.addEventListener('click', checkAnswer);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

// Yeni Kelime/Cümleyi Yükleme
function nextItem() {
    // Rastgele Kelime veya Cümle seç (eşit şans verelim)
    const isSentence = Math.random() < 0.5 && ALL_SENTENCES_DATA.length > 0;
    
    if (isSentence) {
        const randomIndex = Math.floor(Math.random() * ALL_SENTENCES_DATA.length);
        currentItem = ALL_SENTENCES_DATA[randomIndex];
        // Cümle olduğunu belirten bir ipucu ver
        userInput.placeholder = "Cümlenin Türkçe karşılığını yazın...";
    } else if (ALL_WORDS_DATA.length > 0) {
        const randomIndex = Math.floor(Math.random() * ALL_WORDS_DATA.length);
        currentItem = ALL_WORDS_DATA[randomIndex];
        // Kelime olduğunu belirten bir ipucu ver
        userInput.placeholder = "Kelimenin Türkçe karşılığını yazın...";
    }
    
    userInput.value = '';
    feedbackDisplay.textContent = '';
    userInput.disabled = false;
    checkButton.disabled = false;
    speakerButton.disabled = false;

    // Yüklenir yüklenmez seslendir
    speak(currentItem.ar, 'ar-SA', currentItem.ar.length > 10 ? 0.9 : 1.0);
}

// Cevabı Kontrol Etme
function checkAnswer() {
    if (!currentItem) return;
    
    const userText = userInput.value.trim().toLowerCase();
    const correctText = currentItem.tr.trim().toLowerCase().replace(/[\[\]]/g, ''); // [KELİME] formatını temizle
    
    userInput.disabled = true;
    checkButton.disabled = true;

    // Basit doğrulama: kullanıcı cevabını doğru cevabın bir parçası olarak kabul etme
    const isCorrect = userText === correctText;
    
    if (isCorrect) {
        // Doğru Cevap
        correctScore++;
        correctScoreDisplay.textContent = correctScore;
        feedbackDisplay.textContent = `✅ Doğru! (${currentItem.tr})`;
        feedbackDisplay.style.color = 'var(--success-green)';
    } else {
        // Yanlış Cevap
        wrongScore++;
        wrongScoreDisplay.textContent = wrongScore;
        feedbackDisplay.textContent = `❌ Yanlış! Doğrusu: ${currentItem.tr}`;
        feedbackDisplay.style.color = 'red';
    }
    
    // 3 saniye sonra yeni kelimeye geç
    setTimeout(nextItem, 3000);
}

// Veri yükleme işlemini başlat
loadData();
