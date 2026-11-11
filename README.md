# Sim Plan – Yıllık Simülatör Planı

Pilotların yıllık LPC/OPC simülatör planını kuran tek dosyalık uygulama: `sim-plan.html`. Tarayıcıda açılır ya da Windows'a kurulur; internet gerekmez. Tarayıcıda veriler o tarayıcının hafızasında, kurulan uygulamada ise uygulamanın veri klasöründeki bir dosyada saklanır.

Daha önce `capella-code/Training-Forms` deposunda `prototype/simulator-plan.html` olarak geliştirildi; dosyanın bütün geçmişi bu depoya taşındı.

## Neler yapar

- Ekip (rütbe, kod, LPC geçerliliği, son sim tarihi), eğitmenler (rütbe, yetki), vizeler, FSTD / uçak listesi (A–F slotları), simülatör müsaitliği (Reserved / Tahmini), kapalı günler, izinler ve birlikte uçmayacaklar girilir: elle, Excel'den yapıştırarak ya da `.xlsx` / `.csv` yükleyerek.
- **Planı oluştur** taslak planı kurar ve plandaki her gün için müsaitlik listesine Tahmini satır açar; **Sadece Reserved ile planla** yalnızca Reserved günleri kullanır.
- Uygunluk tablosu "Uygunluk tablosu.xlsx" dosyasındaki 2027 sayfasının sütun ve formüllerini (Error, Earliest Auto, Visa Control, Final Month) uygular.
- Öncelikli kurallar (sırası Ayarlar'dan değişir): son ayında planlamama, LPC ile OPC'yi aynı oturuma koymama, 1 CPT + 1 F/O eşleşmesi. Zorunlu kural: eğitimi veren eğitmen aynı oturumda kontrolü yapamaz. İsteğe bağlı: eğitmen olarak SFI/SFE; TRI/TRE yalnızca o ay o lokasyonda kendi LPC/OPC'si varsa.
- Otel taslağı (giriş / çıkış günü Ayarlar'dan), Excel'e aktarma, JSON yedek.
- EN / TR düğmesi: arayüz ve Excel çıktıları İngilizce ya da Türkçe; Türkçede yazıların üzerine gelince İngilizcesi görünür.

## Masaüstü uygulaması (Windows kurulumu)

`sim-plan.html` artık Windows'a kurulan bir Electron uygulaması olarak da paketlenir.

- **Sürüm:** `package.json` içindeki `version` (şu an 1.0.0). Uygulamada başlıkta ve pencere adında `Sim Plan v1.0.0` görünür.
- **Veri yeri:** Tarayıcı yerine `%APPDATA%\Sim Plan\veriler.json` dosyasında tutulur; güncelleme ve yeniden kurulumda silinmez. Uygulama içinden **Diğer ▸ Veri klasörünü aç** ile ulaşılır.
- **Kod koruması:** Kurulum paketine `sim-plan.html` değil, karıştırılmış (obfuscation) `app/index.html` gömülür; `asar` ile paketlenir ve geliştirici araçları kapalıdır. Depodaki `sim-plan.html` okunur kaynak olarak kalır (yalnızca depoya erişimi olanlar görür).

### Kurulum dosyasını (Setup.exe) üretme

GitHub otomatik üretir: **Actions ▸ "Windows kurulum dosyasi" ▸ Run workflow**. Ya da `app-v1.0.0` gibi bir etiket gönderin. İş akışı:
1. `npm install`
2. `npm run build` — `sim-plan.html` karıştırılıp `app/index.html` yazılır.
3. `electron-builder --win` — `dist/Sim Plan Setup <sürüm>.exe` üretilir.

Çıktı hem Actions çalışmasında **artifact** olarak, hem de **Releases** sayfasında `Sim Plan v<sürüm>` olarak indirilebilir. Dosya imzasız olduğu için Windows SmartScreen "bilinmeyen yayıncı" uyarısı verebilir: **Ek bilgi ▸ Yine de çalıştır**. İmza için ücretli sertifika gerekir (kapsam dışı).

### Yeni sürüm çıkarma

`package.json` içindeki `version` artırılır, değişiklik `main`'e gönderilir, iş akışı yeniden çalıştırılır.

## Bilgisayarda kullanım (Masaüstü\Claude\Sim Plan)

`paket/` klasöründeki `Sim Plan.cmd` başlatıcıdır; uygulamayı Microsoft Edge'de kendi penceresinde açar. Klasörü kurmak ya da güncellemek için:

1. `paket/Sim Plan.cmd` dosyasını klasöre koyun.
2. `sim-plan.html` dosyasını aynı klasöre **`sim plan.html`** adıyla kopyalayın (güncellemede eskisinin üzerine yazın; veriler tarayıcıda durduğu için kaybolmaz).
3. `Sim Plan.cmd` ile açın. İlk açılışta verileriniz yoksa **Diğer ▸ Yedekten yükle** ile son JSON yedeğinizi yükleyin.

Veriler tarayıcıda saklandığı için düzenli olarak **Diğer ▸ Yedek al (JSON)** ile yedek alın. Farklı tarayıcılarda (Edge / Chrome) veriler ayrı tutulur; hep aynı başlatıcıyla açın.

## Geliştirme

`python -m http.server 8766 --bind 127.0.0.1` ile depo kökünde sunucu açıp `http://127.0.0.1:8766/sim-plan.html` adresine gidin (ayarı `.claude/launch.json` içinde).

Not: FSTD / Uçak sekmesindeki **Form uygulamasından al** düğmesi, SHGM form uygulaması (Training-Forms) aynı tarayıcı adresinden açıldığında görünür; ayrı açılınca gizlenir, uygulamanın geri kalanı etkilenmez.
