import type { Locale } from "@/lib/locale";

export type Law = {
  place: string;
  acts: string;
  technical: string;
  legal: string;
  language: string;
  user: string;
};

export type AboutChrome = {
  lawActs: string;
  lawTechnical: string;
  lawLegal: string;
  lawLanguage: string;
  lawUser: string;
  lawOrder: string;
  currentMark: string;
  apacheHeading: string;
  apacheReleased: string;
  apache: string[];
};

export const APACHE_CANON = `Copyright 2026 Sytera Labs

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`;

const font = {
  ru: "Файлы шрифтов лежат в папке программы и идут вместе с ней. Их лицензии сохраняются. Название Shelf набрано шрифтом программы.",
  "en-US": "The type files sit in the program folder and ship with it. Their licenses stay with them. The name Shelf is set in the program’s own type.",
  "en-GB": "The type files sit in the programme folder and ship with it. Their licences stay with them. The name Shelf is set in the programme’s own type.",
  de: "Die Schriftdateien liegen im Programmordner und werden mit dem Programm ausgeliefert. Ihre Lizenzen bleiben. Der Name Shelf ist in der Schrift des Programms gesetzt.",
  it: "I file dei caratteri stanno nella cartella del programma e viaggiano con esso. Le loro licenze restano. Il nome Shelf è composto con il carattere del programma.",
  es: "Los archivos de letra están en la carpeta del programa y se entregan con él. Sus licencias se conservan. El nombre Shelf va en la letra del programa.",
  ko: "글꼴 파일은 프로그램 폴더에 있으며 프로그램과 함께 제공됩니다. 그 라이선스는 그대로입니다. Shelf라는 이름은 프로그램의 글꼴로 적혀 있습니다.",
  ja: "書体のファイルはプログラムのフォルダにあり、プログラムと一緒に入ります。そのライセンスはそのままです。名称の Shelf はプログラムの書体で組んでいます。",
  "zh-CN": "字体文件放在程序文件夹里，并随程序一起提供。它们的许可证保持不变。名称 Shelf 用程序自己的字体排印。",
} as const;

function apache(locale: keyof typeof font, lines: string[]): string[] {
  return [...lines, font[locale]];
}

export const aboutChrome: Record<Locale, AboutChrome> = {
  ru: {
    lawActs: "Применимые акты",
    lawTechnical: "Техническая сторона",
    lawLegal: "Юридическая сторона",
    lawLanguage: "Язык и обращение",
    lawUser: "Что это значит для пользователя",
    lawOrder: "Выбор языка не выбирает применимое право и не является согласием на обработку. Ниже — как устроена программа относительно законов каждой страны, для которой есть перевод. Это описание архитектуры, а не решение и не свидетельство государственного органа.",
    currentMark: "Этот раздел стоит первым, потому что он соответствует выбранному языку интерфейса. Не потому, что язык меняет право.",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "Программа выпущена под лицензией Apache 2.0.",
    apache: apache("ru", [
      "Код Shelf выпускается под Apache License, Version 2.0. Copyright 2026 Sytera Labs.",
      "Лицензия даёт бессрочное, всемирное, безвозмездное и неисключительное право воспроизводить программу, создавать производные произведения, показывать, исполнять, сублицензировать и распространять её в исходном виде и в объектном коде.",
      "Отдельно даётся патентная лицензия на те притязания, которые необходимо нарушаются вкладом автора. Она прекращается, если вы возбуждаете патентный спор против программы и утверждаете, что она нарушает ваш патент.",
      "При распространении нужно сохранять уведомление об авторском праве, текст лицензии и файл NOTICE. Права на товарные знаки лицензия не даёт. Названия Shelf и Sytera Labs сами по себе не становятся разрешением ставить чужой знак.",
      "Если закон не требует иного и нет отдельной письменной гарантии, программа поставляется «AS IS»: без гарантий товарной пригодности и пригодности для конкретной цели. Полная английская формулировка — в блоке ниже. Она и есть текст лицензии; перевод над ней только поясняет.",
    ]),
  },
  "en-US": {
    lawActs: "Instruments",
    lawTechnical: "Technical side",
    lawLegal: "Legal side",
    lawLanguage: "Language and address",
    lawUser: "What this means for the user",
    lawOrder: "Choosing a language does not choose the governing law and is not consent to processing. Below is how the program is built, set against the laws of each country that has a translation. This is a description of the architecture. It is not a decision or a certificate of a public authority.",
    currentMark: "This section is first because it matches the interface language you chose. Not because the language changes the law.",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "The program is released under the Apache License 2.0.",
    apache: apache("en-US", [
      "The Shelf code is released under the Apache License, Version 2.0. Copyright 2026 Sytera Labs.",
      "The license grants a perpetual, worldwide, non-exclusive, no-charge, royalty-free right to reproduce the program, prepare derivative works, display it, perform it, sublicense it, and distribute it in source or object form.",
      "It also grants a patent license covering claims necessarily infringed by a contributor’s work. That grant ends if you bring patent litigation claiming that the program infringes your patent.",
      "If you distribute the program, you must keep the copyright notice, the license text, and the NOTICE file. The license does not grant trademark rights. The names Shelf and Sytera Labs are not a license to apply someone else’s mark.",
      "Unless the law requires otherwise, or a separate warranty is agreed in writing, the program is provided “AS IS”, without warranties of merchantability or fitness for a particular purpose. The English block below is the license notice. The paragraphs above only explain it.",
    ]),
  },
  "en-GB": {
    lawActs: "Instruments",
    lawTechnical: "Technical side",
    lawLegal: "Legal side",
    lawLanguage: "Language and address",
    lawUser: "What this means for the user",
    lawOrder: "Choosing a language does not choose the governing law and is not consent to processing. Below is how the programme is built, set against the laws of each country that has a translation. This is a description of the architecture. It is not a decision or a certificate of a public authority.",
    currentMark: "This section is first because it matches the interface language you chose. Not because the language changes the law.",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "The programme is released under the Apache License 2.0.",
    apache: apache("en-GB", [
      "The Shelf code is released under the Apache License, Version 2.0. Copyright 2026 Sytera Labs.",
      "The licence grants a perpetual, worldwide, non-exclusive, no-charge, royalty-free right to reproduce the programme, prepare derivative works, display it, perform it, sublicense it, and distribute it in source or object form.",
      "It also grants a patent licence covering claims necessarily infringed by a contributor’s work. That grant ends if you bring patent litigation claiming that the programme infringes your patent.",
      "If you distribute the programme, you must keep the copyright notice, the licence text, and the NOTICE file. The licence does not grant trademark rights. The names Shelf and Sytera Labs are not a licence to apply someone else’s mark.",
      "Unless the law requires otherwise, or a separate warranty is agreed in writing, the programme is provided “AS IS”, without warranties of merchantability or fitness for a particular purpose. The English block below is the licence notice. The paragraphs above only explain it.",
    ]),
  },
  de: {
    lawActs: "Anwendbare Vorschriften",
    lawTechnical: "Technische Seite",
    lawLegal: "Juristische Seite",
    lawLanguage: "Sprache und Anrede",
    lawUser: "Was das für die Nutzerin oder den Nutzer heißt",
    lawOrder: "Die Sprachwahl wählt nicht das anwendbare Recht und ist keine Einwilligung in eine Verarbeitung. Unten steht, wie das Programm gebaut ist, gemessen an den Gesetzen jedes Landes, für das es eine Übersetzung gibt. Das ist eine Beschreibung der Architektur, kein Bescheid und kein Zeugnis einer Behörde.",
    currentMark: "Dieser Abschnitt steht vorn, weil er zur gewählten Sprache passt. Nicht, weil die Sprache das Recht ändert.",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "Das Programm ist unter der Apache License 2.0 veröffentlicht.",
    apache: apache("de", [
      "Der Code von Shelf steht unter der Apache License, Version 2.0. Copyright 2026 Sytera Labs.",
      "Die Lizenz gewährt ein unbefristetes, weltweites, nicht ausschließliches und unentgeltliches Recht, das Programm zu vervielfältigen, Bearbeitungen zu erstellen, es zu zeigen, aufzuführen, unterzulizenzieren und im Quell- oder Objektcode zu verbreiten.",
      "Dazu kommt eine Patentlizenz für Ansprüche, die ein Beitrag notwendig verletzt. Sie endet, wenn Sie einen Patentstreit mit der Behauptung führen, das Programm verletze Ihr Patent.",
      "Bei einer Weitergabe bleiben Urhebervermerk, Lizenztext und die Datei NOTICE erhalten. Markenrechte gibt die Lizenz nicht. Die Namen Shelf und Sytera Labs erlauben nicht, ein fremdes Zeichen zu setzen.",
      "Soweit das Gesetz nichts anderes verlangt und keine gesonderte schriftliche Garantie besteht, wird das Programm „AS IS“ bereitgestellt, ohne Zusicherung der Handelsüblichkeit oder der Eignung für einen bestimmten Zweck. Der englische Block unten ist der Lizenzvermerk. Der Text darüber erläutert ihn nur.",
    ]),
  },
  it: {
    lawActs: "Atti applicabili",
    lawTechnical: "Lato tecnico",
    lawLegal: "Lato giuridico",
    lawLanguage: "Lingua e registro",
    lawUser: "Che cosa significa per chi usa il programma",
    lawOrder: "Scegliere la lingua non sceglie la legge applicabile e non è un consenso al trattamento. Qui sotto si descrive come è fatto il programma, rispetto alle leggi di ciascun Paese per cui esiste una traduzione. È una descrizione dell’architettura, non un provvedimento e non un attestato di un’autorità.",
    currentMark: "Questa sezione è la prima perché corrisponde alla lingua scelta. Non perché la lingua cambi il diritto.",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "Il programma è pubblicato sotto la licenza Apache 2.0.",
    apache: apache("it", [
      "Il codice di Shelf è pubblicato sotto l’Apache License, Version 2.0. Copyright 2026 Sytera Labs.",
      "La licenza concede un diritto perpetuo, mondiale, non esclusivo e gratuito di riprodurre il programma, preparare opere derivate, mostrarlo, eseguirlo, concederlo in sublicenza e distribuirlo in forma sorgente o oggetto.",
      "Concede anche una licenza di brevetto sui claims necessariamente violati dal contributo. Quella concessione cessa se si promuove una lite brevettuale sostenendo che il programma viola un proprio brevetto.",
      "Chi distribuisce il programma deve conservare l’avviso di copyright, il testo della licenza e il file NOTICE. La licenza non concede diritti su marchi. I nomi Shelf e Sytera Labs non autorizzano ad apporre un segno altrui.",
      "Salvo quanto imposto dalla legge o da una garanzia scritta separata, il programma è fornito «AS IS», senza garanzie di commerciabilità o di idoneità a uno scopo particolare. Il blocco inglese sotto è l’avviso di licenza. I capoversi sopra lo spiegano soltanto.",
    ]),
  },
  es: {
    lawActs: "Normas aplicables",
    lawTechnical: "Lado técnico",
    lawLegal: "Lado jurídico",
    lawLanguage: "Lengua y trato",
    lawUser: "Qué significa para quien usa el programa",
    lawOrder: "Elegir un idioma no elige la ley aplicable y no es un consentimiento para el tratamiento. Abajo se describe cómo está hecho el programa, frente a las leyes de cada país que tiene traducción. Es una descripción de la arquitectura, no una resolución ni un certificado de una autoridad.",
    currentMark: "Esta sección va primero porque corresponde al idioma elegido. No porque el idioma cambie el derecho.",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "El programa se publica bajo la licencia Apache 2.0.",
    apache: apache("es", [
      "El código de Shelf se publica bajo la Apache License, Version 2.0. Copyright 2026 Sytera Labs.",
      "La licencia concede un derecho perpetuo, mundial, no exclusivo y gratuito de reproducir el programa, preparar obras derivadas, mostrarlo, ejecutarlo, sublicenciarlo y distribuirlo en forma de código fuente o de objeto.",
      "También concede una licencia de patentes sobre las reivindicaciones necesariamente infringidas por la contribución. Esa concesión termina si se inicia un litigio de patentes afirmando que el programa infringe una patente propia.",
      "Quien distribuya el programa debe conservar el aviso de copyright, el texto de la licencia y el archivo NOTICE. La licencia no concede derechos de marca. Los nombres Shelf y Sytera Labs no autorizan a poner un signo ajeno.",
      "Salvo que la ley exija otra cosa o exista una garantía escrita aparte, el programa se entrega «AS IS», sin garantías de comerciabilidad ni de idoneidad para un fin concreto. El bloque en inglés de abajo es el aviso de la licencia. Los párrafos de arriba solo lo explican.",
    ]),
  },
  ko: {
    lawActs: "적용 법령",
    lawTechnical: "기술적인 면",
    lawLegal: "법적 측면",
    lawLanguage: "언어와 말투",
    lawUser: "사용자에게 뜻하는 것",
    lawOrder: "언어를 고르는 것은 적용 법률을 고르는 일이 아니고, 처리에 대한 동의도 아닙니다. 아래는 번역이 있는 각 나라의 법령에 비춘 프로그램의 구조입니다. 행정기관의 처분이나 증명서가 아닙니다.",
    currentMark: "이 절이 먼저인 이유는 고른 언어와 맞기 때문입니다. 언어가 법을 바꾸기 때문이 아닙니다.",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "이 프로그램은 Apache License 2.0으로 공개됩니다.",
    apache: apache("ko", [
      "Shelf의 코드는 Apache License, Version 2.0으로 공개됩니다. Copyright 2026 Sytera Labs.",
      "라이선스는 프로그램을 복제하고, 2차적 저작물을 만들고, 전시·공연하고, 재라이선스하고, 소스 또는 오브젝트 형태로 배포할 수 있는 영구적·세계적·비독점적·무상의 권리를 줍니다.",
      "기여자가 반드시 침해하게 되는 청구항에 대한 특허 라이선스도 줍니다. 프로그램이 자신의 특허를 침해한다고 주장하며 특허 소송을 내면 그 허여는 끝납니다.",
      "배포할 때는 저작권 고지, 라이선스 본문, NOTICE 파일을 남겨야 합니다. 상표권은 주지 않습니다. Shelf와 Sytera Labs라는 이름이 남의 표장을 달 권리를 주지는 않습니다.",
      "법이 달리 요구하거나 별도의 서면 보증이 없으면 프로그램은 “AS IS”로 제공되며, 상품성이나 특정 목적 적합성의 보증은 없습니다. 아래 영어 블록이 라이선스 고지입니다. 위의 문단은 그것을 설명할 뿐입니다.",
    ]),
  },
  ja: {
    lawActs: "適用される法令",
    lawTechnical: "技術上の側面",
    lawLegal: "法的な側面",
    lawLanguage: "言語と呼びかけ",
    lawUser: "使う人にとっての意味",
    lawOrder: "言語を選ぶことは、適用される法を選ぶことではなく、取扱いへの同意でもありません。以下は、翻訳のある各国の法令に照らしたプログラムの構造です。行政機関の処分でも証明書でもありません。",
    currentMark: "この節が先にあるのは、選んだ言語に対応するためです。言語が法を変えるからではありません。",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "このプログラムは Apache License 2.0 の下で公開されています。",
    apache: apache("ja", [
      "Shelf のコードは Apache License, Version 2.0 の下で公開されます。Copyright 2026 Sytera Labs.",
      "ライセンスは、プログラムを複製し、二次的著作物を作り、展示・上演し、再許諾し、ソースまたはオブジェクトの形で頒布する、永続的・世界的・非独占・無償の権利を与えます。",
      "貢献によって必然的に侵害される特許クレームについての特許ライセンスも含みます。プログラムが自分の特許を侵害すると主張して特許訴訟を起こすと、その許諾は終わります。",
      "頒布するときは、著作権表示、ライセンス本文、NOTICE ファイルを残します。商標権は与えられません。Shelf と Sytera Labs という名称は、他人の標章を付ける許可にはなりません。",
      "法令が別段を求めず、別の書面による保証もない限り、プログラムは「AS IS」で提供され、商品性や特定目的適合性の保証はありません。下の英語のブロックがライセンスの表示です。上の段落はそれを説明するだけです。",
    ]),
  },
  "zh-CN": {
    lawActs: "适用规范",
    lawTechnical: "技术方面",
    lawLegal: "法律方面",
    lawLanguage: "语言与称呼",
    lawUser: "对使用者的含义",
    lawOrder: "选择语言并不选择适用的法律，也不是对处理的同意。下面按已有译文的每个国家，说明程序的结构与该国法律的关系。这是对架构的说明，不是行政机关的决定或证明。",
    currentMark: "这一节排在前面，是因为它对应当前界面语言，不是因为语言会改变法律。",
    apacheHeading: "Apache License 2.0",
    apacheReleased: "本程序以 Apache License 2.0 发布。",
    apache: apache("zh-CN", [
      "Shelf 的代码以 Apache License, Version 2.0 发布。Copyright 2026 Sytera Labs.",
      "许可证授予永久、全球、非独占、免费的权利：复制程序、制作衍生作品、展示、表演、再许可，并以源代码或目标代码形式分发。",
      "同时授予专利许可，范围限于贡献必然侵犯的权利要求。若你提起专利诉讼，主张程序侵犯你的专利，该项许可终止。",
      "分发时必须保留版权声明、许可证正文和 NOTICE 文件。许可证不授予商标权。Shelf 与 Sytera Labs 这两个名称并不允许使用他人的标志。",
      "除非法律另有要求，或另有书面保证，程序按“AS IS”提供，不保证适销性或对特定用途的适用性。下面的英文区块才是许可声明。上面的段落只是说明。",
    ]),
  },
};

