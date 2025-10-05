// INSTAGRAM VE SES SORUNU İÇİN UYARI
function checkInstagramBrowser() {
    const isInstagramBrowser = /Instagram/i.test(navigator.userAgent);
    if (isInstagramBrowser) {
        alert(
            "DİKKAT! Ses Özelliği Çalışmayabilir.\n\n" +
            "Instagram uygulaması içinden açılan tarayıcılar sesli okumayı engellemektedir.\n" +
            "Lütfen daha iyi bir deneyim için sağ üst köşedeki üç noktaya (...) tıklayarak oyunu Chrome veya Safari gibi HARİCİ BİR TARAYICIDA açın."
        );
    }
}

checkInstagramBrowser();


// 1. TÜM KELİME ÇİFTLERİ VE AŞAMALANDIRMA (Orta ve İleri Seviye dahil)
const ALL_WORD_STAGES = [
    // --- TEMEL SEVİYE AŞAMA 1 ---
    [
        { ar: 'مرحبا', tr: 'Merhaba' },
        { ar: 'شكراً', tr: 'Teşekkürler' },
        { ar: 'نعم', tr: 'Evet' },
        { ar: 'لا', tr: 'Hayır' },
    ],
    // --- TEMEL SEVİYE AŞAMA 2 ---
    [
        { ar: 'الماء', tr: 'Su' },
        { ar: 'طعام', tr: 'Yemek' },
        { ar: 'بيت', tr: 'Ev' },
        { ar: 'سيارة', tr: 'Araba' },
    ],
    // --- ORTA SEVİYE AŞAMA 3 ---
    [
        { ar: 'كتب', tr: 'Yazdı' },
        { ar: 'ذهب', tr: 'Gitti' },
        { ar: 'شرب', tr: 'İçti' },
        { ar: 'قرأ', tr: 'Okudu' },
    ],
    // --- ORTA SEVİYE AŞAMA 4 ---
    [
        { ar: 'كبير', tr: 'Büyük' },
        { ar: 'صغير', tr: 'Küçük' },
        { ar: 'جميل', tr: 'Güzel' },
        { ar: 'قبيح', tr: 'Çirkin' },
    ],
    // --- İLERİ SEVİYE AŞAMA 5 ---
    [
        { ar: 'الحرية', tr: 'Özgürlük' },
        { ar: 'الثقافة', tr: 'Kültür' },
        { ar: 'العدالة', tr: 'Adalet' },
        { ar: 'التحدي', tr: 'Zorluk' },
    ],
    // --- İLERİ SEVİYE AŞAMA 6 ---
    [
        { ar: 'حول', tr: 'Etrafında' },
        { ar: 'لأن', tr: 'Çünkü' },
        { ar: 'بالرغم', tr: 'Rağmen' },
        { ar: 'إلا', tr: 'Hariç' },
    ]
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

// YENİ DEĞİŞKEN: Ses çalınıyor mu kontrolü
let isSpeaking = false; 

// SESLENDİRME FONKSİYONU
function speak(text, lang) {
    if (!('speechSynthesis' in window)) return;
    
    // Ses çalmaya başlamadan önce 'isSpeaking' true yapılır
    isSpeaking = true; 
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Ses bittiğinde 'isSpeaking' false yapılır
    utterance.onend = () => {
        isSpeaking = false;
    };
    
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

// KART ÇEVİRME İŞLEMİ (isSpeaking kontrolü eklendi)
function flipCard() {
    // Ses çalarken veya tahta kilitliyken tıklamayı engelle
    if (isBoardLocked || this.classList.contains('flipped') || this.classList.contains('matched') || isSpeaking) {
        return;
    }

    this.textContent = this.dataset.content;
    this.classList.add('flipped');
    speak(this.dataset.content, this.dataset.lang);

    flippedCards.push(this);

    if (flippedCards.length === 2) {
        isBoardLocked = true; 
        checkForMatch();
    }
}

// EŞLEŞME KONTROLÜ VE AŞAMA İLERLEMESİ (Aynı kaldı)
function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.type === card2.dataset.type) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        
        matchedPairs++;
        matchedPairsDisplay.textContent = matchedPairs;

        if (matchedPairs === (currentStageWords.length / 2)) {
            
            if (currentStage < ALL_WORD_STAGES.length - 1) {
                currentStage++;
                setTimeout(() => {
                    alert(`Tebrikler! ${currentStage + 1}. Kelime Aşamasına geçiliyor.`);
                    createBoard(); 
                }, 1500);
            } else {
                setTimeout(() => {
                    alert('MUHTEŞEM! Tüm Kelime Seviyeleri bitti. Şimdi Cümle Eşleştirme başlıyor!');
                    window.location.href = 'cumle.html'; 
                }, 1500);
            }
        }
        resetBoard(); 

    } else {
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
