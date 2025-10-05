const WORD_TYPES_DATA = [
    { ar: 'كتاب', tip: 'ISIM', tr: 'Kitap' }, { ar: 'ذهب', tip: 'FIIL', tr: 'Gitti' }, { ar: 'كبير', tip: 'SIFAT', tr: 'Büyük' },
    { ar: 'سيارة', tip: 'ISIM', tr: 'Araba' }, { ar: 'أكل', tip: 'FIIL', tr: 'Yedi' }, { ar: 'جميل', tip: 'SIFAT', tr: 'Güzel' },
    { ar: 'مدرسة', tip: 'ISIM', tr: 'Okul' }, { ar: 'شرب', tip: 'FIIL', tr: 'İçti' }, { ar: 'صغير', tip: 'SIFAT', tr: 'Küçük' },
    { ar: 'طويل', tip: 'SIFAT', tr: 'Uzun' }, { ar: 'درس', tip: 'FIIL', tr: 'Ders Çalıştı' }, { ar: 'باب', tip: 'ISIM', tr: 'Kapı' },
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