const lawsRu: Law[] = [
  {
    place: "Российская Федерация",
    acts: "Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных»; Федеральный закон от 21.07.2014 № 242-ФЗ о локализации записи, систематизации, накопления, хранения и уточнения персональных данных граждан Российской Федерации; Федеральный закон от 27.07.2006 № 149-ФЗ «Об информации, информационных технологиях и о защите информации»; часть четвёртая Гражданского кодекса Российской Федерации, в том числе статьи 1229, 1270 и 1299.",
    technical: "Каталог, обложки, заметки, теги, секунды сессий, настройки и выбранный язык хранятся в данных самой программы на этом компьютере. Запроса, который отправлял бы эти сведения на сервер Sytera Labs, нет. Учётной записи нет. Рекламного идентификатора нет. Сторонней аналитики нет. Строка файла запуска — это текст, который ввёл пользователь. Программа не снимает средства технической защиты и не включает в поставку чужие обложки или файлы игр.",
    legal: "Оператором по 152-ФЗ является тот, кто организует и осуществляет обработку персональных данных и определяет её цели. Каталог до издателя не доходит, поэтому у издателя нет ни базы этих сведений, ни целей их обработки. Локализовать по 242-ФЗ и передавать за рубеж нечего: записывать нечего. Статья 1299 ГК РФ запрещает обход технических средств защиты авторских прав. Shelf их не обходит. Исключительное право на добавленные пользователем файлы и изображения остаётся у правообладателя и к Sytera Labs не переходит. Этот абзац описывает юридическую сторону устройства программы, а не разъяснение Роскомнадзора.",
    language: "Русский интерфейс обращается на «вы», пишет букву «ё», использует кавычки «ёлочки» и десятичную запятую в часах. Имена Shelf, Sytera Labs и Apache License не переводятся.",
    user: "Карточку можно выгрузить в JSON и вложить обратно на этом устройстве. Удаление карточки не удаляет файл игры на диске. Если удалить данные программы на этом компьютере, каталог исчезнет: восстановить его у издателя нельзя, потому что копии у издателя нет.",
  },
  {
    place: "Соединённые Штаты Америки",
    acts: "California Consumer Privacy Act с поправками California Privacy Rights Act, Cal. Civ. Code § 1798.100 и далее; Copyright Act, 17 U.S.C.; DMCA, 17 U.S.C. § 1201; Federal Trade Commission Act § 5.",
    technical: "Программа не собирает у издателя имя, почту, идентификатор устройства или историю каталога. Нет продажи и нет «sharing» в смысле передачи данных для кросс-контекстной рекламы: передавать нечего. Программа не ведёт слежения. Обложки и пути к файлам остаются на этом компьютере.",
    legal: "CCPA/CPRA регулируют бизнес, который собирает персональную информацию потребителей. Через Shelf издатель такую информацию не получает, поэтому продавать и передавать её не может. 17 U.S.C. § 1201 запрещает обход технических мер, контролирующих доступ к произведению. Программа таких мер не обходит и чужие произведения в состав поставки не включает. Раздел не изображает печать государственного органа и не утверждает, что FTC или генеральный прокурор штата что-либо удостоверили. Это было бы введением в заблуждение по § 5 FTC Act.",
    language: "Американский английский пишет catalog, color и license, десятичную точку и кавычки “ ”. Обращение нейтральное, без ложного официального титула.",
    user: "Учётной записи нет, поэтому «удалить аккаунт» нечего. Свою полку пользователь выгружает сам. Ответственность за то, есть ли у него право хранить конкретный файл игры и картинку обложки, остаётся на нём.",
  },
  {
    place: "Соединённое Королевство",
    acts: "UK GDPR и Data Protection Act 2018; Privacy and Electronic Communications Regulations 2003; Copyright, Designs and Patents Act 1988.",
    technical: "Издатель не получает каталог и не читает идентификатор устройства для рекламы. Слежения нет. Библиотеку записывает сама программа на компьютере пользователя, потому что пользователь ведёт полку. Это не стороннее хранилище, которое издатель потом считывает.",
    legal: "Контролёром по UK GDPR является тот, кто определяет цели и средства обработки персональных данных. Целей обработки каталога у издателя нет, потому что каталога у него нет. PECR ограничивает доступ к устройству для рекламы и аналитики. Shelf не обращается к компьютеру для рекламы и не строит рекламный профиль. CDPA 1988 оставляет авторское право за правообладателем. Программа не включает чужие произведения и не обходит технические меры. Выбор британского английского в меню не делает издателя учреждением Соединённого Королевства и не создаёт представителя по UK GDPR.",
    language: "Британский английский пишет catalogue, colour и programme, кроме собственного имени Apache License. Десятичная точка. Тон ровный, без ложного герба.",
    user: "Данные полки не уезжают в британский или иной офис издателя, потому что офисной копии нет. Удаление данных программы стирает каталог на этом компьютере.",
  },
  {
    place: "Германия",
    acts: "Регламент (ЕС) 2016/679 (GDPR); Bundesdatenschutzgesetz; § 25 Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG), ранее § 25 TTDSG; Urheberrechtsgesetz, включая нормы о технических мерах защиты.",
    technical: "Нет учётной записи и нет телеметрии. Каталог не уходит на сервер. Данные программы заполняются действием пользователя и нужны самой полке: без них программа не помнит карточки. Это не слежение и не рекламный профиль.",
    legal: "Аргумент по § 25 TDDDG: запись на устройстве, без которой явно запрошенная функция не работает и которую издатель не считывает, не является сторонним хранилищем для слежения. GDPR предполагает обработку персональными данными контролёром. Издатель каталог не обрабатывает. UrhG защищает произведения и технические меры. Материалы игр со Shelf не поставляются, меры не обходятся. Немецкий текст интерфейса не означает, что у программы есть ответственный по ст. 27 GDPR в Германии.",
    language: "Немецкий интерфейс обращается на «Sie», сохраняет ß и умлауты, ставит десятичную запятую и кавычки „ “. Названия Shelf, Sytera Labs и Apache License не переводятся.",
    user: "Часы и карточки считаются на этом устройстве. Экспорт — это файл, который программа записывает на компьютер пользователя, а не выгрузка издателю. Удаление карточки не трогает файл на диске.",
  },
  {
    place: "Италия",
    acts: "Регламент (ЕС) 2016/679; законодательный декрет от 30 июня 2003 г. № 196 с изменениями декрета от 10 августа 2018 г. № 101; закон от 22 апреля 1941 г. № 633 об авторском праве.",
    technical: "Издатель не определяет средства обработки каталога: каталог не покидает этот компьютер. Профилирования нет. Маркетингового идентификатора нет. Обложку и строку запуска даёт пользователь.",
    legal: "По GDPR контролёр — тот, кто определяет цели и средства. Здесь цели обработки библиотеки определяет сам пользователь, храня её у себя, а издатель сведения не получает. Отдельного уведомления Garante по этому каталогу не возникает, потому что обработки у издателя нет. Закон № 633 оставляет права на произведения за их авторами и запрещает обход технических мер. Программа произведения не включает и меры не снимает. Итальянский перевод не создаёт постоянного представительства и не заменяет консультацию юриста.",
    language: "Итальянский интерфейс держит вежливый регистр, апострофы вроде «l’editore» и десятичную запятую. Имена программы и лицензии не переводятся.",
    user: "Полка остаётся на устройстве. Кто добавляет обложку, тот и отвечает за то, что имеет на неё право. Издатель копии обложки не хранит.",
  },
  {
    place: "Испания",
    acts: "Регламент (ЕС) 2016/679; Органический закон 3/2018 о защите персональных данных и гарантии цифровых прав (LOPDGDD); королевский законодательный декрет 1/1996, утверждающий пересмотренный текст Закона об интеллектуальной собственности.",
    technical: "Для издателя персональные данные каталога не собираются. Необязательного следящего хранилища программа не ставит. Игры и изображения добавляет пользователь. Сведения не уходят в испанский или иной сервер издателя.",
    legal: "LOPDGDD применяет GDPR и не создаёт обязанность вести реестр обработки там, где обработки у издателя нет. Закон об интеллектуальной собственности не передаёт Sytera Labs права на файлы, которые пользователь кладёт на полку, и не разрешает снимать технические меры. Программа их не снимает. Текст не является записью в реестре AEPD и не должен так читаться.",
    language: "Испанский интерфейс использует нейтральное обращение, перевёрнутые знаки там, где они нужны в испанском тексте, и десятичную запятую. Имена Shelf и Apache License остаются как есть.",
    user: "Каталог можно заменить импортом JSON. Подтверждение замены спрашивает сама программа на этом компьютере. Отказ оставляет прежнюю полку.",
  },
  {
    place: "Республика Корея",
    acts: "Закон о защите персональной информации (개인정보 보호법, PIPA); Закон об авторском праве (저작권법), включая нормы о технических мерах защиты.",
    technical: "Поставщик не собирает через Shelf персональную информацию: нет членства, нет рекламного идентификатора, нет передачи каталога на сервер. Библиотека остаётся на этом компьютере.",
    legal: "Обработчик персональной информации по PIPA — тот, кто обрабатывает её в служебных целях. Не получая каталог, издатель не ведёт такую обработку и не передаёт сведения третьему лицу. Авторское право на файлы пользователя остаётся у правообладателя. Программа не обходит технические меры и не встраивает чужие произведения. Корейский интерфейс не означает, что сервис оказывается с корейского сервера.",
    language: "Корейский интерфейс ведётся в формальном стиле на -습니다/-ㅂ니다, без фамильярного полуслова. Имена Shelf, Sytera Labs и Apache License не переводятся и не подменяются хангылем.",
    user: "Сессия и часы считаются локально. Закрытие программы дописывает время только до последней живой секунды, а не до следующего открытия. Это правило часов, не передача данных.",
  },
  {
    place: "Япония",
    acts: "Закон о защите персональной информации (個人情報の保護に関する法律); Закон об авторском праве (著作権法), включая положения о технических мерах защиты.",
    technical: "Sytera Labs не приобретает персональную информацию из библиотеки. Данные остаются на устройстве. Программа не воспроизводит чужие материалы игр как часть поставки и не обходит технические меры.",
    legal: "Лицо, ведущее бизнес по обращению с персональной информацией, — то, которое такую информацию обрабатывает. Каталог издатель не обрабатывает, поэтому трансграничной передачи этой библиотеки нет. Авторское право и запрет обхода технических мер остаются на стороне правообладателя и пользователя, который добавляет файлы. Японский текст не является уведомлением Комиссару по защите персональной информации и не заменяет его.",
    language: "Японский интерфейс говорит в форме です・ます, без грубого регистра. Латинские имена программы, лаборатории и лицензии не переводятся.",
    user: "Обложку кладёт пользователь. Чужие витрины программа не запрашивает. Карточка без файла запуска остаётся заметкой на полке и ничего не скачивает.",
  },
  {
    place: "Китайская Народная Республика",
    acts: "Закон о защите персональной информации (个人信息保护法, PIPL); Закон об авторском праве Китайской Народной Республики (著作权法).",
    technical: "Издатель не обрабатывает каталог на сервере в материковом Китае и не отправляет его на сервер за пределами Китая: серверной обработки нет вообще. Библиотеку хранит сама программа на компьютере пользователя. Чужие произведения в поставку не входят. Технические меры не обходятся.",
    legal: "PIPL регулирует обработку персональной информации. Пока издатель каталог не обрабатывает, у него нет деятельности, к которой привязывались бы обязанности оператора, оценка трансграничной передачи или отдельное согласие на серверную обработку. Это не заявление, что любой локальный файл пользователя сам по себе вне китайского права: за файлы и изображения, которые человек добавляет, отвечает он. Закон об авторском праве не переносит права на эти файлы к Sytera Labs. Китайский перевод не означает, что программа прошла отдельную процедуру у ведомства и не должен так читаться.",
    language: "Китайский интерфейс написан на упрощённых иероглифах, ровным деловым тоном. Имена Shelf, Sytera Labs и Apache License остаются латиницей.",
    user: "Полка не синхронизируется с облаком издателя. Смена языка меняет подписи, а не каталог игр. Выгрузка JSON остаётся файлом на устройстве пользователя.",
  },
];

