// eksik_kelime.js - Eksik Kelimeyi Bul Oyununun Mantığı

let sentences = [];
let currentSentenceIndex = 0;
let correctScore = 0;
let wrongScore = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadData().then(data => {
        if (data) {
            sentences = data.eksik_kelime_cumleleri;
            if (sentences.length === 0) {
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
        sentenceDisplay.innerHTML = `Oyun Bitti! Skor: ${correctScore} Doğru, ${wrongScore} Yanlış`;
        translationDisplay.textContent = "";
        choiceOptions.innerHTML = "";
        return;
    }

    const current = sentences[currentSentenceIndex];
    const sentenceWithBlank = current.ar.replace(`[${current.dogru}]`, '<span class="blank-space">...</span>');
    sentenceDisplay.innerHTML = sentenceWithBlank;
    translationDisplay.textContent = current.tr.replace(`[${current.dogru}]`, '__________');

    // Seçenekleri hazırla (3 rastgele yanlış kelime + 1 doğru kelime)
    const allWords = allData.kelimeler.map(k => k.ar);
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

    if (selectedAnswer === correctAnswer) {
        correctScore++;
        button.style.backgroundColor = 'var(--success-green)';
        sentenceDisplay.innerHTML = sentenceDisplay.innerHTML.replace('<span class="blank-space">...</span>', `<span class="blank-space" style="color: var(--success-green);">${correctAnswer}</span>`);
    } else {
        wrongScore++;
        button.style.backgroundColor = 'red';
        // Doğru cevabı bul ve yeşil yap
        buttons.forEach(btn => {
            if (btn.getAttribute('data-choice') === correctAnswer) {
                btn.style.backgroundColor = 'var(--success-green)';
            }
        });
        sentenceDisplay.innerHTML = sentenceDisplay.innerHTML.replace('<span class="blank-space">...</span>', `<span class="blank-space" style="color: red;">${correctAnswer}</span>`);
    }

    document.getElementById('correct-score').textContent = correctScore;
    document.getElementById('wrong-score').textContent = wrongScore;

    setTimeout(() => {
        currentSentenceIndex++;
        displayNextSentence();
    }, 2000);
}
