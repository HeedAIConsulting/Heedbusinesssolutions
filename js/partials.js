/* ============================================================
   WVWCCC — Shared header & footer partials
   Pages call window.ChamberPartials.mount({ active, depth, lang })
   depth = 0 root, 1 subdir (e.g. /members/), 2 nested (e.g. /es/blog/)
   lang = 'en' (default), 'es', 'ru', 'hy', 'zh'
   ============================================================ */

window.ChamberPartials = (function () {
  function p(depth, path) { return ('../'.repeat(depth)) + path; }

  // i18n strings — extend as we ship language versions
  var I18N = {
    en: {
      since: 'Since 1930',
      tagline: 'Serving Tarzana · Woodland Hills · Reseda · Warner Center',
      memberLogin: 'Member Login', staff: 'Staff', contact: 'Contact',
      home: 'Home', theChamber: 'The Chamber', ourCommunity: 'Our Community',
      gratefulHearts: 'Grateful Hearts', events: 'Events', chamberProfiles: 'Chamber Profiles',
      joinNow: 'Join Now', valleyBizBuzz: 'Valley Biz Buzz', diningGuide: 'Dining Guide',
      donate: 'Donate', directory: 'Directory', news: 'News', calendar: 'Calendar',
      // Mega-menu
      social: 'Social', searchMembers: 'Search Members', communityForum: 'Community Forum',
      gallery: 'Gallery', jobBoard: 'Job Board', communityChoiceAwards: 'Community Choice Awards',
      adoptASchool: 'Adopt-a-School', connectionCircles: 'Connection Circles',
      youngProfessionals: 'Young Professionals Network',
      membership: 'Membership', benefits: 'Benefits of Membership',
      memberDeals: 'Member-to-Member Deals', newMembers: 'New Members',
      renewing: 'Renewing Members', advertising: 'Advertising Opportunities',
      committees: 'Committees',
      aboutUs: 'About Us', boardLetter: 'Letter From the Board President',
      ceoLetter: 'Letter From the CEO', boardOfDirectors: 'Board of Directors',
      chamberStaff: 'Chamber Staff', wellnessNetwork: 'Wellness Resource Network',
      ambassadors: 'Ambassadors', leaders: 'Leaders', partnerships: 'Partnerships',
      history: 'History', demographics: 'Demographics',
      woodlandHills: 'Woodland Hills', reseda: 'Reseda', tarzana: 'Tarzana',
      warnerCenter: 'Warner Center', westValley: 'West Valley',
      cbf: 'Community Benefit Foundation',
      resources: 'Resources', dineSFV: 'Dine SFV',
      communityResources: 'Community Resources', visitorCenter: 'Visitor Center',
      attractions: 'Attractions', hotels: 'Hotels & Motels', schools: 'Schools',
      utilities: 'Utilities', seniorCitizens: 'Senior Citizens', banks: 'Banks',
      importantPhones: 'Important Phone Numbers', links: 'Useful Links',
      // Footer
      members: 'Members', resourcesFooter: 'Resources', engage: 'Engage', about: 'About',
      footerTag: 'Connecting the businesses and residents of Tarzana, Woodland Hills, Reseda, and the Warner Center for nearly a century.',
      copyright: '© 2026 West Valley ~ Warner Center Chamber of Commerce. All rights reserved.',
      rebuiltBy: 'Site rebuilt by',
      // Languages
      languages: 'Languages',
      english: 'English', spanish: 'Español', russian: 'Русский', armenian: 'Հայերեն', chinese: '中文',
      // Concierge
      askConcierge: 'Ask the Chamber Concierge'
    },
    es: {
      since: 'Desde 1930',
      tagline: 'Sirviendo a Tarzana · Woodland Hills · Reseda · Warner Center',
      memberLogin: 'Iniciar sesión', staff: 'Personal', contact: 'Contacto',
      home: 'Inicio', theChamber: 'La Cámara', ourCommunity: 'Nuestra Comunidad',
      gratefulHearts: 'Corazones Agradecidos', events: 'Eventos', chamberProfiles: 'Perfiles',
      joinNow: 'Hazte Miembro', valleyBizBuzz: 'Valley Biz Buzz', diningGuide: 'Guía Gastronómica',
      donate: 'Donar', directory: 'Directorio', news: 'Noticias', calendar: 'Calendario',
      social: 'Social', searchMembers: 'Buscar Miembros', communityForum: 'Foro Comunitario',
      gallery: 'Galería', jobBoard: 'Bolsa de Trabajo', communityChoiceAwards: 'Premios Comunitarios',
      adoptASchool: 'Adopta una Escuela', connectionCircles: 'Círculos de Conexión',
      youngProfessionals: 'Red de Jóvenes Profesionales',
      membership: 'Membresía', benefits: 'Beneficios de Membresía',
      memberDeals: 'Ofertas Entre Miembros', newMembers: 'Nuevos Miembros',
      renewing: 'Renovaciones', advertising: 'Oportunidades de Publicidad',
      committees: 'Comités',
      aboutUs: 'Sobre Nosotros', boardLetter: 'Carta del Presidente',
      ceoLetter: 'Carta del CEO', boardOfDirectors: 'Junta Directiva',
      chamberStaff: 'Personal de la Cámara', wellnessNetwork: 'Red de Bienestar',
      ambassadors: 'Embajadores', leaders: 'Líderes', partnerships: 'Asociaciones',
      history: 'Historia', demographics: 'Demografía',
      woodlandHills: 'Woodland Hills', reseda: 'Reseda', tarzana: 'Tarzana',
      warnerCenter: 'Warner Center', westValley: 'West Valley',
      cbf: 'Fundación de Beneficio Comunitario',
      resources: 'Recursos', dineSFV: 'Comer en SFV',
      communityResources: 'Recursos Comunitarios', visitorCenter: 'Centro de Visitantes',
      attractions: 'Atracciones', hotels: 'Hoteles', schools: 'Escuelas',
      utilities: 'Servicios Públicos', seniorCitizens: 'Adultos Mayores', banks: 'Bancos',
      importantPhones: 'Teléfonos Importantes', links: 'Enlaces',
      members: 'Miembros', resourcesFooter: 'Recursos', engage: 'Participa', about: 'Acerca de',
      footerTag: 'Conectando a los negocios y residentes de Tarzana, Woodland Hills, Reseda y Warner Center desde hace casi un siglo.',
      copyright: '© 2026 Cámara de Comercio West Valley · Warner Center. Todos los derechos reservados.',
      rebuiltBy: 'Sitio reconstruido por',
      languages: 'Idiomas',
      english: 'English', spanish: 'Español', russian: 'Русский', armenian: 'Հայերեն', chinese: '中文',
      askConcierge: 'Pregúntale al Concierge'
    },
    ru: {
      since: 'С 1930 года',
      tagline: 'Обслуживаем Тарзану · Вудленд-Хиллз · Реседу · Уорнер Центр',
      memberLogin: 'Вход для участников', staff: 'Сотрудники', contact: 'Контакт',
      home: 'Главная', theChamber: 'Палата', ourCommunity: 'Сообщество',
      gratefulHearts: 'Благодарные Сердца', events: 'События', chamberProfiles: 'Профили',
      joinNow: 'Стать членом', valleyBizBuzz: 'Valley Biz Buzz', diningGuide: 'Рестораны',
      donate: 'Пожертвовать', directory: 'Каталог', news: 'Новости', calendar: 'Календарь',
      social: 'Соцсети', searchMembers: 'Найти участника', communityForum: 'Форум',
      gallery: 'Галерея', jobBoard: 'Вакансии', communityChoiceAwards: 'Народные премии',
      adoptASchool: 'Усынови школу', connectionCircles: 'Круги связи',
      youngProfessionals: 'Сеть молодых профессионалов',
      membership: 'Членство', benefits: 'Преимущества',
      memberDeals: 'Скидки участникам', newMembers: 'Новые участники',
      renewing: 'Продление', advertising: 'Рекламные возможности',
      committees: 'Комитеты',
      aboutUs: 'О нас', boardLetter: 'Письмо председателя',
      ceoLetter: 'Письмо CEO', boardOfDirectors: 'Совет директоров',
      chamberStaff: 'Сотрудники Палаты', wellnessNetwork: 'Сеть здоровья',
      ambassadors: 'Послы', leaders: 'Лидеры', partnerships: 'Партнёрства',
      history: 'История', demographics: 'Демография',
      woodlandHills: 'Вудленд-Хиллз', reseda: 'Реседа', tarzana: 'Тарзана',
      warnerCenter: 'Уорнер Центр', westValley: 'Уэст-Вэлли',
      cbf: 'Фонд общественной пользы',
      resources: 'Ресурсы', dineSFV: 'Рестораны SFV',
      communityResources: 'Ресурсы сообщества', visitorCenter: 'Центр для посетителей',
      attractions: 'Достопримечательности', hotels: 'Отели', schools: 'Школы',
      utilities: 'Коммунальные услуги', seniorCitizens: 'Пожилые', banks: 'Банки',
      importantPhones: 'Важные телефоны', links: 'Ссылки',
      members: 'Участники', resourcesFooter: 'Ресурсы', engage: 'Участие', about: 'О нас',
      footerTag: 'Связываем бизнесы и жителей Тарзаны, Вудленд-Хиллз, Реседы и Уорнер Центра почти столетие.',
      copyright: '© 2026 Торговая палата Уэст-Вэлли · Уорнер Центр. Все права защищены.',
      rebuiltBy: 'Сайт обновлён',
      languages: 'Языки',
      english: 'English', spanish: 'Español', russian: 'Русский', armenian: 'Հայերեն', chinese: '中文',
      askConcierge: 'Спросите консьержа'
    },
    hy: {
      since: '1930-ից',
      tagline: 'Ծառայում ենք Տարզանա · Վուդլենդ Հիլզ · Ռեսեդա · Ուորներ Սենթեր',
      memberLogin: 'Անդամի մուտք', staff: 'Անձնակազմ', contact: 'Կապ',
      home: 'Գլխավոր', theChamber: 'Պալատ', ourCommunity: 'Մեր Համայնքը',
      gratefulHearts: 'Շնորհակալ Սրտեր', events: 'Միջոցառումներ', chamberProfiles: 'Պրոֆիլներ',
      joinNow: 'Միանալ', valleyBizBuzz: 'Valley Biz Buzz', diningGuide: 'Ճաշարաններ',
      donate: 'Նվիրաբերել', directory: 'Տեղեկատու', news: 'Նորություններ', calendar: 'Օրացույց',
      social: 'Սոցիալական', searchMembers: 'Որոնել անդամ', communityForum: 'Ֆորում',
      gallery: 'Պատկերասրահ', jobBoard: 'Աշխատատեղեր', communityChoiceAwards: 'Համայնքի մրցանակներ',
      adoptASchool: 'Որդեգրիր դպրոց', connectionCircles: 'Կապի շրջանակներ',
      youngProfessionals: 'Երիտասարդ մասնագետներ',
      membership: 'Անդամակցություն', benefits: 'Անդամակցության օգուտներ',
      memberDeals: 'Անդամների առաջարկներ', newMembers: 'Նոր անդամներ',
      renewing: 'Թարմացում', advertising: 'Գովազդային հնարավորություններ',
      committees: 'Հանձնաժողովներ',
      aboutUs: 'Մեր մասին', boardLetter: 'Նախագահի նամակը',
      ceoLetter: 'Գործադիր տնօրենի նամակը', boardOfDirectors: 'Տնօրենների խորհուրդ',
      chamberStaff: 'Պալատի անձնակազմ', wellnessNetwork: 'Առողջության ցանց',
      ambassadors: 'Դեսպաններ', leaders: 'Առաջնորդներ', partnerships: 'Համագործակցություններ',
      history: 'Պատմություն', demographics: 'Ժողովրդագրություն',
      woodlandHills: 'Վուդլենդ Հիլզ', reseda: 'Ռեսեդա', tarzana: 'Տարզանա',
      warnerCenter: 'Ուորներ Սենթեր', westValley: 'Ուեսթ Վելլի',
      cbf: 'Համայնքային Բարօրության Հիմնադրամ',
      resources: 'Ռեսուրսներ', dineSFV: 'Ճաշել SFV',
      communityResources: 'Համայնքի ռեսուրսներ', visitorCenter: 'Այցելուների կենտրոն',
      attractions: 'Տեսարժան վայրեր', hotels: 'Հյուրանոցներ', schools: 'Դպրոցներ',
      utilities: 'Կոմունալ', seniorCitizens: 'Տարեցներ', banks: 'Բանկեր',
      importantPhones: 'Կարևոր հեռախոսներ', links: 'Հղումներ',
      members: 'Անդամներ', resourcesFooter: 'Ռեսուրսներ', engage: 'Ներգրավվել', about: 'Մեր մասին',
      footerTag: 'Միացնում ենք Տարզանայի, Վուդլենդ Հիլզի, Ռեսեդայի եւ Ուորներ Սենթերի բիզնեսներն ու բնակիչներին մոտ մեկ դարի ընթացքում։',
      copyright: '© 2026 Ուեսթ Վելլի · Ուորներ Սենթեր Առևտրապալատ։ Բոլոր իրավունքները պաշտպանված են։',
      rebuiltBy: 'Կայքը վերակառուցել է',
      languages: 'Լեզուներ',
      english: 'English', spanish: 'Español', russian: 'Русский', armenian: 'Հայերեն', chinese: '中文',
      askConcierge: 'Հարցրեք Կոնսիերժին'
    },
    zh: {
      since: '自1930年',
      tagline: '服务于塔扎纳 · 伍德兰希尔斯 · 雷塞达 · 华纳中心',
      memberLogin: '会员登录', staff: '员工', contact: '联系',
      home: '首页', theChamber: '商会', ourCommunity: '我们的社区',
      gratefulHearts: '感恩之心', events: '活动', chamberProfiles: '档案',
      joinNow: '立即加入', valleyBizBuzz: 'Valley Biz Buzz', diningGuide: '美食指南',
      donate: '捐赠', directory: '会员目录', news: '新闻', calendar: '日历',
      social: '社交', searchMembers: '搜索会员', communityForum: '社区论坛',
      gallery: '画廊', jobBoard: '招聘版', communityChoiceAwards: '社区选择奖',
      adoptASchool: '认领学校', connectionCircles: '连接圈',
      youngProfessionals: '青年专业人士网络',
      membership: '会员资格', benefits: '会员福利',
      memberDeals: '会员优惠', newMembers: '新会员',
      renewing: '续费', advertising: '广告机会',
      committees: '委员会',
      aboutUs: '关于我们', boardLetter: '主席致信',
      ceoLetter: 'CEO致信', boardOfDirectors: '董事会',
      chamberStaff: '商会员工', wellnessNetwork: '健康网络',
      ambassadors: '大使', leaders: '领导者', partnerships: '合作伙伴',
      history: '历史', demographics: '人口统计',
      woodlandHills: '伍德兰希尔斯', reseda: '雷塞达', tarzana: '塔扎纳',
      warnerCenter: '华纳中心', westValley: '西谷',
      cbf: '社区福利基金会',
      resources: '资源', dineSFV: '在SFV用餐',
      communityResources: '社区资源', visitorCenter: '游客中心',
      attractions: '景点', hotels: '酒店', schools: '学校',
      utilities: '公用事业', seniorCitizens: '老年人', banks: '银行',
      importantPhones: '重要电话', links: '链接',
      members: '会员', resourcesFooter: '资源', engage: '参与', about: '关于',
      footerTag: '近一个世纪以来连接塔扎纳、伍德兰希尔斯、雷塞达和华纳中心的企业和居民。',
      copyright: '© 2026 西谷·华纳中心商会。版权所有。',
      rebuiltBy: '网站由',
      languages: '语言',
      english: 'English', spanish: 'Español', russian: 'Русский', armenian: 'Հայերեն', chinese: '中文',
      askConcierge: '咨询礼宾员'
    }
  };

  function t(lang, key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  function logoBlock(depth, light) {
    return `
      <a href="${p(depth, 'index.html')}" class="brand">
        <img src="${p(depth, 'images/wvwccc-logo-2026.png')}" alt="West Valley Warner Center Chamber of Commerce" class="brand__logo" width="64" height="64" loading="eager">
        <div class="brand__text">
          <div class="brand__name"${light ? ' style="color:#fff;"' : ''}>West Valley · Warner Center</div>
          <div class="brand__sub">Chamber of Commerce · Since 1930</div>
        </div>
      </a>`;
  }

  function header(active, depth, lang) {
    lang = lang || 'en';
    var L = function(k) { return t(lang, k); };
    return `
<header class="site-header">
  <div class="site-header__top">
    <div class="container">
      <div class="site-header__top-meta">
        <span>📞 (818) 347-4737</span>
        <span>📍 ${L('tagline')}</span>
        <span>🕒 ${L('since')}</span>
      </div>
      <div class="site-header__top-actions">
        <div class="lang-switcher">
          <button class="lang-switcher__btn" aria-haspopup="true" aria-expanded="false">🌐 ${lang === 'es' ? 'ES' : lang === 'ru' ? 'RU' : lang === 'hy' ? 'HY' : lang === 'zh' ? 'ZH' : 'EN'} ▾</button>
          <div class="lang-switcher__menu">
            <a href="${p(depth, 'index.html')}">${L('english')}</a>
            <a href="${p(depth, 'es/index.html')}">${L('spanish')}</a>
            <a href="${p(depth, 'ru/index.html')}">${L('russian')}</a>
            <a href="${p(depth, 'hy/index.html')}">${L('armenian')}</a>
            <a href="${p(depth, 'zh/index.html')}">${L('chinese')}</a>
          </div>
        </div>
        <span class="dot-sep">·</span>
        <a href="${p(depth, 'auth/member-login.html')}">${L('memberLogin')}</a>
        <span class="dot-sep">·</span>
        <a href="${p(depth, 'auth/staff-login.html')}">${L('staff')}</a>
        <span class="dot-sep">·</span>
        <a href="${p(depth, 'contact.html')}">${L('contact')}</a>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="site-header__main">
      ${logoBlock(depth, false)}
      <nav class="nav" aria-label="Main">
        <a href="${p(depth, 'index.html')}" ${active==='home'?'class="active"':''}>${L('home')}</a>

        <div class="nav-item nav-item--has-mega ${active==='chamber'?'active':''}">
          <a href="${p(depth, 'about.html')}">${L('theChamber')} ▾</a>
          <div class="mega-menu">
            <div class="mega-menu__col">
              <h4>${L('social')}</h4>
              <a href="${p(depth, 'members/directory.html')}">${L('searchMembers')}</a>
              <a href="${p(depth, 'profiles/index.html')}">${L('chamberProfiles')}</a>
              <a href="${p(depth, 'community/forum.html')}">${L('communityForum')}</a>
              <a href="${p(depth, 'community/gallery.html')}">${L('gallery')}</a>
              <a href="${p(depth, 'community/jobs.html')}">${L('jobBoard')}</a>
              <a href="${p(depth, 'community/awards.html')}">${L('communityChoiceAwards')}</a>
              <a href="${p(depth, 'community/adopt-a-school.html')}">${L('adoptASchool')}</a>
              <a href="${p(depth, 'community/connection-circles.html')}">${L('connectionCircles')}</a>
              <a href="${p(depth, 'community/young-professionals.html')}">${L('youngProfessionals')}</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('membership')}</h4>
              <a href="${p(depth, 'members/directory.html')}">${L('directory')}</a>
              <a href="${p(depth, 'join.html')}">${L('joinNow')}</a>
              <a href="${p(depth, 'benefits.html')}">${L('benefits')}</a>
              <a href="${p(depth, 'member-deals.html')}">${L('memberDeals')}</a>
              <a href="${p(depth, 'members/new.html')}">${L('newMembers')}</a>
              <a href="${p(depth, 'members/renewing.html')}">${L('renewing')}</a>
              <a href="${p(depth, 'advertise.html')}">${L('advertising')}</a>
              <a href="${p(depth, 'committees.html')}">${L('committees')}</a>
              <a href="${p(depth, 'referral.html')}">Referral Program</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('aboutUs')}</h4>
              <a href="${p(depth, 'about.html')}">${L('aboutUs')}</a>
              <a href="${p(depth, 'about/board-letter.html')}">${L('boardLetter')}</a>
              <a href="${p(depth, 'about/ceo-letter.html')}">${L('ceoLetter')}</a>
              <a href="${p(depth, 'about/board.html')}">${L('boardOfDirectors')}</a>
              <a href="${p(depth, 'about/staff.html')}">${L('chamberStaff')}</a>
              <a href="${p(depth, 'about/wellness-network.html')}">${L('wellnessNetwork')}</a>
              <a href="${p(depth, 'about/ambassadors.html')}">${L('ambassadors')}</a>
              <a href="${p(depth, 'about/leaders.html')}">${L('leaders')}</a>
              <a href="${p(depth, 'about/partnerships.html')}">${L('partnerships')}</a>
            </div>
          </div>
        </div>

        <div class="nav-item nav-item--has-mega ${active==='community'?'active':''}">
          <a href="${p(depth, 'community/index.html')}">${L('ourCommunity')} ▾</a>
          <div class="mega-menu">
            <div class="mega-menu__col">
              <h4>${L('history')}</h4>
              <a href="${p(depth, 'community/history.html')}">${L('history')}</a>
              <a href="${p(depth, 'community/demographics.html')}">${L('demographics')}</a>
              <a href="${p(depth, 'community/district-3.html')}">District 3</a>
              <a href="${p(depth, 'community/woodland-hills.html')}">${L('woodlandHills')}</a>
              <a href="${p(depth, 'community/reseda.html')}">${L('reseda')}</a>
              <a href="${p(depth, 'community/tarzana.html')}">${L('tarzana')}</a>
              <a href="${p(depth, 'community/warner-center.html')}">${L('warnerCenter')}</a>
              <a href="${p(depth, 'community/west-valley.html')}">${L('westValley')}</a>
              <a href="${p(depth, 'community/foundation.html')}">${L('cbf')}</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('resources')}</h4>
              <a href="${p(depth, 'guides/index.html')}">All Resource Guides</a>
              <a href="${p(depth, 'guides/restaurant.html')}">${L('dineSFV')} / Dining</a>
              <a href="${p(depth, 'guides/cityloop.html')}">CityLoop Local Resource Guide</a>
              <a href="${p(depth, 'community/visitor-center.html')}">${L('visitorCenter')}</a>
              <a href="${p(depth, 'community/attractions.html')}">${L('attractions')}</a>
              <a href="${p(depth, 'community/hotels.html')}">${L('hotels')}</a>
              <a href="${p(depth, 'community/schools.html')}">${L('schools')}</a>
              <a href="${p(depth, 'community/seniors.html')}">${L('seniorCitizens')}</a>
              <a href="${p(depth, 'community/important-phones.html')}">${L('importantPhones')}</a>
            </div>
            <div class="mega-menu__col">
              <h4>${L('gratefulHearts')}</h4>
              <a href="${p(depth, 'grateful-hearts.html')}">Grateful Hearts Program</a>
              <a href="${p(depth, 'donate.html')}">${L('donate')}</a>
              <a href="${p(depth, 'sponsor.html')}">Sponsor a Cause</a>
              <a href="${p(depth, 'community/foundation.html')}">Community Benefit Foundation</a>
            </div>
          </div>
        </div>

        <a href="${p(depth, 'events/index.html')}" ${active==='events'?'class="active"':''}>${L('events')}</a>

        <div class="nav-item nav-item--has-dropdown ${active==='guides'?'active':''}">
          <a href="${p(depth, 'guides/index.html')}">Guides ▾</a>
          <div class="dropdown">
            <a href="${p(depth, 'guides/index.html')}">All Guides</a>
            <a href="${p(depth, 'guides/restaurant.html')}">🍽️ Restaurant / Dining</a>
            <a href="${p(depth, 'guides/parent-resource.html')}">👨‍👩‍👧 Parent Resource</a>
            <a href="${p(depth, 'guides/spa.html')}">💆 Spa & Wellness</a>
            <a href="${p(depth, 'guides/home-maintenance.html')}">🔧 Home Maintenance</a>
            <a href="${p(depth, 'guides/business-solutions.html')}">💼 Business Solutions</a>
            <a href="${p(depth, 'guides/cityloop.html')}">🏙️ CityLoop (Local)</a>
            <a href="${p(depth, 'guides/education.html')}">🎓 Education</a>
            <a href="${p(depth, 'guides/family-activities.html')}">🎪 Family Activities</a>
            <a href="${p(depth, 'guides/professional-services.html')}">⚖️ Professional Services</a>
          </div>
        </div>

        <a href="${p(depth, 'blog/index.html')}" ${active==='blog'?'class="active"':''}>${L('valleyBizBuzz')}</a>
        <a href="${p(depth, 'donate.html')}" ${active==='donate'?'class="active"':''}>${L('donate')}</a>
        <a href="${p(depth, 'join.html')}" class="btn btn--gold btn--sm nav-cta">${L('joinNow')}</a>
      </nav>
      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </div>
</header>`;
  }

  function footer(depth, lang) {
    lang = lang || 'en';
    var L = function(k) { return t(lang, k); };
    return `
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        ${logoBlock(depth, true)}
        <p class="mt-4">${L('footerTag')}</p>
        <div class="social-links mt-4">
          <a href="https://facebook.com/woodlandhillscc" aria-label="Facebook" rel="noopener">f</a>
          <a href="https://instagram.com/woodlandhillscc" aria-label="Instagram" rel="noopener">ig</a>
          <a href="https://twitter.com/woodlandhillscc" aria-label="X / Twitter" rel="noopener">𝕏</a>
          <a href="https://linkedin.com/company/west-valley-warner-center-chamber-of-commerce" aria-label="LinkedIn" rel="noopener">in</a>
          <a href="https://youtube.com/@woodlandhillscc" aria-label="YouTube" rel="noopener">▶</a>
        </div>
      </div>
      <div>
        <h4>${L('members')}</h4>
        <ul>
          <li><a href="${p(depth, 'join.html')}">${L('joinNow')}</a></li>
          <li><a href="${p(depth, 'members/directory.html')}">${L('directory')}</a></li>
          <li><a href="${p(depth, 'benefits.html')}">${L('benefits')}</a></li>
          <li><a href="${p(depth, 'member-deals.html')}">${L('memberDeals')}</a></li>
          <li><a href="${p(depth, 'referral.html')}">Referral Program</a></li>
          <li><a href="${p(depth, 'auth/member-login.html')}">${L('memberLogin')}</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('resourcesFooter')}</h4>
        <ul>
          <li><a href="${p(depth, 'guides/index.html')}">All Guides</a></li>
          <li><a href="${p(depth, 'guides/restaurant.html')}">Dining Guide</a></li>
          <li><a href="${p(depth, 'guides/cityloop.html')}">CityLoop</a></li>
          <li><a href="${p(depth, 'guides/parent-resource.html')}">Parent Guide</a></li>
          <li><a href="${p(depth, 'guides/home-maintenance.html')}">Home Services</a></li>
          <li><a href="${p(depth, 'ai-concierge.html')}">AI Concierge</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('engage')}</h4>
        <ul>
          <li><a href="${p(depth, 'events/index.html')}">${L('events')}</a></li>
          <li><a href="${p(depth, 'sponsor.html')}">Sponsor</a></li>
          <li><a href="${p(depth, 'advertise.html')}">Advertise</a></li>
          <li><a href="${p(depth, 'donate.html')}">${L('donate')}</a></li>
          <li><a href="${p(depth, 'grateful-hearts.html')}">Grateful Hearts</a></li>
          <li><a href="${p(depth, 'blog/guest-post.html')}">Guest Post</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('about')}</h4>
        <ul>
          <li><a href="${p(depth, 'about.html')}">The Chamber</a></li>
          <li><a href="${p(depth, 'about/board.html')}">Board of Directors</a></li>
          <li><a href="${p(depth, 'about/staff.html')}">Chamber Staff</a></li>
          <li><a href="${p(depth, 'community/index.html')}">Community</a></li>
          <li><a href="${p(depth, 'contact.html')}">${L('contact')}</a></li>
          <li><a href="${p(depth, 'accessibility.html')}">Accessibility</a></li>
          <li><a href="${p(depth, 'privacy.html')}">Privacy</a></li>
        </ul>
      </div>
      <div>
        <h4>${L('languages')}</h4>
        <ul>
          <li><a href="${p(depth, 'index.html')}" hreflang="en">${L('english')}</a></li>
          <li><a href="${p(depth, 'es/index.html')}" hreflang="es">${L('spanish')}</a></li>
          <li><a href="${p(depth, 'ru/index.html')}" hreflang="ru">${L('russian')}</a></li>
          <li><a href="${p(depth, 'hy/index.html')}" hreflang="hy">${L('armenian')}</a></li>
          <li><a href="${p(depth, 'zh/index.html')}" hreflang="zh">${L('chinese')}</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <div>${L('copyright')}</div>
      <div>${L('rebuiltBy')} <a href="https://heedbusinesssolutions.com" style="color:var(--gold);">Heed Business Solutions</a></div>
    </div>
  </div>
</footer>`;
  }

  // ElevenLabs ConvAI widget — single agent serves the entire site,
  // every language. Skipped in /admin/ and /auth/ pages where it'd be
  // out of place.
  var ELEVENLABS_AGENT_ID = 'agent_8201kqnjhzyrfpdvtqwgf9e0034y';
  function mountElevenLabs() {
    if (/\/(admin|auth)\//.test(window.location.pathname)) return;
    if (!document.querySelector('elevenlabs-convai')) {
      var el = document.createElement('elevenlabs-convai');
      el.setAttribute('agent-id', ELEVENLABS_AGENT_ID);
      document.body.appendChild(el);
    }
    if (!document.querySelector('script[src*="@elevenlabs/convai-widget-embed"]')) {
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      s.async = true;
      s.type = 'text/javascript';
      document.body.appendChild(s);
    }
  }

  // Inline concierge launcher — placed wherever a page has
  // <div data-partial="concierge-inline" data-prompt="…" data-topic="…"></div>.
  // Renders a visual chat preview that opens the floating widget on click.
  function mountInlineConciergeLaunchers() {
    document.querySelectorAll('[data-partial="concierge-inline"]').forEach(function(host) {
      var topic  = host.dataset.topic  || 'the West Valley';
      var prompt = host.dataset.prompt || ('Ask about ' + topic + '…');
      var variant = host.dataset.variant || 'card'; // 'card' | 'banner' | 'iframe'

      if (variant === 'iframe') {
        // Persistent embedded chat — used on dedicated concierge pages
        host.outerHTML =
          '<div class="concierge-iframe" style="background:linear-gradient(135deg,var(--navy),var(--blue));border-radius:var(--r-lg);padding:18px;box-shadow:var(--shadow-lg);">'
          + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;color:#fff;">'
          +   '<div style="width:40px;height:40px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;">CC</div>'
          +   '<div><div style="font-family:var(--serif);font-size:1.1rem;font-weight:700;">Chamber Concierge</div>'
          +   '<div style="font-size:.78rem;color:rgba(255,255,255,.78);">Voice or text · 8 languages · Always on duty</div></div>'
          + '</div>'
          + '<iframe src="https://elevenlabs.io/app/talk-to?agent_id=' + ELEVENLABS_AGENT_ID + '" '
          +   'style="width:100%;height:540px;border:0;border-radius:var(--r-md);background:#fff;display:block;" '
          +   'allow="microphone; camera" '
          +   'title="Chamber Concierge"></iframe>'
          + '<p style="margin-top:12px;font-size:.78rem;color:rgba(255,255,255,.7);text-align:center;">'
          +   'Or call <strong style="color:var(--gold);">(818) 347-4737</strong> · '
          +   '<a href="mailto:info@woodlandhillscc.net" style="color:var(--gold);">info@woodlandhillscc.net</a>'
          + '</p>'
          + '</div>';
        return;
      }

      if (variant === 'banner') {
        // Slim banner-style launcher
        host.outerHTML =
          '<section class="concierge-banner" style="background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;padding:18px 0;">'
          + '<div class="container container-narrow" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;">'
          +   '<div style="width:44px;height:44px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;flex-shrink:0;">CC</div>'
          +   '<div style="flex:1;min-width:240px;"><strong style="color:var(--gold);font-family:var(--mono);font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;">Chamber Concierge</strong>'
          +   '<div style="font-family:var(--serif);font-size:1.05rem;">' + prompt + '</div></div>'
          +   '<div style="display:flex;gap:8px;flex-wrap:wrap;">'
          +     '<button type="button" class="btn btn--gold" data-concierge-launch>Start chat ›</button>'
          +     '<a href="tel:8183474737" class="btn btn--outline" style="border-color:rgba(255,255,255,.5);color:#fff;">📞 Call (818) 347-4737</a>'
          +   '</div>'
          + '</div></section>';
        return;
      }

      // Default: card variant — sits inside .hero__visual (white background),
      // so styled DARK on light, not the reverse.
      host.outerHTML =
        '<div class="concierge-card" style="border-radius:var(--r-lg);color:var(--ink);">'
        + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">'
        +   '<div style="width:48px;height:48px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-weight:700;font-size:1.1rem;flex-shrink:0;">CC</div>'
        +   '<div><div style="font-family:var(--serif);font-size:1.15rem;font-weight:700;color:var(--navy);">Chamber Concierge</div>'
        +   '<div style="font-size:.78rem;color:var(--muted);">Voice + text · 8 languages</div></div>'
        + '</div>'
        + '<p style="font-size:.95rem;color:var(--slate);margin-bottom:14px;line-height:1.5;">' + prompt + '</p>'
        + '<div style="background:var(--blue-soft);border-radius:var(--r-md);padding:12px 14px;font-size:.85rem;color:var(--navy);font-style:italic;margin-bottom:14px;border-left:3px solid var(--blue);">'
        +   '"Find me a kid-friendly Persian restaurant in Tarzana that\'s open late."'
        + '</div>'
        + '<button type="button" class="btn btn--gold btn--block" data-concierge-launch>Start the conversation ›</button>'
        + '<div style="margin-top:14px;font-size:.78rem;color:var(--muted);text-align:center;">'
        +   'Or talk to a human: <a href="tel:8183474737" style="color:var(--navy);font-weight:600;">📞 (818) 347-4737</a> · '
        +   '<a href="mailto:info@woodlandhillscc.net" style="color:var(--navy);font-weight:600;">✉️ info@woodlandhillscc.net</a>'
        + '</div>'
        + '</div>';
    });

    // Hook up data-concierge-launch buttons to open the floating widget
    document.addEventListener('click', function(e) {
      var b = e.target.closest('[data-concierge-launch]');
      if (!b) return;
      var w = document.querySelector('elevenlabs-convai');
      if (!w) return;
      // ConvAI widget supports a "click to open" via dispatching a click on its shadow-root trigger.
      // Try the documented .start() / .open() methods first; fall back to scrolling+click.
      try { if (typeof w.open === 'function') { w.open(); return; } } catch (_) {}
      try { if (typeof w.start === 'function') { w.start(); return; } } catch (_) {}
      try {
        var sr = w.shadowRoot;
        if (sr) {
          var btn = sr.querySelector('button[aria-label*="onciege" i], button[aria-label*="oncierg" i], button.elevenlabs-trigger, button');
          if (btn) { btn.click(); return; }
        }
      } catch (_) {}
      // Last resort: scroll the widget into view
      w.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Loads /js/share-calendar.js once (handles Add-to-Calendar + share buttons site-wide).
  function mountShareCalendar(depth) {
    if (window.WVCal) return; // already loaded
    if (document.querySelector('script[src$="share-calendar.js"]')) return;
    var s = document.createElement('script');
    var prefix = '';
    for (var i = 0; i < (depth || 0); i++) prefix += '../';
    s.src = prefix + 'js/share-calendar.js?v=6';
    s.defer = true;
    document.body.appendChild(s);
  }

  // Loads /js/tour.js once (drives the [data-tour-start] guided walkthrough).
  function mountTour(depth) {
    if (window.WVTour) return;
    if (document.querySelector('script[src$="tour.js"]')) return;
    var s = document.createElement('script');
    var prefix = '';
    for (var i = 0; i < (depth || 0); i++) prefix += '../';
    s.src = prefix + 'js/tour.js?v=6';
    s.defer = true;
    document.body.appendChild(s);
  }

  function mount({ active = '', depth = 0, lang = 'en' } = {}) {
    const h = document.querySelector('[data-partial="header"]');
    const f = document.querySelector('[data-partial="footer"]');
    if (h) h.outerHTML = header(active, depth, lang);
    if (f) f.outerHTML = footer(depth, lang);

    mountElevenLabs();
    mountInlineConciergeLaunchers();
    mountShareCalendar(depth);
    mountTour(depth);

    // Close mega menus on outside click / esc
    document.addEventListener('click', function(e){
      if(!e.target.closest('.nav-item--has-mega') && !e.target.closest('.nav-item--has-dropdown') && !e.target.closest('.lang-switcher')){
        document.querySelectorAll('.nav-item--has-mega.open, .nav-item--has-dropdown.open, .lang-switcher.open').forEach(el => el.classList.remove('open'));
      }
    });

    // Mobile menu toggle
    const tog = document.querySelector('.menu-toggle');
    if(tog){
      tog.addEventListener('click', function(){
        document.querySelector('.nav').classList.toggle('open');
      });
    }
  }

  return { mount, header, footer };
})();