const lawsEn: Law[] = [
  {
    place: "Russian Federation",
    acts: "Federal Law No. 152-FZ of 27 July 2006 on Personal Data; Federal Law No. 242-FZ of 21 July 2014 on localisation of the recording, systematisation, accumulation, storage, and update of personal data of citizens of the Russian Federation; Federal Law No. 149-FZ of 27 July 2006 on Information, Information Technologies and the Protection of Information; Civil Code of the Russian Federation, Part IV, including Articles 1229, 1270, and 1299.",
    technical: "The catalog, covers, notes, tags, session seconds, settings, and chosen language are kept in the program’s own data on this computer. Nothing in the program sends those records to a Sytera Labs server. There is no account, no advertising identifier, and no third-party analytics. The launch-file string is text the user typed. The program does not remove technical protection and does not ship other people’s covers or game files.",
    legal: "Under 152-FZ, an operator is a person who organises and carries out processing of personal data and determines its purposes. The catalog never reaches the publisher, so the publisher has neither a database of it nor purposes for processing it. There is nothing to localise under 242-FZ and nothing to transfer abroad, because there is nothing for the publisher to record. Article 1299 of the Civil Code forbids circumvention of technical protection measures. Shelf does not circumvent them. Exclusive rights in files and images the user adds stay with the rightsholder and do not pass to Sytera Labs. This is an argument from the architecture, not guidance from Roskomnadzor.",
    language: "The Russian interface uses the formal вы, the letter ё, guillemets, and a decimal comma in hours. The names Shelf, Sytera Labs, and Apache License are not translated.",
    user: "A card can be exported to JSON and imported back on this device. Removing a card does not delete the game file on disk. If the program’s data on this computer is deleted, the catalog is gone: the publisher cannot restore it, because the publisher has no copy.",
  },
  {
    place: "United States",
    acts: "California Consumer Privacy Act, as amended by the California Privacy Rights Act, Cal. Civ. Code § 1798.100 and following; Copyright Act, 17 U.S.C.; DMCA, 17 U.S.C. § 1201; Federal Trade Commission Act § 5.",
    technical: "The program does not collect, at the publisher, a name, an email address, a device identifier, or the history of the catalog. There is no sale and no “sharing” for cross-context advertising, because there is nothing to transmit. The program does not track. Covers and file paths stay on this computer.",
    legal: "The CCPA/CPRA regulate a business that collects consumers’ personal information. Through Shelf the publisher does not receive that information, and therefore cannot sell or share it. 17 U.S.C. § 1201 forbids circumvention of a technical measure that controls access to a work. The program does not circumvent such a measure and does not include third-party works in the build. This section does not display a government seal and does not say that the FTC or a state attorney general has certified anything. That would be deceptive under FTC Act § 5.",
    language: "American English uses catalog, color, and license, a decimal point, and quotation marks of the form “ ”. The address is plain. It does not invent an official title.",
    user: "There is no account, so there is no account to delete. The user exports their own shelf. Whether they have the right to keep a particular game file and cover remains their responsibility.",
  },
  {
    place: "United Kingdom",
    acts: "UK GDPR and the Data Protection Act 2018; Privacy and Electronic Communications Regulations 2003; Copyright, Designs and Patents Act 1988.",
    technical: "The publisher does not receive the catalog and does not read a device identifier for advertising. There is no tracking. The program writes the library on the user’s computer because the user is keeping a shelf. It is not a third-party store that the publisher later reads.",
    legal: "A controller under the UK GDPR is a person who determines the purposes and means of processing personal data. The publisher has no purposes for the catalog, because the publisher does not have the catalog. PECR limits access to a device for advertising and analytics. Shelf does not use the computer for advertising and does not build an advertising profile. The CDPA 1988 leaves copyright with the rightsholder. The program does not include third-party works and does not circumvent technical measures. Choosing British English in the menu does not make the publisher a United Kingdom establishment and does not appoint a UK GDPR representative.",
    language: "British English uses catalogue, colour, and programme, except in the proper name Apache License. It uses a decimal point. The tone is level, without a false crest.",
    user: "The shelf is not sent to a British or any other office of the publisher, because there is no office copy. Deleting the program’s data erases the catalog on this computer.",
  },
  {
    place: "Germany",
    acts: "Regulation (EU) 2016/679 (GDPR); Bundesdatenschutzgesetz; § 25 of the Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG), formerly § 25 TTDSG; Urheberrechtsgesetz, including the rules on technical protection measures.",
    technical: "There is no account and no telemetry. The catalog does not go to a server. The program’s data is filled by the user’s own action and is required for the shelf itself: without it the program cannot remember cards. It is not tracking and not an advertising profile.",
    legal: "The argument under § 25 TDDDG is that storage on the device, without which a function the user expressly asked for cannot work, and which the publisher does not read, is not a third-party tracking store. The GDPR assumes processing of personal data by a controller. The publisher does not process the catalog. The UrhG protects works and technical measures. Game materials are not shipped with Shelf, and measures are not circumvented. A German interface does not mean the program has an Article 27 GDPR representative in Germany.",
    language: "The German interface uses Sie, keeps ß and umlauts, uses a decimal comma, and uses quotation marks of the form „ “. Shelf, Sytera Labs, and Apache License are not translated.",
    user: "Hours and cards are counted on this device. Export is a file the program writes on the user’s computer, not an upload to the publisher. Removing a card does not touch the file on disk.",
  },
  {
    place: "Italy",
    acts: "Regulation (EU) 2016/679; Legislative Decree of 30 June 2003, No. 196, as amended by Legislative Decree of 10 August 2018, No. 101; Law of 22 April 1941, No. 633, on copyright.",
    technical: "The publisher does not determine the means of processing the catalog: the catalog never leaves this computer. There is no profiling and no marketing identifier. The user supplies the cover and the launch string.",
    legal: "Under the GDPR a controller is the person who determines purposes and means. Here the user determines the purposes of keeping the library, by keeping it locally, and the publisher does not receive the records. No separate notice to the Garante arises for this catalog, because the publisher carries out no processing of it. Law No. 633 leaves rights in works with their authors and forbids circumvention of technical measures. The program does not include the works and does not remove the measures. An Italian translation does not create a permanent establishment and is not a substitute for legal advice.",
    language: "The Italian interface keeps a polite register, apostrophes such as l’editore, and a decimal comma. The names of the program and of the license are not translated.",
    user: "The shelf stays on the device. Whoever adds a cover is responsible for having the right to it. The publisher does not keep a copy of the cover.",
  },
  {
    place: "Spain",
    acts: "Regulation (EU) 2016/679; Organic Law 3/2018 on the Protection of Personal Data and the Guarantee of Digital Rights (LOPDGDD); Royal Legislative Decree 1/1996 approving the revised text of the Intellectual Property Law.",
    technical: "Personal data of the catalog are not collected for the publisher. The program does not place a non-essential tracking store. The user adds games and images. The records do not go to a Spanish or any other server of the publisher.",
    legal: "The LOPDGDD applies the GDPR and does not create a duty to keep a processing record where the publisher carries out no processing. The Intellectual Property Law does not transfer to Sytera Labs the rights in files the user places on the shelf, and it does not permit removal of technical measures. The program does not remove them. This text is not an entry in the AEPD register and should not be read as one.",
    language: "The Spanish interface uses a neutral address, inverted marks where Spanish punctuation needs them, and a decimal comma. Shelf and Apache License stay as they are.",
    user: "The catalog can be replaced by importing JSON. The program on this computer asks before the replacement. Cancelling leaves the previous shelf.",
  },
  {
    place: "Republic of Korea",
    acts: "Personal Information Protection Act (개인정보 보호법); Copyright Act (저작권법), including the rules on technical protection measures.",
    technical: "The provider does not collect personal information through Shelf: there is no membership, no advertising identifier, and no transmission of the catalog to a server. The library stays on this computer.",
    legal: "A personal-information processor under the PIPA is a person who processes personal information for business purposes. Not receiving the catalog, the publisher does not carry out that processing and does not transfer the records to a third party. Copyright in the user’s files stays with the rightsholder. The program does not circumvent technical measures and does not embed third-party works. A Korean interface does not mean the service is provided from a Korean server.",
    language: "The Korean interface uses the formal 합니다 style, not a familiar half-speech. Shelf, Sytera Labs, and Apache License are not translated and are not replaced with hangul.",
    user: "The session and the hours are counted locally. Closing the program records time only up to the last live second, not until the next opening. That is a rule about the clock, not a transfer of data.",
  },
  {
    place: "Japan",
    acts: "Act on the Protection of Personal Information (個人情報の保護に関する法律); Copyright Act (著作権法), including the provisions on technological protection measures.",
    technical: "Sytera Labs does not acquire personal information from the library. The data stay on the device. The program does not reproduce third-party game materials as part of the build and does not circumvent technological measures.",
    legal: "A business operator handling personal information is one that processes such information. The publisher does not process the catalog, so there is no cross-border transfer of this library. Copyright, and the prohibition on circumventing technological measures, stay with the rightsholder and with the user who adds the files. The Japanese text is not a notification to the Personal Information Protection Commission and does not replace one.",
    language: "The Japanese interface uses です・ます, not a rough register. The Latin names of the program, the lab, and the license are not translated.",
    user: "The user supplies the cover. The program does not fetch store artwork. A card with no launch file remains a note on the shelf and downloads nothing.",
  },
  {
    place: "People’s Republic of China",
    acts: "Personal Information Protection Law (个人信息保护法); Copyright Law of the People’s Republic of China (著作权法).",
    technical: "The publisher does not process the catalog on a server in mainland China and does not send it to a server outside China: there is no server-side processing at all. The program stores the library on this computer. Third-party works are not in the build. Technical measures are not circumvented.",
    legal: "The PIPL regulates processing of personal information. While the publisher does not process the catalog, there is no activity to which an operator’s duties, a cross-border-transfer assessment, or a separate consent for server-side processing would attach. This is not a claim that every local file of the user sits outside Chinese law: the person who adds files and images remains responsible for them. The Copyright Law does not move rights in those files to Sytera Labs. A Chinese translation does not mean the program has completed a separate filing, and it should not be read that way.",
    language: "The Chinese interface is in simplified characters, in a level business tone. Shelf, Sytera Labs, and Apache License stay in Latin script.",
    user: "The shelf does not sync to a publisher cloud. Changing the language changes labels, not the game catalog. A JSON export remains a file on the user’s device.",
  },
];

function british(laws: Law[]): Law[] {
  const swap = (value: string) =>
    value
      .replaceAll("catalogs", "catalogues")
      .replaceAll("catalog", "catalogue")
      .replaceAll("Catalog", "Catalogue")
      .replaceAll("programs", "programmes")
      .replaceAll("program", "programme")
      .replaceAll("Program", "Programme")
      .replaceAll("licenses", "licences")
      .replaceAll("license", "licence");
  return laws.map((law, index) => ({
    place: law.place,
    acts: law.acts,
    technical: swap(law.technical),
    legal: swap(law.legal).replaceAll("Apache licence", "Apache License"),
    language: index === 2
      ? "British English uses catalogue, colour, and programme, except in the proper name Apache License. It uses a decimal point. The tone is level, without a false crest."
      : law.language,
    user: swap(law.user),
  }));
}

