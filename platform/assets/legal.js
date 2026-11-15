// Legal pages of the booking website, in English, Dutch, German and Arabic.
// Egyptian consumer law (Law 181/2018, art. 5–6) requires consumer information, contracts and invoices to be available in Arabic;
// the other languages are translations. Privacy texts follow the Personal Data Protection Law (Law 151/2020) and its
// Executive Regulations (Ministerial Decree 816/2025, compliance from 1 November 2026).
// EXAMPLE TEXTS: written for the example platform and NOT legally reviewed. {{…}} marks details the company still has to fill in.

const L = (en, nl, de, ar) => ({ en, nl, de, ar });
export const LEGAL_UPDATED = "2026-11-15";
export const LEGAL_VERSION = "example-3";

// details that only the company can supply; shown as clearly marked placeholders until they are filled in
export const COMPANY = {
  trade_name: "Me & You Tours Egypt",
  legal_name: null, cr_no: null, tax_no: null, licence_no: null, licence_cat: null, etaa_no: null,
  address: null, email: null, phone: null, dpo: null,
  instagram: "https://www.instagram.com/meandyoutoursegypt",
};
export const PLACEHOLDER = {
  en: "to be completed before launch", nl: "in te vullen vóór de lancering", de: "vor dem Start zu ergänzen", ar: "يُستكمل قبل الإطلاق",
};
// what each missing detail is, so a placeholder says what still has to be filled in
export const PH_LABEL = {
  legal_name: L("official company name", "officiële bedrijfsnaam", "Firmenname", "الاسم القانوني للشركة"),
  cr_no: L("register number", "registernummer", "Registernummer", "رقم السجل"),
  tax_no: L("tax number", "belastingnummer", "Steuernummer", "الرقم الضريبي"),
  licence_no: L("licence number", "vergunningsnummer", "Lizenznummer", "رقم الترخيص"),
  etaa_no: L("ETAA number", "ETAA-nummer", "ETAA-Nummer", "رقم الغرفة"),
  address: L("address", "adres", "Anschrift", "العنوان"),
  email: L("e-mail", "e-mail", "E-Mail", "البريد الإلكتروني"),
  phone: L("phone", "telefoon", "Telefon", "الهاتف"),
  dpo: L("DPO contact", "contact DPO", "Kontakt DSB", "بيانات مسؤول حماية البيانات"),
};
export const HOTLINES = [
  { key: "cpa", num: "19588", label: { en: "Consumer Protection Agency (complaints)", nl: "Consumentenbeschermingsautoriteit (klachten)", de: "Verbraucherschutzbehörde (Beschwerden)", ar: "جهاز حماية المستهلك (الشكاوى)" } },
  { key: "tourism", num: "19654", label: { en: "Ministry of Tourism and Antiquities (tourist complaints)", nl: "Ministerie van Toerisme en Oudheden (klachten van toeristen)", de: "Ministerium für Tourismus und Altertümer (Touristenbeschwerden)", ar: "وزارة السياحة والآثار (شكاوى السائحين)" } },
  { key: "tpolice", num: "126", label: { en: "Tourist police", nl: "Toeristenpolitie", de: "Touristenpolizei", ar: "شرطة السياحة" } },
  { key: "amb", num: "123", label: { en: "Ambulance", nl: "Ambulance", de: "Rettungsdienst", ar: "الإسعاف" } },
  { key: "police", num: "122", label: { en: "Police", nl: "Politie", de: "Polizei", ar: "الشرطة" } },
  { key: "fire", num: "180", label: { en: "Fire brigade", nl: "Brandweer", de: "Feuerwehr", ar: "المطافئ" } },
];

