// dinle_ve_yaz.js - Dinle ve Yaz Oyununun Mantığı

let items = [];
let currentItem = null;
let correctScore = 0;
let wrongScore = 0;
let useWords = true; // Başlangıçta kelimeleri kullan

document.addEventListener('DOMContentLoaded', () => {
    loadData().then(data => {
        if (data) {
            // Kelime ve cümleleri birleştir
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
        document.getElementById('feedback').textContent = `Oyun Bitti! Skor: ${correctScore} Doğru, ${wrongScore} Yanlış`;
        document.getElementById('speaker-button').disabled = true;
        document.getElementById('check-button').disabled = true;
        return;
    }

    currentItem = items.pop();
    document.getElementById('user-input').value = '';
    document.getElementById('feedback').textContent = 'Dinle ve Türkçe karşılığını yaz.';
    document.getElementById('feedback').style.color = 'var(--dark-text)';

    // Otomatik seslendirme (Bazı tarayıcılar kısıtlayabilir)
    speakCurrentItem();
}

function speakCurrentItem() {
    if (!currentItem) return;

    // SpeechSynthesis API (Metni sese dönüştürme)
    const utterance = new SpeechSynthesisUtterance(currentItem.ar);
    utterance.lang = 'ar-SA'; // Arapça dil kodu

    // En yavaş hızı ayarla (Daha anlaşılır olması için)
    utterance.rate = 0.8; 

    // Oynatma
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

    // Basit kontrol (Kelimeleri ayırarak kontrol etmek daha iyi olur ama basitlik için tam eşleşme)
    if (userInput === correctTranslation || correctTranslation.includes(userInput)) {
        correctScore++;
        feedback.textContent = `Doğru! Arapçası: ${currentItem.ar} - Türkçesi: ${currentItem.tr}`;
        feedback.style.color = 'var(--success-green)';
    } else {
        wrongScore++;
        feedback.textContent = `Yanlış. Doğru cevap: ${currentItem.tr}. Arapçası: ${currentItem.ar}`;
        feedback.style.color = 'red';
    }

    document.getElementById('correct-score-listen').textContent = correctScore;
    document.getElementById('wrong-score-listen').textContent = wrongScore;

    // Kontrol sonrası bir sonraki kelimeye geç
    setTimeout(nextItem, 2500);
}
