// kelime_eslestirme.js - Kelime ve Cümle Eşleştirme Oyununun Mantığı (KESİN DÜZELTME)

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
            window.allData = data; 
            initializeGame();
        }
    });
});

function initializeGame() {
    // Skor ve Aşama sıfırlama
    matchedPairs = 0;
    document.getElementById('matched-pairs').textContent = `${matchedPairs}/${pairsToMatch}`;
    document.getElementById('current-stage').textContent = currentStage;
    
    let sourceArray;

    if (currentStage === 1) {
        // Kelime eşleştirme (Verideki ilk 12 kelimeyi kullanıyoruz)
        sourceArray = window.allData.kelimeler;
        document.querySelector('header p').textContent = 'Kelime Aşamasındasınız. Arapça kelimeleri Türkçe karşılıklarıyla eşleştirin.';
    } else if (currentStage === 2) {
        // Cümle eşleştirme (Verideki ilk 6 cümleyi kullanıyoruz)
        sourceArray = window.allData.cumleler;
        document.querySelector('header p').textContent = 'Cümle Aşamasındasınız. Arapça cümleleri Türkçe karşılıklarıyla eşleştirin.';
    } else {
         // Oyun Bitti
         const gameContainer = document.getElementById('match-game-container');
         gameContainer.innerHTML = `<div style="text-align:center; padding: 50px;"><h2>🎉 Tebrikler! Tüm Eşleştirme Oyunlarını Bitirdiniz!</h2><a href="index.html" class="menu-button">Ana Menüye Dön</a></div>`;
         return;
    }
    
    // Yeterli veri yoksa
    if (sourceArray.length < pairsToMatch) {
         const gameContainer = document.getElementById('match-game-container');
         gameContainer.innerHTML = `<div style="text-align:center; padding: 50px;"><h2>🎉 Tebrikler! Tüm Eşleştirme Oyunlarını Bitirdiniz!</h2><a href="index.html" class="menu-button">Ana Menüye Dön</a></div>`;
         return;
    }

    // Seçilen 6 çifti al
    const selectedPairs = sourceArray.slice(0, pairsToMatch);
    cards = [];

    selectedPairs.forEach((item, index) => {
        // Arapça kart (index = 0, 1, 2, 3, 4, 5)
        cards.push({ id: index, content: item.ar, lang: 'ar-SA', type: 'arabic' });
        // Türkçe kart (index = 0, 1, 2, 3, 4, 5)
        cards.push({ id: index, content: item.tr, lang: 'tr-TR', type: 'turkish' });
    });

    shuffle(cards);
    renderCards();
}

function renderCards() {
    const gameContainer = document.getElementById('match-game-container');
    gameContainer.innerHTML = ''; // Önceki kartları temizle

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-id', card.id);
        cardElement.setAttribute('data-lang', card.lang);
        // *** DÜZELTME: Kart içeriğini data-content'e atamak kritik. ***
        cardElement.setAttribute('data-content', card.content); 
        
        cardElement.textContent = '?'; // Başlangıçta soru işareti
        
        // Arapça kartlara rtl yönü veriyoruz
        if (card.lang === 'ar-SA') {
            cardElement.style.direction = 'rtl';
            cardElement.style.fontSize = '1.5rem';
        }
        
        cardElement.addEventListener('click', flipCard);
        gameContainer.appendChild(cardElement);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    // Kartı çevir
    this.classList.add('flipped');
    
    // data-content niteliğindeki gerçek içeriği alıp ekrana yaz
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
    // Eşleşme kontrolü: id'ler aynı OLMALI ve dil tipleri farklı OLMALI.
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
