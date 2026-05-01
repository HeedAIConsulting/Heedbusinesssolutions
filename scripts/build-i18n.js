#!/usr/bin/env node
/**
 * build-i18n.js — Generate translated language landing pages for the WVWCCC site.
 * Languages: Spanish (es), Russian (ru), Armenian (hy), Chinese (zh).
 *
 * Strategy: each language gets its own /{lang}/index.html with translated
 * hero/sections + a small set of fully translated key pages. The header/footer
 * are rendered server-style by ChamberPartials with lang param.
 *
 * Run:  node scripts/build-i18n.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const LANGS = {
  es: {
    code: 'es', name: 'Español', dir: 'es',
    htmlLang: 'es', ogLocale: 'es_ES',
    site: 'Cámara de Comercio de West Valley · Warner Center',
    since: 'Desde 1930',
    tagline: 'Sirviendo a Tarzana · Woodland Hills · Reseda · Warner Center',
    title: 'Cámara de Comercio West Valley Warner Center — Tarzana · Woodland Hills · Reseda · Warner Center',
    desc: 'La Cámara de Comercio West Valley · Warner Center conecta a más de 800 negocios y a los residentes de Tarzana, Woodland Hills, Reseda y Warner Center desde 1930.',
    eyebrow: 'Conectando negocios y comunidad desde 1930',
    h1pre: 'El motor comunitario del West Valley',
    h1mid: 'ahora con',
    h1mark: 'inteligencia artificial',
    h1post: '.',
    lead: 'Descubre más de 800 negocios miembros, conéctate con eventos, encuentra recursos para cada etapa de la vida y conoce a las personas que mantienen vivos a Tarzana, Woodland Hills, Reseda y Warner Center — todo con la ayuda de tu Concierge de la Cámara, disponible 24/7.',
    btn1: 'Explorar 800+ Miembros', btn2: 'Hacerse Miembro',
    stat1: 'Negocios Miembros', stat2: 'Años de Servicio', stat3: 'Eventos Anuales', stat4: 'Idiomas',
    askConcierge: 'Pregúntale al Concierge',
    cards: [
      ['🍴','Encuentra un restaurante miembro para una cita','Filtrado por barrio, ambiente, precio.'],
      ['🛠️','Contrata a un plomero verificado, rápido','Pros del hogar recomendados por miembros, disponibles ahora.'],
      ['📅','¿Qué hay este fin de semana?','Eventos seleccionados para familias, miembros y visitantes.'],
      ['🎓','Programas extracurriculares cerca de mí','Desde la Guía de Recursos para Padres.']
    ],
    sectionGuides: 'Diez guías comunitarias asombrosas',
    sectionGuidesP: 'Diez guías de recursos completas, curadas por la Cámara y potenciadas por negocios miembros. Buscables, ordenables y siempre actualizadas — en cinco idiomas.',
    sectionEventsH: 'Eventos para conectarte',
    sectionEventsP: 'Desde desayunos de negocios hasta inauguraciones y nuestro evento insignia de Comida y Vino, el calendario de la Cámara es el calendario social del West Valley.',
    sectionLeaders: 'Respaldado por los negocios que construyeron este Valle',
    sectionLeadersP: 'Seis niveles de asociación. Cada dólar reinvertido en la comunidad.',
    becomeLeader: 'Conviértete en Líder',
    advertising: 'Paquetes de Publicidad',
    members: 'Miembros', sponsors: 'Patrocinadores', community: 'Comunidad',
    membersP: 'Aparece en el directorio, promociona tu negocio a través de guías y eventos, y conecta con más de 800 empresas en el West Valley.',
    sponsorsP: 'Ubicación premium en el directorio, patrocinios de guías, patrocinios principales de eventos — integrado en un sistema transparente y automatizado.',
    communityP: 'Gratis para residentes. Encuentra un médico, contrata un contratista, organiza una fiesta de cumpleaños, asiste a un festival — tu Valle, simplificado.',
    join: 'Únete a la Cámara', sponsorshipMenu: 'Menú de Patrocinios', talkConcierge: 'Habla con el Concierge',
    blogTitle: 'Valley Biz Buzz', blogP: 'Noticias, perfiles de miembros e historias de Tarzana, Woodland Hills, Reseda y Warner Center.',
    readBlog: 'Leer el blog', guestPost: '¿Quieres contribuir?',
    submitPost: 'Envía un artículo →',
    newsletterTitle: 'El Semanal del West Valley',
    newsletterP: 'Un correo cada viernes. Eventos de la semana, perfiles de miembros y qué hacer este fin de semana.',
    subscribe: 'Suscribirse', emailPh: 'tu@correo.com'
  },
  ru: {
    code: 'ru', name: 'Русский', dir: 'ru', htmlLang: 'ru', ogLocale: 'ru_RU',
    site: 'Торговая палата Уэст-Вэлли · Уорнер Центр',
    since: 'С 1930 года',
    tagline: 'Обслуживаем Тарзану · Вудленд-Хиллз · Реседу · Уорнер Центр',
    title: 'Торговая палата Уэст-Вэлли Уорнер Центр — Тарзана · Вудленд-Хиллз · Реседа · Уорнер Центр',
    desc: 'Торговая палата Уэст-Вэлли · Уорнер Центр объединяет более 800 предприятий и жителей Тарзаны, Вудленд-Хиллз, Реседы и Уорнер Центра с 1930 года.',
    eyebrow: 'Связываем бизнес и сообщество с 1930 года',
    h1pre: 'Двигатель сообщества Уэст-Вэлли',
    h1mid: 'теперь с',
    h1mark: 'искусственным интеллектом',
    h1post: '.',
    lead: 'Откройте для себя более 800 бизнес-членов, участвуйте в мероприятиях, находите ресурсы для каждого этапа жизни и связывайтесь с людьми, которые поддерживают процветание Тарзаны, Вудленд-Хиллз, Реседы и Уорнер Центра — всё это с помощью вашего консьержа Палаты, работающего круглосуточно.',
    btn1: 'Просмотреть 800+ участников', btn2: 'Стать участником',
    stat1: 'Бизнес-членов', stat2: 'Лет служения', stat3: 'Мероприятий в год', stat4: 'Языков',
    askConcierge: 'Спросите консьержа Палаты',
    cards: [
      ['🍴','Найти ресторан-член для свидания','Фильтр по району, атмосфере, цене.'],
      ['🛠️','Нанять проверенного сантехника, быстро','Рекомендованные членами специалисты, доступные сейчас.'],
      ['📅','Что происходит в эти выходные?','Подобранные события для семей, членов и гостей.'],
      ['🎓','Послешкольные программы рядом','Из Гида по родительским ресурсам.']
    ],
    sectionGuides: 'Десять потрясающих гидов сообщества',
    sectionGuidesP: 'Десять полнофункциональных тематических гидов, составленных Палатой и поддерживаемых бизнес-членами. С поиском, сортировкой и постоянным обновлением — на пяти языках.',
    sectionEventsH: 'Мероприятия для подключения',
    sectionEventsP: 'От бизнес-завтраков до церемоний открытия и нашего флагманского мероприятия Food & Wine — календарь Палаты является социальным календарем Уэст-Вэлли.',
    sectionLeaders: 'Поддержано бизнесами, построившими эту Долину',
    sectionLeadersP: 'Шесть уровней партнёрства. Каждый доллар реинвестируется в сообщество.',
    becomeLeader: 'Стать лидером',
    advertising: 'Рекламные пакеты',
    members: 'Участники', sponsors: 'Спонсоры', community: 'Сообщество',
    membersP: 'Получите место в каталоге, продвигайте свой бизнес через гиды и мероприятия и связывайтесь с более чем 800 предприятиями по всему Уэст-Вэлли.',
    sponsorsP: 'Премиальное размещение в каталоге, спонсорство гидов, эксклюзивное спонсорство мероприятий — встроено в прозрачную автоматизированную систему.',
    communityP: 'Бесплатно для жителей. Найдите врача, наймите подрядчика, спланируйте день рождения, посетите фестиваль — ваша Долина, без сложностей.',
    join: 'Вступить в Палату', sponsorshipMenu: 'Меню спонсорства', talkConcierge: 'Поговорить с Консьержем',
    blogTitle: 'Valley Biz Buzz', blogP: 'Новости, истории участников и события Тарзаны, Вудленд-Хиллз, Реседы и Уорнер Центра.',
    readBlog: 'Читать блог', guestPost: 'Хотите написать?',
    submitPost: 'Отправить статью →',
    newsletterTitle: 'Уэст-Вэлли еженедельно',
    newsletterP: 'Одно письмо каждую пятницу. События недели, профили участников и план на выходные.',
    subscribe: 'Подписаться', emailPh: 'вы@email.com'
  },
  hy: {
    code: 'hy', name: 'Հայերեն', dir: 'hy', htmlLang: 'hy', ogLocale: 'hy_AM',
    site: 'Ուեսթ Վելլի · Ուորներ Սենթեր Առևտրապալատ',
    since: '1930 թվականից',
    tagline: 'Ծառայում ենք Տարզանա · Վուդլենդ Հիլզ · Ռեսեդա · Ուորներ Սենթեր',
    title: 'Ուեսթ Վելլի Ուորներ Սենթեր Առևտրապալատ — Տարզանա · Վուդլենդ Հիլզ · Ռեսեդա · Ուորներ Սենթեր',
    desc: 'Ուեսթ Վելլի · Ուորներ Սենթեր Առևտրապալատը կապում է 800+ բիզնեսներ եւ Տարզանայի, Վուդլենդ Հիլզի, Ռեսեդայի ու Ուորներ Սենթերի բնակիչներին 1930 թվականից։',
    eyebrow: 'Միացնում ենք բիզնեսը եւ համայնքը 1930-ից',
    h1pre: 'Ուեսթ Վելլիի համայնքի շարժիչը',
    h1mid: 'այժմ', h1mark: 'AI-ով',
    h1post: '։',
    lead: 'Բացահայտեք 800+ անդամ բիզնեսներ, մասնակցեք միջոցառումներին, գտեք ռեսուրսներ կյանքի յուրաքանչյուր փուլի համար եւ կապ հաստատեք մարդկանց հետ, ովքեր պահպանում են Տարզանան, Վուդլենդ Հիլզը, Ռեսեդան եւ Ուորներ Սենթերը գործող — ամեն ինչ Ձեր 24/7 կոնսիերժի օգնությամբ։',
    btn1: 'Դիտել 800+ անդամներին', btn2: 'Դառնալ անդամ',
    stat1: 'Անդամ բիզնեսներ', stat2: 'Տարիների սպասարկում', stat3: 'Միջոցառումներ տարեկան', stat4: 'Լեզուներ',
    askConcierge: 'Հարցրեք Կոնսիերժին',
    cards: [
      ['🍴','Գտեք անդամ ռեստորան երեկոյան ընթրիքի համար','Զտված ըստ թաղամասի, մթնոլորտի, գնի։'],
      ['🛠️','Աշխատանքի ընդունեք ստուգված սանտեխնիկ, արագ','Անդամների կողմից առաջարկվող մասնագետներ։'],
      ['📅','Ի՞նչ կա այս հանգստյան օրերին','Միջոցառումներ ընտանիքների, անդամների եւ այցելուների համար։'],
      ['🎓','Հետագնելու ծրագրեր մոտակայքում','Ծնողների ռեսուրսների ուղեցույցից։']
    ],
    sectionGuides: 'Տասը զարմանահրաշ համայնքային ուղեցույց',
    sectionGuidesP: 'Տասը լիարժեք ռեսուրսային ուղեցույց, որոնք պատրաստված են Պալատի կողմից եւ սնված անդամ բիզնեսներով։ Որոնելի, դասավորելի եւ միշտ թարմ — հինգ լեզվով։',
    sectionEventsH: 'Միջոցառումներ ձեզ համար',
    sectionEventsP: 'Բիզնես-նախաճաշերից մինչեւ բացման արարողություններ եւ մեր գլխավոր Food & Wine միջոցառումը — Պալատի օրացույցը Ուեսթ Վելլիի սոցիալական օրացույցն է։',
    sectionLeaders: 'Աջակցված այն բիզնեսների կողմից, որոնք կառուցել են այս Հովիտը',
    sectionLeadersP: 'Գործընկերության վեց մակարդակ։ Յուրաքանչյուր դոլար վերաներդրվում է համայնքում։',
    becomeLeader: 'Դարձիր Առաջնորդ',
    advertising: 'Գովազդային փաթեթներ',
    members: 'Անդամներ', sponsors: 'Հովանավորներ', community: 'Համայնք',
    membersP: 'Տեղադրվեք գրացուցակում, գովազդեք ձեր բիզնեսը ուղեցույցների եւ միջոցառումների միջոցով եւ կապ հաստատեք 800+ բիզնեսների հետ ամբողջ Ուեսթ Վելլիում։',
    sponsorsP: 'Պրեմիում տեղադրում գրացուցակում, ուղեցույցների հովանավորություն, միջոցառումների գլխավոր հովանավորություն — ինտեգրված թափանցիկ ավտոմատացված համակարգում։',
    communityP: 'Անվճար բնակիչների համար։ Գտեք բժիշկ, վարձեք կապալառու, պլանավորեք ծննդյան երեկույթ, մասնակցեք փառատոնի — ձեր Հովիտը, պարզեցված։',
    join: 'Միանալ Պալատին', sponsorshipMenu: 'Հովանավորության մենյու', talkConcierge: 'Զրուցել Կոնսիերժի հետ',
    blogTitle: 'Valley Biz Buzz', blogP: 'Նորություններ, անդամների ակնարկներ եւ պատմություններ Տարզանայից, Վուդլենդ Հիլզից, Ռեսեդայից եւ Ուորներ Սենթերից։',
    readBlog: 'Կարդալ բլոգը', guestPost: 'Ուզու՞մ եք ներդրում ունենալ',
    submitPost: 'Ուղարկել հոդված →',
    newsletterTitle: 'Ուեսթ Վելլի Շաբաթական',
    newsletterP: 'Մեկ նամակ ամեն ուրբաթ։ Շաբաթվա միջոցառումները, անդամների ակնարկներ եւ ինչ անել այս հանգստյան օրերին։',
    subscribe: 'Բաժանորդագրվել', emailPh: 'դուք@email.com'
  },
  zh: {
    code: 'zh', name: '中文', dir: 'zh', htmlLang: 'zh', ogLocale: 'zh_CN',
    site: '西谷·华纳中心商会',
    since: '自1930年',
    tagline: '服务于塔扎纳·伍德兰希尔斯·雷塞达·华纳中心',
    title: '西谷华纳中心商会 — 塔扎纳 · 伍德兰希尔斯 · 雷塞达 · 华纳中心',
    desc: '西谷·华纳中心商会自1930年起连接了800多家企业以及塔扎纳、伍德兰希尔斯、雷塞达和华纳中心的居民。',
    eyebrow: '自1930年连接商业与社区',
    h1pre: '西谷的社区引擎',
    h1mid: '现在由', h1mark: '人工智能',
    h1post: '驱动。',
    lead: '探索800多家会员企业，参与活动，找到生活每个阶段的资源，结识让塔扎纳、伍德兰希尔斯、雷塞达和华纳中心持续繁荣的人 — 所有这些都有您的全天候商会礼宾员的帮助。',
    btn1: '浏览800+会员', btn2: '成为会员',
    stat1: '会员企业', stat2: '服务年数', stat3: '年度活动', stat4: '语言',
    askConcierge: '咨询商会礼宾员',
    cards: [
      ['🍴','为约会之夜寻找会员餐厅','按社区、氛围、价格筛选。'],
      ['🛠️','快速雇用经过验证的水管工','会员推荐的家庭专业人员，立即可用。'],
      ['📅','本周末有什么活动？','为家庭、会员和访客精心挑选的活动。'],
      ['🎓','附近的课后项目','来自家长资源指南。']
    ],
    sectionGuides: '十大令人惊叹的社区指南',
    sectionGuidesP: '十个全功能资源指南，由商会精心策划，由会员企业提供支持。可搜索、可排序，始终保持最新 — 五种语言。',
    sectionEventsH: '让您融入的活动',
    sectionEventsP: '从早餐会议到剪彩仪式，再到我们的旗舰美食和葡萄酒活动 — 商会的日历是西谷的社交日历。',
    sectionLeaders: '由建立这个山谷的企业支持',
    sectionLeadersP: '六个合作伙伴层级。每一美元都重新投资于社区。',
    becomeLeader: '成为领导者',
    advertising: '广告套餐',
    members: '会员', sponsors: '赞助商', community: '社区',
    membersP: '在目录中列出，通过指南和活动推广您的业务，并与西谷各地800多家企业建立联系。',
    sponsorsP: '高级目录展示位置、指南赞助、活动主要赞助 — 内置于透明的自动化系统中。',
    communityP: '居民免费。寻找医生，雇用承包商，计划生日聚会，参加节日 — 您的山谷，简化。',
    join: '加入商会', sponsorshipMenu: '赞助菜单', talkConcierge: '与礼宾员交谈',
    blogTitle: 'Valley Biz Buzz', blogP: '塔扎纳、伍德兰希尔斯、雷塞达和华纳中心的新闻、会员聚焦和故事。',
    readBlog: '阅读博客', guestPost: '想投稿吗？',
    submitPost: '提交客座文章 →',
    newsletterTitle: '西谷周刊',
    newsletterP: '每个星期五一封电子邮件。本周的活动、会员聚焦以及本周末的活动建议。',
    subscribe: '订阅', emailPh: '您@邮箱.com'
  }
};

function pageHTML(L) {
  return `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${L.title}</title>
<meta name="description" content="${L.desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="${L.site}">
<meta property="og:description" content="${L.desc}">
<meta property="og:url" content="https://www.woodlandhillscc.net/${L.dir}/">
<meta property="og:image" content="https://www.woodlandhillscc.net/images/wvwccc-og.png">
<meta property="og:locale" content="${L.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://www.woodlandhillscc.net/${L.dir}/">
<link rel="alternate" hreflang="en" href="https://www.woodlandhillscc.net/">
<link rel="alternate" hreflang="es" href="https://www.woodlandhillscc.net/es/">
<link rel="alternate" hreflang="ru" href="https://www.woodlandhillscc.net/ru/">
<link rel="alternate" hreflang="hy" href="https://www.woodlandhillscc.net/hy/">
<link rel="alternate" hreflang="zh" href="https://www.woodlandhillscc.net/zh/">
<link rel="alternate" hreflang="x-default" href="https://www.woodlandhillscc.net/">
<link rel="icon" href="../images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&family=Noto+Sans+Armenian:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/chamber.css">
${L.code === 'hy' ? '<style>body{font-family:"Noto Sans Armenian",Inter,sans-serif;}</style>' : ''}
${L.code === 'zh' ? '<style>body{font-family:"Noto Sans SC",Inter,sans-serif;}</style>' : ''}
</head>
<body>

<header data-partial="header"></header>

<section class="hero">
  <div class="container">
    <div class="hero__inner">
      <div>
        <span class="eyebrow eyebrow--navy">${L.eyebrow}</span>
        <h1>${L.h1pre} ${L.h1mid} <span style="color:var(--gold);">${L.h1mark}</span>${L.h1post}</h1>
        <p class="hero__lead">${L.lead}</p>
        <div class="hero__actions">
          <a href="../members/directory.html" class="btn btn--gold btn--lg">${L.btn1}</a>
          <a href="../join.html" class="btn btn--outline btn--lg" style="border-color:rgba(255,255,255,0.5);color:#fff;">${L.btn2}</a>
        </div>
        <div class="hero__stats">
          <div><div class="hero__stat-num">800+</div><div class="hero__stat-lbl">${L.stat1}</div></div>
          <div><div class="hero__stat-num">95</div><div class="hero__stat-lbl">${L.stat2}</div></div>
          <div><div class="hero__stat-num">200+</div><div class="hero__stat-lbl">${L.stat3}</div></div>
          <div><div class="hero__stat-num">5</div><div class="hero__stat-lbl">${L.stat4}</div></div>
        </div>
      </div>
      <div class="hero__visual">
        <h4>${L.askConcierge}</h4>
        <div class="hero-stack">
          ${L.cards.map(c => `<div class="hero-stack__item"><div class="hero-stack__icon">${c[0]}</div><div><div class="hero-stack__title">${c[1]}</div><div class="hero-stack__desc">${c[2]}</div></div></div>`).join('')}
        </div>
        <a href="../ai-concierge.html" class="btn btn--primary btn--block mt-4">${L.askConcierge} ›</a>
      </div>
    </div>
  </div>
</section>

<section class="section bg-cream">
  <div class="container">
    <div class="section-title">
      <h2>${L.sectionGuides}</h2>
      <p>${L.sectionGuidesP}</p>
    </div>
    <div class="text-center"><a href="../guides/index.html" class="btn btn--primary btn--lg">${L.askConcierge} ›</a></div>
  </div>
</section>

<section class="section bg-paper">
  <div class="container">
    <h2>${L.sectionEventsH}</h2>
    <p class="lead">${L.sectionEventsP}</p>
    <a href="../events/index.html" class="btn btn--primary mt-3">${L.sectionEventsH} ›</a>
  </div>
</section>

<section class="section bg-navy">
  <div class="container">
    <div class="section-title"><h2 style="color:#fff;">${L.sectionLeaders}</h2><p style="color:rgba(255,255,255,0.85);">${L.sectionLeadersP}</p></div>
    <div class="text-center"><a href="../sponsor.html" class="btn btn--gold">${L.becomeLeader} ›</a> <a href="../advertise.html" class="btn btn--outline" style="margin-left:12px;border-color:rgba(255,255,255,0.5);color:#fff;">${L.advertising} ›</a></div>
  </div>
</section>

<section class="section bg-sand">
  <div class="container">
    <div class="grid grid-3" style="gap:32px;">
      <div class="card" style="padding:32px;"><div style="font-size:2rem;">🤝</div><h3 style="margin:16px 0 8px;">${L.members}</h3><p>${L.membersP}</p><a href="../join.html" class="btn btn--outline btn--sm mt-3">${L.join} ›</a></div>
      <div class="card" style="padding:32px;"><div style="font-size:2rem;">📣</div><h3 style="margin:16px 0 8px;">${L.sponsors}</h3><p>${L.sponsorsP}</p><a href="../sponsor.html" class="btn btn--outline btn--sm mt-3">${L.sponsorshipMenu} ›</a></div>
      <div class="card" style="padding:32px;"><div style="font-size:2rem;">🌟</div><h3 style="margin:16px 0 8px;">${L.community}</h3><p>${L.communityP}</p><a href="../ai-concierge.html" class="btn btn--outline btn--sm mt-3">${L.talkConcierge} ›</a></div>
    </div>
  </div>
</section>

<section class="section bg-paper">
  <div class="container">
    <h2>${L.blogTitle}</h2>
    <p class="lead">${L.blogP}</p>
    <a href="../blog/index.html" class="btn btn--outline mt-3">${L.readBlog} ›</a>
    <p class="mt-4 text-sm text-muted">${L.guestPost} <a href="../blog/guest-post.html">${L.submitPost}</a></p>
  </div>
</section>

<section class="section bg-cream">
  <div class="container">
    <div class="card" style="padding:48px;text-align:center;background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;border:none;">
      <h2 style="color:#fff;">${L.newsletterTitle}</h2>
      <p style="color:rgba(255,255,255,0.85);max-width:540px;margin:0 auto 24px;">${L.newsletterP}</p>
      <form style="max-width:480px;margin:0 auto;display:flex;gap:8px;flex-wrap:wrap;">
        <input type="email" placeholder="${L.emailPh}" required style="flex:1;min-width:220px;padding:12px 16px;border-radius:8px;border:none;font-size:1rem;">
        <button type="submit" class="btn btn--gold">${L.subscribe}</button>
      </form>
    </div>
  </div>
</section>

<footer data-partial="footer"></footer>

<script src="../js/partials.js"></script>
<script src="../js/chamber.js"></script>
<script>ChamberPartials.mount({ active: 'home', depth: 1, lang: '${L.code}' });</script>

</body>
</html>`;
}

function build() {
  let count = 0;
  Object.values(LANGS).forEach(L => {
    const dir = path.join(ROOT, L.dir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), pageHTML(L));
    count++;
    console.log(`✓ ${L.dir}/index.html (${L.name})`);
  });
  console.log(`\nGenerated ${count} language pages.`);
}

if (require.main === module) build();
module.exports = { build, LANGS };
