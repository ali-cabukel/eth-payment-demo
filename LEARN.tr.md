# Kripto para ve blokzincirin temelleri: bu demo üzerinden

Bu rehber demo uygulamasıyla birlikte okunmak için yazıldı. Her kavram, ekranda tıklayabileceğiniz bir şeye bağlanıyor.

## 1. Blokzincir (blockchain) nedir?

Binlerce bilgisayarın birebir aynı kopyasını tuttuğu **ortak bir kayıt defteri**.

- Kayıt **bloklara** bölünür. Her blok bir grup **işlem** (transaction) içerir: "Alice, 1 numaralı faturaya 0,05 ETH ödedi" gibi.
- Her bloğun bir **hash** değeri vardır: içeriğinden hesaplanan kısa bir parmak izi. Tek bir bayt değişse parmak izi tamamen değişir.
- Her blok, **kendinden önceki bloğun hash'ini** de saklar (*parent*, yani üst blok). "Zincir" budur.
- Eski bir ödemeyi sessizce değiştirmek isterseniz o bloğu değiştirmeniz gerekir. Bu, bloğun hash'ini değiştirir, sonraki bloğun bağlantısını koparır ve bu böyle devam eder. Sonraki tüm blokları ağın geri kalanından daha hızlı yeniden üretmeniz gerekir. Pratikte bu imkânsızdır, yani **geçmiş değiştirilemez**.

👉 Demoda: **Mini blok gezgini**, her bloğun hash'ini ve üst blok hash'ini gösterir. Yan yana iki bloğa tıklayıp karşılaştırın.

## 2. Kripto para nedir? Ether (ETH) nedir?

Blokzincirin kendi parası. Ethereum'da adı **Ether (ETH)**. Bir banka gibi parayı sizin adınıza kimse tutmaz; blokzincir sadece hangi adresin ne kadar sahibi olduğunu kaydeder.

- En küçük birim **wei**'dir. `1 ETH = 1.000.000.000.000.000.000 wei` (10¹⁸). Yuvarlama hatalarından kaçınmak için kod her zaman wei ile (tam sayılarla) çalışır. Bu yüzden sözleşme tutarları wei olarak saklar, uygulama ise ekranda ETH'ye çevirir.
- **gwei** = 10⁹ wei; gas fiyatları için kullanılır (aşağıya bakın).

## 3. Cüzdanlar, adresler ve özel anahtarlar

**Cüzdan** (wallet) aslında bir anahtar çiftidir:

| | Nedir | Paylaşılır mı? |
|---|---|---|
| **Özel anahtar** (private key) | 256 bitlik gizli bir sayı | **Asla.** Kimde varsa para onundur. |
| **Adres** | açık anahtardan türetilir, ör. `0x7099…79C8` | Evet, IBAN gibi |

Bir işlem gönderdiğinizde cüzdanınız onu özel anahtarla **imzalar**. Herkes imzayı adresinize göre doğrulayabilir ama kimse taklit edemez. **"Şifremi unuttum" yoktur**: anahtarı kaybederseniz para gider, sızdırırsanız çalınır.

👉 Demoda: üç kişi, Hardhat'in hazır test cüzdanlarıdır. Bir işleme tıklayınca **imzasını** (`r`, `s`, `v`) ve **nonce** değerini görürsünüz. Nonce, gönderene ait bir sayaçtır; aynı imzalı ödemenin iki kez gönderilmesini engeller.

## 4. İşlemler ve gas ücretleri

Blokzincirdeki her değişiklik bir **işlemdir**. Okumak ücretsizdir; yazmak ise ETH olarak ödenen bir **ücret** gerektirir:

```
ücret = kullanılan gas × gas fiyatı
```

