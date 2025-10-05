const LISTEN_DATA = [
    { ar: 'شكراً', tr: 'Teşekkürler' },
    { ar: 'الماء', tr: 'Su' },
    { ar: 'هل أنت بخير؟', tr: 'İyi misin?' },
    { ar: 'ذهب', tr: 'Gitti' },
    { ar: 'كتاب', tr: 'Kitap' },
    { ar: 'أنا أقرأ كتاباً', tr: 'Ben bir kitap okuyorum' },
    { ar: 'أين محطة القطار؟', tr: 'Tren istasyonu nerede?' },
    { ar: 'يوم سعيد', tr: 'Mutlu günler' },
];

const speakerButton = document.getElementById('speaker-button');
const userInput = document.getElementById('user-input');
const checkButton = document.getElementById('check-button');
const feedbackDisplay = document.getElementById('feedback');
const correctScoreDisplay = document.getElementById('correct-score-listen');
const wrongScoreDisplay = document.getElementById('wrong-score-listen');

let currentPair = null;
let correctScore = 0;
let wrongScore = 0;

function speak(text, lang = 'ar-SA') {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

function nextQuestion() {
    const randomIndex = Math.floor(Math.random() * LISTEN_DATA.length);
    currentPair = LISTEN_DATA[randomIndex];
    
    feedbackDisplay.textContent = '';
    userInput.value = '';
    userInput.disabled = false;
    checkButton.disabled = false;
    
    speak(currentPair.ar, 'ar-SA');
}

speakerButton.addEventListener('click', () => {
    if (currentPair) {
        speak(currentPair.ar, 'ar-SA');
    }
});

checkButton.addEventListener('click', () => {
    if (!currentPair) return;

    const userAnswer = userInput.value.trim().toLowerCase();
    const correctAnswer = currentPair.tr.trim().toLowerCase();
    
    const normalizedUserAnswer = userAnswer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
    const normalizedCorrectAnswer = correctAnswer.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");

    userInput.disabled = true;
    checkButton.disabled = true;

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
        correctScore++;
        correctScoreDisplay.textContent = correctScore;
        feedbackDisplay.textContent = 'MÜKEMMEL! ✅';
        feedbackDisplay.style.color = 'green';
    } else {
        wrongScore++;
        wrongScoreDisplay.textContent = wrongScore;
        feedbackDisplay.textContent = `YANLIŞ! ❌ Doğru: ${currentPair.tr}`;
        feedbackDisplay.style.color = 'red';
    }
    
    setTimeout(nextQuestion, 2000); 
});

nextQuestion();
