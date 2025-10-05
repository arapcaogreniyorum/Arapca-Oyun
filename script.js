// 1. TÜM KELİME ÇİFTLERİ VE AŞAMALANDIRMA
const ALL_WORD_STAGES = [
    // --- AŞAMA 1: Temel Selamlaşma ---
    [
        { ar: 'مرحبا', tr: 'Merhaba' },
        { ar: 'شكراً', tr: 'Teşekkürler' },
        { ar: 'نعم', tr: 'Evet' },
        { ar: 'لا', tr: 'Hayır' },
    ],
    // --- AŞAMA 2: Günlük Kavramlar ---
    [
        { ar: 'الماء', tr: 'Su' },
        { ar: 'طعام', tr: 'Yemek' },
        { ar: 'صباح', tr: 'Sabah' },
        { ar: 'مساء', tr: 'Akşam' },
    ],
    // --- AŞAMA 3: Basit Tanımlamalar ---
    [
        { ar: 'كبير', tr: 'Büyük' },
        { ar: 'صغير', tr: 'Küçük' },
        { ar: 'بيت', tr: 'Ev' },
        { ar: 'عمل', tr: 'İş' },
    ]
    // Kelime aşamaları burada bitiyor.
];

// OYUN DURUM DEĞİŞKENLERİ
let currentStage = 0; 
let currentStageWords = []; 

const gameContainer = document.querySelector('.game-container');
const matchedPairsDisplay = document.getElementById('matched-pairs');
const stageDisplay = document.getElementById('current-stage');

let flippedCards = []; 
let isBoardLocked = false; 
let matchedPairs = 0; 

// SESLENDİRME FONKSİYONU
function speak(text, lang) {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
}

// KARTLARI OLUŞTURMA
function createBoard() {
    gameContainer.innerHTML = ''; 

    // Cümle modu CSS'ini temizle (sadece kelime aşamaları için)
    gameContainer.classList.remove('sentence-mode'); 

    const wordPairs = ALL_WORD_STAGES[currentStage];
    
    currentStageWords = [];
    wordPairs.forEach(pair => {
        currentStageWords.push({ content: pair.ar, type: pair.ar, lang: 'ar-SA' }); 
        currentStageWords.push({ content: pair.tr, type: pair.ar, lang: 'tr-TR' }); 
    });

    shuffle(currentStageWords); 
    matchedPairs = 0; 
    
    matchedPairsDisplay.textContent = matchedPairs;
    stageDisplay.textContent = currentStage + 1; 

    currentStageWords.forEach(cardData => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.textContent = '?'; 

        cardElement.dataset.content = cardData.content; 
        cardElement.dataset.type = cardData.type; 
        cardElement.dataset.lang = cardData.lang; 

        cardElement.addEventListener('click', flipCard);
        gameContainer.appendChild(cardElement);
    });
}

// KART ÇEVİRME İŞLEMİ
function flipCard() {
    if (isBoardLocked || this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.textContent = this.dataset.content;
    this.classList.add('flipped');
    speak(this.dataset.content, this.dataset.lang);

    flippedCards.push(this);

    if (flippedCards.length === 2) {
        isBoardLocked = true; 
        checkForMatch();
    }
}

// EŞLEŞME KONTROLÜ VE AŞAMA İLERLEMESİ
function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.type === card2.dataset.type) {
        // Eşleşti
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        
        matchedPairs++;
        matchedPairsDisplay.textContent = matchedPairs;

        // AŞAMA TAMAMLANDI MI?
        if (matchedPairs === (currentStageWords.length / 2)) {
            
            if (currentStage < ALL_WORD_STAGES.length - 1) {
                // Sonraki kelime aşamasına geç
                currentStage++;
                setTimeout(() => {
                    alert(`Tebrikler! ${currentStage + 1}. Kelime Aşamasına geçiliyor.`);
                    createBoard(); 
                }, 1500);
            } else {
                // TÜM KELİME AŞAMALARI BİTTİ -> Cümle sayfasına yönlendir
                setTimeout(() => {
                    alert('MUHTEŞEM! Tüm Kelime Seviyeleri bitti. Şimdi Cümle Eşleştirme başlıyor!');
                    // Kullanıcıyı yeni sayfaya yönlendir
                    window.location.href = 'cumle.html'; 
                }, 1500);
            }
        }
        resetBoard(); 

    } else {
        // Eşleşmedi
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '?'; 
            card2.textContent = '?'; 
            resetBoard(); 
        }, 1000); 
    }
}

// TAHTAYI SIFIRLAMA
function resetBoard() {
    [flippedCards, isBoardLocked] = [[], false];
}

// Oyunu Başlat!
createBoard();
