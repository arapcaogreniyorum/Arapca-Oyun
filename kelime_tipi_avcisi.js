// kelime_tipi_avcisi.js - Kelime Tipi Avcısı Oyununun Mantığı

let words = [];
let currentWordIndex = 0;
let score = 0;
let misses = 0;
const allowedTypes = ["İSİM", "FİİL", "SIFAT"]; // Oyunda kullanılacak ana tipler

document.addEventListener('DOMContentLoaded', () => {
    loadData().then(data => {
        if (data) {
            // Sadece ana tipleri içeren kelimeleri al
            words = data.kelimeler.filter(word => allowedTypes.includes(word.tip));
            if (words.length === 0) {
                document.getElementById('word-display').textContent = "Yeterli kelime bulunamadı.";
                return;
            }
            shuffle(words);
            renderTypeOptions();
            displayNextWord();
        }
    });
});

function renderTypeOptions() {
    const optionsContainer = document.getElementById('type-options');
    optionsContainer.innerHTML = '';
    
    allowedTypes.forEach(type => {
        const button = document.createElement('button');
        button.classList.add('type-button');
        button.textContent = type;
        button.addEventListener('click', () => checkAnswer(type));
        optionsContainer.appendChild(button);
    });
}

function displayNextWord() {
    if (currentWordIndex >= words.length) {
        document.getElementById('word-display').textContent = `Oyun Bitti! Skor: ${score} Doğru, ${misses} Yanlış`;
        // Butonları devre dışı bırak
        document.querySelectorAll('.type-button').forEach(btn => btn.disabled = true);
        return;
    }

    const word = words[currentWordIndex];
    document.getElementById('word-display').textContent = word.ar;
}

function checkAnswer(selectedType) {
    const currentWord = words[currentWordIndex];
    const display = document.getElementById('word-display');
    const originalText = currentWord.ar;

    if (selectedType === currentWord.tip) {
        score++;
        display.style.color = 'var(--success-green)';
        display.textContent = `${originalText} (Doğru: ${currentWord.tip})`;
    } else {
        misses++;
        display.style.color = 'red';
        display.textContent = `${originalText} (Yanlış! Doğrusu: ${currentWord.tip})`;
    }

    document.getElementById('score').textContent = score;
    document.getElementById('misses').textContent = misses;
    
    // Butonları kısa süre devre dışı bırak
    const buttons = document.querySelectorAll('.type-button');
    buttons.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        currentWordIndex++;
        display.style.color = 'var(--secondary-orange)';
        displayNextWord();
        buttons.forEach(btn => btn.disabled = false);
    }, 1000);
}
