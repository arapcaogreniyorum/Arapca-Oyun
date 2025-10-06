// utility.js - TÜM OYUNLAR İÇİN GÜNCEL VERİ YÜKLEYİCİ VE YARDIMCI FONKSİYONLAR

/**
 * Global değişkenler
 */
let allData = null; // Veri (data.js'ten) buraya atanacak

// const DATA_URL = 'data.json'; // ARTIK KULLANILMIYOR
const CACHE_KEY = 'AppWarningShown';

/**
 * Veriyi yükler ve bir Promise döndürür. Veriyi data.js dosyasındaki gameData değişkeninden alır.
 */
async function loadData() {
    try {
        // data.js dosyasının yüklenip gameData değişkeninin tanımlanıp tanımlanmadığını kontrol et
        if (typeof gameData === 'undefined' || !gameData.kelimeler) {
            // Eğer gameData değişkeni yoksa (data.js yüklenememiş demektir) hata fırlat
            throw new Error("data.js yüklenemedi. Lütfen tüm HTML dosyalarınızda <script src='data.js'></script> etiketinin olduğundan emin olun.");
        }
        
        // Başarılı: Global allData değişkenini ayarla
        window.allData = gameData; 
        console.log("Veri (data.js) başarıyla yüklendi.");
        return window.allData;

    } catch (error) {
        console.error("Veri yüklenirken kritik hata oluştu:", error);
        // fetch() yerine direkt değişken okuma hatası olduğu için daha basit hata gösterimi
        alert('Oyun verisi yüklenirken kritik bir hata oluştu. Tüm HTML dosyalarınızda data.js yüklü mü?');
        return null; 
    }
}

/**
 * Yükleme hatası mesajını ekranda gösterir.
 * NOT: Bu fonksiyon artık çağrılmayacak, çünkü fetch() kullanmıyoruz. Ancak hata yakalama için tutulabilir.
 */
function displayLoadError() {
    const containers = document.querySelectorAll('.game-container, .type-game-container, .fill-game-container, .listen-game-container, .match-game-container');
    containers.forEach(container => {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red;">
                <h2>Üzgünüz, Oyun Verileri Yüklenemedi!</h2>
                <p>Kritik JavaScript hatası! Lütfen **data.js** ve **utility.js** dosyalarınızın doğru yüklendiğinden emin olun.</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; margin-top: 15px; cursor: pointer;">Sayfayı Yenile</button>
            </div>
        `;
    });
}

/**
 * Fisher-Yates algoritması ile diziyi karıştırır.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Uygulama içi tarayıcı olup olmadığını kontrol eder (Instagram, Facebook vb.).
 */
function isWebView() {
    const ua = navigator.userAgent.toLowerCase();
    const rules = [
        /instagram/i.test(ua),
        /fban/i.test(ua), // Facebook
        /fbav/i.test(ua), // Facebook
        /wv/i.test(ua) && /android/i.test(ua), // Android WebView
        /(ipad|iphone|ipod).*crios/i.test(ua) // iOS App (Chrome in app)
    ];
    return rules.some(rule => rule);
}

/**
 * Instagram/WebView uyarısını gösterir ve kullanıcıya tek seferlik gösterimi kaydeder.
 */
function checkAndDisplayWarning() {
    const warning = document.getElementById('app-warning');
    
    // Eğer uyarı zaten gösterilmişse veya tarayıcı WebView değilse (veya warning elemanı yoksa), çık.
    if (!warning || localStorage.getItem(CACHE_KEY) === 'true' || !isWebView()) {
        warning.style.display = 'none';
        return;
    }

    warning.style.display = 'flex';
    
    // "Tamam" butonuna tıklandığında uyarıyı gizle ve kaydet.
    document.querySelector('.warning-box button').onclick = () => {
        warning.style.display = 'none';
        localStorage.setItem(CACHE_KEY, 'true');
    };
}

// Zor kelime kaydetme/çekme fonksiyonları (Akıllı Tekrar için)

function getDifficultWords(gameId = 'kelime_tipi') {
    const list = localStorage.getItem(`difficult_words_${gameId}`);
    return list ? JSON.parse(list) : [];
}

function updateDifficultWords(word, action, gameId = 'kelime_tipi') {
    let difficultWords = getDifficultWords(gameId);
    
    // Kelimeyi büyük/küçük harf fark etmeksizin kaydet (ar)
    const arWord = word.ar; 

    if (action === 'add') {
        // Zaten listede yoksa ekle
        if (!difficultWords.some(w => w.ar === arWord)) {
            difficultWords.push(word);
        }
    } else if (action === 'remove') {
        // Doğru bildiyse listeden çıkar
        difficultWords = difficultWords.filter(w => w.ar !== arWord);
    }
    
    localStorage.setItem(`difficult_words_${gameId}`, JSON.stringify(difficultWords));
}
