// ==========================================================
// CÜMLE EŞLEŞTİRME OYUNU
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
        console.log("Veri başarıyla yüklendi. Toplam cümle:", ALL_SENTENCES_DATA.length);
        
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
const CARDS_PER_STAGE = 8; // Her aşamada 4 çift (8 kart)

// Seslendirme Fonksiyonu
function speak(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    // Cümleler için seslendirme hızını biraz düşürebiliriz
    utterance.rate = 0.9; 
    speechSynthesis.speak(utterance);
}

// Oyunu Başlatma
function startGame() {
    const filteredSentences = ALL_SENTENCES_DATA.filter(item => item.seviye > 0);
    
    if (filteredSentences.length === 0) {
        gameContainer.innerHTML = "Şu an oynanabilir cümle yok.";
        return;
    }
    
    // Rastgele 4 çift cümle seç (4 Arapça, 4 Türkçe)
    let stageSentences = [];
    
    // Eğer o seviye için yeterli cümle varsa o seviyedeki cümlelerden seç
    const sentencesForCurrentStage = filteredSentences.filter(item => item.seviye === currentStage);
    
    // Eğer o seviyede yeterli cümle yoksa, kalan tüm cümlelerden seç
    const pool = sentencesForCurrentStage.length >= (CARDS_PER_STAGE / 2) ? sentencesForCurrentStage : filteredSentences;
    
    // Rastgele 4 cümle (4 çift) seçme
    while (stageSentences.length < (CARDS_PER_STAGE / 2) && pool.length > 0) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        stageSentences.push(pool.splice(randomIndex, 1)[0]);
    }
    
    if (stageSentences.length < 4) {
        gameContainer.innerHTML = '<h2>Tebrikler! Tüm cümle seviyelerini bitirdiniz!</h2><a href="index.html" class="menu-button match-game" style="margin-top:20px;">Ana Menüye Dön</a>';
        return;
    }

    // Seçilen 4 çift cümleyi kartlara dönüştürme (8 kart)
    cards = [];
    stageSentences.forEach((sentence, index) => {
        // Arapça kart
        cards.push({
            id: index, 
            content: sentence.ar, 
            lang: 'ar-SA', 
            matchId: index,
            isMatched: false
        });
        // Türkçe kart
        cards.push({
            id: index, 
            content: sentence.tr, 
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

// Kartları Ekrana Çizme (Aynı fonksiyon)
function renderCards() {
    gameContainer.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = card.content;
        cardElement.dataset.matchId = card.matchId;
        cardElement.dataset.lang = card.lang; 
        
        // Cümle kartları için font boyutu ayarı
        cardElement.style.fontSize = (card.lang === 'ar-SA' || card.content.length > 20) ? '18px' : '22px';

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

// Eşleşmeyi Kontrol Etme (Aynı fonksiyon)
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