const lawsDe: Law[] = [
  {
    place: "Russische Föderation",
    acts: "Föderales Gesetz Nr. 152-FZ vom 27. Juli 2006 über personenbezogene Daten; Föderales Gesetz Nr. 242-FZ vom 21. Juli 2014 über die Lokalisierung der Aufzeichnung personenbezogener Daten von Bürgern der Russischen Föderation; Föderales Gesetz Nr. 149-FZ vom 27. Juli 2006 über Informationen; Vierter Teil des Zivilgesetzbuchs der Russischen Föderation, einschließlich der Artikel 1229, 1270 und 1299.",
    technical: "Katalog, Cover, Notizen, Marken, Sitzungssekunden, Einstellungen und die gewählte Sprache liegen in den eigenen Daten des Programms auf diesem Computer. Nichts im Programm sendet diese Angaben an einen Server von Sytera Labs. Kein Konto, keine Werbekennung, keine fremde Analytik. Die Startdatei ist Text, den die Nutzerin oder der Nutzer eingegeben hat. Technische Schutzmaßnahmen werden nicht umgangen, fremde Cover und Spieldateien liegen nicht bei.",
    legal: "Verantwortlicher nach 152-FZ ist, wer die Verarbeitung personenbezogener Daten organisiert und ihre Zwecke bestimmt. Der Katalog erreicht den Herausgeber nicht. Es gibt nichts zu lokalisieren und nichts zu übermitteln. Artikel 1299 untersagt die Umgehung technischer Schutzmaßnahmen. Shelf umgeht sie nicht. Ausschließliche Rechte an hinzugefügten Dateien bleiben beim Rechteinhaber. Das ist ein Argument aus der Architektur, keine Auskunft von Roskomnadzor.",
    language: "Die russische Oberfläche sagt вы, schreibt ё, nutzt Guillemets und das Dezimalkomma bei den Stunden. Shelf, Sytera Labs und Apache License bleiben unübersetzt.",
    user: "Eine Karte lässt sich als JSON aus- und wieder einlesen. Das Entfernen der Karte löscht die Datei auf dem Datenträger nicht. Wer die Daten des Programms löscht, löscht den Katalog: der Herausgeber hat keine Kopie.",
  },
  {
    place: "Vereinigte Staaten von Amerika",
    acts: "California Consumer Privacy Act in der Fassung des CPRA, Cal. Civ. Code § 1798.100 ff.; Copyright Act, 17 U.S.C.; DMCA, 17 U.S.C. § 1201; Federal Trade Commission Act § 5.",
    technical: "Beim Herausgeber kommen kein Name, keine E-Mail, keine Gerätekennung und keine Kataloggeschichte an. Es gibt keinen Verkauf und kein Sharing für werbeübergreifende Profile, weil nichts übertragen wird. Keine Nachverfolgung. Cover und Pfade bleiben auf diesem Computer.",
    legal: "CCPA/CPRA gelten für ein Geschäft, das personenbezogene Angaben von Verbraucherinnen und Verbrauchern erhebt. Shelf liefert dem Herausgeber solche Angaben nicht. 17 U.S.C. § 1201 verbietet die Umgehung technischer Maßnahmen, die den Zugang zu einem Werk kontrollieren. Das Programm umgeht sie nicht und enthält keine fremden Werke. Dieser Text zeigt kein Behördensiegel und behauptet keine Bescheinigung der FTC. Das wäre irreführend nach § 5 FTC Act.",
    language: "Amerikanisches Englisch schreibt catalog, color und license, den Dezimalpunkt und Anführungen “ ”. Die Anrede ist schlicht.",
    user: "Ein Konto gibt es nicht, also auch keines zu löschen. Die eigene Sammlung wird selbst exportiert. Ob ein Recht an der konkreten Spieldatei und am Cover besteht, bleibt Sache der nutzenden Person.",
  },
  {
    place: "Vereinigtes Königreich",
    acts: "UK GDPR und Data Protection Act 2018; Privacy and Electronic Communications Regulations 2003; Copyright, Designs and Patents Act 1988.",
    technical: "Der Herausgeber erhält den Katalog nicht und liest keine Werbekennung. Keine Nachverfolgung. Das Programm schreibt die Bibliothek auf dem Computer, weil dort eine Sammlung geführt wird. Es ist kein fremder Speicher, den der Herausgeber später ausliest.",
    legal: "Verantwortlicher nach dem UK GDPR ist, wer Zwecke und Mittel der Verarbeitung bestimmt. Zwecke für den Katalog gibt es beim Herausgeber nicht, weil der Katalog nicht bei ihm liegt. PECR begrenzt den Zugriff auf Endgeräte, vor allem für Werbung. Shelf greift dafür nicht auf den Computer zu. Der CDPA 1988 belässt das Urheberrecht beim Rechteinhaber. Die Wahl des britischen Englisch ernennt keinen Vertreter nach dem UK GDPR.",
    language: "Britisches Englisch schreibt catalogue, colour und programme, außer im Eigennamen Apache License. Dezimalpunkt. Kein falsches Wappen.",
    user: "Die Sammlung geht nicht in ein britisches Büro, weil es keine Bürokopie gibt. Das Löschen der Programmdaten löscht den Katalog auf diesem Computer.",
  },
  {
    place: "Deutschland",
    acts: "Datenschutz-Grundverordnung, Verordnung (EU) 2016/679; Bundesdatenschutzgesetz; § 25 Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG), vormals § 25 TTDSG; Urheberrechtsgesetz, einschließlich der Regeln zu technischen Schutzmaßnahmen.",
    technical: "Kein Konto, keine Telemetrie. Der Katalog geht nicht auf einen Server. Die Programmdaten werden durch die eigene Handlung gefüllt und sind für die Sammlung selbst nötig. Es ist keine Nachverfolgung und kein Werbeprofil.",
    legal: "Das Argument zu § 25 TDDDG: Eine Speicherung auf dem Gerät, ohne die eine ausdrücklich verlangte Funktion nicht arbeitet und die der Herausgeber nicht ausliest, ist kein fremdes Tracking. Die DSGVO setzt eine Verarbeitung durch einen Verantwortlichen voraus. Der Herausgeber verarbeitet den Katalog nicht. Das UrhG schützt Werke und technische Maßnahmen. Spielmaterial wird nicht mitgeliefert, Maßnahmen werden nicht umgangen. Ein deutscher Text bedeutet nicht, dass ein Vertreter nach Art. 27 DSGVO in Deutschland benannt ist.",
    language: "Die deutsche Oberfläche siezt, behält ß und Umlaute, setzt das Dezimalkomma und die Zeichen „ “. Shelf, Sytera Labs und Apache License werden nicht übersetzt.",
    user: "Stunden und Karten zählen auf diesem Gerät. Der Export ist eine Datei, die das Programm auf dem Computer schreibt, kein Upload. Das Entfernen einer Karte lässt die Datei auf dem Datenträger unberührt.",
  },
  {
    place: "Italien",
    acts: "Verordnung (EU) 2016/679; gesetzesvertretendes Dekret vom 30. Juni 2003, Nr. 196, geändert durch das Dekret vom 10. August 2018, Nr. 101; Gesetz vom 22. April 1941, Nr. 633, zum Urheberrecht.",
    technical: "Der Herausgeber bestimmt nicht die Mittel der Katalogverarbeitung: der Katalog verlässt diesen Computer nicht. Kein Profiling, keine Marketing-Kennung. Cover und Startzeile kommen von der nutzenden Person.",
    legal: "Verantwortlicher ist, wer Zwecke und Mittel bestimmt. Hier bestimmt die nutzende Person den Zweck, indem sie die Bibliothek bei sich behält. Eine eigene Meldung an den Garante entsteht für diesen Katalog nicht, weil der Herausgeber ihn nicht verarbeitet. Gesetz Nr. 633 belässt die Rechte bei den Urhebern. Die italienische Übersetzung begründet keine Niederlassung und ersetzt keinen Rechtsrat.",
    language: "Die italienische Oberfläche bleibt höflich, mit Apostroph wie in l’editore und mit Dezimalkomma. Programmnamen und Lizenzname bleiben stehen.",
    user: "Die Sammlung bleibt auf dem Gerät. Wer ein Cover hinzufügt, verantwortet das Recht daran. Der Herausgeber behält keine Kopie.",
  },
  {
    place: "Spanien",
    acts: "Verordnung (EU) 2016/679; Organgesetz 3/2018 über den Schutz personenbezogener Daten und die Gewähr digitaler Rechte (LOPDGDD); Königliches Gesetzesdekret 1/1996 mit dem bereinigten Text des Gesetzes über geistiges Eigentum.",
    technical: "Personenbezogene Angaben des Katalogs werden für den Herausgeber nicht erhoben. Ein nicht erforderlicher Tracking-Speicher wird nicht gesetzt. Spiele und Bilder fügt die nutzende Person hinzu.",
    legal: "Das LOPDGDD wendet die DSGVO an und schafft keine Pflicht zu einem Verarbeitungsverzeichnis, wo der Herausgeber nicht verarbeitet. Das Gesetz über geistiges Eigentum überträgt Sytera Labs keine Rechte an den abgelegten Dateien und erlaubt nicht, technische Maßnahmen zu entfernen. Der Text ist kein Eintrag im Register der AEPD.",
    language: "Die spanische Oberfläche bleibt neutral, setzt umgekehrte Zeichen, wo das Spanische sie braucht, und das Dezimalkomma. Shelf und Apache License bleiben.",
    user: "Der Katalog lässt sich per JSON ersetzen. Das Programm fragt auf diesem Computer nach. Ein Abbruch lässt die bisherige Sammlung stehen.",
  },
  {
    place: "Republik Korea",
    acts: "Gesetz zum Schutz personenbezogener Informationen (개인정보 보호법); Urheberrechtsgesetz (저작권법), einschließlich der Regeln zu technischen Schutzmaßnahmen.",
    technical: "Der Anbieter erhebt über Shelf keine personenbezogenen Informationen: keine Mitgliedschaft, keine Werbekennung, keine Übertragung des Katalogs. Die Bibliothek bleibt auf diesem Computer.",
    legal: "Ein Auftrags- oder Geschäftsverarbeiter nach dem koreanischen Gesetz ist, wer personenbezogene Informationen zu geschäftlichen Zwecken verarbeitet. Ohne den Katalog gibt es diese Verarbeitung nicht und keine Weitergabe an Dritte. Das Urheberrecht bleibt beim Rechteinhaber. Eine koreanische Oberfläche heißt nicht, dass der Dienst von einem koreanischen Server kommt.",
    language: "Die koreanische Oberfläche spricht in der Form 합니다, nicht vertraulich. Shelf, Sytera Labs und Apache License werden nicht in Hangeul ersetzt.",
    user: "Sitzung und Stunden zählen lokal. Eine geschlossene Registerkarte schreibt nur bis zur letzten lebendigen Sekunde fort. Das ist eine Uhrregel, keine Datenübertragung.",
  },
  {
    place: "Japan",
    acts: "Gesetz zum Schutz personenbezogener Informationen (個人情報の保護に関する法律); Urheberrechtsgesetz (著作権法), einschließlich der Bestimmungen zu technischen Schutzmaßnahmen.",
    technical: "Sytera Labs erlangt aus der Bibliothek keine personenbezogenen Informationen. Die Daten bleiben auf dem Gerät. Fremde Spielmaterialien werden nicht mitgeliefert, technische Maßnahmen nicht umgangen.",
    legal: "Ein Unternehmer, der personenbezogene Informationen geschäftlich handhabt, ist, wer sie verarbeitet. Der Herausgeber verarbeitet den Katalog nicht, also gibt es keine grenzüberschreitende Übermittlung dieser Bibliothek. Der japanische Text ist keine Anzeige bei der Kommission für den Schutz personenbezogener Informationen.",
    language: "Die japanische Oberfläche spricht in です・ます. Die lateinischen Namen bleiben unübersetzt.",
    user: "Das Cover legt die nutzende Person hinein. Fremde Schaufenster werden nicht abgefragt. Eine Karte ohne Startdatei bleibt eine Notiz und lädt nichts herunter.",
  },
  {
    place: "Volksrepublik China",
    acts: "Gesetz zum Schutz personenbezogener Informationen (个人信息保护法); Urheberrechtsgesetz der Volksrepublik China (著作权法).",
    technical: "Der Herausgeber verarbeitet den Katalog nicht auf einem Server in Festlandchina und sendet ihn auch nicht ins Ausland: eine serverseitige Verarbeitung gibt es nicht. Das Programm speichert die Bibliothek auf diesem Computer. Technische Maßnahmen werden nicht umgangen.",
    legal: "Das PIPL regelt die Verarbeitung personenbezogener Informationen. Solange der Herausgeber den Katalog nicht verarbeitet, hängt daran keine Betreiberpflicht und keine Prüfung einer grenzüberschreitenden Übermittlung. Das sagt nicht, dass jede lokale Datei außerhalb des chinesischen Rechts läge: wer Dateien und Bilder hinzufügt, bleibt dafür verantwortlich. Eine chinesische Übersetzung ist keine behördliche Registrierung.",
    language: "Die chinesische Oberfläche nutzt vereinfachte Schriftzeichen und einen nüchternen Ton. Shelf, Sytera Labs und Apache License bleiben lateinisch.",
    user: "Die Sammlung wird nicht in eine Cloud des Herausgebers synchronisiert. Ein Sprachwechsel ändert Beschriftungen, nicht den Katalog. Der JSON-Export bleibt eine Datei auf dem Gerät.",
  },
];