export const DOCS = {
  // ------------------------------------------------------------------ company details & licences
  IMPRINT: {
    title: L("Company details & licences", "Bedrijfsgegevens & vergunningen", "Impressum & Lizenzen", "بيانات الشركة والتراخيص"),
    intro: L(
      "Egyptian law requires the supplier's identity, registration and tourism licence to be visible before you book. These are our details.",
      "De Egyptische wet verplicht de identiteit, registratie en toerismevergunning van de aanbieder vóór het boeken te tonen. Dit zijn onze gegevens.",
      "Nach ägyptischem Recht müssen Identität, Registrierung und Tourismuslizenz des Anbieters vor der Buchung sichtbar sein. Hier sind unsere Angaben.",
      "يُلزم القانون المصري بإظهار هوية المورد وقيده وترخيصه السياحي قبل الحجز. هذه بياناتنا."),
    sections: [
      [L("Who we are", "Wie wij zijn", "Wer wir sind", "من نحن"), L(
        "Trade name: Me & You Tours Egypt\nLegal name: {{legal_name}}\nCommercial register number: {{cr_no}}\nTax registration number: {{tax_no}}\nRegistered address: {{address}}\nE-mail: {{email}} · Phone/WhatsApp: {{phone}}\nInstagram: @meandyoutoursegypt",
        "Handelsnaam: Me & You Tours Egypt\nOfficiële naam: {{legal_name}}\nNummer handelsregister: {{cr_no}}\nBelastingnummer: {{tax_no}}\nVestigingsadres: {{address}}\nE-mail: {{email}} · Telefoon/WhatsApp: {{phone}}\nInstagram: @meandyoutoursegypt",
        "Handelsname: Me & You Tours Egypt\nFirmenname: {{legal_name}}\nHandelsregisternummer: {{cr_no}}\nSteuernummer: {{tax_no}}\nAnschrift: {{address}}\nE-Mail: {{email}} · Telefon/WhatsApp: {{phone}}\nInstagram: @meandyoutoursegypt",
        "الاسم التجاري: Me & You Tours Egypt\nالاسم القانوني: {{legal_name}}\nرقم السجل التجاري: {{cr_no}}\nرقم التسجيل الضريبي: {{tax_no}}\nالعنوان المسجل: {{address}}\nالبريد الإلكتروني: {{email}} · الهاتف/واتساب: {{phone}}\nإنستغرام: @meandyoutoursegypt")],
      [L("Tourism licence", "Toerismevergunning", "Tourismuslizenz", "الترخيص السياحي"), L(
        "Tourism companies in Egypt need a licence from the Ministry of Tourism and Antiquities (Law 38/1977 on tourism companies) and registration with the Egyptian Travel Agents Association (ETAA).\nMinistry licence number and category: {{licence_no}}\nETAA membership number: {{etaa_no}}\nYou can check a licence in the ETAA directory at etaa-egypt.org.",
        "Toerismebedrijven in Egypte hebben een vergunning nodig van het Ministerie van Toerisme en Oudheden (Wet 38/1977 op toerismebedrijven) en een inschrijving bij de Egyptian Travel Agents Association (ETAA).\nVergunningsnummer en categorie van het ministerie: {{licence_no}}\nETAA-lidmaatschapsnummer: {{etaa_no}}\nJe kunt een vergunning controleren in het ETAA-register op etaa-egypt.org.",
        "Tourismusunternehmen in Ägypten benötigen eine Lizenz des Ministeriums für Tourismus und Altertümer (Gesetz 38/1977 über Tourismusunternehmen) und eine Registrierung bei der Egyptian Travel Agents Association (ETAA).\nLizenznummer und Kategorie des Ministeriums: {{licence_no}}\nETAA-Mitgliedsnummer: {{etaa_no}}\nSie können eine Lizenz im ETAA-Verzeichnis auf etaa-egypt.org prüfen.",
        "تحتاج شركات السياحة في مصر إلى ترخيص من وزارة السياحة والآثار (القانون رقم 38 لسنة 1977 بشأن الشركات السياحية) وإلى القيد في غرفة شركات ووكالات السفر والسياحة (ETAA).\nرقم ترخيص الوزارة وفئته: {{licence_no}}\nرقم العضوية في الغرفة: {{etaa_no}}\nيمكنك التحقق من الترخيص في دليل الغرفة على etaa-egypt.org.")],
      [L("Partners who carry out the experiences", "Partners die de ervaringen uitvoeren", "Partner, die die Erlebnisse durchführen", "الشركاء المنفذون للتجارب"), L(
        "Boat trips, desert tours, transfers and guided visits are carried out by local partners. Before a partner is listed we check their licences, insurance and vehicles or boats. The partner's name is shown in your offer.",
        "Boottochten, woestijntochten, transfers en rondleidingen worden uitgevoerd door lokale partners. Voordat een partner wordt opgenomen controleren we vergunningen, verzekering en voertuigen of boten. De naam van de partner staat in je offerte.",
        "Bootsfahrten, Wüstentouren, Transfers und Führungen werden von lokalen Partnern durchgeführt. Bevor ein Partner aufgenommen wird, prüfen wir Lizenzen, Versicherung sowie Fahrzeuge oder Boote. Der Name des Partners steht in Ihrem Angebot.",
        "تُنفَّذ الرحلات البحرية ورحلات الصحراء والتنقلات والجولات المصحوبة بمرشد عن طريق شركاء محليين. قبل إدراج أي شريك نتحقق من تراخيصه وتأمينه ومركباته أو قواربه. يظهر اسم الشريك في عرضك.")],
      [L("Website", "Website", "Website", "الموقع الإلكتروني"), L(
        "Website made by VormVivo Studios.", "Website gemaakt door VormVivo Studios.", "Website erstellt von VormVivo Studios.", "تم إنشاء الموقع بواسطة VormVivo Studios.")],
    ],
  },

  // ------------------------------------------------------------------ privacy notice (PDPL)
  PRIVACY: {
    title: L("Privacy notice", "Privacyverklaring", "Datenschutzhinweis", "إشعار الخصوصية"),
    intro: L(
      "This notice explains which personal data we process, why, and what your rights are under Egypt's Personal Data Protection Law (Law 151/2020) and its Executive Regulations (Decree 816/2025).",
      "Deze verklaring legt uit welke persoonsgegevens we verwerken, waarom, en welke rechten je hebt onder de Egyptische wet op de bescherming van persoonsgegevens (Wet 151/2020) en het uitvoeringsbesluit (Besluit 816/2025).",
      "Dieser Hinweis erklärt, welche personenbezogenen Daten wir verarbeiten, warum, und welche Rechte Sie nach dem ägyptischen Datenschutzgesetz (Gesetz 151/2020) und seiner Durchführungsverordnung (Erlass 816/2025) haben.",
      "يوضح هذا الإشعار البيانات الشخصية التي نعالجها وسبب ذلك وحقوقك وفقًا لقانون حماية البيانات الشخصية المصري (القانون رقم 151 لسنة 2020) ولائحته التنفيذية (القرار رقم 816 لسنة 2025)."),
    sections: [
      [L("Who is responsible", "Wie is verantwoordelijk", "Verantwortlicher", "المسؤول عن المعالجة"), L(
        "Controller: {{legal_name}}, {{address}}.\nData protection officer (DPO): {{dpo}}.\nFor every privacy question or request use the privacy request form on this website or Support.",
        "Verwerkingsverantwoordelijke: {{legal_name}}, {{address}}.\nFunctionaris voor gegevensbescherming (DPO): {{dpo}}.\nVoor elke privacyvraag of elk verzoek gebruik je het privacyverzoekformulier op deze website of Support.",
        "Verantwortlicher: {{legal_name}}, {{address}}.\nDatenschutzbeauftragter (DPO): {{dpo}}.\nFür jede Datenschutzfrage oder Anfrage nutzen Sie das Datenschutz-Anfrageformular auf dieser Website oder den Support.",
        "المتحكم: {{legal_name}}، {{address}}.\nمسؤول حماية البيانات: {{dpo}}.\nلأي سؤال أو طلب يتعلق بالخصوصية استخدم نموذج طلب الخصوصية على هذا الموقع أو قسم الدعم.")],
      [L("What we collect", "Wat we verzamelen", "Was wir erheben", "ما الذي نجمعه"), L(
        "• Contact details: name, e-mail, phone number (optional).\n• Booking details: date, group size, ages of children where an activity requires it, pickup location, flight number for transfers, wishes you type in yourself.\n• Payment status: amounts and the payment reference. Card details are entered on the payment provider's page and never reach us.\n• Account details if you create one: password (stored only as a secure hash), language, favourites, trip plans.\n• Messages you send to Support.\nWe do not ask for passport numbers, and we ask you not to send health information unless it is needed for your safety on an activity.",
        "• Contactgegevens: naam, e-mail, telefoonnummer (optioneel).\n• Boekingsgegevens: datum, groepsgrootte, leeftijden van kinderen als een activiteit dat vereist, ophaallocatie, vluchtnummer bij transfers, wensen die je zelf invult.\n• Betaalstatus: bedragen en de betaalreferentie. Kaartgegevens vul je in op de pagina van de betaalprovider; die komen nooit bij ons.\n• Accountgegevens als je er een aanmaakt: wachtwoord (alleen als veilige hash opgeslagen), taal, favorieten, reisplannen.\n• Berichten die je naar Support stuurt.\nWe vragen geen paspoortnummers en vragen je geen gezondheidsinformatie te sturen, tenzij die nodig is voor je veiligheid bij een activiteit.",
        "• Kontaktdaten: Name, E-Mail, Telefonnummer (optional).\n• Buchungsdaten: Datum, Gruppengröße, Alter von Kindern, falls eine Aktivität es erfordert, Abholort, Flugnummer bei Transfers, Wünsche, die Sie selbst eingeben.\n• Zahlungsstatus: Beträge und die Zahlungsreferenz. Kartendaten geben Sie auf der Seite des Zahlungsanbieters ein; sie erreichen uns nie.\n• Kontodaten, wenn Sie ein Konto anlegen: Passwort (nur als sicherer Hash gespeichert), Sprache, Favoriten, Reisepläne.\n• Nachrichten an den Support.\nWir fragen keine Passnummern ab und bitten Sie, keine Gesundheitsdaten zu senden, außer sie sind für Ihre Sicherheit bei einer Aktivität nötig.",
        "• بيانات التواصل: الاسم والبريد الإلكتروني ورقم الهاتف (اختياري).\n• بيانات الحجز: التاريخ وعدد الأفراد وأعمار الأطفال إذا تطلبت التجربة ذلك ومكان الاستلام ورقم الرحلة الجوية للتنقلات والطلبات التي تكتبها بنفسك.\n• حالة الدفع: المبالغ ومرجع الدفع. تُدخل بيانات البطاقة في صفحة مزود الدفع ولا تصل إلينا أبدًا.\n• بيانات الحساب إذا أنشأت حسابًا: كلمة المرور (تُحفظ فقط بصيغة مشفرة آمنة) واللغة والمفضلة وخطط الرحلة.\n• الرسائل التي ترسلها إلى الدعم.\nلا نطلب أرقام جوازات السفر، ونرجو عدم إرسال معلومات صحية إلا إذا كانت ضرورية لسلامتك أثناء النشاط.")],
      [L("Why, and on what legal basis", "Waarom, en op welke grondslag", "Zweck und Rechtsgrundlage", "الغرض والأساس القانوني"), L(
        "• To arrange and deliver your booking (performance of the contract you ask for).\n• To issue invoices and keep accounting records (legal obligation under Egyptian tax law).\n• To answer your questions and complaints (your request, and our legal duty under consumer law).\n• To send offers or news by e-mail or WhatsApp only if you separately and explicitly opted in (consent, which you can withdraw at any time).\nWe do not sell personal data, do not build advertising profiles and do not use automated decisions that affect you.",
        "• Om je boeking te regelen en uit te voeren (uitvoering van de overeenkomst die je aanvraagt).\n• Om facturen uit te geven en een administratie te voeren (wettelijke plicht onder de Egyptische belastingwet).\n• Om je vragen en klachten te beantwoorden (je verzoek, en onze wettelijke plicht onder de consumentenwet).\n• Om aanbiedingen of nieuws per e-mail of WhatsApp te sturen, alleen als je daar apart en uitdrukkelijk voor hebt gekozen (toestemming, die je altijd kunt intrekken).\nWe verkopen geen persoonsgegevens, maken geen advertentieprofielen en gebruiken geen geautomatiseerde besluiten die jou raken.",
        "• Um Ihre Buchung zu organisieren und durchzuführen (Erfüllung des von Ihnen angefragten Vertrags).\n• Um Rechnungen auszustellen und Buchhaltungsunterlagen zu führen (gesetzliche Pflicht nach ägyptischem Steuerrecht).\n• Um Ihre Fragen und Beschwerden zu beantworten (Ihre Anfrage und unsere Pflicht nach dem Verbraucherschutzgesetz).\n• Um Angebote oder Neuigkeiten per E-Mail oder WhatsApp zu senden, nur wenn Sie gesondert und ausdrücklich eingewilligt haben (Einwilligung, jederzeit widerrufbar).\nWir verkaufen keine Daten, erstellen keine Werbeprofile und nutzen keine automatisierten Entscheidungen, die Sie betreffen.",
        "• لترتيب حجزك وتنفيذه (تنفيذ العقد الذي تطلبه).\n• لإصدار الفواتير والاحتفاظ بالسجلات المحاسبية (التزام قانوني وفق قانون الضرائب المصري).\n• للرد على أسئلتك وشكاواك (بناءً على طلبك وواجبنا وفق قانون حماية المستهلك).\n• لإرسال العروض أو الأخبار عبر البريد الإلكتروني أو واتساب فقط إذا وافقت على ذلك صراحةً وبشكل منفصل (موافقة يمكنك سحبها في أي وقت).\nلا نبيع البيانات الشخصية ولا ننشئ ملفات إعلانية ولا نستخدم قرارات آلية تؤثر عليك.")],
      [L("Who receives your data", "Wie je gegevens ontvangt", "Empfänger", "من يتلقى بياناتك"), L(
        "• The partner who carries out your experience receives only what is needed: name, group size, date, pickup location and relevant wishes.\n• The payment provider receives what it needs to process the payment.\n• Our hosting and e-mail providers process data on our instructions under a written agreement.\n• Authorities, only where Egyptian law requires it.",
        "• De partner die je ervaring uitvoert krijgt alleen wat nodig is: naam, groepsgrootte, datum, ophaallocatie en relevante wensen.\n• De betaalprovider krijgt wat nodig is om de betaling te verwerken.\n• Onze hosting- en e-mailproviders verwerken gegevens in onze opdracht, onder een schriftelijke overeenkomst.\n• Overheden, alleen als de Egyptische wet dat vereist.",
        "• Der Partner, der Ihr Erlebnis durchführt, erhält nur das Nötige: Name, Gruppengröße, Datum, Abholort und relevante Wünsche.\n• Der Zahlungsanbieter erhält, was er für die Zahlung braucht.\n• Unsere Hosting- und E-Mail-Anbieter verarbeiten Daten in unserem Auftrag auf Grundlage eines schriftlichen Vertrags.\n• Behörden, nur soweit das ägyptische Recht es verlangt.",
        "• يتلقى الشريك المنفذ لتجربتك ما يلزم فقط: الاسم وعدد الأفراد والتاريخ ومكان الاستلام والطلبات ذات الصلة.\n• يتلقى مزود الدفع ما يحتاجه لمعالجة الدفع.\n• يعالج مزودو الاستضافة والبريد الإلكتروني البيانات وفق تعليماتنا وبموجب اتفاق مكتوب.\n• الجهات الرسمية فقط عندما يشترط القانون المصري ذلك.")],
      [L("Transfers outside Egypt", "Doorgifte buiten Egypte", "Übermittlung außerhalb Ägyptens", "النقل خارج مصر"), L(
        "Personal data is only transferred or stored outside Egypt where the law allows it: with the licence or permit of the Personal Data Protection Centre (PDPC), or where the transfer is necessary for the contract you asked for, and with safeguards at least equal to Egyptian law. Before launch we will list here every country and provider involved. In this example website all data stays inside your own browser.",
        "Persoonsgegevens worden alleen buiten Egypte doorgegeven of opgeslagen als de wet dat toestaat: met een vergunning of toestemming van het Personal Data Protection Centre (PDPC), of als de doorgifte nodig is voor de overeenkomst die je aanvraagt, en met waarborgen die minstens gelijk zijn aan de Egyptische wet. Vóór de lancering vermelden we hier elk betrokken land en elke betrokken leverancier. Op deze voorbeeldwebsite blijven alle gegevens in je eigen browser.",
        "Personenbezogene Daten werden nur dann außerhalb Ägyptens übermittelt oder gespeichert, wenn das Gesetz es erlaubt: mit Lizenz oder Genehmigung des Personal Data Protection Centre (PDPC) oder wenn die Übermittlung für den von Ihnen gewünschten Vertrag nötig ist, und mit Garantien, die dem ägyptischen Recht mindestens gleichwertig sind. Vor dem Start nennen wir hier jedes beteiligte Land und jeden Anbieter. Auf dieser Beispiel-Website bleiben alle Daten in Ihrem eigenen Browser.",
        "لا تُنقل البيانات الشخصية ولا تُخزَّن خارج مصر إلا حيث يسمح القانون بذلك: بترخيص أو تصريح من مركز حماية البيانات الشخصية، أو إذا كان النقل ضروريًا لتنفيذ العقد الذي طلبته، ومع ضمانات لا تقل عن القانون المصري. قبل الإطلاق سنذكر هنا كل دولة وكل مزود معني. في هذا الموقع التجريبي تبقى جميع البيانات داخل متصفحك.")],
      [L("How long we keep data", "Hoe lang we gegevens bewaren", "Speicherdauer", "مدة الاحتفاظ بالبيانات"), L(
        "• Booking records and invoices: as long as Egyptian tax and commercial law requires; after that they are deleted.\n• Account data: until you delete your account. On deletion your account is anonymised; bookings stay only for the legal retention period, without your name.\n• Support messages: as long as needed to handle the matter, then deleted.\n• Marketing consent: until you withdraw it.",
        "• Boekingsgegevens en facturen: zo lang als de Egyptische belasting- en handelswet vereist; daarna worden ze verwijderd.\n• Accountgegevens: tot je je account verwijdert. Bij verwijdering wordt je account geanonimiseerd; boekingen blijven alleen voor de wettelijke bewaartermijn, zonder je naam.\n• Supportberichten: zo lang als nodig om de zaak af te handelen, daarna verwijderd.\n• Toestemming voor marketing: tot je die intrekt.",
        "• Buchungsunterlagen und Rechnungen: so lange, wie das ägyptische Steuer- und Handelsrecht es verlangt; danach werden sie gelöscht.\n• Kontodaten: bis Sie Ihr Konto löschen. Bei Löschung wird Ihr Konto anonymisiert; Buchungen bleiben nur für die gesetzliche Aufbewahrungsfrist, ohne Ihren Namen.\n• Support-Nachrichten: so lange wie für die Bearbeitung nötig, danach gelöscht.\n• Marketing-Einwilligung: bis Sie sie widerrufen.",
        "• سجلات الحجز والفواتير: طوال المدة التي يشترطها قانونا الضرائب والتجارة المصريان، ثم تُحذف.\n• بيانات الحساب: حتى تحذف حسابك. عند الحذف يُجهَّل حسابك، وتبقى الحجوزات فقط طوال مدة الاحتفاظ القانونية دون اسمك.\n• رسائل الدعم: طوال المدة اللازمة لمعالجة الأمر، ثم تُحذف.\n• الموافقة على التسويق: حتى تسحبها.")],
      [L("Your rights", "Je rechten", "Ihre Rechte", "حقوقك"), L(
        "You have the right to know which data we hold about you and to get a copy; to have incorrect data corrected; to have data deleted when it is no longer needed; to object to or restrict processing; to withdraw your consent at any time; and to be told about a breach that affects you.\nUse the privacy request form. We verify your identity first, then handle the request within the period set by the law. Withdrawing consent never affects processing that took place before.",
        "Je hebt het recht om te weten welke gegevens we van je hebben en een kopie te krijgen; om onjuiste gegevens te laten corrigeren; om gegevens te laten verwijderen als ze niet meer nodig zijn; om bezwaar te maken tegen of een beperking te vragen van de verwerking; om je toestemming altijd in te trekken; en om geïnformeerd te worden over een datalek dat jou raakt.\nGebruik het privacyverzoekformulier. We controleren eerst je identiteit en handelen het verzoek af binnen de termijn die de wet stelt. Intrekken van toestemming raakt nooit verwerking die al eerder plaatsvond.",
        "Sie haben das Recht zu erfahren, welche Daten wir über Sie speichern, und eine Kopie zu erhalten; falsche Daten berichtigen zu lassen; Daten löschen zu lassen, wenn sie nicht mehr nötig sind; der Verarbeitung zu widersprechen oder sie einzuschränken; Ihre Einwilligung jederzeit zu widerrufen; und über eine Datenpanne informiert zu werden, die Sie betrifft.\nNutzen Sie das Datenschutz-Anfrageformular. Wir prüfen zuerst Ihre Identität und bearbeiten die Anfrage innerhalb der gesetzlichen Frist. Ein Widerruf berührt nie eine zuvor erfolgte Verarbeitung.",
        "لك الحق في معرفة البيانات التي نحتفظ بها عنك والحصول على نسخة منها، وتصحيح البيانات غير الصحيحة، وحذف البيانات عندما لا تعود لازمة، والاعتراض على المعالجة أو تقييدها، وسحب موافقتك في أي وقت، وإبلاغك بأي خرق يمسك.\nاستخدم نموذج طلب الخصوصية. نتحقق من هويتك أولًا ثم نعالج الطلب خلال المدة التي يحددها القانون. سحب الموافقة لا يؤثر على المعالجة التي تمت قبل ذلك.")],
      [L("Security and data breaches", "Beveiliging en datalekken", "Sicherheit und Datenpannen", "الأمان وخروقات البيانات"), L(
        "Connections are encrypted, passwords are stored as hashes, staff only see what their role needs and every change to a booking is logged. If a breach happens we report it to the PDPC within 72 hours and inform you within three working days after that report, as the Executive Regulations require.",
        "Verbindingen zijn versleuteld, wachtwoorden worden als hash opgeslagen, medewerkers zien alleen wat hun rol nodig heeft en elke wijziging aan een boeking wordt vastgelegd. Bij een datalek melden we dat binnen 72 uur bij het PDPC en informeren we jou binnen drie werkdagen na die melding, zoals het uitvoeringsbesluit vereist.",
        "Verbindungen sind verschlüsselt, Passwörter werden als Hash gespeichert, Mitarbeitende sehen nur, was ihre Rolle erfordert, und jede Änderung an einer Buchung wird protokolliert. Bei einer Datenpanne melden wir sie innerhalb von 72 Stunden dem PDPC und informieren Sie innerhalb von drei Werktagen nach dieser Meldung, wie es die Durchführungsverordnung verlangt.",
        "الاتصالات مشفرة، وكلمات المرور محفوظة بصيغة مشفرة، ولا يرى الموظفون إلا ما يتطلبه دورهم، وكل تغيير في الحجز مسجَّل. إذا وقع خرق نُبلغ مركز حماية البيانات الشخصية خلال 72 ساعة ونُبلغك خلال ثلاثة أيام عمل من ذلك الإبلاغ، كما تشترط اللائحة التنفيذية.")],
      [L("Children", "Kinderen", "Kinder", "الأطفال"), L(
        "Bookings and accounts are made by adults (18+). For children we only ask for the age when an activity requires it for safety, and it is given by the parent or guardian.",
        "Boekingen en accounts worden gemaakt door volwassenen (18+). Van kinderen vragen we alleen de leeftijd als een activiteit dat voor de veiligheid vereist, en die wordt opgegeven door de ouder of voogd.",
        "Buchungen und Konten werden von Erwachsenen (18+) angelegt. Bei Kindern fragen wir nur das Alter ab, wenn eine Aktivität es aus Sicherheitsgründen erfordert; es wird von den Eltern oder dem Vormund angegeben.",
        "تُجرى الحجوزات وتُنشأ الحسابات من قِبل البالغين (18 عامًا فأكثر). لا نطلب من الأطفال إلا العمر عندما تتطلبه سلامة النشاط، ويقدمه الوالد أو الوصي.")],
      [L("Complaints", "Klachten", "Beschwerden", "الشكاوى"), L(
        "If you are not satisfied with how we handle your data, contact us first. You can also complain to the Personal Data Protection Centre (PDPC), the Egyptian supervisory authority.",
        "Ben je niet tevreden over hoe we met je gegevens omgaan, neem dan eerst contact met ons op. Je kunt ook een klacht indienen bij het Personal Data Protection Centre (PDPC), de Egyptische toezichthouder.",
        "Wenn Sie mit unserem Umgang mit Ihren Daten nicht zufrieden sind, wenden Sie sich zuerst an uns. Sie können sich auch beim Personal Data Protection Centre (PDPC), der ägyptischen Aufsichtsbehörde, beschweren.",
        "إذا لم تكن راضيًا عن طريقة تعاملنا مع بياناتك فتواصل معنا أولًا. ويمكنك أيضًا تقديم شكوى إلى مركز حماية البيانات الشخصية، الجهة الرقابية المصرية.")],
    ],
  },

  // ------------------------------------------------------------------ device storage ("cookies")
  COOKIES: {
    title: L("Cookies & device storage", "Cookies & opslag op je apparaat", "Cookies & Gerätespeicher", "ملفات تعريف الارتباط والتخزين على الجهاز"),
    intro: L(
      "We use no tracking, no analytics and no advertising cookies. We only store what the website needs to work, plus two convenience items you can switch on or off.",
      "We gebruiken geen tracking-, analyse- of advertentiecookies. We bewaren alleen wat de website nodig heeft om te werken, plus twee gemaksfuncties die je zelf aan of uit zet.",
      "Wir verwenden keine Tracking-, Analyse- oder Werbe-Cookies. Wir speichern nur, was die Website zum Funktionieren braucht, plus zwei Komfortfunktionen, die Sie selbst ein- oder ausschalten.",
      "لا نستخدم ملفات تتبع أو تحليلات أو إعلانات. نخزّن فقط ما يحتاجه الموقع ليعمل، إضافة إلى ميزتين للراحة يمكنك تشغيلهما أو إيقافهما."),
    sections: [
      [L("Necessary (always on)", "Noodzakelijk (altijd aan)", "Notwendig (immer aktiv)", "ضرورية (مفعّلة دائمًا)"), L(
        "• Sign-in session (myt_c, myt_s): keeps you signed in; removed when you sign out.\n• Your bookings on this device (myt_refs): the booking references and access codes you created here, so you can open them again.\n• Your storage choice (myt_consent) and a random device number (myt_device) to record that choice.\n• Offline copy of the website (service worker cache) so tickets open without internet.",
        "• Inlogsessie (myt_c, myt_s): houdt je ingelogd; verdwijnt bij uitloggen.\n• Je boekingen op dit apparaat (myt_refs): de boekingsnummers en toegangscodes die je hier hebt gemaakt, zodat je ze weer kunt openen.\n• Je opslagkeuze (myt_consent) en een willekeurig apparaatnummer (myt_device) om die keuze vast te leggen.\n• Offline kopie van de website (service-worker-cache) zodat tickets zonder internet openen.",
        "• Anmeldesitzung (myt_c, myt_s): hält Sie angemeldet; wird beim Abmelden entfernt.\n• Ihre Buchungen auf diesem Gerät (myt_refs): die hier erstellten Buchungsnummern und Zugangscodes, damit Sie sie wieder öffnen können.\n• Ihre Speicherwahl (myt_consent) und eine zufällige Gerätenummer (myt_device), um diese Wahl festzuhalten.\n• Offline-Kopie der Website (Service-Worker-Cache), damit Tickets ohne Internet öffnen.",
        "• جلسة تسجيل الدخول (myt_c وmyt_s): تُبقيك مسجلًا للدخول وتُحذف عند تسجيل الخروج.\n• حجوزاتك على هذا الجهاز (myt_refs): أرقام الحجز ورموز الوصول التي أنشأتها هنا لتتمكن من فتحها مرة أخرى.\n• اختيارك بشأن التخزين (myt_consent) ورقم عشوائي للجهاز (myt_device) لتسجيل هذا الاختيار.\n• نسخة غير متصلة من الموقع (ذاكرة عامل الخدمة) لتفتح التذاكر دون إنترنت.")],
      [L("Preferences (your choice)", "Voorkeuren (jouw keuze)", "Präferenzen (Ihre Wahl)", "التفضيلات (باختيارك)"), L(
        "• Language (myt_lang), favourites (myt_favs) and half-filled booking forms (myt_form_…). Without your permission they are only kept until you close the page.",
        "• Taal (myt_lang), favorieten (myt_favs) en half ingevulde boekingsformulieren (myt_form_…). Zonder je toestemming worden ze alleen bewaard tot je de pagina sluit.",
        "• Sprache (myt_lang), Favoriten (myt_favs) und halb ausgefüllte Buchungsformulare (myt_form_…). Ohne Ihre Erlaubnis werden sie nur bis zum Schließen der Seite gespeichert.",
        "• اللغة (myt_lang) والمفضلة (myt_favs) ونماذج الحجز غير المكتملة (myt_form_…). بدون إذنك تُحفظ فقط حتى تغلق الصفحة.")],
      [L("Change your choice", "Je keuze wijzigen", "Wahl ändern", "تغيير اختيارك"), L(
        "Use 'Storage settings' at the bottom of every page. Your choice is recorded with the date, as the data protection law requires.",
        "Gebruik 'Opslaginstellingen' onderaan elke pagina. Je keuze wordt met datum vastgelegd, zoals de wet op gegevensbescherming vereist.",
        "Nutzen Sie „Speichereinstellungen“ unten auf jeder Seite. Ihre Wahl wird mit Datum festgehalten, wie es das Datenschutzgesetz verlangt.",
        "استخدم «إعدادات التخزين» أسفل كل صفحة. يُسجَّل اختيارك مع التاريخ كما يشترط قانون حماية البيانات.")],
    ],
  },

  // ------------------------------------------------------------------ booking terms (versioned; accepted per booking)
  BOOKING_TERMS: {
    title: L("Booking terms", "Boekingsvoorwaarden", "Buchungsbedingungen", "شروط الحجز"),
    intro: L(
      "These terms apply to every booking made through this website or the Me & You Travel App. The Arabic text is the official version; the other languages are translations.",
      "Deze voorwaarden gelden voor elke boeking via deze website of de Me & You Travel App. De Arabische tekst is de officiële versie; de andere talen zijn vertalingen.",
      "Diese Bedingungen gelten für jede Buchung über diese Website oder die Me & You Travel App. Der arabische Text ist die maßgebliche Fassung; die anderen Sprachen sind Übersetzungen.",
      "تسري هذه الشروط على كل حجز يتم عبر هذا الموقع أو تطبيق Me & You Travel. النص العربي هو النسخة الرسمية واللغات الأخرى ترجمات."),
    sections: [
      [L("1. How a booking is made", "1. Hoe een boeking tot stand komt", "1. Zustandekommen der Buchung", "1. كيف يتم الحجز"), L(
        "Before you pay you see the supplier, what is included, the date and time, the meeting point and the total price. A booking is confirmed only when (a) the partner has confirmed availability where needed, (b) you have accepted the final offer and these terms, and (c) the payment is verified. You then receive a confirmation and an electronic ticket.",
        "Vóór je betaalt zie je de aanbieder, wat inbegrepen is, datum en tijd, het ontmoetingspunt en de totaalprijs. Een boeking is pas bevestigd als (a) de partner waar nodig de beschikbaarheid heeft bevestigd, (b) je de definitieve offerte en deze voorwaarden hebt geaccepteerd en (c) de betaling is gecontroleerd. Je krijgt dan een bevestiging en een elektronisch ticket.",
        "Vor der Zahlung sehen Sie den Anbieter, die Leistungen, Datum und Uhrzeit, den Treffpunkt und den Gesamtpreis. Eine Buchung ist erst bestätigt, wenn (a) der Partner die Verfügbarkeit wo nötig bestätigt hat, (b) Sie das endgültige Angebot und diese Bedingungen angenommen haben und (c) die Zahlung geprüft ist. Sie erhalten dann eine Bestätigung und ein elektronisches Ticket.",
        "قبل الدفع ترى المورد وما يشمله العرض والتاريخ والوقت ونقطة اللقاء والسعر الإجمالي. لا يُؤكَّد الحجز إلا عندما (أ) يؤكد الشريك التوفر عند الحاجة، و(ب) تقبل العرض النهائي وهذه الشروط، و(ج) يتم التحقق من الدفع. بعدها تتلقى تأكيدًا وتذكرة إلكترونية.")],
      [L("2. Private service", "2. Privéservice", "2. Privatservice", "2. الخدمة الخاصة"), L(
        "Every booking is for your own party only; we do not add other travellers to your booking. Each experience states its privacy level: Private Guide (only the guidance is private), Private Transport (only the vehicle), Private Transport & Guide (guidance and transport), or Fully Private (the activity and its facilities are exclusive, guaranteed in writing by the supplier). Public places such as beaches, reefs, temples, markets and restaurants are not exclusive unless the offer says so. If the private element we confirmed is not delivered, tell us at once: you are entitled to a remedy, and where it could not be delivered at all, a refund of the private surcharge.",
        "Elke boeking is alleen voor je eigen gezelschap; we voegen geen andere reizigers toe aan je boeking. Bij elke ervaring staat het privéniveau: Privégids (alleen de begeleiding is privé), Privévervoer (alleen het voertuig), Privévervoer & gids (begeleiding en vervoer), of Volledig privé (de activiteit en voorzieningen zijn exclusief, schriftelijk gegarandeerd door de leverancier). Openbare plekken zoals stranden, riffen, tempels, markten en restaurants zijn niet exclusief, tenzij de offerte dat zegt. Wordt het bevestigde privé-onderdeel niet geleverd, meld het dan meteen: je hebt recht op een oplossing, en als het helemaal niet geleverd kon worden op terugbetaling van de privétoeslag.",
        "Jede Buchung gilt nur für Ihre eigene Gruppe; wir fügen Ihrer Buchung keine anderen Reisenden hinzu. Jedes Erlebnis nennt seine Privatsphäre-Stufe: Privater Guide (nur die Begleitung ist privat), Privater Transport (nur das Fahrzeug), Privater Transport & Guide (Begleitung und Transport) oder Vollständig privat (Aktivität und Einrichtungen sind exklusiv, schriftlich vom Anbieter garantiert). Öffentliche Orte wie Strände, Riffe, Tempel, Märkte und Restaurants sind nicht exklusiv, außer das Angebot sagt es. Wird der bestätigte private Teil nicht erbracht, melden Sie es sofort: Sie haben Anspruch auf Abhilfe und, wenn er gar nicht erbracht werden konnte, auf Erstattung des Privatzuschlags.",
        "كل حجز لمجموعتك فقط؛ لا نضيف مسافرين آخرين إلى حجزك. توضح كل تجربة مستوى خصوصيتها: مرشد خاص (المرافقة فقط خاصة)، أو نقل خاص (المركبة فقط)، أو نقل ومرشد خاصان (المرافقة والنقل)، أو خاص بالكامل (النشاط ومرافقه حصرية بضمان مكتوب من المورد). الأماكن العامة كالشواطئ والشعاب والمعابد والأسواق والمطاعم ليست حصرية ما لم ينص العرض على ذلك. إذا لم يُقدَّم الجزء الخاص الذي أكدناه فأبلغنا فورًا: يحق لك الحصول على معالجة، وإذا تعذر تقديمه كليًا يحق لك استرداد رسوم الخصوصية.")],
      [L("3. Prices and payment", "3. Prijzen en betaling", "3. Preise und Zahlung", "3. الأسعار والدفع"), L(
        "Prices are in Egyptian pounds (EGP) and include value added tax (14%) and all fees. There are no hidden costs at the meeting point. The price in your accepted offer is fixed. Where a deposit is offered, the balance is due as stated in the offer. You receive an invoice in Arabic and in your language.",
        "Prijzen zijn in Egyptische ponden (EGP) en inclusief btw (14%) en alle kosten. Er zijn geen verborgen kosten bij het ontmoetingspunt. De prijs in je geaccepteerde offerte staat vast. Bij een aanbetaling betaal je het restant zoals in de offerte staat. Je krijgt een factuur in het Arabisch en in jouw taal.",
        "Preise sind in ägyptischen Pfund (EGP) und enthalten die Mehrwertsteuer (14 %) sowie alle Gebühren. Am Treffpunkt fallen keine versteckten Kosten an. Der Preis in Ihrem angenommenen Angebot ist fest. Bei einer Anzahlung ist der Rest wie im Angebot angegeben fällig. Sie erhalten eine Rechnung auf Arabisch und in Ihrer Sprache.",
        "الأسعار بالجنيه المصري وتشمل ضريبة القيمة المضافة (14٪) وجميع الرسوم. لا توجد تكاليف خفية عند نقطة اللقاء. السعر في العرض الذي قبلته ثابت. عند وجود دفعة مقدمة يُستحق الباقي كما هو مذكور في العرض. تتلقى فاتورة باللغة العربية وبلغتك.")],
      [L("4. Changes", "4. Wijzigingen", "4. Änderungen", "4. التعديلات"), L(
        "You can ask for a change through Support; it depends on the partner's availability and you see any price difference before you agree. If we must change an essential part (for example the date), you may accept the change or cancel with a full refund.",
        "Je kunt via Support een wijziging vragen; die hangt af van de beschikbaarheid van de partner en je ziet een eventueel prijsverschil voordat je akkoord gaat. Als wij een wezenlijk onderdeel moeten wijzigen (bijvoorbeeld de datum), mag je de wijziging accepteren of annuleren met volledige terugbetaling.",
        "Änderungen können Sie über den Support anfragen; sie hängen von der Verfügbarkeit des Partners ab, und Sie sehen einen Preisunterschied, bevor Sie zustimmen. Müssen wir einen wesentlichen Teil ändern (z. B. das Datum), können Sie die Änderung annehmen oder mit voller Erstattung stornieren.",
        "يمكنك طلب تعديل عبر الدعم، ويعتمد ذلك على توفر الشريك وترى أي فرق في السعر قبل الموافقة. إذا اضطررنا لتغيير جزء جوهري (مثل التاريخ) يمكنك قبول التغيير أو الإلغاء مع استرداد كامل المبلغ.")],
      [L("5. Weather and safety", "5. Weer en veiligheid", "5. Wetter und Sicherheit", "5. الطقس والسلامة"), L(
        "Boat and desert trips depend on the weather and on instructions of the authorities. If an activity cannot go ahead for safety reasons we offer another date or a full refund. Please follow the instructions of the crew and guides.",
        "Boot- en woestijntochten hangen af van het weer en van instructies van de autoriteiten. Als een activiteit om veiligheidsredenen niet door kan gaan, bieden we een andere datum of volledige terugbetaling aan. Volg de instructies van de bemanning en gidsen op.",
        "Boots- und Wüstentouren hängen vom Wetter und von Anweisungen der Behörden ab. Kann eine Aktivität aus Sicherheitsgründen nicht stattfinden, bieten wir einen anderen Termin oder die volle Erstattung an. Bitte folgen Sie den Anweisungen von Crew und Guides.",
        "تعتمد الرحلات البحرية ورحلات الصحراء على الطقس وتعليمات السلطات. إذا تعذر تنفيذ النشاط لأسباب تتعلق بالسلامة نعرض موعدًا آخر أو استردادًا كاملًا. يُرجى اتباع تعليمات الطاقم والمرشدين.")],
      [L("6. Cancellation", "6. Annuleren", "6. Stornierung", "6. الإلغاء"), L(
        "The cancellation policy shown in your offer applies. Your rights under the Consumer Protection Law (Law 181/2018) are not limited by these terms; where the law gives you a stronger right, that right applies.",
        "Het annuleringsbeleid in je offerte is van toepassing. Je rechten onder de consumentenbeschermingswet (Wet 181/2018) worden door deze voorwaarden niet beperkt; waar de wet je een sterker recht geeft, geldt dat recht.",
        "Es gelten die Stornobedingungen in Ihrem Angebot. Ihre Rechte nach dem Verbraucherschutzgesetz (Gesetz 181/2018) werden durch diese Bedingungen nicht eingeschränkt; wo das Gesetz Ihnen ein stärkeres Recht gibt, gilt dieses.",
        "تسري سياسة الإلغاء الموضحة في عرضك. لا تُقيِّد هذه الشروط حقوقك وفق قانون حماية المستهلك (القانون رقم 181 لسنة 2018)، وحيث يمنحك القانون حقًا أقوى يُطبَّق ذلك الحق.")],
      [L("7. Complaints and law", "7. Klachten en recht", "7. Beschwerden und Recht", "7. الشكاوى والقانون"), L(
        "Report a problem as soon as possible, preferably during the activity, so it can be solved on the spot; otherwise through Support. If we cannot solve it you can contact the Consumer Protection Agency (hotline 19588) or the Ministry of Tourism and Antiquities (19654). Egyptian law applies.",
        "Meld een probleem zo snel mogelijk, liefst tijdens de activiteit zodat het ter plekke kan worden opgelost; anders via Support. Lukt het ons niet, dan kun je contact opnemen met de Consumentenbeschermingsautoriteit (hotline 19588) of het Ministerie van Toerisme en Oudheden (19654). Het Egyptische recht is van toepassing.",
        "Melden Sie ein Problem so früh wie möglich, am besten während der Aktivität, damit es vor Ort gelöst werden kann; sonst über den Support. Können wir es nicht lösen, wenden Sie sich an die Verbraucherschutzbehörde (Hotline 19588) oder das Ministerium für Tourismus und Altertümer (19654). Es gilt ägyptisches Recht.",
        "أبلِغ عن أي مشكلة في أسرع وقت، ويفضل أثناء النشاط ليتم حلها في الحال، وإلا فعبر الدعم. إذا لم نتمكن من حلها يمكنك التواصل مع جهاز حماية المستهلك (الخط الساخن 19588) أو وزارة السياحة والآثار (19654). يسري القانون المصري.")],
    ],
  },

  // ------------------------------------------------------------------ cancellation policy (versioned; refund rules stored with it)
  CANCELLATION_POLICY: {
    title: L("Cancellation policy", "Annuleringsbeleid", "Stornobedingungen", "سياسة الإلغاء"),
    intro: L(
      "You can cancel in My bookings or through Support. The refund is calculated automatically from the time left before the start (Cairo time).",
      "Je annuleert via Mijn boekingen of via Support. De terugbetaling wordt automatisch berekend op basis van de tijd tot de start (Cairo-tijd).",
      "Sie stornieren über Meine Buchungen oder den Support. Die Erstattung wird automatisch nach der verbleibenden Zeit bis zum Beginn berechnet (Kairoer Zeit).",
      "يمكنك الإلغاء من «حجوزاتي» أو عبر الدعم. يُحسب المبلغ المسترد تلقائيًا حسب الوقت المتبقي قبل البدء (بتوقيت القاهرة)."),
    sections: [
      [L("Refunds", "Terugbetaling", "Erstattung", "الاسترداد"), L(
        "• More than 48 hours before the start: full refund.\n• Between 24 and 48 hours before the start: 50% refund.\n• Less than 24 hours before the start: no refund.\n• If we or the partner cancel (for example because of weather or an instruction of the authorities): always a full refund.",
        "• Meer dan 48 uur vóór de start: volledige terugbetaling.\n• Tussen 24 en 48 uur vóór de start: 50% terug.\n• Minder dan 24 uur vóór de start: geen terugbetaling.\n• Als wij of de partner annuleren (bijvoorbeeld door het weer of een instructie van de autoriteiten): altijd volledige terugbetaling.",
        "• Mehr als 48 Stunden vor Beginn: volle Erstattung.\n• Zwischen 24 und 48 Stunden vor Beginn: 50 % Erstattung.\n• Weniger als 24 Stunden vor Beginn: keine Erstattung.\n• Wenn wir oder der Partner absagen (z. B. wegen des Wetters oder einer behördlichen Anweisung): immer volle Erstattung.",
        "• قبل البدء بأكثر من 48 ساعة: استرداد كامل.\n• بين 24 و48 ساعة قبل البدء: استرداد 50٪.\n• قبل البدء بأقل من 24 ساعة: لا استرداد.\n• إذا ألغينا نحن أو الشريك (مثلًا بسبب الطقس أو تعليمات السلطات): استرداد كامل دائمًا.")],
      [L("How you get your money back", "Hoe je je geld terugkrijgt", "Wie Sie Ihr Geld zurückerhalten", "كيف تسترد أموالك"), L(
        "Refunds go back to the original payment method. You see the status in My bookings and receive a credit note. A refund is never paid twice.",
        "Terugbetalingen gaan terug naar de oorspronkelijke betaalmethode. Je ziet de status in Mijn boekingen en krijgt een creditnota. Een terugbetaling wordt nooit twee keer uitgevoerd.",
        "Erstattungen gehen an die ursprüngliche Zahlungsmethode zurück. Den Status sehen Sie in Meine Buchungen, und Sie erhalten eine Gutschrift. Eine Erstattung wird nie doppelt ausgezahlt.",
        "تُعاد المبالغ إلى وسيلة الدفع الأصلية. ترى الحالة في «حجوزاتي» وتتلقى إشعارًا دائنًا. لا يُصرف الاسترداد مرتين أبدًا.")],
      [L("Your statutory rights", "Je wettelijke rechten", "Ihre gesetzlichen Rechte", "حقوقك القانونية"), L(
        "This policy never limits your rights under the Consumer Protection Law (Law 181/2018) and its Executive Regulations. Where the law gives you a stronger right, that right applies.",
        "Dit beleid beperkt nooit je rechten onder de consumentenbeschermingswet (Wet 181/2018) en het uitvoeringsbesluit. Waar de wet je een sterker recht geeft, geldt dat recht.",
        "Diese Bedingungen schränken Ihre Rechte nach dem Verbraucherschutzgesetz (Gesetz 181/2018) und seiner Durchführungsverordnung nie ein. Wo das Gesetz Ihnen ein stärkeres Recht gibt, gilt dieses.",
        "لا تُقيِّد هذه السياسة أبدًا حقوقك وفق قانون حماية المستهلك (القانون رقم 181 لسنة 2018) ولائحته التنفيذية. وحيث يمنحك القانون حقًا أقوى يُطبَّق ذلك الحق.")],
    ],
  },

  // ------------------------------------------------------------------ consumer rights & complaints
  CONSUMER: {
    title: L("Your rights & complaints", "Je rechten & klachten", "Ihre Rechte & Beschwerden", "حقوقك والشكاوى"),
    intro: L(
      "Egypt's Consumer Protection Law (Law 181/2018) also protects you when you book online. This is what that means at Me & You Tours Egypt.",
      "De Egyptische consumentenbeschermingswet (Wet 181/2018) beschermt je ook als je online boekt. Dit betekent dat bij Me & You Tours Egypt.",
      "Das ägyptische Verbraucherschutzgesetz (Gesetz 181/2018) schützt Sie auch bei Online-Buchungen. Das bedeutet es bei Me & You Tours Egypt.",
      "يحميك قانون حماية المستهلك المصري (القانون رقم 181 لسنة 2018) أيضًا عند الحجز عبر الإنترنت. وهذا ما يعنيه ذلك لدى Me & You Tours Egypt."),
    sections: [
      [L("What you always get", "Wat je altijd krijgt", "Was Sie immer erhalten", "ما تحصل عليه دائمًا"), L(
        "• Before you pay: the supplier's identity, what is included, date, time, meeting point and the total price in EGP including VAT.\n• All information, terms and invoices in Arabic, next to your own language.\n• A written confirmation of your booking and the terms you accepted, which you can open at any time in My bookings.\n• An invoice for every payment and a credit note for every refund.",
        "• Vóór je betaalt: de identiteit van de aanbieder, wat inbegrepen is, datum, tijd, ontmoetingspunt en de totaalprijs in EGP inclusief btw.\n• Alle informatie, voorwaarden en facturen in het Arabisch, naast je eigen taal.\n• Een schriftelijke bevestiging van je boeking en de voorwaarden die je accepteerde, die je altijd kunt openen in Mijn boekingen.\n• Een factuur voor elke betaling en een creditnota voor elke terugbetaling.",
        "• Vor der Zahlung: Identität des Anbieters, Leistungen, Datum, Uhrzeit, Treffpunkt und Gesamtpreis in EGP inklusive MwSt.\n• Alle Informationen, Bedingungen und Rechnungen auf Arabisch, neben Ihrer eigenen Sprache.\n• Eine schriftliche Bestätigung Ihrer Buchung und der angenommenen Bedingungen, jederzeit abrufbar in Meine Buchungen.\n• Eine Rechnung für jede Zahlung und eine Gutschrift für jede Erstattung.",
        "• قبل الدفع: هوية المورد وما يشمله العرض والتاريخ والوقت ونقطة اللقاء والسعر الإجمالي بالجنيه المصري شاملًا الضريبة.\n• جميع المعلومات والشروط والفواتير باللغة العربية إلى جانب لغتك.\n• تأكيد مكتوب لحجزك وللشروط التي قبلتها، يمكنك فتحه في أي وقت من «حجوزاتي».\n• فاتورة لكل دفعة وإشعار دائن لكل استرداد.")],
      [L("How to complain", "Zo dien je een klacht in", "So beschweren Sie sich", "كيف تقدم شكوى"), L(
        "1. On the spot: tell the guide or crew, so it can be solved immediately.\n2. Support: choose 'Complaint' in Support. You get a ticket number and a reply from a person.\n3. Still not solved? Contact the Consumer Protection Agency (hotline 19588, or its app) or the Ministry of Tourism and Antiquities (hotline 19654).",
        "1. Ter plekke: meld het bij de gids of bemanning, zodat het direct kan worden opgelost.\n2. Support: kies 'Klacht' in Support. Je krijgt een ticketnummer en een antwoord van een mens.\n3. Nog niet opgelost? Neem contact op met de Consumentenbeschermingsautoriteit (hotline 19588, of de app) of het Ministerie van Toerisme en Oudheden (hotline 19654).",
        "1. Vor Ort: Sagen Sie es dem Guide oder der Crew, damit es sofort gelöst werden kann.\n2. Support: Wählen Sie „Beschwerde“ im Support. Sie erhalten eine Ticketnummer und eine Antwort von einem Menschen.\n3. Immer noch nicht gelöst? Wenden Sie sich an die Verbraucherschutzbehörde (Hotline 19588 oder deren App) oder das Ministerium für Tourismus und Altertümer (Hotline 19654).",
        "1. في الموقع: أخبر المرشد أو الطاقم ليتم الحل فورًا.\n2. الدعم: اختر «شكوى» في قسم الدعم. تحصل على رقم تذكرة ورد من شخص حقيقي.\n3. لم تُحل بعد؟ تواصل مع جهاز حماية المستهلك (الخط الساخن 19588 أو تطبيقه) أو وزارة السياحة والآثار (الخط الساخن 19654).")],
    ],
  },

  // ------------------------------------------------------------------ accessibility
  ACCESSIBILITY: {
    title: L("Accessibility", "Toegankelijkheid", "Barrierefreiheit", "إمكانية الوصول"),
    intro: L(
      "We want everyone to be able to book. The website is built to meet WCAG 2.2 level AA.",
      "We willen dat iedereen kan boeken. De website is gebouwd om te voldoen aan WCAG 2.2 niveau AA.",
      "Jeder soll buchen können. Die Website ist so gebaut, dass sie WCAG 2.2 Stufe AA erfüllt.",
      "نريد أن يتمكن الجميع من الحجز. صُمم الموقع ليلبي معيار WCAG 2.2 المستوى AA."),
    sections: [
      [L("What we did", "Wat we hebben gedaan", "Was wir getan haben", "ما قمنا به"), L(
        "• Works with keyboard and screen readers, with visible focus.\n• Sufficient colour contrast and text that can be enlarged to 200%.\n• Arabic is shown right to left.\n• Animations stop when your device asks for reduced motion.\n• Error messages appear next to the field they belong to.",
        "• Werkt met toetsenbord en schermlezers, met zichtbare focus.\n• Voldoende kleurcontrast en tekst die tot 200% vergroot kan worden.\n• Arabisch wordt van rechts naar links getoond.\n• Animaties stoppen als je apparaat om minder beweging vraagt.\n• Foutmeldingen verschijnen naast het veld waar ze bij horen.",
        "• Bedienbar mit Tastatur und Screenreadern, mit sichtbarem Fokus.\n• Ausreichender Farbkontrast und Text, der auf 200 % vergrößert werden kann.\n• Arabisch wird von rechts nach links angezeigt.\n• Animationen stoppen, wenn Ihr Gerät reduzierte Bewegung verlangt.\n• Fehlermeldungen erscheinen neben dem zugehörigen Feld.",
        "• يعمل مع لوحة المفاتيح وقارئات الشاشة مع تركيز مرئي.\n• تباين ألوان كافٍ ونص يمكن تكبيره حتى 200٪.\n• يُعرض النص العربي من اليمين إلى اليسار.\n• تتوقف الحركات عندما يطلب جهازك تقليل الحركة.\n• تظهر رسائل الخطأ بجوار الحقل الذي تخصه.")],
      [L("Need help?", "Hulp nodig?", "Hilfe nötig?", "هل تحتاج مساعدة؟"), L(
        "If something does not work for you, or you need an activity adapted to a disability, tell us through Support. We check with the partner what is possible before you pay.",
        "Werkt iets niet voor je, of heb je een activiteit nodig die is aangepast aan een beperking, laat het ons weten via Support. We overleggen met de partner wat mogelijk is voordat je betaalt.",
        "Wenn etwas für Sie nicht funktioniert oder Sie eine an eine Behinderung angepasste Aktivität brauchen, sagen Sie es uns über den Support. Wir klären mit dem Partner, was möglich ist, bevor Sie zahlen.",
        "إذا لم يعمل شيء بالنسبة لك أو كنت تحتاج نشاطًا مُكيَّفًا مع إعاقة، أخبرنا عبر الدعم. نتحقق مع الشريك مما هو ممكن قبل الدفع.")],
    ],
  },
};

/** plain text of a document in one language (stored as the versioned body for terms that are accepted per booking) */
export function docText(kind, lang = "ar") {
  const d = DOCS[kind];
  return [d.title[lang], d.intro[lang], ...d.sections.map(([h, b]) => `${h[lang]}\n${b[lang]}`)].join("\n\n");
}
