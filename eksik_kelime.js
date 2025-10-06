// eksik_kelime.js - Eksik Kelimeyi Bul Oyununun Mantığı (KESİN DÜZELTME)

let sentences = [];
let allWords = []; // Yeni: Tüm kelimeleri burada tutacağız
let currentSentenceIndex = 0;
let correctScore = 0;
let wrongScore = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadData().then(data => {
        if (data) {
            window.allData = data; // Tüm veriyi global olarak atıyoruz
            
            // Eksik kelime cümlelerini ve tüm kelimeleri al
            sentences = data.eksik_kelime_cumleleri;
            allWords = data.kelimeler.map(k => k.ar);
            
            if (!sentences || sentences.length === 0) {
                document.getElementById('sentence-display').textContent = "Yeterli cümle bulunamadı.";
                return;
            }
            shuffle(sentences);
            displayNextSentence();
        }
    });
});

function displayNextSentence() {
    const sentenceDisplay = document.getElementById('sentence-display');
    const translationDisplay = document.getElementById('translation-display');
    const choiceOptions = document.getElementById('choice-options');

    if (currentSentenceIndex >= sentences.length) {
        endGame();
        return;
    }

    const current = sentences[currentSentenceIndex];
    // Doğru kelimeyi [dogru_kelime] formatından çıkarıp yerine boşluk koyuyoruz
    const sentenceWithBlank = current.ar.replace(`[${current.dogru}]`, '<span class="blank-space">...</span>');
    sentenceDisplay.innerHTML = sentenceWithBlank;
    translationDisplay.textContent = current.tr.replace(`[${current.dogru}]`, '__________');

    // Seçenekleri hazırla (3 rastgele yanlış kelime + 1 doğru kelime)
    const incorrectWords = allWords.filter(w => w !== current.dogru);
    shuffle(incorrectWords);
    
    const choices = [current.dogru, ...incorrectWords.slice(0, 3)];
    shuffle(choices);

    renderChoices(choices, current.dogru);
}

function renderChoices(choices, correctAnswer) {
    const optionsContainer = document.getElementById('choice-options');
    optionsContainer.innerHTML = '';

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice-button');
        button.textContent = choice;
        button.setAttribute('data-choice', choice);
        button.addEventListener('click', (e) => checkChoice(e.target, correctAnswer));
        optionsContainer.appendChild(button);
    });
}

function checkChoice(button, correctAnswer) {
    const selectedAnswer = button.getAttribute('data-choice');
    const sentenceDisplay = document.getElementById('sentence-display');
    const buttons = document.querySelectorAll('.choice-button');

    // Butonları devre dışı bırak
    buttons.forEach(btn => btn.disabled = true);
    // Geri bildirim sınıflarını temizle
    buttons.forEach(btn => btn.classList.remove('correct-feedback', 'incorrect-feedback'));


    if (selectedAnswer === correctAnswer) {
        correctScore++;
        button.classList.add('correct-feedback');
        // Boşluğu doğru cevapla ve yeşil renkle doldur
        sentenceDisplay.innerHTML = sentenceDisplay.innerHTML.replace('<span class="blank-space">...</span>', `<span class="blank-space correct-feedback" style="color: var(--success-green);">${correctAnswer}</span>`);
    } else {
        wrongScore++;
        button.classList.add('incorrect-feedback');
        
        // Doğru cevabı bul ve yeşil yap
        buttons.forEach(btn => {
            if (btn.getAttribute('data-choice') === correctAnswer) {
                btn.classList.add('correct-feedback');
            }
        });
        // Boşluğu yanlış cevapla kırmızı göster
        sentenceDisplay.innerHTML = sentenceDisplay.innerHTML.replace('<span class="blank-space">...</span>', `<span class="blank-space incorrect-feedback" style="color: red;">${correctAnswer}</span>`);
    }

    document.getElementById('correct-score').textContent = correctScore;
    document.getElementById('wrong-score').textContent = wrongScore;

    setTimeout(() => {
        currentSentenceIndex++;
        displayNextSentence();
    }, 2500);
}

function endGame() {
    const sentenceDisplay = document.getElementById('sentence-display');
    const translationDisplay = document.getElementById('translation-display');
    const choiceOptions = document.getElementById('choice-options');

    sentenceDisplay.innerHTML = `Oyun Bitti! Skor: ${correctScore} Doğru, ${wrongScore} Yanlış`;
    translationDisplay.textContent = "Tebrikler, tüm cümleleri tamamladınız!";
    
    localStorage.setItem('fill_completed', 'true');

    // Tekrar Oyna Butonu
    choiceOptions.innerHTML = `
        <button id="restart-button" class="choice-button" style="background-color: var(--primary-blue);">Baştan Başla (Tekrar Oyna)</button>
    `;
    
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

function restartGame() {
    correctScore = 0;
    wrongScore = 0;
    currentSentenceIndex = 0;
    document.getElementById('correct-score').textContent = correctScore;
    document.getElementById('wrong-score').textContent = wrongScore;

    shuffle(sentences);
    displayNextSentence();
}