const lawsIt: Law[] = [
  {
    place: "Federazione Russa",
    acts: "Legge federale n. 152-FZ del 27 luglio 2006 sui dati personali; legge federale n. 242-FZ del 21 luglio 2014 sulla localizzazione della registrazione dei dati personali dei cittadini della Federazione Russa; legge federale n. 149-FZ del 27 luglio 2006 sull’informazione; parte quarta del Codice civile, inclusi gli articoli 1229, 1270 e 1299.",
    technical: "Catalogo, copertine, note, etichette, secondi di sessione, impostazioni e lingua scelta restano nei dati del programma su questo computer. Nulla invia questi dati a un server di Sytera Labs. Nessun account, nessun identificatore pubblicitario, nessuna analitica di terzi. La stringa di avvio è testo inserito da chi usa il programma. Le misure tecniche non si aggirano e le opere altrui non sono incluse.",
    legal: "L’operatore secondo la 152-FZ è chi organizza il trattamento e ne determina le finalità. Il catalogo non arriva all’editore: non c’è una base da localizzare né da trasferire. L’articolo 1299 vieta l’elusione delle misure tecniche. Shelf non le elude. I diritti esclusivi sui file aggiunti restano al titolare. È un argomento di architettura, non un parere del Roskomnadzor.",
    language: "L’interfaccia russa dà del вы, scrive ё, usa le virgolette « » e la virgola decimale nelle ore. Shelf, Sytera Labs e Apache License non si traducono.",
    user: "Una scheda si esporta in JSON e si reimporta su questo dispositivo. Togliere la scheda non cancella il file sul disco. Cancellare i dati del programma cancella il catalogo: l’editore non ha una copia.",
  },
  {
    place: "Stati Uniti d’America",
    acts: "California Consumer Privacy Act come modificato dal CPRA, Cal. Civ. Code § 1798.100 e seguenti; Copyright Act, 17 U.S.C.; DMCA, 17 U.S.C. § 1201; Federal Trade Commission Act § 5.",
    technical: "Presso l’editore non arrivano nome, posta, identificatore del dispositivo né la storia del catalogo. Non c’è vendita né sharing pubblicitario, perché non c’è nulla da trasmettere. Nessun tracciamento. Copertine e percorsi restano su questo computer.",
    legal: "Il CCPA/CPRA riguarda un’impresa che raccoglie informazioni personali dei consumatori. Tramite Shelf l’editore non le riceve e quindi non può venderle o condividerle. Il § 1201 vieta l’elusione di una misura tecnica che controlla l’accesso a un’opera. Il programma non la elude e non include opere altrui. Questo testo non mostra un sigillo pubblico e non afferma una certificazione della FTC: sarebbe ingannevole ai sensi del § 5.",
    language: "L’inglese americano scrive catalog, color e license, il punto decimale e le virgolette “ ”. Il registro è piano.",
    user: "Non c’è un account da cancellare. La propria raccolta si esporta da sé. Il diritto a conservare un certo file e una certa copertina resta di chi li aggiunge.",
  },
  {
    place: "Regno Unito",
    acts: "UK GDPR e Data Protection Act 2018; Privacy and Electronic Communications Regulations 2003; Copyright, Designs and Patents Act 1988.",
    technical: "L’editore non riceve il catalogo e non legge un identificatore pubblicitario. Nessun tracciamento. Il programma scrive la biblioteca sul computer perché chi usa il programma tiene uno scaffale. Non è un archivio di terzi che l’editore rilegge.",
    legal: "Titolare secondo lo UK GDPR è chi determina finalità e mezzi. Finalità sul catalogo non ce ne sono, perché il catalogo non è presso l’editore. Il PECR limita l’accesso al terminale, soprattutto per la pubblicità. Shelf non usa il computer per questo. Il CDPA 1988 lascia il diritto d’autore al titolare dei diritti. Scegliere l’inglese britannico non nomina un rappresentante UK GDPR.",
    language: "L’inglese britannico scrive catalogue, colour e programme, salvo il nome proprio Apache License. Punto decimale. Nessuno stemma finto.",
    user: "La raccolta non va in un ufficio britannico, perché una copia d’ufficio non esiste. Cancellare i dati del programma elimina il catalogo su questo computer.",
  },
  {
    place: "Germania",
    acts: "Regolamento (UE) 2016/679 (GDPR); Bundesdatenschutzgesetz; § 25 TDDDG (già § 25 TTDSG); Urheberrechtsgesetz, comprese le norme sulle misure tecniche di protezione.",
    technical: "Nessun account e nessuna telemetria. Il catalogo non va su un server. I dati del programma si riempiono con l’atto di chi usa il programma e sono necessari allo scaffale stesso. Non è un tracciamento né un profilo pubblicitario.",
    legal: "L’argomento sul § 25 TDDDG: una memorizzazione sul dispositivo, senza la quale una funzione chiesta in modo esplicito non funziona e che l’editore non legge, non è un archivio di tracciamento di terzi. Il GDPR presuppone un trattamento da parte di un titolare. L’editore non tratta il catalogo. L’UrhG protegge le opere e le misure tecniche. I materiali di gioco non sono allegati e le misure non si aggirano. Il testo tedesco non significa che vi sia un rappresentante ex art. 27 in Germania.",
    language: "L’interfaccia tedesca dà del Sie, conserva ß e le dieresi, usa la virgola decimale e le virgolette „ “. I nomi propri non si traducono.",
    user: "Ore e schede si contano su questo dispositivo. L’esportazione è un file che il programma scrive sul computer, non un invio all’editore. Togliere una scheda non tocca il file sul disco.",
  },
  {
    place: "Italia",
    acts: "Regolamento (UE) 2016/679; decreto legislativo 30 giugno 2003, n. 196, come modificato dal decreto legislativo 10 agosto 2018, n. 101; legge 22 aprile 1941, n. 633, sul diritto d’autore.",
    technical: "L’editore non determina i mezzi del trattamento del catalogo: il catalogo non lascia questo computer. Nessuna profilazione e nessun identificatore di marketing. Copertina e riga di avvio le fornisce chi usa il programma.",
    legal: "Titolare è chi determina finalità e mezzi. Qui le finalità della biblioteca le determina chi la conserva in locale, e l’editore non riceve i dati. Non sorge una segnalazione al Garante per questo catalogo, perché l’editore non lo tratta. La legge n. 633 lascia i diritti agli autori e vieta l’elusione delle misure tecniche. Il programma non include le opere e non rimuove le misure. La traduzione italiana non crea una stabile organizzazione e non sostituisce un parere legale.",
    language: "L’interfaccia italiana tiene un registro cortese, l’apostrofo come in l’editore e la virgola decimale. I nomi del programma e della licenza non si traducono.",
    user: "Lo scaffale resta sul dispositivo. Chi aggiunge una copertina risponde del diritto di usarla. L’editore non ne conserva una copia.",
  },
  {
    place: "Spagna",
    acts: "Regolamento (UE) 2016/679; legge organica 3/2018 sulla protezione dei dati personali e la garanzia dei diritti digitali (LOPDGDD); regio decreto legislativo 1/1996, testo unico della legge sulla proprietà intellettuale.",
    technical: "I dati personali del catalogo non sono raccolti per l’editore. Non si colloca un archivio di tracciamento non necessario. Giochi e immagini li aggiunge chi usa il programma.",
    legal: "La LOPDGDD applica il GDPR e non crea un obbligo di registro dei trattamenti là dove l’editore non tratta. La legge sulla proprietà intellettuale non trasferisce a Sytera Labs i diritti sui file posti sullo scaffale e non consente di rimuovere le misure tecniche. Questo testo non è un’iscrizione nel registro dell’AEPD.",
    language: "L’interfaccia spagnola usa un tono neutro, i segni invertiti dove la punteggiatura spagnola li richiede e la virgola decimale. Shelf e Apache License restano.",
    user: "Il catalogo si può sostituire importando un JSON. Il programma, su questo computer, chiede conferma. Annullare lascia lo scaffale precedente.",
  },
  {
    place: "Repubblica di Corea",
    acts: "Legge sulla protezione delle informazioni personali (개인정보 보호법); legge sul diritto d’autore (저작권법), comprese le norme sulle misure tecniche di protezione.",
    technical: "Il fornitore non raccoglie informazioni personali tramite Shelf: niente iscrizione, niente identificatore pubblicitario, niente invio del catalogo. La biblioteca resta su questo computer.",
    legal: "Chi tratta informazioni personali per fini di impresa è il soggetto della legge coreana. Senza il catalogo quel trattamento non c’è e non c’è cessione a terzi. Il diritto d’autore resta al titolare. Un’interfaccia coreana non significa che il servizio parta da un server coreano.",
    language: "L’interfaccia coreana usa lo stile formale 합니다, non un registro confidenziale. Shelf, Sytera Labs e Apache License non sono sostituiti in hangul.",
    user: "Sessione e ore si contano in locale. Chiudere il programma conta solo fino all’ultimo secondo vivo. È una regola dell’orologio, non un trasferimento.",
  },
  {
    place: "Giappone",
    acts: "Legge sulla protezione delle informazioni personali (個人情報の保護に関する法律); legge sul diritto d’autore (著作権法), comprese le disposizioni sulle misure tecniche di protezione.",
    technical: "Sytera Labs non acquisisce informazioni personali dalla biblioteca. I dati restano sul dispositivo. I materiali altrui non sono riprodotti nella fornitura e le misure tecniche non si aggirano.",
    legal: "L’operatore che tratta informazioni personali per la propria attività è chi le tratta. L’editore non tratta il catalogo, dunque non c’è un trasferimento transfrontaliero di questa biblioteca. Il testo giapponese non è una notifica alla commissione per la protezione delle informazioni personali.",
    language: "L’interfaccia giapponese usa です・ます. I nomi latini non si traducono.",
    user: "La copertina la mette chi usa il programma. Le vetrine altrui non sono richieste. Una scheda senza file di avvio resta una nota e non scarica nulla.",
  },
  {
    place: "Repubblica Popolare Cinese",
    acts: "Legge sulla protezione delle informazioni personali (个人信息保护法); legge sul diritto d’autore della Repubblica Popolare Cinese (著作权法).",
    technical: "L’editore non tratta il catalogo su un server nella Cina continentale e non lo invia all’estero: un trattamento lato server non esiste. Il programma conserva la biblioteca su questo computer. Le misure tecniche non si aggirano.",
    legal: "La PIPL regola il trattamento delle informazioni personali. Finché l’editore non tratta il catalogo, non c’è un’attività a cui agganciare doveri di operatore o una valutazione del trasferimento transfrontaliero. Ciò non dice che ogni file locale stia fuori dal diritto cinese: chi aggiunge file e immagini ne risponde. Una traduzione cinese non è una registrazione amministrativa.",
    language: "L’interfaccia cinese è in caratteri semplificati, con tono piano. Shelf, Sytera Labs e Apache License restano in latino.",
    user: "Lo scaffale non si sincronizza con un cloud dell’editore. Cambiare lingua cambia le etichette, non il catalogo. L’esportazione JSON resta un file sul dispositivo.",
  },
];