- **Gas**, işlemin ne kadar hesaplama gerektirdiğini ölçer (düz bir ETH transferi 21.000 gas'tır; bir sözleşmeyi çağırmak daha fazlasıdır).
- **Gas fiyatı**, gas birimi başına önerdiğiniz tutardır. Ağ yoğunken fiyatlar yükselir.
- Ücret mağazaya **değil**, ağa (doğrulayıcılara) gider.

👉 Demoda: kayıt alanı her işlem için kullanılan gas'ı, gas fiyatını ve ücreti gösterir. Mağazanın sadece fatura oluşturmak için bile ücret ödediğine dikkat edin.

## 5. Madencilik / doğrulama ve onay

İşlemler, bir **doğrulayıcı** (validator) onları bir bloğa koyana kadar sırada bekler. Ethereum yaklaşık **12 saniyede** bir yeni blok üretir. Bir ödeme bir bloğa girdiğinde "onaylanmış" olur. Pahalı ürünleri göndermeden önce birçok işletme birkaç blok daha (ya da yaklaşık 13 dakika süren "kesinleşme"yi, finality) bekler.

👉 Demoda: yerel zincir her işlem için **anında** blok üretir; bu yüzden gerçek hayattan daha hızlı hissettirir.

## 6. Akıllı sözleşmeler

**Akıllı sözleşme** (smart contract), blokzincirde kendi adresinde yaşayan bir programdır. Yayınlandıktan sonra:

- Kodu **herkese açıktır** ve (normalde) **değiştirilemez**.
- Tam olarak yazıldığı gibi çalışır. Onu yazan şirket dahil kimse araya giremez.
- Kendisi **ETH tutabilir**.

Bizim sözleşmemiz `contracts/PaymentProcessor.sol`, **Solidity** diliyle yazıldı. Üç fonksiyonu var:

| Fonksiyon | Kim çağırır | Ne yapar |
|---|---|---|
| `createInvoice(tutar, açıklama)` | mağaza | bir fatura kaydeder, numarasını döndürür |
| `pay(id)` + ETH | müşteri | tutarın tam olduğunu ve faturanın ödenmemiş olduğunu kontrol eder, faturayı ödendi yapar, tutarı mağazanın bakiyesine ekler |
| `withdraw()` | mağaza | mağazaya o ana kadar ödenen her şeyi gönderir |

Bir kural sağlanmazsa (yanlış tutar, zaten ödenmiş) sözleşme **revert** eder: tüm işlem hiç olmamış gibi iptal edilir.

👉 Demoda: **Eksik öde** ya da **Tekrar ödemeyi dene** düğmelerine basın. Kayıt alanında sözleşmenin hata mesajını görürsünüz.

## 7. Olaylar (events): şirketin sunucusu "ödendi"yi nasıl anlar?

Sözleşmeler **olay** yayar (`InvoiceCreated`, `InvoicePaid`, `Withdrawn`). Bunlar ucuz ve kalıcı kayıt satırlarıdır. Gerçek bir mağazanın sunucusu **`InvoicePaid` olayını dinler**, siparişi kendi veritabanında ödendi olarak işaretler ve ürünü gönderir.

👉 Demoda: bir işleme tıklayıp yaydığı olayları görün.

## 8. Para neden "çekilerek" alınıyor? (bir güvenlik dersi)

Sözleşme, `pay()` sırasında parayı mağazaya kendisi göndermez. Tutarı bir **bakiyeye ekler**, mağaza da parayı daha sonra `withdraw()` ile **kendisi çeker**. Sözleşme, ETH'yi göndermeden *önce* bakiyeyi sıfırlar. Bu, klasik **yeniden giriş saldırısını** (re-entrancy) engeller: 2016'daki "DAO saldırısında" (~60 milyon $) kötü niyetli alıcı, ödeme ortasında sözleşmeyi tekrar çağırarak parayı iki kez çekmişti.

## 9. Test ağları ve ana ağ

| Ağ | Para | Ne için |
|---|---|---|
| **Yerel (Hardhat)**, bu demo | sahte, sınırsız | öğrenme, otomatik testler |
| **Sepolia** test ağı | "faucet"lerden alınan ücretsiz test ETH'si | MetaMask gibi gerçek cüzdanlarla test |
| **Ethereum ana ağı** (mainnet) | gerçek ETH | canlı kullanım |
| **Katman 2'ler** (Base, Arbitrum, Optimism…) | gerçek ETH, çok daha düşük ücret | bugün gerçek ödemelerin çoğu |

## 10. Gerçek bir şirket ödeme sistemi bunlara ek olarak neye ihtiyaç duyar?

Bu demo bilerek küçük tutuldu. Canlıdaki bir kripto ödeme sistemi ayrıca şunlarla uğraşır:

1. **Fiyat dalgalanması.** ETH'nin fiyatı çok oynar. Çoğu işletme fiyatı itibari parayla (TL/€/$) belirleyip ödeme anında çevirir ya da ETH yerine **stablecoin** (USDC, USDT: 1 $'a sabitlenmiş token'lar) kabul eder.
2. **Müşteri cüzdanları.** Müşteriler MetaMask, Coinbase Wallet, WalletConnect vb. ile öder. Uygulama cüzdandan imza ister; özel anahtarı hiçbir zaman görmez.
3. **Anahtar saklama.** Şirketin özel anahtarlarını kim tutuyor? Genellikle bir donanım güvenlik modülü (HSM), çok imzalı bir cüzdan (ör. Safe) ya da bir saklama (custody) hizmeti. Anahtarı kaybetmek parayı kaybetmektir.
4. **Onaylar ve zincir yeniden düzenlemeleri** (reorg). Bir ödemeyi kesin saymadan önce yeterince blok bekleyin.
5. **İadeler.** Blokzincir ödemeleri banka tarafından geri alınamaz. İade, geriye doğru yeni bir ödemedir; bunu sözleşme ya da sunucu desteklemelidir.
6. **Denetimler.** Sözleşme hataları kalıcı ve herkese açıktır. Canlıdaki sözleşmeler denetlenir (audit) ve genellikle OpenZeppelin gibi iyi test edilmiş kütüphaneler üzerine kurulur.
7. **Gizlilik.** Zincirdeki her şey sonsuza kadar herkese açıktır. Müşteri adını, e-postasını ya da sipariş ayrıntılarını asla zincire yazmayın; sadece bir sipariş numarası yazın, gerisini kendi veritabanınızda tutun.
8. **Mevzuat.** Kimlik doğrulama (KYC), kara para aklamayla mücadele (AML), vergi ve lisans kuralları ülkeye göre değişir. Örneğin Türkiye'de kripto varlıkların *ödeme aracı olarak* kullanılması Nisan 2021'den beri TCMB yönetmeliğiyle yasaktır. Yayına almadan önce hukuk ekibine danışın.
9. **Ödeme altyapı sağlayıcıları.** Birçok şirket sıfırdan yazmak yerine bir sağlayıcı kullanır (Coinbase Commerce, BitPay, Stripe'ın kripto ödemeleri vb.).

## Sözlük

| Terim | Anlamı |
|---|---|
| Adres (address) | Herkese açık hesap kimliği (`0x…`, 40 onaltılık karakter) |
| Blok (block) | Bir grup işlem; önceki bloğa hash'i ile bağlıdır |
| Gas | Hesaplama birimi; ücreti ETH ile ödenir |
| Gwei | 10⁹ wei; gas fiyatları için kullanılır |
| Hash | Bir verinin sabit uzunluktaki parmak izi; en küçük değişiklik bambaşka bir hash verir |
| Nonce | Hesap başına işlem sayacı |
| Özel anahtar (private key) | Bir adresi kontrol eden sır |
| Revert | Sözleşme çağrıyı reddetti; yaptığı tüm değişiklikler geri alınır |
| Akıllı sözleşme (smart contract) | Blokzincirde saklanan ve çalışan program |
| Stablecoin | Sabit bir değerde (ör. 1 $) kalması için tasarlanmış token |
| Wei | ETH'nin en küçük birimi (10⁻¹⁸ ETH) |
