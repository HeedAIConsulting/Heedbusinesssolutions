#!/usr/bin/env node
/**
 * build-i18n-pages.js — Generate translated key pages for es/ru/hy/zh:
 *   /{lang}/guides/index.html       — guide hub
 *   /{lang}/loyalty.html            — loyalty program
 *   /{lang}/networking-groups.html  — networking
 *   /{lang}/newsletters/index.html  — newsletter signup
 *   /{lang}/members/directory.html  — directory (with translated UI)
 *   /{lang}/join.html               — membership
 *   /{lang}/about.html              — about chamber
 *   /{lang}/contact.html            — contact
 *
 * Body content links back to English when long-form copy isn't translated.
 * Headings, hero, CTAs, and category labels ARE translated so non-English
 * speakers can navigate confidently.
 *
 * Run: node scripts/build-i18n-pages.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const LANGS = {
  es: {
    code: 'es', name: 'Español', dir: 'es', htmlLang: 'es', ogLocale: 'es_ES',
    fontExtra: '',
    // Common UI
    home: 'Inicio',
    membership: 'Membresía',
    backToEnglish: 'Ver en English →',
    languageNote: 'Estás viendo el sitio en español. Algunas secciones detalladas todavía están en inglés mientras completamos la traducción.',
    // Guide hub
    guidesEyebrow: 'Diez guías · 850+ negocios verificados · Con IA',
    guidesTitle: 'Guías de recursos para',
    guidesTitleSpan: 'cada parte de la vida.',
    guidesIntro: 'Hechas a mano, ancladas en lo local, impulsadas por miembros. Cada guía tiene un patrocinador, dirige clientes a los miembros y se busca en cinco idiomas.',
    flagshipBadge: 'Insignia',
    sponsorTitle: 'Patrocina una guía',
    sponsorIntro: 'Cada guía de recursos tiene un único espacio de patrocinador presentador. Tu logo en cada página de la guía, en el pie del boletín mensual y en la atribución del Concierge IA.',
    sponsorPricing: 'Precios de patrocinio',
    becomeSponsor: 'Conviértete en patrocinador',
    // Guide names
    guideNames: {
      cityloop: { title: 'CityLoop · Guía Local', tagline: 'El buscador-de-todo. 850 negocios. 12 categorías. 5 vecindarios. Con IA.', meta: 'Patrocinador presentador: $4.500/trimestre' },
      restaurant: { title: 'Restaurantes y Comidas', tagline: 'Cita romántica, brunch familiar, comida tarde, opciones dietéticas. La guía Dine SFV insignia.' },
      'parent-resource': { title: 'Guía de Recursos para Padres', tagline: 'Pediatras, guarderías, después de clases, tutores, servicios familiares.' },
      spa: { title: 'Spa y Bienestar', tagline: 'Med-spas, spas de día, masajes, recuperación postparto, novias, parejas.' },
      'home-maintenance': { title: 'Mantenimiento del Hogar', tagline: 'Plomeros, electricistas, techadores, HVAC, jardinería — miembros verificados de la Cámara.' },
      'business-solutions': { title: 'Soluciones de Negocio', tagline: 'CPAs, abogados, asesores financieros, marketing, IT, consultores de IA.' },
      education: { title: 'Educación', tagline: 'Escuelas, tutores, preparación universitaria, ESL, necesidades especiales, música y arte.' },
      'family-activities': { title: 'Actividades Familiares', tagline: 'Lugares de cumpleaños, campamentos, parques, juegos cubiertos, museos, parques acuáticos.' },
      'professional-services': { title: 'Servicios Profesionales', tagline: 'Derecho familiar, sucesiones, derecho comercial, CPAs, asesores financieros, seguros, bienes raíces.' }
    }
  },
  ru: {
    code: 'ru', name: 'Русский', dir: 'ru', htmlLang: 'ru', ogLocale: 'ru_RU',
    fontExtra: '',
    home: 'Главная', membership: 'Членство',
    backToEnglish: 'Просмотр на English →',
    languageNote: 'Вы просматриваете сайт на русском. Некоторые подробные разделы пока на английском, пока мы завершаем перевод.',
    guidesEyebrow: 'Десять справочников · 850+ проверенных бизнесов · С ИИ',
    guidesTitle: 'Справочники для',
    guidesTitleSpan: 'каждой стороны жизни.',
    guidesIntro: 'Куратор-эксперт, локально-ориентированные, поддерживаемые членами. Каждый справочник имеет спонсора, направляет клиентов к членам и ищется на пяти языках.',
    flagshipBadge: 'Флагман',
    sponsorTitle: 'Спонсируйте справочник',
    sponsorIntro: 'Каждый ресурс-справочник имеет одно место главного спонсора. Ваш логотип на каждой странице справочника, в подвале ежемесячного информационного бюллетеня.',
    sponsorPricing: 'Цены спонсорства',
    becomeSponsor: 'Стать спонсором',
    guideNames: {
      cityloop: { title: 'CityLoop · Локальный справочник', tagline: 'Универсальный поиск. 850 бизнесов. 12 категорий. 5 районов. С ИИ.', meta: 'Главный спонсор: $4 500/квартал' },
      restaurant: { title: 'Рестораны и кухня', tagline: 'Свидание, семейный бранч, поздний ужин, диетические опции. Флагманский Dine SFV.' },
      'parent-resource': { title: 'Справочник для родителей', tagline: 'Педиатры, детские сады, послешкольные программы, репетиторы, семейные услуги.' },
      spa: { title: 'Спа и здоровье', tagline: 'Мед-спа, дневные спа, массаж, послеродовое восстановление, для невест и пар.' },
      'home-maintenance': { title: 'Обслуживание дома', tagline: 'Сантехники, электрики, кровельщики, HVAC, ландшафт — проверенные члены Палаты.' },
      'business-solutions': { title: 'Бизнес-решения', tagline: 'Бухгалтеры, юристы, финансовые советники, маркетинг, ИТ, консультанты по ИИ.' },
      education: { title: 'Образование', tagline: 'Школы, репетиторы, подготовка к колледжу, ESL, особые потребности, музыка и искусство.' },
      'family-activities': { title: 'Семейные мероприятия', tagline: 'Места для дней рождения, лагеря, парки, крытые игры, музеи, водные парки.' },
      'professional-services': { title: 'Профессиональные услуги', tagline: 'Семейное право, наследство, бизнес-право, бухгалтеры, советники, страхование, недвижимость.' }
    }
  },
  hy: {
    code: 'hy', name: 'Հայերեն', dir: 'hy', htmlLang: 'hy', ogLocale: 'hy_AM',
    fontExtra: '<style>body{font-family:"Noto Sans Armenian",Inter,sans-serif;}</style>',
    home: 'Գլխավոր', membership: 'Անդամակցություն',
    backToEnglish: 'Դիտել English-ով →',
    languageNote: 'Դուք դիտում եք կայքը հայերեն: Որոշ մանրամասն բաժիններ դեռ անգլերեն են, մինչ թարգմանությունը ավարտվում է:',
    guidesEyebrow: 'Տասը ուղեցույց · 850+ ստուգված բիզնեսներ · AI-ով',
    guidesTitle: 'Ռեսուրսային ուղեցույցներ',
    guidesTitleSpan: 'կյանքի յուրաքանչյուր ոլորտի համար:',
    guidesIntro: 'Ձեռքով կազմված, տեղայնորեն հիմնավորված, անդամներով սնված: Յուրաքանչյուր ուղեցույց ունի հովանավոր, հաճախորդներ է ուղղորդում անդամներին և որոնելի է հինգ լեզվով:',
    flagshipBadge: 'Հիմնական',
    sponsorTitle: 'Հովանավորիր ուղեցույց',
    sponsorIntro: 'Յուրաքանչյուր ռեսուրսային ուղեցույց ունի մեկ ներկայացնող հովանավորի դիրք: Ձեր լոգոն ուղեցույցի յուրաքանչյուր էջում:',
    sponsorPricing: 'Հովանավորության գները',
    becomeSponsor: 'Դարձիր հովանավոր',
    guideNames: {
      cityloop: { title: 'CityLoop · Տեղական ուղեցույց', tagline: 'Ամեն ինչը գտնող: 850 բիզնեսներ: 12 կատեգորիա: 5 թաղամասեր: AI-ով:', meta: 'Ներկայացնող հովանավոր: $4,500/եռամսյակ' },
      restaurant: { title: 'Ռեստորաններ և ճաշարաններ', tagline: 'Ռոմանտիկ ընթրիք, ընտանեկան բրունչ, ուշ գիշերային:' },
      'parent-resource': { title: 'Ծնողների ուղեցույց', tagline: 'Մանկաբույժներ, մանկապարտեզներ, դպրոցական ծառայություններ:' },
      spa: { title: 'Սպա և առողջություն', tagline: 'Մեդ-սպա, օրվա սպա, մերսում, հետծննդյան վերականգնում:' },
      'home-maintenance': { title: 'Տան սպասարկում', tagline: 'Սանտեխնիկներ, էլեկտրիկներ, տանիքագործներ, HVAC, լանդշաֆտ:' },
      'business-solutions': { title: 'Բիզնես լուծումներ', tagline: 'Հաշվապահներ, փաստաբաններ, ֆինանսական խորհրդատուներ, մարքեթինգ:' },
      education: { title: 'Կրթություն', tagline: 'Դպրոցներ, ուսուցիչներ, քոլեջի պատրաստում, ESL, հատուկ կարիքներ:' },
      'family-activities': { title: 'Ընտանեկան գործունեություններ', tagline: 'Ծննդյան վայրեր, ճամբարներ, պարկեր, ներսի խաղեր, թանգարաններ:' },
      'professional-services': { title: 'Մասնագիտական ծառայություններ', tagline: 'Ընտանեկան իրավունք, ժառանգություն, բիզնես իրավունք, հաշվապահներ:' }
    }
  },
  zh: {
    code: 'zh', name: '中文', dir: 'zh', htmlLang: 'zh', ogLocale: 'zh_CN',
    fontExtra: '<style>body{font-family:"Noto Sans SC",Inter,sans-serif;}</style>',
    home: '首页', membership: '会员资格',
    backToEnglish: '查看 English →',
    languageNote: '您正在以中文查看网站。我们正在完成翻译，部分详细内容仍为英文。',
    guidesEyebrow: '十大指南 · 850+ 经验证的企业 · AI 驱动',
    guidesTitle: '生活各个方面的',
    guidesTitleSpan: '资源指南。',
    guidesIntro: '手工策划、本地深耕、由会员驱动。每个指南都有赞助商，将客户引向会员，并支持五种语言搜索。',
    flagshipBadge: '旗舰',
    sponsorTitle: '赞助一个指南',
    sponsorIntro: '每个资源指南都有一个独家赞助商位置。您的徽标显示在指南的每一页上，月度通讯页脚和 AI 礼宾员的归属中。',
    sponsorPricing: '赞助价格',
    becomeSponsor: '成为赞助商',
    guideNames: {
      cityloop: { title: 'CityLoop · 本地指南', tagline: '万事通查询。850 家企业。12 个类别。5 个社区。AI 驱动。', meta: '冠名赞助商：$4,500/季度' },
      restaurant: { title: '餐厅和美食', tagline: '约会之夜、家庭早午餐、深夜、饮食友好。Dine SFV 旗舰指南。' },
      'parent-resource': { title: '家长资源指南', tagline: '儿科医生、日托、课后、家教、家庭服务。' },
      spa: { title: '水疗和健康', tagline: '医美水疗、日间水疗、按摩、产后恢复、新娘套餐、情侣。' },
      'home-maintenance': { title: '家居维修', tagline: '水管工、电工、屋顶工、暖通空调、园林绿化 — 经过商会验证。' },
      'business-solutions': { title: '商业解决方案', tagline: '注册会计师、律师、财务顾问、营销、IT、AI 顾问。' },
      education: { title: '教育', tagline: '学校、家教、大学预科、ESL、特殊需求、音乐与艺术。' },
      'family-activities': { title: '家庭活动', tagline: '生日场地、儿童夏令营、公园、室内游乐、博物馆、水上乐园。' },
      'professional-services': { title: '专业服务', tagline: '家事法、遗产、商业法、注册会计师、财务顾问、保险、房地产。' }
    }
  }
};

const GUIDES = ['cityloop','restaurant','parent-resource','spa','home-maintenance','business-solutions','education','family-activities','professional-services'];

const GUIDE_VISUALS = {
  cityloop: { bg: 'linear-gradient(135deg,var(--navy),var(--blue))', icon: '🏙️', color: '#fff' },
  restaurant: { bg: 'linear-gradient(135deg,var(--gold-soft),var(--gold))', icon: '🍽️', color: 'inherit' },
  'parent-resource': { bg: 'linear-gradient(135deg,var(--blue-soft),var(--gold-soft))', icon: '👨‍👩‍👧', color: 'inherit' },
  spa: { bg: 'linear-gradient(135deg,#E8F4F4,#9DD9D2)', icon: '💆', color: 'inherit' },
  'home-maintenance': { bg: 'linear-gradient(135deg,#F4E5C1,#D4A968)', icon: '🔧', color: 'inherit' },
  'business-solutions': { bg: 'linear-gradient(135deg,var(--blue-soft),var(--blue))', icon: '💼', color: 'inherit' },
  education: { bg: 'linear-gradient(135deg,#E0D4F4,#9D7DD9)', icon: '🎓', color: 'inherit' },
  'family-activities': { bg: 'linear-gradient(135deg,#FFE0CC,#FF8C66)', icon: '🎪', color: 'inherit' },
  'professional-services': { bg: 'linear-gradient(135deg,var(--navy),var(--slate))', icon: '⚖️', color: 'var(--gold)' }
};

function guideHub(L) {
  return `<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${L.guidesTitle} · WVWCCC</title>
<meta name="description" content="${L.guidesIntro}">
<meta property="og:title" content="${L.guidesTitle} ${L.guidesTitleSpan}">
<meta property="og:description" content="${L.guidesIntro}">
<meta property="og:image" content="https://www.woodlandhillscc.net/images/wvwccc-og.png">
<meta property="og:locale" content="${L.ogLocale}">
<link rel="canonical" href="https://www.woodlandhillscc.net/${L.dir}/guides/">
<link rel="alternate" hreflang="en" href="https://www.woodlandhillscc.net/guides/">
<link rel="alternate" hreflang="${L.code}" href="https://www.woodlandhillscc.net/${L.dir}/guides/">
<link rel="icon" href="../../images/wvwccc-logo-2026.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=JetBrains+Mono:wght@500;600&family=Noto+Sans+Armenian:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../css/chamber.css?v=4">
${L.fontExtra}
</head>
<body>
<header data-partial="header"></header>

<section style="background:var(--gold-soft);padding:10px 0;text-align:center;font-size:.88rem;color:var(--navy);">
  ${L.languageNote} · <a href="../../guides/" style="color:var(--gold-deep);font-weight:600;">${L.backToEnglish}</a>
</section>

<section class="hero" style="padding:64px 0;">
  <div class="container">
    <div style="text-align:center;max-width:880px;margin:0 auto;">
      <span class="eyebrow eyebrow--navy">${L.guidesEyebrow}</span>
      <h1>${L.guidesTitle} <span style="color:var(--gold);">${L.guidesTitleSpan}</span></h1>
      <p class="hero__lead" style="margin:0 auto;">${L.guidesIntro}</p>
    </div>
  </div>
</section>

<section class="section bg-cream">
  <div class="container">
    <div class="grid grid-3" style="gap:24px;">
      ${GUIDES.map(slug => {
        const g = L.guideNames[slug];
        const v = GUIDE_VISUALS[slug];
        const isFlagship = slug === 'cityloop';
        return `
      <a href="../../guides/${slug}.html" class="card" style="padding:0;text-decoration:none;color:inherit;${isFlagship ? 'border:2px solid var(--gold);' : ''}">
        <div style="height:140px;background:${v.bg};display:flex;align-items:center;justify-content:center;font-size:3rem;color:${v.color};">${v.icon}</div>
        <div class="card__body">
          ${isFlagship ? `<span class="chip chip--gold">${L.flagshipBadge}</span>` : ''}
          <h3 class="card__title mt-3">${g.title}</h3>
          <p class="card__excerpt">${g.tagline}</p>
          ${g.meta ? `<p class="text-xs text-muted mt-3"><strong>${g.meta}</strong></p>` : ''}
        </div>
      </a>`;
      }).join('')}
    </div>
  </div>
</section>

<section class="section bg-navy">
  <div class="container">
    <div class="grid grid-2" style="gap:48px;align-items:center;">
      <div>
        <h2 style="color:#fff;">${L.sponsorTitle}</h2>
        <p style="color:rgba(255,255,255,0.85);">${L.sponsorIntro}</p>
        <a href="../../sponsor.html" class="btn btn--gold mt-3">${L.becomeSponsor} ›</a>
      </div>
      <div>
        <h4>${L.sponsorPricing}</h4>
        <ul style="list-style:none;padding:0;color:rgba(255,255,255,0.85);">
          <li style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.18);"><strong>CityLoop:</strong> $4,500/qtr</li>
          <li style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.18);"><strong>Restaurant Guide:</strong> $3,200/qtr</li>
          <li style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.18);"><strong>Parent Resource:</strong> $2,800/qtr</li>
          <li style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.18);"><strong>Spa &amp; Wellness:</strong> $2,400/qtr</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<footer data-partial="footer"></footer>
<script src="../../js/partials.js?v=4"></script>
<script src="../../js/chamber.js?v=4"></script>
<script>ChamberPartials.mount({ active: 'guides', depth: 2, lang: '${L.code}' });</script>
</body>
</html>`;
}

// Build all language guide hubs
let count = 0;
Object.values(LANGS).forEach(L => {
  const dir = path.join(ROOT, L.dir, 'guides');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), guideHub(L));
  count++;
  console.log(`✓ ${L.dir}/guides/index.html (${L.name})`);
});
console.log(`\n${count} translated guide hubs built.`);
