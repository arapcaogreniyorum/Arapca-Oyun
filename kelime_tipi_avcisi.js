// kelime_tipi_avcisi.js - Kelime Tipi Avcısı Oyununun Mantığı (AKILLI TEKRAR + LEVEL VERSİYONU)

let words = []; 
let currentWordIndex = 0; 
let misses = 0; // Doğru skor artık Local Storage'dan yönetilecek
const allowedTypes = ["İSİM", "FİİL", "SIFAT", "ZAMİR", "ZARF", "EDAT"]; 
const TOTAL_WORDS_TO_PLAY = 15; // Bir oyunda sorulacak toplam kelime sayısı
const GAME_ID = 'kelime_tipi'; // Bu oyunun benzersiz kimliği

// YENİ FONKSİYON: Seviye bilgisini HTML'de gösterir.
function updateLevelDisplay() {
    const currentLevel = getCurrentGlobalLevel(); // utility.js'den gelir
    const levelDisplay = document.getElementById('current-global-level');
    if (levelDisplay) {
        levelDisplay.textContent = currentLevel;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // YENİ: Sayfa yüklenir yüklenmez seviyeyi göster
    updateLevelDisplay();
    
    loadData().then(data => {
        if (data) {
            window.allData = data;
            
            // Başlangıç skorlarını Local Storage'dan yükle
            document.getElementById('score').textContent = getGameScore(GAME_ID);
            
            restartGame(); 
        }
    });
});

function selectWordsForGame() {
    // YENİ: Mevcut Global Seviyeyi al
    const currentLevel = getCurrentGlobalLevel(); 
    
    // YENİ: Tüm kelimeleri tipine GÖRE ve seviyeye GÖRE filtrele
    const allFilteredWords = window.allData.kelimeler.filter(
        word => allowedTypes.includes(word.tip) && word.seviye <= currentLevel
    );

    if (allFilteredWords.length === 0) {
        document.getElementById('word-display').textContent = "Yeterli kelime bulunamadı. Lütfen data.js dosyasını kontrol edin veya seviyenizi artırın.";
        return [];
    }

    // Zor kelimeler listesini al (utility.js'ten)
    // NOT: getDifficultWords ve updateDifficultWords'e oyun ID'si eklenmeli
    const difficultWords = getDifficultWords(GAME_ID); 
    let selectedWords = [];
    const easyWords = allFilteredWords.filter(word => !difficultWords.some(dw => dw.ar === word.ar));

    // 1. Kural: Zor kelimelerin %30'unu seç
    const numDifficult = Math.min(Math.ceil(TOTAL_WORDS_TO_PLAY * 0.3), difficultWords.length);
    shuffle(difficultWords);
    selectedWords.push(...difficultWords.slice(0, numDifficult));

    // 2. Kural: Geri kalanını kolay/rastgele kelimelerden seç
    const numEasy = TOTAL_WORDS_TO_PLAY - selectedWords.length;
    shuffle(easyWords);
    selectedWords.push(...easyWords.slice(0, numEasy));
    
    // Son kelime listesini karıştır ve geri döndür
    shuffle(selectedWords);
    return selectedWords;
}

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

    buttons.forEach(btn => btn.disabled = true);
    buttons.forEach(btn => btn.classList.remove('correct-feedback', 'incorrect-feedback'));

    if (selectedType === currentWord.tip) {
        // YENİ: Skoru güncelle ve seviye atlamayı kontrol et
        updateGameScore(GAME_ID, true); 
        
        // YENİ: Seviye atlamış olabilir, ekranı güncelle
        updateLevelDisplay();

        display.style.color = 'var(--success-green)';
        display.textContent = `${originalText} (Doğru: ${currentWord.tip})`;
        clickedButton.classList.add('correct-feedback');
        
        // AKILLI TEKRAR: Doğru bildi, zor kelimeler listesinden çıkar!
        updateDifficultWords(currentWord, 'remove', GAME_ID); 

    } else {
        misses++;
        display.style.color = 'red';
        display.textContent = `${originalText} (Yanlış! Doğrusu: ${currentWord.tip})`;
        clickedButton.classList.add('incorrect-feedback');
        buttons.forEach(btn => {
            if (btn.textContent === currentWord.tip) {
                btn.classList.add('correct-feedback');
            }
        });
        
        // AKILLI TEKRAR: Yanlış bildi, zor kelimeler listesine ekle!
        updateDifficultWords(currentWord, 'add', GAME_ID); 
    }

    // YENİ: Skor Local Storage'dan çekiliyor
    document.getElementById('score').textContent = getGameScore(GAME_ID); 
    document.getElementById('misses').textContent = misses;

    setTimeout(() => {
        buttons.forEach(btn => btn.classList.remove('correct-feedback', 'incorrect-feedback'));
        currentWordIndex++;
        display.style.color = 'var(--secondary-orange)';
        displayNextWord();
        buttons.forEach(btn => btn.disabled = false);
    }, 1500);
}

// kelime_tipi_avcisi.js dosyasından (endGame fonksiyonu)

function endGame() {
    const display = document.getElementById('word-display');
    const optionsContainer = document.getElementById('type-options');
    
    // YENİ: Skoru Local Storage'dan çek
    const finalScore = getGameScore(GAME_ID);
    
    // Oyun sonu toplam skorlarını hesapla
    const totalQuestions = finalScore + misses;
    const successRate = totalQuestions > 0 ? ((finalScore / totalQuestions) * 100).toFixed(1) : 0;
    
    // Kelime alanını temizle ve bitiş mesajını göster
    display.innerHTML = `
        <div style="color: var(--primary-blue); margin-bottom: 20px;">
            <h2>🎉 Oyun Tamamlandı!</h2>
        </div>
    `;

    // Seçenekler alanına detaylı puan tablosunu ve butonu yerleştir
    optionsContainer.innerHTML = `
        <div class="score-summary" style="text-align: left; width: 100%; max-width: 300px; margin: 0 auto 30px; padding: 15px; background-color: var(--light-bg); border-radius: 8px;">
            <h3 style="margin-top: 0; color: var(--secondary-orange);">Sonuçlar</h3>
            <p><strong>Toplam Soru:</strong> ${totalQuestions}</p>
            <p style="color: var(--success-green);"><strong>Doğru Cevap:</strong> ${finalScore}</p>
            <p style="color: red;"><strong>Yanlış Cevap:</strong> ${misses}</p>
            <hr style="border-top: 1px solid #ddd;">
            <p><strong>Başarı Oranı:</strong> %${successRate}</p>
        </div>
        
        <button id="restart-button" class="type-button" style="background-color: var(--primary-blue);">
            Baştan Başla (Tekrar Oyna)
        </button>
    `;

    // İlerleme Kaydı ve Buton Dinleyicisi
    localStorage.setItem('type_completed', 'true');
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

function restartGame() {
    // Yanlışları sıfırla, doğru skor Local Storage'da kalır
    misses = 0;
    currentWordIndex = 0;
    
    // YENİ: Skor ve seviyeyi güncelle
    document.getElementById('score').textContent = getGameScore(GAME_ID);
    updateLevelDisplay();
    document.getElementById('misses').textContent = misses;
    
    // Yeni kelime setini Akıllı Tekrar/Level mantığıyla seç
    words = selectWordsForGame();
    
    renderTypeOptions();
    displayNextWord();
}