const lawsEs: Law[] = [
  {
    place: "Federación de Rusia",
    acts: "Ley federal n.º 152-FZ, de 27 de julio de 2006, de datos personales; ley federal n.º 242-FZ, de 21 de julio de 2014, sobre la localización del registro de datos personales de ciudadanos de la Federación de Rusia; ley federal n.º 149-FZ, de 27 de julio de 2006, de la información; parte cuarta del Código Civil, incluidos los artículos 1229, 1270 y 1299.",
    technical: "El catálogo, las portadas, las notas, las etiquetas, los segundos de sesión, los ajustes y el idioma elegido se guardan en los datos del propio programa en este ordenador. Nada envía esos datos a un servidor de Sytera Labs. No hay cuenta, ni identificador publicitario, ni analítica de terceros. La cadena de arranque es texto que escribe quien usa el programa. No se eluden medidas técnicas y no se incluyen obras ajenas.",
    legal: "Operador según la 152-FZ es quien organiza el tratamiento y fija sus fines. El catálogo no llega al editor: no hay base que localizar ni que transferir. El artículo 1299 prohíbe eludir las medidas técnicas. Shelf no las elude. Los derechos exclusivos de los archivos añadidos siguen en el titular. Es un argumento de arquitectura, no un criterio de Roskomnadzor.",
    language: "La interfaz rusa trata de вы, escribe ё, usa comillas « » y la coma decimal en las horas. Shelf, Sytera Labs y Apache License no se traducen.",
    user: "Una ficha se exporta a JSON y se vuelve a importar en este dispositivo. Quitar la ficha no borra el archivo del disco. Borrar los datos del programa borra el catálogo: el editor no tiene copia.",
  },
  {
    place: "Estados Unidos de América",
    acts: "California Consumer Privacy Act, modificada por la CPRA, Cal. Civ. Code § 1798.100 y siguientes; Copyright Act, 17 U.S.C.; DMCA, 17 U.S.C. § 1201; Federal Trade Commission Act § 5.",
    technical: "Al editor no llegan nombre, correo, identificador del dispositivo ni el historial del catálogo. No hay venta ni sharing publicitario, porque no hay nada que transmitir. No hay seguimiento. Las portadas y las rutas se quedan en este ordenador.",
    legal: "La CCPA/CPRA regula un negocio que recoge información personal de consumidores. A través de Shelf el editor no la recibe y, por tanto, no puede venderla ni compartirla. El § 1201 prohíbe eludir una medida técnica que controla el acceso a una obra. El programa no la elude y no incluye obras ajenas. Este texto no muestra un sello oficial ni afirma un certificado de la FTC: eso sería engañoso conforme al § 5.",
    language: "El inglés de Estados Unidos escribe catalog, color y license, el punto decimal y las comillas “ ”. El trato es llano.",
    user: "No hay cuenta que borrar. Cada cual exporta su propia estantería. El derecho a conservar un archivo y una portada concretos sigue siendo de quien los añade.",
  },
  {
    place: "Reino Unido",
    acts: "UK GDPR y Data Protection Act 2018; Privacy and Electronic Communications Regulations 2003; Copyright, Designs and Patents Act 1988.",
    technical: "El editor no recibe el catálogo y no lee un identificador publicitario. No hay seguimiento. El programa escribe la biblioteca en el ordenador porque quien usa el programa lleva una estantería. No es un almacén de un tercero que el editor vuelva a leer.",
    legal: "Responsable según el UK GDPR es quien determina los fines y los medios. No hay fines sobre el catálogo, porque el editor no lo tiene. El PECR limita el acceso al terminal, sobre todo para publicidad. Shelf no usa el ordenador para eso. La CDPA de 1988 deja el derecho de autor en el titular. Elegir el inglés británico no designa un representante del UK GDPR.",
    language: "El inglés británico escribe catalogue, colour y programme, salvo el nombre propio Apache License. Punto decimal. Sin un escudo falso.",
    user: "La estantería no va a una oficina británica, porque no existe una copia de oficina. Borrar los datos del programa borra el catálogo en este ordenador.",
  },
  {
    place: "Alemania",
    acts: "Reglamento (UE) 2016/679 (GDPR); Bundesdatenschutzgesetz; § 25 TDDDG (antes § 25 TTDSG); Urheberrechtsgesetz, incluidas las normas sobre medidas técnicas de protección.",
    technical: "No hay cuenta ni telemetría. El catálogo no va a un servidor. Los datos del programa los llena el propio acto de quien usa el programa y hacen falta para la estantería. No es un seguimiento ni un perfil publicitario.",
    legal: "El argumento del § 25 TDDDG: un almacenamiento en el dispositivo, sin el cual no funciona una función pedida de forma expresa y que el editor no lee, no es un almacén de seguimiento de un tercero. El GDPR supone un tratamiento por un responsable. El editor no trata el catálogo. La UrhG protege las obras y las medidas técnicas. No se adjuntan materiales de juegos y no se eluden medidas. El texto alemán no significa que haya un representante del artículo 27 en Alemania.",
    language: "La interfaz alemana trata de Sie, conserva la ß y las diéresis, usa la coma decimal y las comillas „ “. Los nombres propios no se traducen.",
    user: "Las horas y las fichas se cuentan en este dispositivo. La exportación es un archivo que el programa escribe en el ordenador, no un envío al editor. Quitar una ficha no toca el archivo del disco.",
  },
  {
    place: "Italia",
    acts: "Reglamento (UE) 2016/679; decreto legislativo de 30 de junio de 2003, n.º 196, modificado por el decreto legislativo de 10 de agosto de 2018, n.º 101; ley de 22 de abril de 1941, n.º 633, de propiedad intelectual.",
    technical: "El editor no determina los medios del tratamiento del catálogo: el catálogo no sale de este ordenador. No hay elaboración de perfiles ni identificador de marketing. La portada y la línea de arranque las pone quien usa el programa.",
    legal: "Responsable es quien determina fines y medios. Aquí los fines de la biblioteca los fija quien la guarda en local, y el editor no recibe los datos. No nace un aviso al Garante por este catálogo, porque el editor no lo trata. La ley n.º 633 deja los derechos en los autores. La traducción italiana no crea un establecimiento permanente y no sustituye un consejo jurídico.",
    language: "La interfaz italiana mantiene un registro cortés, el apóstrofo como en l’editore y la coma decimal. Los nombres del programa y de la licencia no se traducen.",
    user: "La estantería se queda en el dispositivo. Quien añade una portada responde de tener derecho a ella. El editor no guarda una copia.",
  },
  {
    place: "España",
    acts: "Reglamento (UE) 2016/679; Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD); Real Decreto Legislativo 1/1996, por el que se aprueba el texto refundido de la Ley de Propiedad Intelectual.",
    technical: "Los datos personales del catálogo no se recogen para el editor. No se instala un almacenamiento de seguimiento no necesario. Los juegos y las imágenes los añade quien usa el programa.",
    legal: "La LOPDGDD aplica el GDPR y no crea un deber de registro de actividades allí donde el editor no trata datos. La Ley de Propiedad Intelectual no transfiere a Sytera Labs los derechos sobre los archivos puestos en la estantería y no permite retirar las medidas técnicas. Este texto no es un asiento en el registro de la AEPD.",
    language: "La interfaz española usa un trato neutro, los signos invertidos cuando la puntuación española los pide y la coma decimal. Shelf y Apache License se quedan como están.",
    user: "El catálogo se puede sustituir importando un JSON. El programa, en este ordenador, pide confirmación. Cancelar deja la estantería anterior.",
  },
  {
    place: "República de Corea",
    acts: "Ley de protección de la información personal (개인정보 보호법); Ley de propiedad intelectual (저작권법), incluidas las normas sobre medidas técnicas de protección.",
    technical: "El prestador no recoge información personal a través de Shelf: no hay alta, ni identificador publicitario, ni envío del catálogo. La biblioteca se queda en este ordenador.",
    legal: "Quien trata información personal con fines de negocio es el sujeto de la ley coreana. Sin el catálogo no hay ese tratamiento ni una cesión a terceros. El derecho de autor sigue en el titular. Una interfaz coreana no significa que el servicio salga de un servidor coreano.",
    language: "La interfaz coreana usa el estilo formal 합니다, no un registro familiar. Shelf, Sytera Labs y Apache License no se sustituyen por hangul.",
    user: "La sesión y las horas se cuentan en local. Cerrar el programa cuenta solo hasta el último segundo vivo. Es una regla del reloj, no una transferencia.",
  },
  {
    place: "Japón",
    acts: "Ley de protección de la información personal (個人情報の保護に関する法律); Ley de propiedad intelectual (著作権法), incluidas las disposiciones sobre medidas técnicas de protección.",
    technical: "Sytera Labs no obtiene información personal de la biblioteca. Los datos se quedan en el dispositivo. No se reproducen materiales ajenos en la entrega y no se eluden las medidas técnicas.",
    legal: "El operador que trata información personal en su actividad es quien la trata. El editor no trata el catálogo, así que no hay una transferencia transfronteriza de esta biblioteca. El texto japonés no es una notificación a la comisión de protección de la información personal.",
    language: "La interfaz japonesa usa です・ます. Los nombres en latino no se traducen.",
    user: "La portada la pone quien usa el programa. No se piden escaparates ajenos. Una ficha sin archivo de arranque sigue siendo una nota y no descarga nada.",
  },
  {
    place: "República Popular China",
    acts: "Ley de protección de la información personal (个人信息保护法); Ley de derechos de autor de la República Popular China (著作权法).",
    technical: "El editor no trata el catálogo en un servidor de la China continental ni lo envía al extranjero: no hay tratamiento en servidor. El programa guarda la biblioteca en este ordenador. Las medidas técnicas no se eluden.",
    legal: "La PIPL regula el tratamiento de información personal. Mientras el editor no trate el catálogo, no hay una actividad a la que enganchar deberes de operador ni una evaluación de transferencia transfronteriza. Eso no dice que cada archivo local quede fuera del derecho chino: quien añade archivos e imágenes responde de ellos. Una traducción china no es un registro administrativo.",
    language: "La interfaz china está en caracteres simplificados, con un tono sobrio. Shelf, Sytera Labs y Apache License siguen en latino.",
    user: "La estantería no se sincroniza con una nube del editor. Cambiar el idioma cambia los rótulos, no el catálogo. La exportación JSON sigue siendo un archivo en el dispositivo.",
  },
];

