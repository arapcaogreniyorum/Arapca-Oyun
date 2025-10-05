// CÜMLE OYUNU MANTIK DOSYASI
// Bu dosya, ana kelime oyunu bittikten sonra yönlendirilen sayfayı yönetir.

// 1. CÜMLE AŞAMALARI (TEMEL, ORTA ve İLERİ SEVİYE)
const ALL_WORD_STAGES = [
    // --- TEMEL CÜMLE AŞAMASI 1: Günlük Konuşma ---
    [
        { ar: 'أريد كوب قهوة', tr: 'Bir fincan kahve istiyorum' },
        { ar: 'كم سعر هذا؟', tr: 'Bunun fiyatı ne kadar?' },
        { ar: 'أين الحمام؟', tr: 'Banyo nerede?' },
        { ar: 'لا أفهم', tr: 'Anlamıyorum' },
    ],
    // --- TEMEL CÜMLE AŞAMASI 2: Temel Fiil Kullanımı ---
    [
        { ar: 'هل أنت بخير؟', tr: 'İyi misin?' },
        { ar: 'نحن ذاهبون الآن', tr: 'Biz şimdi gidiyoruz' },
        { ar: 'أنا أقرأ كتاباً', tr: 'Ben bir kitap okuyorum' },
        { ar: 'مع السلامة', tr: 'Güle güle' },
    ],
    // --- ORTA CÜMLE AŞAMASI 3: Gelecek Zaman ve İhtiyaç ---
    [
        { ar: 'سأذهب إلى السوق غداً', tr: 'Yarın markete gideceğim' },
        { ar: 'يجب أن ندرس أكثر', tr: 'Daha çok ders çalışmalıyız' },
        { ar: 'أبحث عن وظيفة جديدة', tr: 'Yeni bir iş arıyorum' },
        { ar: 'ما رأيك في هذا؟', tr: 'Bu konuda ne düşünüyorsun?' },
    ],
    // --- ORTA CÜMLE AŞAMASI 4: Edatlı İfadeler ---
    [
        { ar: 'القطة على الطاولة', tr: 'Kedi masanın üzerinde' },
        { ar: 'تحدثت مع صديقي', tr: 'Arkadaşımla konuştum' },
        { ar: 'أفكر في المستقبل', tr: 'Geleceği düşünüyorum' },
        { ar: 'الاجتماع يبدأ قريباً', tr: 'Toplantı yakında başlıyor' },
    ],
    // --- İLERİ CÜMLE AŞAMASI 5: Şart Cümleleri (Eğer/Şayet) ---
    [
        { ar: 'إذا درست، ستنجح', tr: 'Eğer çalışırsan, başarılı olursun' },
        { ar: 'لو كنت أعرف، لكنت أخبرتك', tr: 'Bilseydim, sana söylerdim' },
        { ar: 'أنا مقتنع بأن هذا صحيح', tr: 'Bunun doğru olduğuna ikna oldum' },
        { ar: 'ليس كل ما يلمع ذهباً', tr: 'Parlayan her şey altın değildir' },
    ],
    // --- İLERİ CÜMLE AŞAMASI 6: Mastar ve Bağlaç Kullanımı ---
    [
        { ar: 'هدفي هو تعلم اللغة', tr: 'Hedefim dili öğrenmek' },
        { ar: 'بسبب المطر، ألغينا الرحلة', tr: 'Yağmur nedeniyle geziyi iptal ettik' },
        { ar: 'على الرغم من الصعوبة، واصلنا', tr: 'Zorluğa rağmen devam ettik' },
        { ar: 'من المهم ممارسة الرياضة', tr: 'Spor yapmak önemlidir' },
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

    // Cümle modu CSS'i burada gerekli
    if (!gameContainer.classList.contains('sentence-mode')) {
        gameContainer.classList.add('sentence-mode');
    }

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

// EŞLEŞME KONTROLÜ
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
                // Sonraki cümle aşamasına geç
                currentStage++;
                setTimeout(() => {
                    alert(`Tebrikler! ${currentStage + 1}. Cümle Aşamasına geçiliyor.`);
                    createBoard(); 
                }, 1500);
            } else {
                // TÜM CÜMLE AŞAMALARI BİTTİ -> Bitiş Ekranı göster
                setTimeout(() => {
                    alert('TEBRİKLER! Arapça eğitiminin tamamını başarıyla bitirdiniz!');
                    showFinishScreen();
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

// Oyun Bitti Ekranı
function showFinishScreen() {
    gameContainer.innerHTML = `
        <div style="grid-column: span 4; text-align: center; padding: 20px;">
            <h2>MÜKEMMEL!</h2>
            <p>Tüm Arapça seviyelerini bitirdin. En baştan başlamak ister misin?</p>
            <button onclick="window.location.href = 'index.html';" style="padding: 10px 20px; font-size: 18px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 5px; margin-top: 10px;">
                Kelime Oyununa Dön (1. Aşama)
            </button>
        </div>
    `;
}

// Oyunu Başlat!
createBoard();
