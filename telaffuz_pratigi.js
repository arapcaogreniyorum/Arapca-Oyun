// telaffuz_pratigi.js - Telaffuz Pratiği Oyunu (Web Speech API ile)

let items = []; // Kelime ve cümlelerin birleşimi
let currentItem = null;
let correctScore = 0;
let retryScore = 0;
let recognition = null; // Konuşma tanıma objesi

document.addEventListener('DOMContentLoaded', () => {
    // 1. Veri Yükleme
    loadData().then(data => {
        if (data) {
            // Hem kelimeleri hem cümleleri kullan
            items = [...data.kelimeler, ...data.cumleler];
            shuffle(items);
            
            // 2. Konuşma Tanıma Desteği Kontrolü
            if ('webkitSpeechRecognition' in window) {
                initializeSpeechRecognition();
                setupListeners();
                nextItem();
            } else {
                document.getElementById('feedback').textContent = "⚠️ Üzgünüz! Tarayıcınız Konuşma Tanıma özelliğini desteklemiyor (Chrome/Edge önerilir).";
                document.getElementById('start-speech').disabled = true;
            }
        }
    });
});

function initializeSpeechRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'ar-SA'; // Arapça dilini ayarla
    recognition.continuous = false;
    recognition.interimResults = false;

    // Sonuç geldiğinde
    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        processSpeechResult(result);
    };

    // Hata oluştuğunda
    recognition.onerror = (event) => {
        document.getElementById('feedback').textContent = `Hata oluştu: ${event.error}. Tekrar deneyin.`;
        document.getElementById('start-speech').disabled = false;
    };

    // Konuşma bittiğinde
    recognition.onend = () => {
        document.getElementById('start-speech').textContent = "🎤 Başla ve Oku";
    };
}

function setupListeners() {
    document.getElementById('listen-model').addEventListener('click', speakCurrentItem);
    document.getElementById('start-speech').addEventListener('click', startSpeechRecognition);
}

function nextItem() {
    if (items.length === 0) {
        document.getElementById('word-to-read').textContent = `Oyun Bitti! Başarılı: ${correctScore}`;
        document.getElementById('translation-display').textContent = "";
        document.getElementById('feedback').textContent = "Tebrikler, tüm içeriği bitirdiniz!";
        document.getElementById('start-speech').disabled = true;
        document.getElementById('listen-model').disabled = true;
        return;
    }

    currentItem = items.pop();
    document.getElementById('word-to-read').textContent = currentItem.ar;
    document.getElementById('translation-display').textContent = `Türkçesi: ${currentItem.tr}`;
    document.getElementById('feedback').textContent = 'Okumaya hazır olduğunuzda "Başla ve Oku" butonuna basın.';
    document.getElementById('user-speech-output').textContent = '';
}

function speakCurrentItem() {
    if (!currentItem) return;
    const utterance = new SpeechSynthesisUtterance(currentItem.ar);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8; 
    window.speechSynthesis.speak(utterance);
}

function startSpeechRecognition() {
    if (recognition) {
        document.getElementById('feedback').textContent = 'Dinliyorum... Lütfen şimdi Arapça okuyun.';
        document.getElementById('start-speech').textContent = "🔴 Okunuyor...";
        document.getElementById('start-speech').disabled = true;
        recognition.start();
    }
}

function processSpeechResult(result) {
    document.getElementById('user-speech-output').textContent = `Sistem Algıladı: ${result}`;
    document.getElementById('start-speech').disabled = false;
    
    // Basit doğrulama: Tanınan metin, model metne ne kadar yakın?
    // Bu basit bir eşleşme, gerçek telaffuz puanlaması yapmaz.
    const cleanResult = result.replace(/[^ء-ي]/g, '').trim(); // Arapça dışı karakterleri kaldır
    const cleanModel = currentItem.ar.replace(/[^ء-ي]/g, '').trim(); 
    
    // Çok basit bir doğruluk kontrolü yapıyoruz (uzunluk farkı ve başlangıç/bitiş eşleşmesi)
    const isClose = cleanModel.includes(cleanResult) || cleanResult.includes(cleanModel); 

    if (isClose && cleanResult.length > cleanModel.length * 0.5) { // En az %50'si eşleşmeli
        correctScore++;
        document.getElementById('feedback').textContent = "✅ Mükemmel! Telaffuzunuz başarılıydı. Tebrikler!";
        document.getElementById('feedback').style.color = 'var(--success-green)';
        setTimeout(nextItem, 2000);
    } else {
        retryScore++;
        document.getElementById('feedback').textContent = `❌ Tekrar Deneyin. Telaffuzunuz tam eşleşmedi. Doğru model: "${currentItem.ar}"`;
        document.getElementById('feedback').style.color = 'red';
        setTimeout(() => {
            document.getElementById('feedback').textContent = 'Tekrar okumayı deneyin veya doğru okunuşu dinleyin.';
            document.getElementById('feedback').style.color = 'var(--dark-text)';
        }, 3000);
    }

    document.getElementById('correct-score-speech').textContent = correctScore;
    document.getElementById('retry-score-speech').textContent = retryScore;
}
