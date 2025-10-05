const SENTENCE_DATA = [
    { tr_template: 'Ben her gün [BOŞLUK] içerim.', dogru_kelime: 'Kahve', yanlis_secenekler: ['Araba', 'Okul', 'Ayakkabı'], ar: 'أنا أشرب القهوة كل يوم' },
    { tr_template: 'Yarın [BOŞLUK] gitmek zorundayım.', dogru_kelime: 'İşe', yanlis_secenekler: ['Yeşil', 'Koşmak', 'Yemek'], ar: 'يجب أن أذهب إلى العمل غداً' },
    { tr_template: 'Bu çok [BOŞLUK] bir gün!', dogru_kelime: 'Güzel', yanlis_secenekler: ['Kitap', 'Gitmek', 'Çay'], ar: 'هذا يوم جميل جداً!' },
    { tr_template: '[BOŞLUK] kapının önünde duruyor.', dogru_kelime: 'Araba', yanlis_secenekler: ['Uyku', 'Yazmak', 'Hava'], ar: 'السيارة تقف أمام الباب' },
    { tr_template: 'Akşam yemeği için [BOŞLUK] pişireceğim.', dogru_kelime: 'Balık', yanlis_secenekler: ['Mavi', 'Uyku', 'Hızlı'], ar: 'سأقوم بطهي السمك لتناول العشاء' },
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
    speechSynthesis.speak(utterance);
}

function nextSentence() {
    const randomIndex = Math.floor(Math.random() * SENTENCE_DATA.length);
    currentSentence = SENTENCE_DATA[randomIndex];

    const formattedSentence = currentSentence.tr_template.replace('[BOŞLUK]', '<span class="blank-space">...</span>');
    sentenceDisplay.innerHTML = formattedSentence;
    translationDisplay.textContent = '';

    let choices = [currentSentence.dogru_kelime].concat(currentSentence.yanlis_secenekler);
    shuffle(choices);

    choiceButtons.forEach((button, index) => {
        button.textContent = choices[index];
        button.onclick = () => checkAnswer(button.textContent);
        button.disabled = false;
        button.style.backgroundColor = '#4CAF50';
    });
}

function checkAnswer(selectedWord) {
    const isCorrect = (selectedWord === currentSentence.dogru_kelime);
    choiceButtons.forEach(button => button.disabled = true);

    if (isCorrect) {
        correctScore++;
        correctScoreDisplay.textContent = correctScore;
        const completedSentence = currentSentence.tr_template.replace('[BOŞLUK]', `<span style="color:green;">${selectedWord}</span>`);
        sentenceDisplay.innerHTML = completedSentence;
        translationDisplay.textContent = `Doğru! Arapçası: ${currentSentence.ar}`;
        speak(currentSentence.ar, 'ar-SA');
    } else {
        wrongScore++;
        wrongScoreDisplay.textContent = wrongScore;
        choiceButtons.forEach(button => {
            if (button.textContent === selectedWord) {
                button.style.backgroundColor = 'red';
            }
        });
        translationDisplay.textContent = `Yanlış! Doğru kelime: ${currentSentence.dogru_kelime}. Arapçası: ${currentSentence.ar}`;
    }
    setTimeout(nextSentence, 2500);
}
nextSentence();
