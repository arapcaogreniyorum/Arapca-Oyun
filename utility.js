// utility.js - Tüm oyunlar tarafından kullanılan temel fonksiyonlar ve veri yükleyici

/**
 * Global değişkenler
 */
let allData = null; // data.json içeriği buraya yüklenecek
const DATA_URL = 'data.json';
const CACHE_KEY = 'AppWarningShown';

/**
 * Veriyi yükler ve bir Promise döndürür. Veri yüklenmezse hata mesajı gösterir.
 */
async function loadData() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP Hata! Durum: ${response.status}`);
        }
        allData = await response.json();
        console.log("Veri başarıyla yüklendi.");
        return allData;
    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        displayLoadError();
        return null; // Hata durumunda null döndür
    }
}

/**
 * Yükleme hatası mesajını ekranda gösterir.
 */
function displayLoadError() {
    const containers = document.querySelectorAll('.game-container, .type-game-container, .fill-game-container, .listen-game-container');
    containers.forEach(container => {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: red;">
                <h2>Üzgünüz, Oyun Verileri Yüklenemedi!</h2>
                <p>Bu, genellikle tarayıcınızın güvenlik kısıtlamalarından kaynaklanır (CORS hatası).</p>
                <p>Lütfen sitenizi bir **yerel sunucu (Live Server)** üzerinden çalıştırdığınızdan emin olun ve sayfayı yenileyiniz.</p>
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