const lawsKo: Law[] = [
  {
    place: "러시아 연방",
    acts: "2006년 7월 27일 연방법 제152-FZ호(개인정보). 2014년 7월 21일 연방법 제242-FZ호(러시아 연방 시민 개인정보의 기록 현지화). 2006년 7월 27일 연방법 제149-FZ호(정보). 러시아 연방 민법 제4부, 제1229조·제1270조·제1299조를 포함합니다.",
    technical: "목록, 표지, 메모, 태그, 세션 초, 설정, 고른 언어는 이 컴퓨터에서 프로그램 자신의 데이터로 보관됩니다. 이 기록을 Sytera Labs 서버로 보내는 요청은 없습니다. 계정, 광고 식별자, 제3자 분석은 없습니다. 실행 파일 문자열은 사용자가 입력한 텍스트입니다. 기술 보호를 해제하지 않으며, 타인의 표지나 게임 파일을 넣지 않습니다.",
    legal: "제152-FZ호에서 처리자는 개인정보 처리를 조직하고 그 목적을 정하는 사람입니다. 목록은 발행자에게 닿지 않으므로, 현지화하거나 국외로 이전할 기록이 발행자에게 없습니다. 민법 제1299조는 기술 보호조치의 우회를 금지합니다. Shelf는 우회하지 않습니다. 사용자가 넣은 파일의 배타적 권리는 권리자에게 남습니다. 이것은 구조에서 나온 논거이며, 로스콤나드조르의 유권해석이 아닙니다.",
    language: "러시아어 화면은 вы로 말하고, ё를 쓰며, « » 따옴표와 시간의 소수 쉼표를 씁니다. Shelf, Sytera Labs, Apache License는 번역하지 않습니다.",
    user: "카드는 JSON으로 보내고 이 기기에서 다시 넣을 수 있습니다. 카드를 지워도 디스크의 게임 파일은 지워지지 않습니다. 사이트 데이터를 지우면 목록도 사라집니다. 발행자에게 사본이 없기 때문입니다.",
  },
  {
    place: "미합중국",
    acts: "CPRA로 개정된 California Consumer Privacy Act, Cal. Civ. Code § 1798.100 이하. Copyright Act, 17 U.S.C. DMCA, 17 U.S.C. § 1201. Federal Trade Commission Act § 5.",
    technical: "발행자에게 이름, 우편, 기기 식별자, 목록의 이력은 도착하지 않습니다. 넘길 것이 없으므로 판매도, 교차 맥락 광고를 위한 sharing도 없습니다. 추적은 없습니다. 표지와 경로는 이 컴퓨터에 남습니다.",
    legal: "CCPA/CPRA는 소비자의 개인정보를 수집하는 사업을 규율합니다. Shelf를 통해 발행자는 그 정보를 받지 않으므로 팔거나 공유할 수 없습니다. 제1201조는 저작물 접근을 통제하는 기술조치의 우회를 금지합니다. 프로그램은 우회하지 않고 타인의 저작물을 포함하지 않습니다. 이 글은 관인처럼 읽혀서는 안 되며, FTC의 인증을 주장하지 않습니다. 그것은 FTC Act § 5에 비추어 기만입니다.",
    language: "미국 영어는 catalog, color, license, 소수 마침표, “ ” 따옴표를 씁니다. 말투는 평이합니다.",
    user: "계정이 없으므로 지울 계정도 없습니다. 선반은 사용자가 직접 내보냅니다. 특정 파일과 표지를 둘 권리는 그것을 넣은 사람에게 있습니다.",
  },
  {
    place: "영국",
    acts: "UK GDPR 및 Data Protection Act 2018. Privacy and Electronic Communications Regulations 2003. Copyright, Designs and Patents Act 1988.",
    technical: "발행자는 목록을 받지 않고 광고 식별자를 읽지 않습니다. 추적은 없습니다. 프로그램이 컴퓨터에 서재를 쓰는 것은 사용자가 선반을 두기 때문입니다. 발행자가 나중에 읽는 제3자 저장소가 아닙니다.",
    legal: "UK GDPR의 컨트롤러는 개인정보 처리의 목적과 수단을 정하는 사람입니다. 목록이 발행자에게 없으므로 그 목적도 없습니다. PECR은 단말기 접근, 특히 광고를 제한합니다. Shelf는 그런 쿠키를 심지 않습니다. 1988년 CDPA는 저작권을 권리자에게 둡니다. 영국 영어를 고른다고 UK GDPR 대리인이 임명되지는 않습니다.",
    language: "영국 영어는 catalogue, colour, programme을 쓰되, 고유명 Apache License는 그대로 둡니다. 소수 마침표. 거짓 문장은 없습니다.",
    user: "선반은 영국 사무소로 가지 않습니다. 사무소 사본이 없기 때문입니다. 프로그램 데이터를 지우면 이 컴퓨터의 목록이 지워집니다.",
  },
  {
    place: "독일",
    acts: "규정 (EU) 2016/679 (GDPR). Bundesdatenschutzgesetz. TDDDG 제25조(옛 TTDSG 제25조). Urheberrechtsgesetz. 기술 보호조치에 관한 규정을 포함합니다.",
    technical: "계정과 원격 측정은 없습니다. 목록은 서버로 가지 않습니다. 프로그램 데이터는 사용자의 행위로 채워지고 선반 자체에 필요합니다. 추적도 광고 프로필도 아닙니다.",
    legal: "TDDDG 제25조에 대한 논거입니다. 사용자가 분명히 요청한 기능이 없으면 동작하지 않고, 발행자가 읽지 않는 기기 저장은 제3자의 추적 저장이 아닙니다. GDPR은 컨트롤러의 처리를 전제합니다. 발행자는 목록을 처리하지 않습니다. UrhG는 저작물과 기술조치를 보호합니다. 게임 자료를 동봉하지 않고 조치를 우회하지 않습니다. 독일어 화면이 독일의 제27조 대리인을 뜻하지는 않습니다.",
    language: "독일어 화면은 Sie로 말하고, ß와 움라우트, 소수 쉼표, „ “ 따옴표를 유지합니다. 고유명은 번역하지 않습니다.",
    user: "시간과 카드는 이 기기에서 셉니다. 내보내기는 프로그램이 컴퓨터에 쓰는 파일이며 발행자에게 올리는 일이 아닙니다. 카드를 지워도 디스크의 파일은 그대로입니다.",
  },
  {
    place: "이탈리아",
    acts: "규정 (EU) 2016/679. 2003년 6월 30일 입법령 제196호(2018년 8월 10일 입법령 제101호로 개정). 1941년 4월 22일 법률 제633호(저작권).",
    technical: "발행자는 목록 처리의 수단을 정하지 않습니다. 목록은 이 컴퓨터를 떠나지 않습니다. 프로파일링과 마케팅 식별자는 없습니다. 표지와 실행 문자열은 사용자가 넣습니다.",
    legal: "컨트롤러는 목적과 수단을 정하는 사람입니다. 여기서는 사용자가 서재를 자기 기기에 두며 목적을 정하고, 발행자는 기록을 받지 않습니다. 발행자의 처리가 없으므로 이 목록에 대해 Garante에 대한 별도 통지가 생기지 않습니다. 제633호 법률은 권리를 저작자에게 두고 기술조치의 우회를 금지합니다. 이탈리아어 번역이 고정 사업장을 만들거나 법률 자문을 대신하지는 않습니다.",
    language: "이탈리아어 화면은 정중한 말투와 l’editore 같은 아포스트로피, 소수 쉼표를 유지합니다. 프로그램과 라이선스의 이름은 번역하지 않습니다.",
    user: "선반은 기기에 남습니다. 표지를 넣는 사람이 그 권리에 답합니다. 발행자는 표지 사본을 보관하지 않습니다.",
  },
  {
    place: "스페인",
    acts: "규정 (EU) 2016/679. 개인정보 보호 및 디지털 권리 보장에 관한 조직법 3/2018 (LOPDGDD). 지식재산법 개정문을 승인하는 왕립 입법명령 1/1996.",
    technical: "목록의 개인정보는 발행자를 위해 수집되지 않습니다. 불필요한 추적 저장소를 두지 않습니다. 게임과 이미지는 사용자가 추가합니다.",
    legal: "LOPDGDD는 GDPR을 적용하며, 발행자가 처리하지 않는 곳에 처리 기록 의무를 새로 만들지 않습니다. 지식재산법은 선반에 놓은 파일의 권리를 Sytera Labs에 넘기지 않고, 기술조치의 제거를 허용하지 않습니다. 이 글은 AEPD 등록부의 등재가 아닙니다.",
    language: "스페인어 화면은 중립적 말투, 스페인어 문장에 필요한 전도 부호, 소수 쉼표를 씁니다. Shelf와 Apache License는 그대로 둡니다.",
    user: "JSON을 들여 목록을 바꿀 수 있습니다. 이 컴퓨터의 프로그램이 확인을 묻습니다. 취소하면 이전 선반이 남습니다.",
  },
  {
    place: "대한민국",
    acts: "개인정보 보호법. 저작권법. 기술적 보호조치에 관한 규정을 포함합니다.",
    technical: "제공자는 Shelf를 통해 개인정보를 수집하지 않습니다. 회원 가입, 광고 식별자, 목록의 서버 전송이 없습니다. 서재는 이 컴퓨터에 남습니다.",
    legal: "개인정보 보호법의 개인정보처리자는 업무 목적으로 개인정보를 처리하는 자입니다. 목록을 받지 않으므로 그 처리는 없고, 제3자에게 제공도 없습니다. 사용자가 넣은 파일의 저작권은 권리자에게 남습니다. 프로그램은 기술적 보호조치를 우회하지 않고 타인의 저작물을 넣지 않습니다. 한국어 화면이 한국 서버에서 서비스한다는 뜻은 아닙니다.",
    language: "한국어 화면은 합니다체를 쓰며, 반말은 쓰지 않습니다. Shelf, Sytera Labs, Apache License는 한글로 바꾸지 않습니다.",
    user: "세션과 시간은 이 기기에서 셉니다. 프로그램을 닫으면 마지막 살아 있는 초까지만 더합니다. 다음 번에 열 때까지가 아닙니다. 이것은 시계의 규칙이며 데이터 전송이 아닙니다.",
  },
  {
    place: "일본",
    acts: "개인정보 보호에 관한 법률(個人情報の保護に関する法律). 저작권법(著作権法). 기술적 보호수단에 관한 규정을 포함합니다.",
    technical: "Sytera Labs는 서재에서 개인정보를 취득하지 않습니다. 데이터는 기기에 남습니다. 타인의 게임 자료를 배포물에 넣지 않고 기술조치를 우회하지 않습니다.",
    legal: "개인정보를 업무상 취급하는 자는 그 정보를 처리하는 자입니다. 발행자는 목록을 처리하지 않으므로 이 서재의 국외 이전도 없습니다. 저작권과 기술조치 우회의 금지는 권리자와, 파일을 넣는 사용자 쪽에 남습니다. 일본어 글은 개인정보 보호 위원회에 대한 신고가 아닙니다.",
    language: "일본어 화면은 です・ます를 씁니다. 거친 말투는 쓰지 않습니다. 프로그램, 실험실, 라이선스의 로마자 이름은 번역하지 않습니다.",
    user: "표지는 사용자가 넣습니다. 남의 진열을 가져오지 않습니다. 실행 파일이 없는 카드는 선반의 메모로 남으며 아무것도 받지 않습니다.",
  },
  {
    place: "중화인민공화국",
    acts: "개인정보 보호법(个人信息保护法). 중화인민공화국 저작권법(著作权法).",
    technical: "발행자는 중국 본토의 서버에서 목록을 처리하지 않고, 국외 서버로 보내지도 않습니다. 서버 쪽 처리 자체가 없습니다. 서재는 프로그램이 이 컴퓨터에 보관합니다. 기술조치는 우회하지 않습니다.",
    legal: "개인정보 보호법은 개인정보의 처리를 규율합니다. 발행자가 목록을 처리하지 않는 동안에는 처리자 의무나 국외 이전 평가가 붙을 활동이 없습니다. 이것은 사용자의 모든 로컬 파일이 중국법 밖에 있다는 말이 아닙니다. 파일과 이미지를 넣는 사람이 그에 답합니다. 저작권법은 그 파일의 권리를 Sytera Labs로 옮기지 않습니다. 중국어 번역이 별도의 행정 절차를 마쳤다는 뜻은 아닙니다.",
    language: "중국어 화면은 간체와 고른 문어체를 씁니다. Shelf, Sytera Labs, Apache License는 로마자로 둡니다.",
    user: "선반은 발행자의 클라우드와 동기화되지 않습니다. 언어를 바꾸면 문구가 바뀌고 게임 목록은 바뀌지 않습니다. JSON 내보내기는 사용자 기기의 파일로 남습니다.",
  },
];

const lawsJa: Law[] = [
  {
    place: "ロシア連邦",
    acts: "2006年7月27日連邦法第152-FZ号（個人データ）。2014年7月21日連邦法第242-FZ号（ロシア連邦市民の個人データの記録の国内保存）。2006年7月27日連邦法第149-FZ号（情報）。ロシア連邦民法典第四部（第1229条、第1270条、第1299条を含む）。",
    technical: "目録、表紙、メモ、タグ、セッションの秒、設定、選んだ言語は、このコンピュータ上の、プログラム自身のデータに書かれます。これらを Sytera Labs のサーバへ送る処理はありません。アカウント、広告識別子、第三者の解析はありません。起動ファイルの文字列は、使う人が入力した文字です。技術的保護手段は回避せず、他人の表紙やゲームのファイルは同梱しません。",
    legal: "第152-FZ号の事業者は、個人データの取扱いを組織し、その目的を定める者です。目録は発行者に届かないので、国内に置いて保存すべき記録も、国外へ送る記録も、発行者にはありません。民法典第1299条は技術的保護手段の回避を禁じます。Shelf は回避しません。加えられたファイルの独占的権利は権利者に残ります。これは構造からの論拠であり、ロスコムナドゾルの見解ではありません。",
    language: "ロシア語の画面は вы で呼びかけ、ё を書き、「」ではなく « » を使い、時間は小数のコンマです。Shelf、Sytera Labs、Apache License は訳しません。",
    user: "カードは JSON で書き出し、この機器で戻せます。カードを外しても、ディスク上のゲームのファイルは消えません。サイトのデータを消すと目録も消えます。発行者に写しがないからです。",
  },
  {
    place: "アメリカ合衆国",
    acts: "CPRA により改正された California Consumer Privacy Act（Cal. Civ. Code § 1798.100 以下）。著作権法 17 U.S.C.。DMCA 17 U.S.C. § 1201。連邦取引委員会法 § 5。",
    technical: "発行者のところへ、氏名、メール、機器の識別子、目録の履歴は届きません。渡すものがないので、販売も、横断的な広告のための sharing もありません。追跡はありません。表紙とパスはこのコンピュータに残ります。",
    legal: "CCPA/CPRA は、消費者の個人情報を収集する事業を規律します。Shelf を通じて発行者はその情報を受け取らないので、売ることも共有することもできません。第1201条は、著作物へのアクセスを制御する技術的手段の回避を禁じます。プログラムは回避せず、他人の著作物を含めません。この文章は公の印章ではなく、FTC の証明を主張しません。それは FTC 法第5条に照らして誤認です。",
    language: "アメリカ英語は catalog、color、license、小数点、“ ” の引用符を使います。呼びかけは平らです。",
    user: "アカウントはないので、消すアカウントもありません。棚は使う人が自分で書き出します。特定のファイルと表紙を置いてよいかは、置いた人の責任です。",
  },
  {
    place: "英国",
    acts: "UK GDPR および Data Protection Act 2018。Privacy and Electronic Communications Regulations 2003。Copyright, Designs and Patents Act 1988。",
    technical: "発行者は目録を受け取らず、広告の識別子も読みません。追跡はありません。プログラムがコンピュータに書庫を書くのは、使う人が棚を持っているからです。発行者が後から読む第三者の保管ではありません。",
    legal: "UK GDPR の管理者は、個人データの取扱いの目的と手段を定める者です。目録が発行者にないので、その目的もありません。PECR は端末へのアクセス、とくに広告を限ます。Shelf はそのクッキーを置きません。1988年の CDPA は著作権を権利者に残します。英国英語を選んでも、UK GDPR の代理人は任命されません。",
    language: "英国英語は catalogue、colour、programme を書きます。ただし固有の名である Apache License はそのままです。小数点。偽の紋章はありません。",
    user: "棚は英国の事務所へ行きません。事務所の写しがないからです。プログラムのデータを消すと、このコンピュータの目録は消えます。",
  },
  {
    place: "ドイツ",
    acts: "規則（EU）2016/679（GDPR）。連邦データ保護法。TDDDG 第25条（旧 TTDSG 第25条）。著作権法。技術的保護措置の定めを含みます。",
    technical: "アカウントもテレメトリもありません。目録はサーバへ行きません。プログラムのデータは使う人の操作で埋まり、棚そのものに必要です。追跡でも広告のプロファイルでもありません。",
    legal: "TDDDG 第25条についての論拠です。使う人が明示して求めた機能がなければ動かず、発行者が読まない機器上の保存は、第三者の追跡のための保存ではありません。GDPR は管理者による取扱いを前提とします。発行者は目録を取り扱いません。著作権法は著作物と技術的措置を守ります。ゲームの素材は同梱せず、措置は回避しません。ドイツ語の画面は、ドイツに第27条の代理人があるという意味ではありません。",
    language: "ドイツ語の画面は Sie で呼びかけ、ß とウムラウト、小数のコンマ、「„ “」を保ちます。固有名は訳しません。",
    user: "時間とカードはこの機器で数えます。書き出しはプログラムがコンピュータに書くファイルであり、発行者への送信ではありません。カードを外しても、ディスク上のファイルには触れません。",
  },
  {
    place: "イタリア",
    acts: "規則（EU）2016/679。2003年6月30日法令第196号（2018年8月10日法令第101号により改正）。1941年4月22日法律第633号（著作権）。",
    technical: "発行者は目録の取扱いの手段を定めません。目録はこのコンピュータを離れません。プロファイリングもマーケティング識別子もありません。表紙と起動の文字列は使う人が渡します。",
    legal: "管理者は目的と手段を定める者です。ここでは使う人が書庫を手元に置くことで目的を定め、発行者は記録を受け取りません。発行者の取扱いがないので、この目録について Garante への別段の届出は生じません。第633号は権利を著作者に残し、技術的措置の回避を禁じます。イタリア語訳は恒常的施設を作らず、法的助言に代わるものでもありません。",
    language: "イタリア語の画面は丁寧なレジスター、l’editore のようなアポストロフ、小数のコンマを保ちます。プログラムとライセンスの名は訳しません。",
    user: "棚は機器に残ります。表紙を加える人が、その権利に応えます。発行者は表紙の写しを持ちません。",
  },
  {
    place: "スペイン",
    acts: "規則（EU）2016/679。個人データの保護およびデジタル権利の保障に関する組織法3/2018（LOPDGDD）。知的財産法の改正テキストを承認する王立法令1/1996。",
    technical: "目録の個人データは発行者のために収集されません。不要な追跡の保存は置きません。ゲームと画像は使う人が加えます。",
    legal: "LOPDGDD は GDPR を適用し、発行者が取り扱わないところに処理記録の義務を新たに作りません。知的財産法は、棚に置いたファイルの権利を Sytera Labs に移さず、技術的措置を外すことを許しません。この文章は AEPD の登録ではありません。",
    language: "スペイン語の画面は中立的な呼びかけ、スペイン語の句読点に必要な逆さの記号、小数のコンマを使います。Shelf と Apache License はそのままです。",
    user: "JSON を読み込んで目録を置き換えられます。このコンピュータのプログラムが確認します。取り消せば、前の棚が残ります。",
  },
  {
    place: "大韓民国",
    acts: "個人情報保護法（개인정보 보호법）。著作権法（저작권법）。技術的保護措置の定めを含みます。",
    technical: "提供者は Shelf を通じて個人情報を収集しません。会員、広告識別子、目録のサーバ送信はありません。書庫はこのコンピュータに残ります。",
    legal: "個人情報保護法の処理者は、業務の目的で個人情報を取り扱う者です。目録を受け取らないので、その取扱いはなく、第三者への提供もありません。ファイルの著作権は権利者に残ります。プログラムは技術的措置を回避せず、他人の著作物を埋め込みません。韓国語の画面は、韓国のサーバから提供するという意味ではありません。",
    language: "韓国語の画面は합니다体で、くだけた半分の言葉は使いません。Shelf、Sytera Labs、Apache License をハングルに置き換えません。",
    user: "セッションと時間は手元で数えます。プログラムを閉じると、最後に生きていた秒までだけ足します。次に開くまでではありません。これは時計の規則であり、データの移転ではありません。",
  },
  {
    place: "日本",
    acts: "個人情報の保護に関する法律。著作権法（技術的保護手段に関する定めを含む）。",
    technical: "Sytera Labs は書庫から個人情報を取得しません。データは機器に残ります。他人のゲーム素材を頒布物として複製せず、技術的保護手段を回避しません。",
    legal: "個人情報取扱事業者は、個人情報を事業として取り扱う者です。発行者は目録を取り扱わないので、この書庫の越境移転はありません。著作権と、技術的保護手段の回避の禁止は、権利者と、ファイルを加える人の側に残ります。この日本語は、個人情報保護委員会への通知ではなく、それに代わるものでもありません。",
    language: "日本語の画面はです・ますで話します。荒いレジスターは使いません。プログラム、ラボ、ライセンスのラテン文字の名は訳しません。",
    user: "表紙は使う人が置きます。他人の店頭は取りに行きません。起動ファイルのないカードは棚のメモのままで、何もダウンロードしません。",
  },
  {
    place: "中華人民共和国",
    acts: "個人情報保護法（个人信息保护法）。中華人民共和国著作権法（著作权法）。",
    technical: "発行者は中国本土のサーバで目録を取り扱わず、国外のサーバへも送りません。サーバ側の取扱い自体がありません。書庫はプログラムがこのコンピュータに保存します。技術的措置は回避しません。",
    legal: "個人情報保護法は個人情報の取扱いを規律します。発行者が目録を取り扱わない間は、取扱事業者の義務や越境移転の評価が結び付く活動がありません。これは、使う人の手元のファイルがすべて中国法の外にあるという主張ではありません。ファイルと画像を加える人がそれに応えます。著作権法は、そのファイルの権利を Sytera Labs に移しません。中国語訳は、別の行政手続を終えたという意味に読んではなりません。",
    language: "中国語の画面は簡体字で、落ち着いた文体です。Shelf、Sytera Labs、Apache License はラテン文字のままです。",
    user: "棚は発行者のクラウドと同期しません。言語を変えると表示が変わり、ゲームの目録は変わりません。JSON の書き出しは、使う人の機器のファイルのままです。",
  },
];

