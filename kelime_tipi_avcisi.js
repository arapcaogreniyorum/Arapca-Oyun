// ==========================================================
// KELİME TİPİ AVCISI OYUNU
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
        console.log("Veri başarıyla yüklendi. Toplam kelime:", ALL_WORDS_DATA.length);
        
        startGame(); 

    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        alert("Üzgünüz, oyun verileri yüklenemedi. Lütfen sayfayı yenileyin.");
    }
}

// Oyun Değişkenleri
const wordDisplay = document.getElementById('word-display');
const scoreDisplay = document.getElementById('score');
const missesDisplay = document.getElementById('misses');
const typeOptionsDiv = document.querySelector('.type-options');

let currentWord = null;
let score = 0;
let misses = 0;
// JSON'dan gelebilecek tüm ana tipleri tanımlıyoruz
let availableTypes = ['İSİM', 'FİİL', 'SIFAT', 'ZAMİR', 'ZARF', 'EDAT', 'BAĞLAÇ', 'SORU']; 

// Seslendirme Fonksiyonu
function speak(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

// Oyun Başlatma (loadData tarafından çağrılır)
function startGame() {
    createTypeButtons();
    wordDisplay.textContent = 'Başlamak için tipe tıkla!';
}

// Tıklanabilir butonları oluşturur
function createTypeButtons() {
    typeOptionsDiv.innerHTML = '';
    
    // Şimdilik en temel ve sık kullanılan tipleri gösterelim
    const typesToShow = ['İSİM', 'FİİL', 'SIFAT', 'ZAMİR']; 

    typesToShow.forEach(type => {
        const button = document.createElement('button');
        button.className = 'type-button';
        button.dataset.type = type;
        button.textContent = type;
        button.addEventListener('click', checkAnswer);
        typeOptionsDiv.appendChild(button);
    });
    
    // İlk tıklamada ilk kelimeyi yüklemek için tüm butonlara başlangıç olayı ekle
    document.querySelectorAll('.type-button').forEach(button => {
        button.addEventListener('click', (e) => {
            if (!currentWord) {
                e.stopImmediatePropagation(); // Diğer click olaylarını durdur
                nextWord();
                checkAnswer.call(e.currentTarget);
            }
        });
    });
    
    // Sadece bir kere çağrılacak bir ilk kelime yükleme fonksiyonu
    nextWord();
}

// Yeni kelimeyi seçme ve gösterme
function nextWord() {
    // Kelime Tipi Avcısı için 'tip' özelliği olan kelimeleri kullan
    const eligibleWords = ALL_WORDS_DATA.filter(w => w.tip);
    
    if (eligibleWords.length === 0) {
        wordDisplay.textContent = "Tebrikler, tüm kelimeleri bitirdin!";
        return;
    }
    
    // Rastgele bir kelime seç
    const randomIndex = Math.floor(Math.random() * eligibleWords.length);
    currentWord = eligibleWords[randomIndex];
    
    // Kelimeyi ekranda göster ve seslendir
    wordDisplay.textContent = currentWord.ar;
    speak(currentWord.ar, 'ar-SA');
}

// Cevabı kontrol etme
function checkAnswer() {
    if (!currentWord) return;

    const selectedType = this.dataset.type;
    
    if (selectedType === currentWord.tip) {
        // Doğru Cevap
        score++;
        scoreDisplay.textContent = score;
        wordDisplay.style.color = 'var(--success-green)';
        wordDisplay.textContent = 'صحيح! ✅ (' + currentWord.tr + ')';
        setTimeout(nextWord, 750); 
    } else {
        // Yanlış Cevap
        misses++;
        missesDisplay.textContent = misses;
        wordDisplay.style.color = 'red';
        wordDisplay.textContent = `خطأ! ❌ (${currentWord.tr} - Doğru: ${currentWord.tip})`;
        speak('خطأ', 'ar-SA'); 
        setTimeout(() => {
            wordDisplay.style.color = 'var(--secondary-orange)';
            nextWord();
        }, 1500);
    }
}

// Veri yükleme işlemini başlat
loadData();
