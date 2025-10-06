// kelime_eslestirme.js - Kelime ve Cümle Eşleştirme Oyununun Mantığı (Düzeltilmiş Versiyon)

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedPairs = 0;
let currentStage = 1;
const pairsToMatch = 6;

document.addEventListener('DOMContentLoaded', () => {
    // utility.js'teki loadData'yı kullanarak veriyi çek
    loadData().then(data => {
        if (data) {
            window.allData = data; // allData'yı global/window seviyesine atıyoruz
            initializeGame();
        }
    });
});

function initializeGame() {
    matchedPairs = 0;
    document.getElementById('matched-pairs').textContent = `${matchedPairs}/${pairsToMatch}`;
    document.getElementById('current-stage').textContent = currentStage;
    
    let sourceArray;

    if (currentStage === 1) {
        // Kelime eşleştirme için ilk 12 kelimeyi al
        sourceArray = window.allData.kelimeler.slice(0, 12); 
        document.querySelector('header p').textContent = 'Kelime Aşamasındasınız. Arapça kelimeleri Türkçe karşılıklarıyla eşleştirin.';
    } else if (currentStage === 2) {
        // Cümle eşleştirme için ilk 6 cümleyi al
        sourceArray = window.allData.cumleler.slice(0, 6);
        document.querySelector('header p').textContent = 'Cümle Aşamasındasınız. Arapça cümleleri Türkçe karşılıklarıyla eşleştirin.';
    } else {
         // Oyun Bitti
         const gameContainer = document.getElementById('match-game-container');
         gameContainer.innerHTML = `<div style="text-align:center; padding: 50px;"><h2>🎉 Tebrikler! Tüm Eşleştirme Oyunlarını Bitirdiniz!</h2><a href="index.html" class="menu-button">Ana Menüye Dön</a></div>`;
         return;
    }

    if (sourceArray.length < pairsToMatch) {
        // İkinci seviyede veri bitince oyun sonu mesajı
        if (currentStage === 2) {
             const gameContainer = document.getElementById('match-game-container');
             gameContainer.innerHTML = `<div style="text-align:center; padding: 50px;"><h2>🎉 Tebrikler! Tüm Eşleştirme Oyunlarını Bitirdiniz!</h2><a href="index.html" class="menu-button">Ana Menüye Dön</a></div>`;
             return;
        }
    }

    // Seçilen 6 çifti hazırla ve kartları oluştur
    const selectedPairs = sourceArray.slice(0, pairsToMatch);
    cards = [];

    selectedPairs.forEach((item, index) => {
        // Arapça kart
        cards.push({ id: index, content: item.ar, lang: 'ar-SA', type: 'arabic' });
        // Türkçe kart
        cards.push({ id: index, content: item.tr, lang: 'tr-TR', type: 'turkish' });
    });

    shuffle(cards);
    renderCards();
}

function renderCards() {
    const gameContainer = document.getElementById('match-game-container');
    gameContainer.innerHTML = ''; 

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-id', card.id);
        cardElement.setAttribute('data-lang', card.lang);
        // *** DÜZELTME 1: Kart içeriğini data-content niteliğine ekliyoruz ***
        cardElement.setAttribute('data-content', card.content); 
        
        cardElement.textContent = '?'; 
        cardElement.addEventListener('click', flipCard);
        gameContainer.appendChild(cardElement);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    // Kartı çevir
    this.classList.add('flipped');
    
    // *** DÜZELTME 2: data-content niteliğindeki gerçek içeriği alıp ekrana yazıyoruz ***
    this.textContent = this.getAttribute('data-content'); 

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true; 
    checkForMatch();
}

function checkForMatch() {
    // Eşleşme kontrolü: id'ler aynı (çift oluşturuyorlar), ancak dil tipleri farklı olmalı (Türkçe-Arapça)
    const isMatch = firstCard.dataset.id === secondCard.dataset.id && firstCard.dataset.lang !== secondCard.dataset.lang;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);

    firstCard.classList.add('matched');
    secondCard.classList.add('matched');

    matchedPairs++;
    document.getElementById('matched-pairs').textContent = `${matchedPairs}/${pairsToMatch}`;

    resetBoard();

    if (matchedPairs === pairsToMatch) {
        setTimeout(nextStage, 1000);
    }
}

function unflipCards() {
    setTimeout(() => {
        // Kart içeriğini tekrar gizle (soru işareti)
        firstCard.textContent = '?';
        secondCard.textContent = '?';

        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function nextStage() {
    const gameContainer = document.getElementById('match-game-container');
    gameContainer.innerHTML = `
        <div style="text-align:center; padding: 20px;">
            <h2>Tebrikler! Aşama ${currentStage} Tamamlandı!</h2>
            <p>${currentStage === 1 ? 'Cümleler aşamasına' : 'Oyunun sonuna'} geçiliyor...</p>
        </div>
    `;
    
    currentStage++;
    
    setTimeout(() => {
        initializeGame();
    }, 2000);
}
