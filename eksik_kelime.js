// EKSİK KELİMEYİ BUL MANTIĞI: Arapça Boşluk Doldurma
const SENTENCE_DATA = [
    { 
        ar_template: 'الطالب يقرأ [BOŞLUK] في المكتبة.', 
        dogru_kelime: 'كتاباً',
        yanlis_secenekler: ['سيارة', 'شرب', 'سريع'],
        tr_translation: 'Öğrenci kütüphanede kitap okuyor.'
    },
    { 
        ar_template: 'هذا المنزل [BOŞLUK] جداً.', 
        dogru_kelime: 'جديد',
        yanlis_secenekler: ['المعلم', 'الجامعة', 'طبخ'],
        tr_translation: 'Bu ev çok yenidir.'
    },
    { 
        ar_template: 'نحن نحتاج إلى [BOŞLUK] لحل المشكلة.', 
        dogru_kelime: 'التفكير',
        yanlis_secenekler: ['السفر', 'العمل', 'ساعد'],
        tr_translation: 'Problemi çözmek için düşünmeye ihtiyacımız var.'
    },
    { 
        ar_template: 'هل [BOŞLUK] المسلسل الجديد؟', 
        dogru_kelime: 'شاهدت',
        yanlis_secenekler: ['المدينة', 'مهم', 'صحيح'],
        tr_translation: 'Yeni diziyi izledin mi?'
    },
    { 
        ar_template: 'ذهبت إلى [BOŞLUK] لشراء القهوة.', 
        dogru_kelime: 'المتجر',
        yanlis_secenekler: ['كتب', 'مختلف', 'صغير'],
        tr_translation: 'Kahve almak için mağazaya gittim.'
    },
    { 
        ar_template: 'المطر يمنعنا من [BOŞLUK] اليوم.', 
        dogru_kelime: 'الخروج',
        yanlis_secenekler: ['السعيد', 'الصباح', 'الدفتر'],
        tr_translation: 'Yağmur bugün dışarı çıkmamızı engelliyor.'
    },
];

const sentenceDisplay = document.getElementById('sentence-display');
const translationDisplay = document.getElementById('translation-display');
const choiceButtons = document.querySelectorAll('.choice-button');
const correctScoreDisplay = document.getElementById('correct-score');
const wrongScoreDisplay = document.getElementById('wrong-score');

let currentSentence = null;
let correctScore = 0;
let wrongScore = 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
}

function speak(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function nextSentence() {
    const randomIndex = Math.floor(Math.random() * SENTENCE_DATA.length);
    currentSentence = SENTENCE_DATA[randomIndex];

    // Arapça template'i kullan ve boşluk alanını göster
    const formattedSentence = currentSentence.ar_template.replace('[BOŞLUK]', '<span class="blank-space">_____</span>');
    sentenceDisplay.innerHTML = formattedSentence;
    translationDisplay.textContent = '';

    let choices = [currentSentence.dogru_kelime].concat(currentSentence.yanlis_secenekler);
    shuffle(choices);

    choiceButtons.forEach((button, index) => {
        button.textContent = choices[index];
        button.onclick = () => checkAnswer(button.textContent);
        button.disabled = false;
        button.style.backgroundColor = 'var(--success-green)'; 
    });
}

function checkAnswer(selectedWord) {
    const isCorrect = (selectedWord === currentSentence.dogru_kelime);
    
    choiceButtons.forEach(button => button.disabled = true);

    if (isCorrect) {
        correctScore++;
        correctScoreDisplay.textContent = correctScore;
        
        // Cümleyi Arapça doğru kelime ile tamamla
        const completedSentence = currentSentence.ar_template.replace('[BOŞLUK]', `<span style="color:var(--primary-blue); font-weight: bold;">${selectedWord}</span>`);
        sentenceDisplay.innerHTML = completedSentence;
        
        translationDisplay.textContent = `Doğru! Türkçe Çeviri: ${currentSentence.tr_translation}`;
        speak(currentSentence.ar_template.replace('[BOŞLUK]', selectedWord), 'ar-SA');
        
    } else {
        wrongScore++;
        wrongScoreDisplay.textContent = wrongScore;
        
        choiceButtons.forEach(button => {
            if (button.textContent === selectedWord) {
                button.style.backgroundColor = 'red';
            }
        });
        
        translationDisplay.textContent = `Yanlış! Doğru kelime: ${currentSentence.dogru_kelime}. Türkçe: ${currentSentence.tr_translation}`;
    }

    setTimeout(nextSentence, 3000); 
}

nextSentence();
