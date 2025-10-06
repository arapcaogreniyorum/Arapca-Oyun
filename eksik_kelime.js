// ==========================================================
// EKSİK KELİMEYİ BUL OYUNU
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
        console.log("Veri başarıyla yüklendi. Toplam eksik kelime cümlesi:", ALL_FILL_SENTENCES.length);
        
        startGame(); 

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        alert("Üzgünüz, oyun verileri yüklenemedi. Lütfen sayfayı yenileyin.");
    }
}

// Oyun Değişkenleri
const sentenceDisplay = document.getElementById('sentence-display');
const choiceOptionsDiv = document.querySelector('.choice-options');
const translationDisplay = document.getElementById('translation-display');
const correctScoreDisplay = document.getElementById('correct-score');
const wrongScoreDisplay = document.getElementById('wrong-score');
const choiceButtons = document.querySelectorAll('.choice-button');

let currentSentence = null;
let correctScore = 0;
let wrongScore = 0;

// Seslendirme Fonksiyonu
function speak(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
}

// Oyunu Başlatma
function startGame() {
    if (ALL_FILL_SENTENCES.length === 0) {
        sentenceDisplay.innerHTML = '<h2>Eksik kelime cümleleri yüklenemedi.</h2>';
        return;
    }
    nextSentence();
    // Butonlara click olayını atama
    choiceButtons.forEach(button => button.addEventListener('click', checkAnswer));
}

// Yeni Cümleyi Yükleme
function nextSentence() {
    translationDisplay.textContent = '';
    
    // Rastgele cümle seç
    const randomIndex = Math.floor(Math.random() * ALL_FILL_SENTENCES.length);
    currentSentence = ALL_FILL_SENTENCES[randomIndex];
    
    // [KELİME] kısmını gizli boşluk olarak göster
    const displayedSentence = currentSentence.ar.replace(`[${currentSentence.dogru}]`, `<span class="blank-space">...</span>`);
    sentenceDisplay.innerHTML = displayedSentence;
    
    // Seçenekleri oluştur
    createChoices();
}

// Seçenekleri Oluşturma
function createChoices() {
    let choices = [currentSentence.dogru];
    
    // Yanlış cevaplar için havuz
    const wrongAnswersPool = ALL_FILL_SENTENCES
        .map(c => c.dogru)
        .filter(d => d !== currentSentence.dogru);
    
    // 3 yanlış cevap ekle
    while (choices.length < 4 && wrongAnswersPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * wrongAnswersPool.length);
        const wrongChoice = wrongAnswersPool.splice(randomIndex, 1)[0];
        if (!choices.includes(wrongChoice)) {
            choices.push(wrongChoice);
        }
    }
    
    // Seçenekleri karıştır
    choices.sort(() => Math.random() - 0.5);
    
    // Butonlara seçenekleri yerleştir
    choiceButtons.forEach((button, index) => {
        button.textContent = choices[index];
        button.dataset.choice = choices[index];
        button.style.backgroundColor = 'var(--success-green)';
        button.disabled = false;
    });
}

// Cevabı Kontrol Etme
function checkAnswer() {
    const selectedChoice = this.dataset.choice;
    
    // Tüm butonları devre dışı bırak
    choiceButtons.forEach(button => button.disabled = true);
    
    if (selectedChoice === currentSentence.dogru) {
        // Doğru Cevap
        correctScore++;
        correctScoreDisplay.textContent = correctScore;
        translationDisplay.textContent = `✅ Harika! Türkçesi: "${currentSentence.tr.replace(`[${currentSentence.dogru}]`, selectedChoice)}"`;
        translationDisplay.style.color = 'var(--success-green)';
        
        // Cümlenin tamamını seslendir
        speak(currentSentence.ar.replace(`[${currentSentence.dogru}]`, currentSentence.dogru), 'ar-SA');
        
    } else {
        // Yanlış Cevap
        wrongScore++;
        wrongScoreDisplay.textContent = wrongScore;
        this.style.backgroundColor = 'red';
        translationDisplay.textContent = `❌ Hata! Doğru kelime: ${currentSentence.dogru}. Türkçesi: "${currentSentence.tr.replace(`[${currentSentence.dogru}]`, currentSentence.dogru)}"`;
        translationDisplay.style.color = 'red';
    }
    
    // Doğru kelimeyi gösteren butonu vurgula
    document.querySelector(`.choice-button[data-choice="${currentSentence.dogru}"]`).style.backgroundColor = 'var(--primary-blue)';
    
    // 3 saniye sonra yeni cümleye geç
    setTimeout(nextSentence, 3000);
}

// Veri yükleme işlemini başlat
loadData();
