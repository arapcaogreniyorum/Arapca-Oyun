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


// ------------------------------------------------------------------
// TELAFUZ DÜZELTME FONKSİYONU (SON VE EN GÜÇLÜ VERSİYON)
// ------------------------------------------------------------------

/**
 * Arapça kelimeleri konuşma tanıma ve veri eşleştirmesi için agrasif olarak temizler ve basitleştirir.
 * Yalnızca Arapça harfleri tutar ve standartlaştırır.
 */
function normalizeArabic(text) {
    if (!text) return "";
    
    let normalized = text.trim().toLowerCase();
    
    // 1. YALNIZCA ARAPÇA HARFLERİ VE BOŞLUKLARI KORUYAN FİLTRELEME
    // Bu, araya giren İngilizce/Türkçe kelimeleri, noktalama işaretlerini, rakamları tamamen kaldırır.
    normalized = normalized.replace(/[^\u0600-\u06FF\s]/g, ""); 
    
    // 2. Harekeleri (Vowels) ve Şeddeyi Kaldır
    normalized = normalized.replace(/[\u064b-\u065e\u0651]/g, ""); 
    
    // 3. Elif Varyasyonlarını Standartlaştır (آ، أ، إ -> ا)
    normalized = normalized.replace(/[\u0622\u0623\u0625]/g, "\u0627"); 
    
    // 4. Yuvarlak T (ة) ve normal H (ه) farkını standartlaştır (ة -> ه)
    // Bu, "سيارة" ve "سياره" sorununu kesin çözer.
    normalized = normalized.replace(/\u0629/g, "\u0647"); 
    
    // 5. Elif Maksura (ى) ve Yaa (ي) standartlaştır (ى -> ي)
    normalized = normalized.replace(/\u0649/g, "\u064A"); 
    
    // 6. Birden fazla boşluğu tek boşluğa indir ve baştaki/sondaki boşlukları kaldır.
    normalized = normalized.replace(/\s+/g, " ").trim();
    
    return normalized;
}


// ------------------------------------------------------------------
// ZOR KELİME YÖNETİMİ (MEVCUT)
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// LEVEL (SEVİYE) YÖNETİMİ (YENİ EKLENEN KISIM)
// ------------------------------------------------------------------

const MAX_LEVEL = 10; // Uygulamanın ulaşabileceği maksimum seviye sayısı
const XP_PER_LEVEL = 5; // Bir sonraki seviyeye geçmek için gereken başarılı skor (her oyun için ayrı ayrı)
const GLOBAL_LEVEL_KEY = 'user_global_level';

/**
 * Kullanıcının mevcut global seviyesini Local Storage'dan alır. Yoksa 1 döndürür.
 */
function getCurrentGlobalLevel() {
    const level = localStorage.getItem(GLOBAL_LEVEL_KEY);
    return level ? parseInt(level, 10) : 1;
}

/**
 * Belirli bir oyunun (type_game, fill_game, match_game vb.) başarılı skorunu Local Storage'da günceller.
 * Bu skor, seviye ilerlemesi için kullanılır.
 * @param {string} gameId - Oyunun benzersiz kimliği (örn: 'telaffuz', 'kelime_tipi').
 * @param {boolean} isCorrect - Cevabın doğru olup olmadığı.
 */
function updateGameScore(gameId, isCorrect) {
    const scoreKey = `score_${gameId}`;
    let currentScore = parseInt(localStorage.getItem(scoreKey) || '0', 10);
    
    if (isCorrect) {
        currentScore += 1;
        localStorage.setItem(scoreKey, currentScore.toString());
        
        // Seviye atlama kontrolünü yap
        checkLevelUp(gameId, currentScore);
    }
}

/**
 * Seviye atlama kontrolünü yapar ve seviye atlanmışsa global seviyeyi günceller.
 * @param {string} gameId - Oyunun benzersiz kimliği.
 * @param {number} currentScore - Oyunun mevcut başarılı skor sayısı.
 */
function checkLevelUp(gameId, currentScore) {
    let currentLevel = getCurrentGlobalLevel();
    
    // Yeterli skor toplanmışsa ve maksimum seviyeye ulaşılmamışsa
    // NOT: İleride bu skoru seviyeye göre artırabilirsiniz (örn: Seviye 2 için 10 XP)
    const requiredXP = XP_PER_LEVEL; 
    
    if (currentScore >= requiredXP && currentLevel < MAX_LEVEL) {
        
        // Global seviyeyi artır
        currentLevel += 1;
        localStorage.setItem(GLOBAL_LEVEL_KEY, currentLevel.toString());
        
        console.log(`🎉 Tebrikler! Seviye ${currentLevel}'e ulaştınız.`);
        alert(`🎉 Tebrikler! Artık Seviye ${currentLevel}'desiniz! Yeni kelimeler ve oyunlar açıldı!`);

        // NOT: Burası seviye atladıktan sonra mevcut oyunun skorunu sıfırlama veya koruma kararına bağlıdır.
        // Şimdilik skorlar korunuyor.
    }
}

/**
 * Belirli bir oyunda kullanıcının şu anki başarılı skorunu alır.
 * @param {string} gameId - Oyunun benzersiz kimliği.
 * @returns {number} Oyunun mevcut başarılı skoru.
 */
function getGameScore(gameId) {
    const scoreKey = `score_${gameId}`;
    return parseInt(localStorage.getItem(scoreKey) || '0', 10);
}
