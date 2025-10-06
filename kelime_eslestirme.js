// kelime_eslestirme.js - Kelime ve Cümle Eşleştirme Oyununun Mantığı

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
            allData = data;
            initializeGame();
        }
    });
});

function initializeGame() {
    matchedPairs = 0;
    document.getElementById('matched-pairs').textContent = `${matchedPairs}/${pairsToMatch}`;
    document.getElementById('current-stage').textContent = currentStage;
    
    let sourceArray;
    let maxElements;

    if (currentStage === 1) {
        // Kelime eşleştirme için ilk 12 kelimeyi al
        sourceArray = allData.kelimeler.slice(0, 12); 
    } else {
        // Cümle eşleştirme için ilk 6 cümleyi al
        sourceArray = allData.cumleler.slice(0, 6);
    }
    
    // Yetersiz veri kontrolü
    if (sourceArray.length < pairsToMatch) {
        document.getElementById('match-game-container').innerHTML = `<p style="text-align:center;">Tebrikler! Tüm ${currentStage === 1 ? 'kelime' : 'cümle'} seviyelerini bitirdiniz.</p>`;
        return;
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
    gameContainer.innerHTML = ''; // Önceki kartları temizle

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-id', card.id);
        cardElement.setAttribute('data-lang', card.lang);
        cardElement.textContent = '?'; // Başlangıçta soru işareti
        cardElement.addEventListener('click', flipCard);
        gameContainer.appendChild(cardElement);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    // Kartı çevir ve içeriğini göster
    this.classList.add('flipped');
    const cardData = cards.find(c => c.content === this.dataset.content);
    if(cardData) this.textContent = cardData.content;
    
    // Kart içeriğini data-content'e kaydet
    const cardIndex = cards.findIndex(c => c.content === this.textContent);
    this.setAttribute('data-content', cards[cardIndex].content);

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true; 
    checkForMatch();
}

function checkForMatch() {
    // Eşleşme kontrolü: id'ler aynı, ancak dil tipleri farklı olmalı (Türkçe-Arapça)
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
        // Kart içeriğini tekrar gizle
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
            <p>Yeni ve daha zorlu bir aşamaya geçiliyor...</p>
        </div>
    `;
    
    currentStage++;
    
    setTimeout(() => {
        initializeGame();
    }, 2000);
}
