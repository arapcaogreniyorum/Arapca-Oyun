// DİNLE VE YAZ MANTIĞI: Daha fazla ve daha uzun cümleler
const LISTEN_DATA = [
    { ar: 'هل أنت طالب في الجامعة؟', tr: 'Üniversitede öğrenci misin?' },
    { ar: 'القراءة مهمة لتطوير اللغة.', tr: 'Okuma, dil geliştirmek için önemlidir.' },
    { ar: 'هل فكرت في السفر إلى المدينة؟', tr: 'Şehre seyahat etmeyi düşündün mü?' },
    { ar: 'ساعدني معلمي في فهم الدرس.', tr: 'Öğretmenim dersi anlamama yardım etti.' },
    { ar: 'الطعام الذي طبخته كان صحيحاً.', tr: 'Pişirdiğin yemek sağlıklıydı/doğruydu.' },
    { ar: 'أين هو العمل الجديد الذي وجدته؟', tr: 'Bulduğun yeni iş nerede?' },
    { ar: 'كتبت كتاباً كبيراً ومختلفاً.', tr: 'Büyük ve farklı bir kitap yazdım.' },
    { ar: 'السائق كان سريعاً جداً.', tr: 'Sürücü çok hızlıydı.' },
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
    
    // Cevabı sadeleştir (noktalama işaretlerini ve fazla boşlukları kaldır)
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