const lawsZh: Law[] = [
  {
    place: "俄罗斯联邦",
    acts: "2006年7月27日第152-FZ号联邦法《个人数据法》；2014年7月21日第242-FZ号联邦法（俄罗斯联邦公民个人数据记录的本地化）；2006年7月27日第149-FZ号联邦法《信息法》；俄罗斯联邦民法典第四部分，包括第1229条、第1270条和第1299条。",
    technical: "目录、封面、备注、标签、会话秒数、设置和所选语言保存在这台电脑上、程序自己的数据里。程序不会把这些记录发到 Sytera Labs 的服务器。没有账户，没有广告标识，没有第三方分析。启动文件的字符串是使用者输入的文字。程序不解除技术保护，也不附带他人的封面或游戏文件。",
    legal: "按第152-FZ号，运营者是组织并实施个人数据处理、并决定其目的的人。目录到不了发行方，因此没有可本地化、可跨境传输的记录。民法典第1299条禁止规避技术保护措施。Shelf 不规避。使用者添加的文件，专有权利仍在权利人。这是从架构出发的论证，不是俄罗斯通信监管机关的解释。",
    language: "俄语界面用「вы」，写 ё，用 « » 引号，时长用小数逗号。Shelf、Sytera Labs 和 Apache License 不翻译。",
    user: "卡片可以导出为 JSON，再在这台设备上导入。去掉卡片不会删除磁盘上的游戏文件。清除网站数据后目录就没有了：发行方没有副本，无法恢复。",
  },
  {
    place: "美利坚合众国",
    acts: "经 CPRA 修订的《加州消费者隐私法》，Cal. Civ. Code § 1798.100 及以下；《版权法》17 U.S.C.；DMCA，17 U.S.C. § 1201；《联邦贸易委员会法》第5条。",
    technical: "姓名、邮箱、设备标识和目录历史不会到达发行方。没有可传输的内容，因此没有出售，也没有为跨情境广告而进行的共享。没有跟踪。封面和路径留在这台电脑上。",
    legal: "CCPA/CPRA 规范收集消费者个人信息的业务。发行方并不通过 Shelf 收到这些信息，因此不能出售或共享。第1201条禁止规避控制作品访问的技术措施。程序不规避，也不包含他人作品。这段文字不是政府印章，也不声称 FTC 作了认证。那样会构成第5条意义上的误导。",
    language: "美国英语使用 catalog、color、license、小数点和 “ ” 引号。语气平实，不虚构官衔。",
    user: "没有账户，也就没有可删除的账户。书架由使用者自己导出。是否有权保存某一游戏文件和封面，仍由添加的人负责。",
  },
  {
    place: "英国",
    acts: "UK GDPR 与《2018年数据保护法》；《2003年隐私与电子通信条例》；《1988年版权、外观设计与专利法》。",
    technical: "发行方不接收目录，也不读取广告标识。没有跟踪。程序把书库写在这台电脑上，是因为使用者在保管书架。这不是发行方事后读取的第三方存储。",
    legal: "UK GDPR 下的控制者是决定个人数据处理目的和方式的人。发行方没有目录，也就没有处理目的。PECR 限制为广告而访问终端设备。Shelf 不会为此使用这台电脑。《1988年法》把版权留在权利人。选择英式英语并不会指定 UK GDPR 代表。",
    language: "英式英语使用 catalogue、colour 和 programme，但专名 Apache License 保持不变。小数点。没有虚假的纹章。",
    user: "书架不会送到英国办事处，因为不存在办事处副本。删除程序数据会删除这台电脑上的目录。",
  },
  {
    place: "德国",
    acts: "欧盟条例 2016/679（GDPR）；《联邦数据保护法》；TDDDG 第25条（原 TTDSG 第25条）；《著作权法》，包括关于技术保护措施的规定。",
    technical: "没有账户，也没有遥测。目录不到服务器。程序数据由使用者自己的操作写入，并且书架本身需要它。这不是跟踪，也不是广告档案。",
    legal: "关于 TDDDG 第25条的论证：设备上的存储，若没有它，使用者明确要求的功能就无法工作，且发行方不读取，则不是第三方跟踪存储。GDPR 以控制者的处理为前提。发行方不处理目录。《著作权法》保护作品和技术措施。游戏素材不随程序分发，措施不被规避。德文界面并不表示在德国设有第27条代表。",
    language: "德文界面用 Sie，保留 ß 和变元音，使用小数逗号和 „ “ 引号。专名不翻译。",
    user: "时长和卡片在这台设备上计算。导出是程序写在这台电脑上的文件，不是上传给发行方。去掉卡片不会触碰磁盘上的文件。",
  },
  {
    place: "意大利",
    acts: "欧盟条例 2016/679；2003年6月30日第196号立法令（经2018年8月10日第101号立法令修订）；1941年4月22日第633号著作权法。",
    technical: "发行方并不决定目录处理的方式：目录不离开这台电脑。没有画像，也没有营销标识。封面和启动字符串由使用者提供。",
    legal: "控制者是决定目的和方式的人。这里由使用者把书库留在本地来决定目的，发行方不接收记录。发行方没有处理，因此不会就该目录向 Garante 另行通知。第633号法把权利留在作者，并禁止规避技术措施。意大利文译文不构成常设机构，也不代替法律意见。",
    language: "意大利文界面保持礼貌语域，使用 l’editore 这类撇号和小数逗号。程序和许可证的名称不翻译。",
    user: "书架留在设备上。添加封面的人对自己是否有权负责。发行方不保存封面副本。",
  },
  {
    place: "西班牙",
    acts: "欧盟条例 2016/679；第3/2018号组织法《个人数据保护与数字权利保障法》（LOPDGDD）；第1/1996号皇家立法令（知识产权法合并文本）。",
    technical: "不为发行方收集目录中的个人数据。不放置不必要的跟踪存储。游戏和图像由使用者添加。",
    legal: "LOPDGDD 适用 GDPR，并不在发行方没有处理的地方另设处理记录义务。知识产权法不把放上书架的文件权利转给 Sytera Labs，也不允许拆除技术措施。这段文字不是 AEPD 登记簿上的记载。",
    language: "西班牙文界面用语中性，在西班牙语句读需要时使用倒置符号，并使用小数逗号。Shelf 和 Apache License 保持原样。",
    user: "可以导入 JSON 来替换目录。这台电脑上的程序会先询问。取消则保留原来的书架。",
  },
  {
    place: "大韩民国",
    acts: "《个人信息保护法》（개인정보 보호법）；《著作权法》（저작권법），包括关于技术保护措施的规定。",
    technical: "提供者并不通过 Shelf 收集个人信息。没有会员、广告标识，也不把目录发到服务器。书库留在这台电脑上。",
    legal: "韩国法上的个人信息处理者，是为业务目的处理个人信息的人。收不到目录，就没有这种处理，也没有向第三方提供。文件的著作权仍在权利人。程序不规避技术措施，也不嵌入他人作品。韩文界面并不表示服务来自韩国服务器。",
    language: "韩文界面使用합니다体，不用随意的半语。Shelf、Sytera Labs 和 Apache License 不用谚文替换。",
    user: "会话和时长在本地计算。关闭程序只记到最后一次仍在活动的秒，而不是直到下次打开。这是计时规则，不是数据传输。",
  },
  {
    place: "日本",
    acts: "《个人信息保护法》（個人情報の保護に関する法律）；《著作权法》（著作権法），包括关于技术保护措施的规定。",
    technical: "Sytera Labs 不从书库取得个人信息。数据留在设备上。不把他人的游戏素材作为交付的一部分复制，也不规避技术措施。",
    legal: "以业务处理个人信息的人，才是处理者。发行方不处理目录，因此不存在这本书库的跨境传输。著作权以及禁止规避技术措施，仍在权利人和添加文件的人一边。这段日文不是向个人信息保护委员会的申报。",
    language: "日文界面使用です・ます，不用粗率语体。程序、实验室和许可证的拉丁名称不翻译。",
    user: "封面由使用者放入。程序不抓取他人的店面。没有启动文件的卡片只是架上的备注，不会下载任何东西。",
  },
  {
    place: "中华人民共和国",
    acts: "《中华人民共和国个人信息保护法》；《中华人民共和国著作权法》。",
    technical: "发行方不在中国境内的服务器上处理该目录，也不把它发到境外服务器：根本没有服务器端处理。书库由程序保存在这台电脑上。技术措施不被规避。他人作品不包含在交付中。",
    legal: "《个人信息保护法》规范个人信息的处理。在发行方不处理该目录的情况下，没有可附着运营者义务、跨境传输评估或服务器端单独同意的活动。这并不是说使用者本地的每一个文件都处于中国法之外：添加文件和图像的人仍须自行负责。《著作权法》不把这些文件的权利转移给 Sytera Labs。中文译文不表示程序已完成另行备案，也不应这样理解。",
    language: "中文界面使用简体字，语气平实。Shelf、Sytera Labs 和 Apache License 保留拉丁字母。",
    user: "书架不会同步到发行方的云。更换语言只改变界面文字，不改变游戏目录。JSON 导出仍是使用者设备上的文件。",
  },
];

const leadIndex: Record<Locale, number> = {
  ru: 0,
  "en-US": 1,
  "en-GB": 2,
  de: 3,
  it: 4,
  es: 5,
  ko: 6,
  ja: 7,
  "zh-CN": 8,
};

export const laws: Record<Locale, Law[]> = {
  ru: lawsRu,
  "en-US": lawsEn,
  "en-GB": british(lawsEn),
  de: lawsDe,
  it: lawsIt,
  es: lawsEs,
  ko: lawsKo,
  ja: lawsJa,
  "zh-CN": lawsZh,
};

export function orderedLaws(locale: Locale): Law[] {
  const list = laws[locale];
  const lead = leadIndex[locale];
  return [list[lead], ...list.filter((_, index) => index !== lead)];
}



