// KELİME OYUNU MANTIĞI: Yeni ve daha geniş kelime havuzu
function checkInstagramBrowser() {
    const isInstagramBrowser = /Instagram/i.test(navigator.userAgent);
    if (isInstagramBrowser) {
        alert("DİKKAT! Sesli okumada sorun yaşayabilirsiniz. Lütfen oyunu harici bir tarayıcıda (Chrome/Safari) açın.");
    }
}
checkInstagramBrowser();

const ALL_WORD_STAGES = [
    // --- TEMEL SEVİYE AŞAMA 1 (Basit Kelimeler) ---
    [{ ar: 'مرحبا', tr: 'Merhaba' }, { ar: 'شكراً', tr: 'Teşekkürler' }, { ar: 'نعم', tr: 'Evet' }, { ar: 'البيت', tr: 'Ev' }],
    // --- TEMEL SEVİYE AŞAMA 2 (Fiiller) ---
    [{ ar: 'شاهد', tr: 'İzledi' }, { ar: 'قرأ', tr: 'Okudu' }, { ar: 'طبخ', tr: 'Pişirdi' }, { ar: 'كتب', tr: 'Yazdı' }],
    // --- ORTA SEVİYE AŞAMA 3 (Sıfatlar) ---
    [{ ar: 'سريع', tr: 'Hızlı' }, { ar: 'جديد', tr: 'Yeni' }, { ar: 'صحيح', tr: 'Doğru' }, { ar: 'كبير', tr: 'Büyük' }],
    // --- ORTA SEVİYE AŞAMA 4 (Mekan İsimleri) ---
    [{ ar: 'المدينة', tr: 'Şehir' }, { ar: 'المكتبة', tr: 'Kütüphane' }, { ar: 'الجامعة', tr: 'Üniversite' }, { ar: 'العمل', tr: 'İş' }],
    // --- İLERİ SEVİYE AŞAMA 5 (Soyut Kavramlar) ---
    [{ ar: 'التفكير', tr: 'Düşünme' }, { ar: 'القراءة', tr: 'Okuma (isim)' }, { ar: 'السفر', tr: 'Seyahat (isim)' }, { ar: 'الحرية', tr: 'Özgürlük' }],
    // --- İLERİ SEVİYE AŞAMA 6 (Daha Zor Fiiller) ---
    [{ ar: 'ساعد', tr: 'Yardım etti' }, { ar: 'نسي', tr: 'Unuttu' }, { ar: 'سأل', tr: 'Sordu' }, { ar: 'تذكر', tr: 'Hatırladı' }],
    // --- UZMAN SEVİYE AŞAMA 7 (Zor Sıfatlar) ---
    [{ ar: 'مختلف', tr: 'Farklı' }, { ar: 'مهم', tr: 'Önemli' }, { ar: 'متعب', tr: 'Yorgun' }, { ar: 'سعيد', tr: 'Mutlu' }],
    // --- UZMAN SEVİYE AŞAMA 8 (Çeşitli) ---
    [{ ar: 'الصباح', tr: 'Sabah' }, { ar: 'المساء', tr: 'Akşam' }, { ar: 'الطريق', tr: 'Yol' }, { ar: 'القهوة', tr: 'Kahve' }],
];

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
                    alert(`Tebrikler! ${currentStage + 1}. Kelime Aşamasına geçiliyor.`);
                    createBoard(); 
                }, 1500);
            } else {
                setTimeout(() => {
                    // Kelime aşaması bitince cümle oyununa yönlendir
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

function resetBoard() {
    [flippedCards, isBoardLocked] = [[], false];
}
createBoard();
