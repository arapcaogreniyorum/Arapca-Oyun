// dinle_ve_yaz.js - Dinle ve Yaz Oyununun Mantığı (Son Versiyon)

let items = [];
let currentItem = null;
let correctScore = 0;
let wrongScore = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadData().then(data => {
        if (data) {
            items = [...data.kelimeler, ...data.cumleler];
            if (items.length === 0) {
                document.getElementById('user-input').placeholder = "Yeterli sesli içerik bulunamadı.";
                return;
            }
            shuffle(items);
            setupListeners();
            nextItem();
        }
    });
});

function setupListeners() {
    document.getElementById('speaker-button').addEventListener('click', speakCurrentItem);
    document.getElementById('check-button').addEventListener('click', checkAnswer);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

function nextItem() {
    if (items.length === 0) {
        endGame();
        return;
    }

    currentItem = items.pop();
    document.getElementById('user-input').value = '';
    document.getElementById('feedback').textContent = 'Dinle ve Türkçe karşılığını yaz.';
    document.getElementById('feedback').style.color = 'var(--dark-text)';
    document.getElementById('check-button').disabled = false;
    document.getElementById('speaker-button').disabled = false;
    
    speakCurrentItem();
}

function speakCurrentItem() {
    if (!currentItem) return;

    const utterance = new SpeechSynthesisUtterance(currentItem.ar);
    utterance.lang = 'ar-SA'; 
    utterance.rate = 0.8; 

    window.speechSynthesis.speak(utterance);
}

function checkAnswer() {
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    const correctTranslation = currentItem.tr.trim().toLowerCase();
    const feedback = document.getElementById('feedback');

    if (!userInput) {
        feedback.textContent = 'Lütfen bir cevap yazın.';
        feedback.style.color = 'red';
        return;
    }

    if (userInput === correctTranslation) {
        correctScore++;
        feedback.innerHTML = `✅ **Doğru!** Arapçası: <span style="font-weight: bold; direction: rtl; display: inline-block;">${currentItem.ar}</span> - Türkçesi: ${currentItem.tr}`;
        feedback.style.color = 'var(--success-green)';
    } else {
        wrongScore++;
        feedback.innerHTML = `❌ **Yanlış.** Doğru cevap: **${currentItem.tr}**. Arapçası: <span style="font-weight: bold; direction: rtl; display: inline-block;">${currentItem.ar}</span>`;
        feedback.style.color = 'red';
    }

    document.getElementById('correct-score-listen').textContent = correctScore;
    document.getElementById('wrong-score-listen').textContent = wrongScore;
    
    document.getElementById('check-button').disabled = true;

    setTimeout(nextItem, 3000);
}

function endGame() {
    const feedback = document.getElementById('feedback');
    const container = document.querySelector('.listen-game-container');
    
    feedback.innerHTML = "";
    container.innerHTML = `
        <h2>Oyun Bitti!</h2>
        <p>Skor: ${correctScore} Doğru, ${wrongScore} Yanlış</p>
        <button id="restart-button" class="type-button" style="background-color: var(--primary-blue);">Baştan Başla (Tekrar Oyna)</button>
    `;
    
    // İlerleme Kaydı
    localStorage.setItem('listen_completed', 'true');
    
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

function restartGame() {
    // Sayfayı yeniden yükleyerek oyunu baştan başlatıyoruz
    window.location.reload(); 
}
