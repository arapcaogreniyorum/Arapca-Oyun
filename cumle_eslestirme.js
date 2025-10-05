// CÜMLE OYUNU MANTIK DOSYASI
const ALL_WORD_STAGES = [
    // TEMEL CÜMLE AŞAMASI 1 (Günlük konuşma)
    [
        { ar: 'أريد كوب قهوة', tr: 'Bir fincan kahve istiyorum' },
        { ar: 'كم سعر هذا؟', tr: 'Bunun fiyatı ne kadar?' },
        { ar: 'أين الحمام؟', tr: 'Banyo nerede?' },
        { ar: 'لا أفهم ماذا تقول.', tr: 'Ne dediğini anlamıyorum.' },
    ],
    // ORTA CÜMLE AŞAMASI 2 (Duygular ve Fikirler)
    [
        { ar: 'أشعر بالملل قليلاً اليوم.', tr: 'Bugün biraz sıkılmış hissediyorum.' },
        { ar: 'يجب أن أذهب إلى العمل الآن.', tr: 'Şimdi işe gitmem gerekiyor.' },
        { ar: 'أفضل القراءة في المكتبة.', tr: 'Kütüphanede okumayı tercih ederim.' },
        { ar: 'ما رأيك في هذا الكتاب الجديد؟', tr: 'Bu yeni kitap hakkında ne düşünüyorsun?' },
    ],
    // İLERİ CÜMLE AŞAMASI 3 (Neden-Sonuç ve Soyut)
    [
        { ar: 'هدفي هو تعلم اللغة العربية.', tr: 'Hedefim Arapça dilini öğrenmek.' },
        { ar: 'بسبب المطر، ألغينا السفر إلى المدينة.', tr: 'Yağmur nedeniyle şehre seyahati iptal ettik.' },
        { ar: 'على الرغم من الصعوبة، واصلنا التفكير.', tr: 'Zorluğa rağmen düşünmeye devam ettik.' },
        { ar: 'من المهم أن تكون سعيداً ومختلفاً.', tr: 'Mutlu ve farklı olmak önemlidir.' },
    ]
];

// OYUN MANTIĞI (Kelime.js ile aynı mantık)
let currentStage = 0; 
const gameContainer = document.querySelector('.game-container');
const matchedPairsDisplay = document.getElementById('matched-pairs');
const stageDisplay = document.getElementById('current-stage');

let flippedCards = []; 
let isBoardLocked = false; 
let matchedPairs = 0; 
let isSpeaking = false;

function speak(text, lang) {
    if (!('speechSynthesis' in window)) return;
    isSpeaking = true; 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => { isSpeaking = false; };
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
}

function createBoard() {
    gameContainer.innerHTML = ''; 
    if (!gameContainer.classList.contains('sentence-mode')) {
        gameContainer.classList.add('sentence-mode');
    }

    const wordPairs = ALL_WORD_STAGES[currentStage];
    let currentStageWords = [];
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

function flipCard() {
    if (isBoardLocked || this.classList.contains('flipped') || this.classList.contains('matched') || isSpeaking) return;
    this.textContent = this.dataset.content;
    this.classList.add('flipped');
    speak(this.dataset.content, this.dataset.lang);
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        isBoardLocked = true; 
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.type === card2.dataset.type) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        matchedPairs++;
        matchedPairsDisplay.textContent = matchedPairs;

        if (matchedPairs === (ALL_WORD_STAGES[currentStage].length)) {
            if (currentStage < ALL_WORD_STAGES.length - 1) {
                currentStage++;
                setTimeout(() => {
                    alert(`Tebrikler! ${currentStage + 1}. Cümle Aşamasına geçiliyor.`);
                    createBoard(); 
                }, 1500);
            } else {
                setTimeout(() => {
                    alert('TEBRİKLER! Tüm Arapça eğitimini başarıyla bitirdiniz!');
                    window.location.href = 'index.html'; 
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

function resetBoard() {
    [flippedCards, isBoardLocked] = [[], false];
}

createBoard();
