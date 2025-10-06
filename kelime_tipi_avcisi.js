// kelime_tipi_avcisi.js - Kelime Tipi Avcısı Oyununun Mantığı (Görsel ve Tekrar Oyna Eklentisi)

let words = [];
let currentWordIndex = 0;
let score = 0;
let misses = 0;
const allowedTypes = ["İSİM", "FİİL", "SIFAT", "ZAMİR", "ZARF"]; // Daha fazla çeşitlilik için tipleri artırdık

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
        button.addEventListener('click', (e) => checkAnswer(type, e.target));
        optionsContainer.appendChild(button);
    });
}

function displayNextWord() {
    if (currentWordIndex >= words.length) {
        endGame();
        return;
    }

    const word = words[currentWordIndex];
    document.getElementById('word-display').textContent = word.ar;
}

function checkAnswer(selectedType, clickedButton) {
    const currentWord = words[currentWordIndex];
    const display = document.getElementById('word-display');
    const originalText = currentWord.ar;
    const buttons = document.querySelectorAll('.type-button');

    // Butonları devre dışı bırak
    buttons.forEach(btn => btn.disabled = true);
    
    // Tüm butonlardan geri bildirim sınıflarını temizle
    buttons.forEach(btn => btn.classList.remove('correct-feedback', 'incorrect-feedback'));

    if (selectedType === currentWord.tip) {
        score++;
        display.style.color = 'var(--success-green)';
        display.textContent = `${originalText} (Doğru: ${currentWord.tip})`;
        clickedButton.classList.add('correct-feedback'); // Yeşil çerçeve
    } else {
        misses++;
        display.style.color = 'red';
        display.textContent = `${originalText} (Yanlış! Doğrusu: ${currentWord.tip})`;
        clickedButton.classList.add('incorrect-feedback'); // Kırmızı çerçeve
        
        // Doğru cevabı bul ve yeşil çerçeve ile işaretle
        buttons.forEach(btn => {
            if (btn.textContent === currentWord.tip) {
                btn.classList.add('correct-feedback');
            }
        });
    }

    document.getElementById('score').textContent = score;
    document.getElementById('misses').textContent = misses;
    
    setTimeout(() => {
        // Geri bildirim sınıflarını kaldır
        buttons.forEach(btn => btn.classList.remove('correct-feedback', 'incorrect-feedback'));
        
        currentWordIndex++;
        display.style.color = 'var(--secondary-orange)';
        displayNextWord();
        buttons.forEach(btn => btn.disabled = false);
    }, 1500);
}

function endGame() {
    const display = document.getElementById('word-display');
    const optionsContainer = document.getElementById('type-options');
    
    display.textContent = `Oyun Bitti! Skor: ${score} Doğru, ${misses} Yanlış`;
    display.style.color = 'var(--primary-blue)';

    // Tekrar Oyna Butonu Ekle
    optionsContainer.innerHTML = `
        <button id="restart-button" class="type-button" style="background-color: var(--primary-blue);">Baştan Başla (Tekrar Oyna)</button>
    `;
    
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

function restartGame() {
    // Skorları sıfırla ve oyunu yeniden başlat
    score = 0;
    misses = 0;
    currentWordIndex = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('misses').textContent = misses;

    shuffle(words);
    renderTypeOptions();
    displayNextWord();
}
