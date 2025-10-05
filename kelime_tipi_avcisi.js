// KELİME TİPİ AVCISI MANTIĞI: Daha fazla İsim, Fiil, Sıfat
const WORD_TYPES_DATA = [
    { ar: 'المعلم', tip: 'ISIM', tr: 'Öğretmen' },
    { ar: 'شاهد', tip: 'FIIL', tr: 'İzledi' },
    { ar: 'سريع', tip: 'SIFAT', tr: 'Hızlı' },
    { ar: 'المدينة', tip: 'ISIM', tr: 'Şehir' },
    { ar: 'قرأ', tip: 'FIIL', tr: 'Okudu' },
    { ar: 'جديد', tip: 'SIFAT', tr: 'Yeni' },
    { ar: 'المكتبة', tip: 'ISIM', tr: 'Kütüphane' },
    { ar: 'طبخ', tip: 'FIIL', tr: 'Pişirdi' },
    { ar: 'صحيح', tip: 'SIFAT', tr: 'Doğru' },
    { ar: 'العمل', tip: 'ISIM', tr: 'İş' },
    { ar: 'فكر', tip: 'FIIL', tr: 'Düşündü' },
    { ar: 'مهم', tip: 'SIFAT', tr: 'Önemli' },
    { ar: 'الجامعة', tip: 'ISIM', tr: 'Üniversite' },
    { ar: 'ساعد', tip: 'FIIL', tr: 'Yardım etti' },
    { ar: 'مختلف', tip: 'SIFAT', tr: 'Farklı' },
    { ar: 'القراءة', tip: 'ISIM', tr: 'Okuma' },
    { ar: 'كتب', tip: 'FIIL', tr: 'Yazdı' },
    { ar: 'كبير', tip: 'SIFAT', tr: 'Büyük' },
];

const wordDisplay = document.getElementById('word-display');
const scoreDisplay = document.getElementById('score');
const missesDisplay = document.getElementById('misses');
const typeButtons = document.querySelectorAll('.type-button');

let currentWord = null;
let score = 0;
let misses = 0;

function speak(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

function nextWord() {
    const randomIndex = Math.floor(Math.random() * WORD_TYPES_DATA.length);
    currentWord = WORD_TYPES_DATA[randomIndex];
    
    wordDisplay.textContent = currentWord.ar;
    speak(currentWord.ar, 'ar-SA');
}

typeButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (!currentWord) { nextWord(); return; }

        const selectedType = this.dataset.type;
        
        if (selectedType === currentWord.tip) {
            score++;
            scoreDisplay.textContent = score;
            wordDisplay.textContent = 'صحيح! (' + currentWord.tr + ')';
            setTimeout(nextWord, 750); 
        } else {
            misses++;
            missesDisplay.textContent = misses;
            wordDisplay.textContent = 'خطأ! (' + currentWord.tr + ' - ' + currentWord.tip + ')';
            speak('خطأ', 'ar-SA'); 
            setTimeout(nextWord, 1500); 
        }
    });
});
wordDisplay.textContent = 'Başlamak için tipe tıkla!';
