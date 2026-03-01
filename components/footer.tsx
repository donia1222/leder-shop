"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AdminLoginButton } from "@/components/admin-auth"
import { Facebook, Twitter, Instagram, Newspaper, ArrowRight, Download, ShieldCheck } from "lucide-react"

const API_BASE_URL = "https://web.lweb.ch/ledershop"

export function Footer() {
  const router = useRouter()
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [paySettings, setPaySettings] = useState<{
    enable_paypal: boolean
    enable_stripe: boolean
    enable_twint: boolean
    enable_invoice: boolean
  } | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/get_payment_settings.php`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.settings) {
          const s = data.settings
          setPaySettings({
            enable_paypal: !!s.enable_paypal,
            enable_stripe: !!s.enable_stripe,
            enable_twint: !!s.enable_twint,
            enable_invoice: s.enable_invoice !== false,
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleDownloadVCard = () => {
    const imageUrl = "https://online-shop-seven-delta.vercel.app/logo.png"
    fetch(imageUrl)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.blob()
      })
      .then((blob) => {
        const reader = new FileReader()
        reader.onloadend = function () {
          const base64data = (reader.result as string).split(",")[1]
          const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:Leder-Shop\nORG:Leder-Shop\nTITLE:HANDGEMACHT · SCHWEIZ\nADR:;;9468 Sax (SG);;;Switzerland\nTEL:+41774167375\nEMAIL:info@leder-shop.ch\nURL:https://leder-shop.ch\nPHOTO;ENCODING=b;TYPE=PNG:${base64data}\nEND:VCARD`
          const blob2 = new Blob([vCardContent], { type: "text/vcard;charset=utf-8" })
          const link = document.createElement("a")
          link.href = URL.createObjectURL(blob2)
          link.download = "Leder-Shop.vcf"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        reader.readAsDataURL(blob)
      })
      .catch(() => {
        const vCardContent = `BEGIN:VCARD\nVERSION:3.0\nFN:Leder-Shop\nORG:Leder-Shop\nTITLE:HANDGEMACHT · SCHWEIZ\nADR:;;9468 Sax (SG);;;Switzerland\nTEL:+41774167375\nEMAIL:info@leder-shop.ch\nURL:https://leder-shop.ch\nEND:VCARD`
        const blob2 = new Blob([vCardContent], { type: "text/vcard;charset=utf-8" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob2)
        link.download = "Leder-Shop.vcf"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
  }

  const legalContent = {
    agb: {
      title: "Allgemeine Geschäftsbedingungen (AGB)",
      content: `Leder-Shop | 9468 Sax (SG) | info@leder-shop.ch

1. GELTUNGSBEREICH
Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen, die über den Online-Shop von Leder-Shop abgeschlossen werden. Abweichende Bedingungen des Käufers werden nicht anerkannt, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu.

2. VERTRAGSSCHLUSS
Das Angebot in unserem Online-Shop stellt eine unverbindliche Einladung zur Bestellung dar. Durch das Absenden der Bestellung geben Sie ein verbindliches Angebot ab. Der Kaufvertrag kommt erst mit unserer schriftlichen Auftragsbestätigung per E-Mail zustande. Wir behalten uns das Recht vor, Bestellungen ohne Angabe von Gründen abzulehnen.

3. SORTIMENT & PRODUKTE
Unser Sortiment umfasst Artikel aus den Bereichen Jagd, Angeln und Outdoor, insbesondere: Messer, Armbrüste, Pfeilbogen, Beile, Sicherheitsprodukte, Lampen, Schleudern, Blasrohre sowie Grill- und Räucherzubehör. Alle Produkte werden in Übereinstimmung mit den geltenden Schweizer Gesetzen angeboten. Für bestimmte Artikel (z. B. Messer, Armbrüste) gelten gesetzliche Altersbeschränkungen. Mit der Bestellung bestätigen Sie, das gesetzlich vorgeschriebene Mindestalter erreicht zu haben.

4. PREISE UND ZAHLUNG
Alle Preise verstehen sich in Schweizer Franken (CHF) inklusive der gesetzlichen Mehrwertsteuer (MwSt.). Versandkosten werden im Bestellprozess separat ausgewiesen. Wir akzeptieren folgende Zahlungsmittel: TWINT, PostFinance, VISA, Mastercard, American Express sowie PayPal. Der Kaufpreis ist mit Abschluss der Bestellung fällig.

5. LIEFERUNG
Wir liefern ausschliesslich innerhalb der Schweiz. Die Lieferzeit beträgt in der Regel 1–3 Werktage nach Zahlungseingang. Bei Lieferverzögerungen informieren wir Sie unverzüglich. Das Versandrisiko geht mit Übergabe an den Paketdienstleister auf den Käufer über.

6. WIDERRUFSRECHT & RÜCKGABE
Sie haben das Recht, Ihre Bestellung innerhalb von 14 Tagen ab Erhalt der Ware ohne Angabe von Gründen zu widerrufen. Die Ware ist in originalem, unbenutztem Zustand und in der Originalverpackung zurückzusenden. Die Rücksendekosten trägt der Käufer. Ausgenommen vom Widerrufsrecht sind auf Kundenwunsch angefertigte oder personalisierte Artikel sowie Hygieneartikel nach Entsiegelung.

7. GEWÄHRLEISTUNG
Es gelten die gesetzlichen Gewährleistungsrechte nach Schweizer OR. Bei Sachmängeln haben Sie das Recht auf Nachbesserung oder Ersatzlieferung. Schlägt die Nacherfüllung fehl, können Sie vom Vertrag zurücktreten oder den Kaufpreis mindern.

8. HAFTUNG
Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Im Übrigen ist unsere Haftung auf den vorhersehbaren, vertragstypischen Schaden beschränkt. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit keine wesentlichen Vertragspflichten verletzt werden.

9. ANWENDBARES RECHT & GERICHTSSTAND
Es gilt ausschliesslich Schweizer Recht. Gerichtsstand für alle Streitigkeiten ist Sax, Kanton St. Gallen, Schweiz.

10. SCHLUSSBESTIMMUNGEN
Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Stand: Februar 2026.`,
    },
    datenschutz: {
      title: "Datenschutzerklärung",
      content: `Leder-Shop | 9468 Sax (SG) | info@leder-shop.ch

Diese Datenschutzerklärung informiert Sie gemäss dem Schweizer Datenschutzgesetz (DSG) sowie der EU-Datenschutz-Grundverordnung (DSGVO) über die Verarbeitung Ihrer personenbezogenen Daten.

1. VERANTWORTLICHE STELLE
Leder-Shop
9468 Sax (SG), Schweiz
Telefon: 077 416 73 75
E-Mail: info@leder-shop.ch

2. WELCHE DATEN WIR ERHEBEN
Im Rahmen der Bestellabwicklung erheben wir folgende Daten: Vor- und Nachname, Lieferadresse, E-Mail-Adresse, Telefonnummer sowie Zahlungsinformationen. Beim Besuch unserer Website werden technische Daten wie IP-Adresse, Browsertyp, Besuchsdauer und aufgerufene Seiten automatisch erfasst.

3. ZWECK DER DATENVERARBEITUNG
Wir verwenden Ihre Daten ausschliesslich für folgende Zwecke: Abwicklung und Bestätigung Ihrer Bestellungen, Versand und Lieferung der gekauften Produkte (Messer, Outdoor- und Jagdausrüstung, Angelzubehör etc.), Kundenkommunikation und Support, Erfüllung gesetzlicher Pflichten sowie zur Verbesserung unseres Angebots.

4. RECHTSGRUNDLAGE
Die Verarbeitung Ihrer Daten erfolgt zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO), zur Erfüllung rechtlicher Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO) sowie auf Basis unseres berechtigten Interesses an einem sicheren und effizienten Shopbetrieb (Art. 6 Abs. 1 lit. f DSGVO).

5. WEITERGABE VON DATEN
Ihre Daten werden nur an Dritte weitergegeben, soweit dies für die Vertragsabwicklung notwendig ist (z. B. Paketdienstleister für die Lieferung, Zahlungsanbieter wie PayPal, TWINT oder PostFinance). Eine Weitergabe zu Werbezwecken an Dritte findet nicht statt.

6. DATENSICHERHEIT
Wir setzen technische und organisatorische Sicherheitsmassnahmen ein, um Ihre Daten vor Verlust, Manipulation und unberechtigtem Zugriff zu schützen. Unser Online-Shop ist durch SSL/TLS-Verschlüsselung gesichert.

7. SPEICHERDAUER
Ihre Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck notwendig ist oder gesetzliche Aufbewahrungsfristen (in der Regel 10 Jahre für Buchhaltungsunterlagen) es erfordern.

8. IHRE RECHTE
Sie haben jederzeit das Recht auf: Auskunft über Ihre gespeicherten Daten, Berichtigung unrichtiger Daten, Löschung Ihrer Daten (sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen), Einschränkung der Verarbeitung sowie Datenübertragbarkeit. Zur Ausübung Ihrer Rechte wenden Sie sich an: info@leder-shop.ch

9. COOKIES
Unsere Website verwendet technisch notwendige Cookies, die für den Betrieb des Shops erforderlich sind. Analytische oder Marketing-Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt.

10. ÄNDERUNGEN
Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Stand: Februar 2026.`,
    },
    zahlungsarten: {
      title: "Zahlungsarten",
      content: `Leder-Shop akzeptiert folgende Zahlungsmittel:

TWINT
Bezahlen Sie schnell und sicher direkt per Smartphone-App. TWINT ist die meistgenutzte Schweizer Bezahl-App und funktioniert ohne Kreditkarte. Der Betrag wird sofort von Ihrem Konto abgebucht.

PostFinance
Bezahlen Sie bequem über Ihr PostFinance-Konto (E-Finance oder PostFinance Card). Ideal für alle PostFinance-Kunden in der Schweiz.

VISA / Mastercard / American Express
Wir akzeptieren alle gängigen Kredit- und Debitkarten. Die Zahlung erfolgt verschlüsselt über eine sichere SSL-Verbindung. Ihr Kartendaten werden nicht gespeichert.

PayPal
Bezahlen Sie über Ihr bestehendes PayPal-Konto. PayPal bietet einen integrierten Käuferschutz und ist weltweit verbreitet.

Allgemeine Hinweise
— Alle Preise verstehen sich in Schweizer Franken (CHF) inkl. MwSt.
— Der Kaufbetrag wird erst nach Versandbestätigung belastet.
— Bei Fragen zur Zahlung erreichen Sie uns unter info@leder-shop.ch oder 077 416 73 75.`,
    },
    cookies: {
      title: "Cookie Manager",
      content: `Was sind Cookies?
Cookies sind kleine Textdateien, die beim Besuch unserer Website auf Ihrem Gerät gespeichert werden. Sie ermöglichen es, Einstellungen zu speichern und die Nutzung der Website zu verbessern.

Technisch notwendige Cookies
Diese Cookies sind für den Betrieb des Online-Shops unbedingt erforderlich. Sie ermöglichen grundlegende Funktionen wie Warenkorb, Login und Sitzungsverwaltung. Diese Cookies können nicht deaktiviert werden.
— Sitzungs-Cookie (Session): Speichert Ihre aktuelle Sitzung (Warenkorb, Login-Status).
— Sicherheits-Cookie: Schützt vor Cross-Site-Request-Forgery (CSRF).

Funktionale Cookies
Diese Cookies ermöglichen erweiterte Funktionen wie gespeicherte Spracheinstellungen oder zuletzt angesehene Produkte. Sie können diese Cookies deaktivieren, was jedoch die Funktionalität einschränken kann.

Analyse-Cookies
Wir verwenden keine externen Analyse-Dienste (z. B. Google Analytics) ohne Ihre ausdrückliche Einwilligung.

Ihre Rechte
Gemäss Schweizer DSG und EU-DSGVO haben Sie das Recht, Cookies abzulehnen oder zu löschen. Sie können Cookies jederzeit über die Einstellungen Ihres Browsers verwalten oder löschen:
— Chrome: Einstellungen → Datenschutz → Cookies
— Firefox: Einstellungen → Datenschutz → Cookies
— Safari: Einstellungen → Datenschutz → Cookies verwalten

Bei Fragen: info@leder-shop.ch`,
    },
    ueberuns: {
      title: "Über uns",
      content: `Leder-Shop
Ihr Schweizer Spezialist für handgemachte Lederartikel

Wer wir sind
Leder-Shop ist ein familiengeführtes Fachgeschäft mit Sitz in Sax, Kanton St. Gallen. Wir sind Ihr verlässlicher Partner für hochwertige handgemachte Lederartikel – mit persönlicher Beratung und einem sorgfältig kuratierten Sortiment aus echtem Leder.

Was uns auszeichnet
Unser Team besteht aus passionierten Handwerkern und Lederliebhabern, die ihre Produkte selbst kennen und lieben. Jedes Stück wird mit Sorgfalt und Leidenschaft gefertigt – Qualität vor Quantität.

Unser Sortiment
— Portemonnaies & Geldbörsen: Handgefertigte Lederportemonnaies verschiedener Stile
— Handtaschen & Shopper: Damen- und Herrentaschen aus echtem Leder
— Rucksäcke: Lederrucksäcke für Freizeit und Business
— Gürtel: Echtledergürtel in verschiedenen Breiten und Farben
— Aktentaschen: Klassische Businesstaschen und Briefcases
— Accessoires: Schlüsseletui, Kartenetui, Armbänder und mehr
— Lederpflege: Pflegeprodukte und Zubehör für lange Freude an Ihren Artikeln

Unsere Werte
Wir legen grössten Wert auf Schweizer Qualitätsstandards, seriöse Beratung und echte Handwerkskunst.

Besuchen Sie uns
9468 Sax (SG)
Mo – Fr: 13:30 – 18:30 | Sa: 10:00 – 16:00
📞 077 416 73 75 | info@leder-shop.ch`,
    },
    impressum: {
      title: "Impressum",
      content: `Angaben gemäss Schweizer Recht (OR Art. 944)

BETREIBER DES ONLINE-SHOPS
Leder-Shop
9468 Sax (SG)
Kanton St. Gallen, Schweiz

KONTAKT
Telefon: 077 416 73 75
E-Mail: info@leder-shop.ch
Website: www.usfh.ch

ÖFFNUNGSZEITEN
Montag – Donnerstag: 13:30 – 18:30 Uhr
Freitag: 13:30 – 18:30 Uhr
Samstag: 10:00 – 16:00 Uhr
Sonntag: Geschlossen

UNTERNEHMENSFORM
Einzelunternehmen / Kleinunternehmen nach Schweizer Recht

MEHRWERTSTEUER
Alle Preise verstehen sich in CHF inklusive der gesetzlichen Schweizer Mehrwertsteuer (MwSt.).

VERANTWORTLICH FÜR DEN INHALT
Leder-Shop, 9468 Sax (SG)

WEBDESIGN & UMSETZUNG
lweb.ch – Webdesign & Digitalagentur
Website: https://lweb.ch

HAFTUNGSAUSSCHLUSS
Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich. Alle Inhalte dieser Website sind urheberrechtlich geschützt.

ANWENDBARES RECHT
Es gilt ausschliesslich Schweizer Recht. Gerichtsstand ist Sax, Kanton St. Gallen.

Stand: Februar 2026`,
    },
    rueckgabe: {
      title: "Versand & Rückgabe",
      content: `Leder-Shop | 9468 Sax (SG) | info@leder-shop.ch

1. VERSAND
Wir liefern ausschliesslich innerhalb der Schweiz. Bestellungen werden in der Regel innerhalb von 1–3 Werktagen nach Zahlungseingang versandt. Der Versand erfolgt mit einem zuverlässigen Schweizer Paketdienstleister. Sie erhalten nach dem Versand eine E-Mail mit Ihrer Sendungsverfolgungsnummer. Versandkosten werden transparent im Bestellprozess ausgewiesen.

2. RÜCKGABERECHT
Sie können bestellte Artikel innerhalb von 14 Tagen ab Erhalt ohne Angabe von Gründen zurückgeben. Bitte kontaktieren Sie uns vor der Rücksendung per E-Mail an info@leder-shop.ch oder telefonisch unter 077 416 73 75.

3. ZUSTAND DER WARE
Die Ware muss sich in originalem, unbenutztem Zustand befinden und in der Originalverpackung zurückgesendet werden. Bei Produkten wie Messern, Armbrüsten oder Outdoor-Ausrüstung dürfen keine Gebrauchsspuren vorhanden sein.

4. AUSNAHMEN VOM RÜCKGABERECHT
Vom Rückgaberecht ausgenommen sind: auf Kundenwunsch angefertigte oder gravierte Artikel, entsiegelte Hygieneartikel sowie Munition und gesetzlich regulierte Waren, sofern das Siegel gebrochen wurde.

5. RÜCKSENDEPROZESS
Bitte senden Sie die Ware gut verpackt an folgende Adresse zurück:
Leder-Shop
9468 Sax (SG)

Die Rücksendekosten trägt der Käufer. Wir empfehlen, die Sendung versichert zu verschicken.

6. ERSTATTUNG
Nach Erhalt und Prüfung der zurückgesandten Ware erstatten wir den Kaufpreis innerhalb von 14 Tagen auf dem ursprünglichen Zahlungsweg. Bei TWINT, PayPal, PostFinance sowie Kredit- und Debitkarten erfolgt die Gutschrift direkt auf das verwendete Konto.

7. BESCHÄDIGTE ODER FALSCHE LIEFERUNG
Falls Sie eine beschädigte oder falsche Ware erhalten haben, wenden Sie sich bitte umgehend an uns. Wir übernehmen in diesem Fall die Rücksendekosten und liefern Ihnen die korrekte Ware auf dem schnellsten Weg zu.`,
    },
  }

  return (
    <footer className="bg-white dark:bg-[#1a0b04] mt-0">

      {/* ── Payment icons strip ── */}
      {paySettings && (paySettings.enable_invoice || paySettings.enable_stripe || paySettings.enable_twint || paySettings.enable_paypal) && (
        <div className="border-t border-b border-[#E0E0E0] dark:border-[#3a2010] py-5 bg-white dark:bg-[#1a0b04]">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 pr-4 border-r border-[#E0E0E0]">
                <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
                <span className="text-[11px] font-semibold text-[#555] tracking-widest uppercase">Sichere Zahlung</span>
              </div>
              {paySettings.enable_invoice && (
                <div className="h-9 px-4 rounded-lg bg-[#F5F5F5] border border-[#E0E0E0] flex items-center gap-2 shadow-sm">
                  <span className="text-lg">🏦</span>
                  <span className="text-[11px] font-bold text-[#444] tracking-tight">Rechnung</span>
                </div>
              )}
              {paySettings.enable_twint && (
                <div className="h-9 px-3 rounded-lg bg-black flex items-center shadow-sm">
                  <img src="/twint-logo.svg" alt="TWINT" className="h-7 w-auto" />
                </div>
              )}
              {paySettings.enable_stripe && (
                <>
                  <div className="h-9 px-5 rounded-lg bg-[#1A1F71] flex items-center shadow-sm">
                    <span className="font-black text-white text-base italic tracking-tight">VISA</span>
                  </div>
                  <div className="h-9 px-4 rounded-lg bg-white border border-[#E0E0E0] flex items-center gap-1 shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-90" />
                    <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90 -ml-2" />
                    <span className="text-[11px] font-bold text-[#333] ml-1.5 tracking-tight">Mastercard</span>
                  </div>
                </>
              )}
              {paySettings.enable_paypal && (
                <div className="h-9 px-3 rounded-lg bg-white border border-[#E0E0E0] flex items-center shadow-sm">
                  <img src="/0014294_paypal-express-payment-plugin.png" alt="PayPal" className="h-7 w-auto object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Social icons ── */}
      <div className="border-b border-[#E0E0E0] dark:border-[#3a2010] py-4 bg-white dark:bg-[#1a0b04]">
        <div className="container mx-auto px-4 flex justify-center gap-6">
          {[
            { Icon: Facebook, href: "https://www.facebook.com/usfh.ch" },
            { Icon: Twitter, href: null },
            { Icon: Instagram, href: null },
          ].map(({ Icon, href }, i) =>
            href ? (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-[#8B5E3C] transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ) : (
              <button key={i} className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-[#8B5E3C] transition-colors">
                <Icon className="w-5 h-5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Footer columns ── */}
      <div className="bg-white dark:bg-[#1a0b04] border-t border-[#E8E8E8] dark:border-[#3a2010] py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10">

            {/* LEFT: Logo + Contact + Hours */}
            <div>
              {/* Logo + name */}
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.png" alt="Logo" className="h-14 w-auto object-contain flex-shrink-0" />
                <div
                  className="px-3 py-1.5 rounded-xl"
                  style={{ border: "2px dashed #8B5E3C", boxShadow: "inset 0 0 0 3px var(--box-inset), 0 0 0 1px #C49A6C33" }}
                >
                  <div className="font-black text-[#2D1206] dark:text-[#C49A6C] text-lg leading-tight tracking-tight">Leder-Shop</div>
                  <div className="text-xs text-[#8B5E3C] uppercase tracking-widest mt-1">Handgemachte Lederartikel</div>
                </div>
              </div>

              {/* Contact pills */}
              <div className="flex flex-col items-start gap-2 mb-6">
                <a href="https://maps.google.com/?q=9468+Sax+SG" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#F5F5F5] dark:bg-[#2D1206] text-[#444] dark:text-[#A89070] text-sm px-3 py-1.5 rounded-full whitespace-nowrap no-underline">
                  <span>📍</span> 9468 Sax (SG)
                </a>
                <a href="tel:0774167375"
                  className="inline-flex items-center gap-1.5 bg-[#F5F5F5] dark:bg-[#2D1206] text-[#8B5E3C] dark:text-[#C49A6C] font-semibold text-sm px-3 py-1.5 rounded-full whitespace-nowrap no-underline">
                  <span>📞</span> 077 416 73 75
                </a>
                <a href="mailto:info@leder-shop.ch"
                  className="inline-flex items-center gap-1.5 bg-[#F5F5F5] dark:bg-[#2D1206] text-[#8B5E3C] dark:text-[#C49A6C] font-semibold text-sm px-3 py-1.5 rounded-full whitespace-nowrap no-underline">
                  <span>✉️</span> info@leder-shop.ch
                </a>
              </div>
 
            </div>

            {/* Service */}
            <div>
              <h3 className="font-black text-[#1A1A1A] dark:text-[#FAF7F4] text-base mb-5 uppercase tracking-widest">Service</h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:info@leder-shop.ch" className="text-sm font-medium text-[#444] dark:text-[#C49A6C] hover:text-[#8B5E3C] transition-colors">Kontakt</a>
                </li>
                <li>
                  <Dialog open={openModal === "rueckgabe"} onOpenChange={(open) => setOpenModal(open ? "rueckgabe" : null)}>
                    <DialogTrigger asChild>
                      <button className="text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left">Versand und Rückgabe</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{legalContent.rueckgabe.title}</DialogTitle>
                      </DialogHeader>
                      <div className="whitespace-pre-line text-sm text-[#555]">{legalContent.rueckgabe.content}</div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog open={openModal === "zahlungsarten"} onOpenChange={(open) => setOpenModal(open ? "zahlungsarten" : null)}>
                    <DialogTrigger asChild>
                      <button className="text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left">Zahlungsarten</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{legalContent.zahlungsarten.title}</DialogTitle>
                      </DialogHeader>
                      <div className="whitespace-pre-line text-sm text-[#555]">{legalContent.zahlungsarten.content}</div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog open={openModal === "cookies"} onOpenChange={(open) => setOpenModal(open ? "cookies" : null)}>
                    <DialogTrigger asChild>
                      <button className="text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left">Cookie Manager</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{legalContent.cookies.title}</DialogTitle>
                      </DialogHeader>
                      <div className="whitespace-pre-line text-sm text-[#555]">{legalContent.cookies.content}</div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <button
                    onClick={handleDownloadVCard}
                    className="flex items-center gap-1.5 text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Digitale Visitenkarte
                  </button>
                </li>
              </ul>
            </div>

            {/* Firma */}
            <div>
              <h3 className="font-black text-[#1A1A1A] dark:text-[#FAF7F4] text-base mb-5 uppercase tracking-widest">Firma</h3>
              <ul className="space-y-3">
                <li>
                  <Dialog open={openModal === "ueberuns"} onOpenChange={(open) => setOpenModal(open ? "ueberuns" : null)}>
                    <DialogTrigger asChild>
                      <button className="text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left">Über uns</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{legalContent.ueberuns.title}</DialogTitle>
                      </DialogHeader>
                      <div className="whitespace-pre-line text-sm text-[#555]">{legalContent.ueberuns.content}</div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog open={openModal === "impressum"} onOpenChange={(open) => setOpenModal(open ? "impressum" : null)}>
                    <DialogTrigger asChild>
                      <button className="text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left">Impressum</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{legalContent.impressum.title}</DialogTitle>
                      </DialogHeader>
                      <div className="whitespace-pre-line text-sm text-[#555]">{legalContent.impressum.content}</div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog open={openModal === "datenschutz"} onOpenChange={(open) => setOpenModal(open ? "datenschutz" : null)}>
                    <DialogTrigger asChild>
                      <button className="text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left">Datenschutzerklärung</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{legalContent.datenschutz.title}</DialogTitle>
                      </DialogHeader>
                      <div className="whitespace-pre-line text-sm text-[#555]">{legalContent.datenschutz.content}</div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog open={openModal === "agb"} onOpenChange={(open) => setOpenModal(open ? "agb" : null)}>
                    <DialogTrigger asChild>
                      <button className="text-sm font-medium text-[#444] dark:text-[#D4C0A0] hover:text-[#8B5E3C] dark:hover:text-[#C49A6C] transition-colors text-left">AGB</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{legalContent.agb.title}</DialogTitle>
                      </DialogHeader>
                      <div className="whitespace-pre-line text-sm text-[#555]">{legalContent.agb.content}</div>
                    </DialogContent>
                  </Dialog>
                </li>
              </ul>

            
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ── */}
      <div className="bg-[#F5F5F5] dark:bg-[#0d0602] border-t border-[#E0E0E0] dark:border-[#3a2010] py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#888] dark:text-[#A89070]">
            <span>* Alle Preise inkl. MwSt., zzgl. Versandkosten</span>
            <span className="font-semibold text-xs text-[#555] dark:text-[#B8A080]">Copyright © 2026 Leder-Shop. Alle Rechte vorbehalten.</span>
            <span className="flex items-center gap-2">
              Design:&nbsp;<a href="https://lweb.ch" target="_blank" rel="noopener noreferrer" className="text-[#8B5E3C] font-semibold hover:underline">lweb.ch</a>
              <AdminLoginButton className="text-[#CCC] hover:text-[#888] ml-2" />
            </span>
          </div>
        </div>
      </div>

    </footer>
  )
}
