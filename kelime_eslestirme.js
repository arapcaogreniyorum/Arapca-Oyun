// ==========================================================
// KELİME EŞLEŞTİRME OYUNU
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
const gameContainer = document.querySelector('.game-container');
const stageDisplay = document.getElementById('current-stage');
const matchedPairsDisplay = document.getElementById('matched-pairs');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let currentStage = 1;
const CARDS_PER_STAGE = 12; // Her aşamada 6 çift (12 kart)

// Seslendirme Fonksiyonu
function speak(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

// Oyunu Başlatma
function startGame() {
    // Sadece Kelime seviyeleri için filtreleme yapıyoruz. (Seviye=0 cümledir)
    const filteredWords = ALL_WORDS_DATA.filter(item => item.seviye > 0);
    
    if (filteredWords.length === 0) {
        gameContainer.innerHTML = "Şu an oynanabilir kelime yok. Lütfen 'cumle.html'e geçin.";
        return;
    }
    
    // Rastgele 6 çift kelime seç
    let stageWords = [];
    
    // Eğer o seviye için yeterli kelime varsa o seviyedeki kelimelerden seç
    const wordsForCurrentStage = filteredWords.filter(item => item.seviye === currentStage);
    
    // Eğer o seviyede yeterli kelime yoksa, kalan tüm kelimelerden seç
    const pool = wordsForCurrentStage.length >= (CARDS_PER_STAGE / 2) ? wordsForCurrentStage : filteredWords;
    
    // Rastgele 6 kelime (6 çift) seçme
    while (stageWords.length < (CARDS_PER_STAGE / 2) && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        stageWords.push(pool.splice(randomIndex, 1)[0]);
    }
    
    if (stageWords.length < 6) {
        // Yeterli kelime yoksa cümle oyununa yönlendir
        gameContainer.innerHTML = '<h2>Tebrikler! Tüm kelime seviyelerini bitirdiniz!</h2><a href="cumle.html" class="menu-button match-game" style="margin-top:20px;">Cümle Eşleştirmeye Geç</a>';
        return;
    }

    // Seçilen 6 çift kelimeyi kartlara dönüştürme (12 kart)
    cards = [];
    stageWords.forEach((word, index) => {
        // Arapça kart
        cards.push({
            id: index, 
            content: word.ar, 
            lang: 'ar-SA', 
            matchId: index,
            isMatched: false
        });
        // Türkçe kart
        cards.push({
            id: index, 
            content: word.tr, 
            lang: 'tr-TR', 
            matchId: index,
            isMatched: false
        });
    });

    // Kartları karıştır
    cards.sort(() => Math.random() - 0.5);

    // Kartları ekranda göster
    renderCards();
    updateScoreBoard();
}

// Kartları Ekrana Çizme
function renderCards() {
    gameContainer.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = card.content;
        cardElement.dataset.matchId = card.matchId;
        cardElement.dataset.lang = card.lang; 
        cardElement.addEventListener('click', () => handleCardClick(cardElement, card));
        gameContainer.appendChild(cardElement);
    });
}

// Kart Tıklama İşlemi
function handleCardClick(element, data) {
    if (element.classList.contains('flipped') || element.classList.contains('matched') || flippedCards.length === 2) {
        return;
    }

    element.classList.add('flipped');
    flippedCards.push({element, data});
    
    // Arapça kartı seslendir
    if(data.lang === 'ar-SA') {
        speak(data.content, 'ar-SA');
    }

    if (flippedCards.length === 2) {
        setTimeout(checkForMatch, 1000); 
    }
}

// Eşleşmeyi Kontrol Etme
function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.data.matchId === card2.data.matchId) {
        // Eşleşti!
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
        matchedPairs++;
        updateScoreBoard();

        if (matchedPairs === (CARDS_PER_STAGE / 2)) {
            // Aşama bitti
            setTimeout(nextStage, 1500);
        }
    } else {
        // Eşleşmedi, kartları geri çevir
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
    }

    flippedCards = [];
}

// Aşama İlerletme
function nextStage() {
    currentStage++;
    matchedPairs = 0;
    
    // Yeni aşamayı başlat
    startGame();
}

// Puan Tablosunu Güncelleme
function updateScoreBoard() {
    stageDisplay.textContent = currentStage;
    matchedPairsDisplay.textContent = matchedPairs;
}

// Sayfa Yüklendiğinde veriyi çek ve oyunu başlat
loadData();
