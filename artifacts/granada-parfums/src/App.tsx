import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, Check, Menu, X } from 'lucide-react';

const wilayas = [
  ['01', 'Adrar', 'أدرار'], ['02', 'Chlef', 'الشلف'], ['03', 'Laghouat', 'الأغواط'],
  ['04', 'Oum El Bouaghi', 'أم البواقي'], ['05', 'Batna', 'باتنة'], ['06', 'Béjaïa', 'بجاية'],
  ['07', 'Biskra', 'بسكرة'], ['08', 'Béchar', 'بشار'], ['09', 'Blida', 'البليدة'],
  ['10', 'Bouira', 'البويرة'], ['11', 'Tamanrasset', 'تمنراست'], ['12', 'Tébessa', 'تبسة'],
  ['13', 'Tlemcen', 'تلمسان'], ['14', 'Tiaret', 'تيارت'], ['15', 'Tizi Ouzou', 'تيزي وزو'],
  ['16', 'Alger', 'الجزائر'], ['17', 'Djelfa', 'الجلفة'], ['18', 'Jijel', 'جيجل'],
  ['19', 'Sétif', 'سطيف'], ['20', 'Saïda', 'سعيدة'], ['21', 'Skikda', 'سكيكدة'],
  ['22', 'Sidi Bel Abbès', 'سيدي بلعباس'], ['23', 'Annaba', 'عنابة'], ['24', 'Guelma', 'قالمة'],
  ['25', 'Constantine', 'قسنطينة'], ['26', 'Médéa', 'المدية'], ['27', 'Mostaganem', 'مستغانم'],
  ['28', "M'Sila", 'المسيلة'], ['29', 'Mascara', 'معسكر'], ['30', 'Ouargla', 'ورقلة'],
  ['31', 'Oran', 'وهران'], ['32', 'El Bayadh', 'البيض'], ['33', 'Illizi', 'إليزي'],
  ['34', 'Bordj Bou Arréridj', 'برج بوعريريج'], ['35', 'Boumerdès', 'بومرداس'],
  ['36', 'El Tarf', 'الطارف'], ['37', 'Tindouf', 'تندوف'], ['38', 'Tissemsilt', 'تيسمسيلت'],
  ['39', 'El Oued', 'الوادي'], ['40', 'Khenchela', 'خنشلة'], ['41', 'Souk Ahras', 'سوق أهراس'],
  ['42', 'Tipaza', 'تيبازة'], ['43', 'Mila', 'ميلة'], ['44', 'Aïn Defla', 'عين الدفلى'],
  ['45', 'Naâma', 'النعامة'], ['46', 'Aïn Témouchent', 'عين تموشنت'], ['47', 'Ghardaïa', 'غرداية'],
  ['48', 'Relizane', 'غليزان'], ['49', 'Timimoun', 'تيميمون'],
  ['50', 'Bordj Badji Mokhtar', 'برج باجي مختار'], ['51', 'Ouled Djellal', 'أولاد جلال'],
  ['52', 'Béni Abbès', 'بني عباس'], ['53', 'In Salah', 'عين صالح'], ['54', 'In Guezzam', 'عين قزام'],
  ['55', 'Touggourt', 'تقرت'], ['56', 'Djanet', 'جانت'], ['57', "El M'Ghair", 'المغير'],
  ['58', 'El Meniaa', 'المنيعة'],
];

type Variant = 'royal' | 'ivory';
type Booking = { name: string; phone: string; variant: Variant; wilaya: string; createdAt: string };
const phonePattern = /^0[567][0-9]{8}$/;

function App() {
  const [variant, setVariant] = useState<Variant>('royal');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const phoneError = phone.length > 0 && !phonePattern.test(phone)
    ? 'أدخل رقم هاتف من 10 أرقام يبدأ بـ 05 أو 06 أو 07.'
    : '';

  function chooseVariant(next: Variant) {
    setVariant(next);
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    setSubmitError('');
    if (!name.trim() || !phonePattern.test(phone) || !wilaya) {
      setSubmitError('يرجى إكمال جميع المعلومات والتحقق من رقم الهاتف.');
      return;
    }
    try {
      const existing: Booking[] = JSON.parse(localStorage.getItem('granada-prebookings') || '[]');
      const booking: Booking = { name: name.trim(), phone, variant, wilaya, createdAt: new Date().toISOString() };
      localStorage.setItem('granada-prebookings', JSON.stringify([...existing, booking]));
      setSubmitted(true);
      setName('');
      setPhone('');
      setWilaya('');
    } catch {
      setSubmitError('تعذر الحفظ على هذا الجهاز. يرجى التحقق من مساحة التخزين والمحاولة مجدداً.');
    }
  }

  const closeMenu = () => setMobileMenu(false);
  return (
    <main className="min-h-[100dvh] overflow-hidden">
      <div className="bg-[#211219] px-4 py-2 text-center text-[10px] tracking-[.18em] text-[#ddc795] sm:text-xs" data-testid="text-delivery-announcement">
        LIVRAISON DANS LES 58 WILAYAS · التوصيل إلى جميع ولايات الوطن
      </div>
      <header className="site-header sticky top-0 z-40 border-b border-white/10 text-[#f5f0e7]">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 md:px-10">
          <a href="#home" onClick={closeMenu} className="group flex items-center gap-3" data-testid="link-brand-home">
            <span className="grid h-10 w-10 place-items-center border border-[#c6a56a]/65 text-[#c6a56a] transition-transform group-hover:rotate-45"><span className="star-mark">✧</span></span>
            <span className="leading-tight"><span className="serif block text-[19px] tracking-[.08em]">GRANADA</span><span className="block text-[8px] tracking-[.36em] text-[#c6a56a]">PARFUMS · ALGÉRIE</span></span>
          </a>
          <nav className="hidden items-center gap-9 text-[11px] tracking-[.16em] text-[#e8ddd3] md:flex" aria-label="Navigation principale">
            <a className="transition-colors hover:text-[#d3b677]" href="#collection" data-testid="link-nav-collection">LA COLLECTION</a>
            <a className="transition-colors hover:text-[#d3b677]" href="#story" data-testid="link-nav-story">NOTRE HISTOIRE</a>
            <a className="transition-colors hover:text-[#d3b677]" href="#notes" data-testid="link-nav-notes">LES NOTES</a>
          </nav>
          <a href="#booking" className="hidden border border-[#c6a56a] px-5 py-3 text-[10px] tracking-[.16em] text-[#e7d2a4] transition-colors hover:bg-[#c6a56a] hover:text-[#281018] sm:inline-flex" data-testid="link-nav-order">PRÉCOMMANDER <ArrowRight size={13} className="ml-2" /></a>
          <button type="button" aria-label={mobileMenu ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)} className="grid h-11 w-11 place-items-center border border-white/20 md:hidden" data-testid="button-mobile-menu">{mobileMenu ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {mobileMenu && <nav className="grid gap-1 border-t border-white/10 bg-[#281018] px-6 py-4 text-sm md:hidden" aria-label="Navigation mobile">
          {[[ '#collection', 'LA COLLECTION' ], [ '#story', 'NOTRE HISTOIRE' ], [ '#notes', 'LES NOTES' ], [ '#booking', 'PRÉCOMMANDER' ]].map(([href, label]) => <a key={href} href={href} onClick={closeMenu} className="py-3 tracking-[.13em]" data-testid={`link-mobile-${href.slice(1)}`}>{label}</a>)}
        </nav>}
      </header>

      <section id="home" className="relative isolate flex min-h-[690px] items-center bg-[#27141b] text-[#f7f0e6] sm:min-h-[760px] lg:min-h-[790px]" data-testid="section-hero">
        <img src="/andalousie-hero.png" alt="قارورتا عطر لَسونس داندالوزي البيضاء والسوداء في مشهد أندلسي" className="absolute inset-0 -z-20 h-full w-full object-cover object-[61%_center]" data-testid="img-hero-product" />
        <div className="hero-overlay absolute inset-0 -z-10" />
        <div className="tile-pattern absolute inset-0 -z-10 opacity-30 mix-blend-screen" />
        <div className="mx-auto w-full max-w-[1320px] px-6 pb-14 pt-16 md:px-12 lg:pt-12">
          <div className="max-w-[610px]">
            <div className="ornament section-kicker fade-up mb-7">MAISON GRANADA · ALGÉRIE</div>
            <p className="fade-up fade-delay-1 mb-5 text-[11px] tracking-[.23em] text-[#ddc795]">UN HÉRITAGE, UNE PRÉSENCE</p>
            <h1 className="serif fade-up fade-delay-1 max-w-[650px] text-[52px] leading-[1.02] tracking-[-.035em] sm:text-[68px] lg:text-[86px]" data-testid="text-hero-title">L’Essence<br /><span className="text-[#d2b574]">d’Andalousie</span></h1>
            <p dir="rtl" className="fade-up fade-delay-2 mt-7 max-w-[490px] text-right font-medium text-[22px] leading-relaxed text-[#f2e8dc] sm:text-[26px]" data-testid="text-arabic-tagline">عطر الأندلس - عبق يروي حكاية الأصالة</p>
            <p className="fade-up fade-delay-2 mt-5 max-w-[420px] text-sm leading-7 text-[#e1d4c8] sm:text-[15px]">Un parfum de caractère, né en Algérie. L’élégance andalouse rencontre la profondeur des bois et la chaleur des épices.</p>
            <div className="fade-up fade-delay-2 mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href="#booking" className="inline-flex min-h-14 items-center gap-3 bg-[#c6a56a] px-5 text-[10px] font-semibold tracking-[.12em] text-[#281018] transition-colors hover:bg-[#e0c78e] sm:gap-5 sm:px-6 sm:text-[11px] sm:tracking-[.14em]" data-testid="link-hero-prebooking">PRE-BOOKING OPEN / احجز الآن <ArrowRight size={15} /></a>
              <span className="text-xs tracking-[.12em] text-[#e2d1bd]">À PARTIR DE <b className="ml-2 text-base text-[#e5ce9c]">1 200 DZD</b></span>
            </div>
          </div>
        </div>
        <a href="#collection" aria-label="Découvrir la collection" className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-[#c6a56a] md:block" data-testid="link-scroll-collection"><ArrowDown size={18} /></a>
        <div className="absolute bottom-9 right-8 hidden text-[9px] tracking-[.2em] text-white/60 [writing-mode:vertical-rl] lg:block">L’ART DU PARFUM · DEPUIS L’ALGÉRIE</div>
      </section>

      <section id="collection" className="relative bg-[#f5f0e7] px-5 py-20 sm:py-28" data-testid="section-collection">
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div><p className="section-kicker !text-[#7e5c42]">L’EAU DE PARFUM · COLLECTION SIGNATURE</p><h2 className="serif mt-4 text-4xl leading-tight text-[#311923] sm:text-5xl">Une essence.<br className="sm:hidden" /> Deux expressions.</h2></div>
            <p className="max-w-[330px] pb-1 text-sm leading-6 text-[#695e57]">Une même signature olfactive, deux formats pour accompagner chaque instant.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {([
              { key: 'royal' as const, size: '50 ml', title: 'Édition Royale', color: 'Noir & or', price: '2,000', detail: 'Une présence intense, pensée pour les grandes occasions.', img: 'noir' },
              { key: 'ivory' as const, size: '30 ml', title: 'Édition Blanche', color: 'Ivoire & or', price: '1,200', detail: 'Le même sillage précieux, dans un format à emporter.', img: 'blanc' },
            ]).map((item) => <article key={item.key} className={`group relative overflow-hidden border ${variant === item.key ? 'border-[#8b6d42]' : 'border-[#ded3c4]'} bg-[#eee7dc] transition-colors`} data-testid={`card-product-${item.key}`}>
              <div className="relative flex min-h-[265px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_55%,#d8cabb_0%,#e9e1d6_43%,#eee7dc_72%)]">
                <span className="arch-frame absolute bottom-[-68px] left-1/2 h-[350px] w-[238px] -translate-x-1/2 border border-[#b69661]/55" />
                <span className="absolute bottom-8 left-1/2 h-px w-[60%] -translate-x-1/2 bg-[#b69661]/50" />
                <img src="/andalousie-hero.png" alt={`L'Essence d'Andalousie, ${item.title}`} className={`product-image relative z-10 h-[245px] w-[75%] object-cover transition-transform duration-700 group-hover:scale-[1.04] ${item.key === 'royal' ? 'object-[62%_55%]' : 'object-[78%_55%]'}`} data-testid={`img-product-${item.key}`} />
                <span className="absolute left-5 top-5 z-10 border border-[#8b6d42]/50 px-3 py-2 text-[9px] tracking-[.2em] text-[#604b35]">{item.color.toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                <div><p className="text-[10px] tracking-[.2em] text-[#88785f]">{item.size} · EAU DE PARFUM</p><h3 className="serif mt-2 text-2xl text-[#301a22]">{item.title}</h3><p className="mt-2 max-w-[320px] text-sm leading-6 text-[#71655d]">{item.detail}</p></div>
                <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end"><p className="serif whitespace-nowrap text-2xl text-[#4b1827]"><span className="text-xs">DZD</span> {item.price}</p><button type="button" onClick={() => chooseVariant(item.key)} className="inline-flex min-h-11 items-center gap-3 border border-[#4b1827] px-4 text-[10px] font-semibold tracking-[.12em] text-[#4b1827] transition-colors hover:bg-[#4b1827] hover:text-[#f5f0e7]" data-testid={`button-select-${item.key}`}>CHOISIR <ArrowRight size={13} /></button></div>
              </div>
            </article>)}
          </div>
          <p className="mt-5 text-center text-[11px] text-[#887d73]">Prix en dinars algériens · Livraison disponible dans les 58 wilayas</p>
        </div>
      </section>

      <section id="story" className="relative overflow-hidden bg-[#321621] text-[#f4ece2]" data-testid="section-story">
        <div className="absolute inset-y-0 right-0 hidden w-[43%] bg-[radial-gradient(ellipse_at_65%_45%,rgba(132,86,118,.35),transparent_56%)] lg:block" />
        <div className="tile-pattern absolute inset-0 opacity-[.18]" />
        <div className="relative mx-auto grid max-w-[1200px] gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-24 lg:px-12">
          <div className="relative mx-auto flex aspect-[.82] w-full max-w-[410px] items-end justify-center overflow-hidden border border-[#c6a56a]/45 bg-[linear-gradient(160deg,#47303d,#23131a_72%)] p-8">
            <div className="arch-frame absolute bottom-[-15%] left-[12%] h-[108%] w-[76%] border border-[#c6a56a]/35" />
            <div className="absolute inset-4 border border-[#c6a56a]/20" />
            <div className="absolute inset-x-0 top-[28%] text-center text-[82px] text-[#c6a56a]/60">۞</div>
            <div className="relative z-10 mb-4 text-center"><p className="section-kicker">GRANADA · ALGÉRIE</p><p className="serif mt-4 text-3xl">L’héritage<br />en mouvement</p></div>
          </div>
          <div className="max-w-[570px]">
            <p className="section-kicker">NOTRE MAISON · NOTRE HORIZON</p>
            <h2 className="serif mt-5 text-[39px] leading-[1.15] sm:text-[54px]">L’Andalousie,<br /><span className="text-[#c6a56a]">vue d’Algérie.</span></h2>
            <p className="mt-7 text-[15px] leading-8 text-[#e3d7d0]">Il existe des parfums qui traversent les frontières sans jamais oublier d’où ils viennent. L’Essence d’Andalousie est notre hommage à cette mémoire partagée : l’éclat des patios, la géométrie des zelliges et la profondeur des matières nobles, réinterprétés par une maison algérienne.</p>
            <p className="mt-5 text-[15px] leading-8 text-[#e3d7d0]">Inspirée par l’élégance royale et la présence magnétique des grandes compositions contemporaines — une sophistication que l’on retrouve dans l’univers de Dior Sauvage Elixir — Granada signe sa propre voie : une création indépendante, ancrée dans son héritage, imaginée et portée depuis l’Algérie. Aucun lien ni affiliation avec Dior.</p>
            <div className="mt-8 flex items-center gap-4 text-[11px] tracking-[.18em] text-[#cfb477]"><span className="star-mark">✧</span> UNE SIGNATURE ALGÉRIENNE, SANS COMPROMIS</div>
          </div>
        </div>
      </section>

      <section id="notes" className="relative bg-[#e9e0d3] px-5 py-20 sm:py-28" data-testid="section-notes">
        <div className="mx-auto max-w-[1110px]">
          <div className="text-center"><p className="section-kicker !text-[#7e5c42]">LA COMPOSITION</p><h2 className="serif mt-4 text-4xl text-[#301923] sm:text-5xl">Le sillage, en trois actes.</h2><p className="mx-auto mt-4 max-w-[540px] text-sm leading-7 text-[#6e6258]">Une ouverture épicée, un cœur aromatique, une profondeur qui s’attarde.</p></div>
          <div className="relative mt-14 grid gap-0 md:grid-cols-3">
            <div className="absolute left-[16.5%] right-[16.5%] top-[48px] hidden h-px bg-[#a98c5b]/55 md:block" />
            {[
              { no: '01', en: 'TOP NOTES', title: 'L’éveil', lines: 'Cinnamon · Nutmeg · Cardamom · Grapefruit', ar: 'دفء التوابل وانتعاش الجريب فروت' },
              { no: '02', en: 'HEART NOTE', title: 'L’équilibre', lines: 'Lavender', ar: 'اللافندر' },
              { no: '03', en: 'BASE NOTES', title: 'La mémoire', lines: 'Sandalwood · Licorice · Patchouli · Oud · Amber · Musk · Vetiver', ar: 'عمق الأخشاب الفاخرة والعنبر والمسك' },
            ].map((note) => <article className="relative px-5 pb-8 pt-7 text-center md:px-8 md:pt-0" key={note.no} data-testid={`card-note-${note.no}`}>
              <span className="relative z-10 mx-auto grid h-24 w-24 place-items-center rounded-full border border-[#a98c5b]/70 bg-[#e9e0d3] text-[11px] tracking-[.17em] text-[#705337]">{note.no}<span className="absolute text-xl text-[#a98c5b]">✧</span></span>
              <p className="mt-5 text-[9px] tracking-[.22em] text-[#8b775f]">{note.en}</p><h3 className="serif mt-2 text-2xl text-[#341c24]">{note.title}</h3>
              <p className="mx-auto mt-4 max-w-[280px] text-[13px] leading-6 text-[#66594f]">{note.lines}</p>
              <p dir="rtl" className="serif mt-4 text-[16px] leading-7 text-[#6b4c3b]">{note.ar}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="relative bg-[#4b1827] text-[#f5f0e7]" data-testid="section-delivery">
        <div className="tile-pattern absolute inset-0 opacity-25" />
        <div className="relative mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-8 px-6 py-14 text-center sm:py-16 md:flex-row md:text-left md:px-12">
          <div><p className="section-kicker">DE TINDOUF À EL TARF</p><h2 className="serif mt-3 text-3xl sm:text-4xl">La maison Granada, partout chez vous.</h2><p className="mt-3 text-sm text-[#eaded4]">Livraison disponible dans les 58 wilayas d’Algérie.</p></div>
          <div className="flex shrink-0 items-center gap-4 border border-[#c6a56a]/50 px-5 py-4"><span className="serif text-4xl text-[#d7bd82]">58</span><span className="text-left text-[10px] leading-5 tracking-[.12em] text-[#e6d7c7]">WILAYAS<br />COUVERTES</span></div>
        </div>
      </section>

      <section id="booking" className="bg-[#f5f0e7] px-5 py-20 sm:py-28" data-testid="section-booking">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
          <div className="pt-2">
            <p className="section-kicker !text-[#7e5c42]">VOTRE RENDEZ-VOUS AVEC GRANADA</p>
            <h2 className="serif mt-5 text-[42px] leading-[1.08] text-[#301923] sm:text-[56px]">Réservez votre<br /><span className="text-[#765143]">signature.</span></h2>
            <p className="mt-6 max-w-[390px] text-sm leading-7 text-[#6e6258]">Laissez-nous vos coordonnées pour précommander L’Essence d’Andalousie. Votre demande est enregistrée sur cet appareil.</p>
            <div className="mt-9 border-l border-[#a98c5b] pl-5"><p className="serif text-xl text-[#4b1827]">Un sillage. Une histoire.</p><p dir="rtl" className="mt-2 text-sm text-[#7e6a5d]">عطر الأندلس - عبق يروي حكاية الأصالة</p></div>
          </div>
          <form onSubmit={handleSubmit} className="border border-[#ded3c4] bg-[#faf7f1] p-5 sm:p-9" noValidate data-testid="form-prebooking">
            <div className="mb-7 flex items-center justify-between border-b border-[#e4dbce] pb-5"><div><p className="section-kicker !text-[#8b7251]">PRÉCOMMANDE</p><h3 className="serif mt-1 text-2xl text-[#301923]">Vos coordonnées</h3></div><span className="text-[10px] tracking-[.15em] text-[#968779]">ALGÉRIE</span></div>
            <div className="grid gap-5">
              <label className="grid gap-2 text-[12px] font-medium text-[#493b36]" htmlFor="customer-name"><span>الإسم واللقب <span className="text-[#998b7e]">· Nom complet</span></span><input id="customer-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="h-12 border border-[#d7cbbb] bg-transparent px-4 text-sm text-[#2c201d] outline-none transition-colors placeholder:text-[#a3978a] focus:border-[#8c6b42] focus:ring-2 focus:ring-[#c6a56a]/20" placeholder="Votre nom complet" data-testid="input-customer-name" /></label>
              <label className="grid gap-2 text-[12px] font-medium text-[#493b36]" htmlFor="customer-phone"><span>رقم الهاتف <span className="text-[#998b7e]">· Téléphone</span></span><input id="customer-phone" type="tel" inputMode="numeric" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))} aria-invalid={!!phoneError} aria-describedby="phone-hint phone-error" required maxLength={10} className={`h-12 border bg-transparent px-4 text-sm text-[#2c201d] outline-none transition-colors placeholder:text-[#a3978a] focus:ring-2 focus:ring-[#c6a56a]/20 ${phoneError ? 'border-red-700 focus:border-red-700' : 'border-[#d7cbbb] focus:border-[#8c6b42]'}`} placeholder="05 00 00 00 00" data-testid="input-customer-phone" /><span id="phone-hint" className="text-[10px] text-[#897c70]">10 chiffres · commence par 05, 06 ou 07</span>{phoneError && <span id="phone-error" role="alert" className="text-xs text-red-800" data-testid="error-phone">{phoneError}</span>}</label>
              <fieldset className="grid gap-2"><legend className="mb-2 text-[12px] font-medium text-[#493b36]">اختار عطرك <span className="text-[#998b7e]">· Choisissez votre édition</span></legend><div className="grid grid-cols-2 gap-3">
                <label className={`relative flex min-h-[68px] cursor-pointer items-center gap-3 border px-3 transition-colors ${variant === 'royal' ? 'border-[#765143] bg-[#f0e9dd]' : 'border-[#d7cbbb]'} `} data-testid="option-variant-royal"><input type="radio" name="variant" value="royal" checked={variant === 'royal'} onChange={() => setVariant('royal')} className="accent-[#4b1827]" data-testid="input-variant-royal" /><span><span className="block text-[11px] font-semibold text-[#35211f]">50 ml · Édition Royale</span><span className="mt-1 block text-[11px] text-[#84633d]">2,000 DZD</span></span>{variant === 'royal' && <Check size={14} className="ml-auto text-[#765143]" />}</label>
                <label className={`relative flex min-h-[68px] cursor-pointer items-center gap-3 border px-3 transition-colors ${variant === 'ivory' ? 'border-[#765143] bg-[#f0e9dd]' : 'border-[#d7cbbb]'}`} data-testid="option-variant-ivory"><input type="radio" name="variant" value="ivory" checked={variant === 'ivory'} onChange={() => setVariant('ivory')} className="accent-[#4b1827]" data-testid="input-variant-ivory" /><span><span className="block text-[11px] font-semibold text-[#35211f]">30 ml · Édition Blanche</span><span className="mt-1 block text-[11px] text-[#84633d]">1,200 DZD</span></span>{variant === 'ivory' && <Check size={14} className="ml-auto text-[#765143]" />}</label>
              </div></fieldset>
              <label className="grid gap-2 text-[12px] font-medium text-[#493b36]" htmlFor="customer-wilaya"><span>الولاية <span className="text-[#998b7e]">· Wilaya</span></span><select id="customer-wilaya" required value={wilaya} onChange={(e) => setWilaya(e.target.value)} className="h-12 appearance-none border border-[#d7cbbb] bg-[#faf7f1] px-4 text-sm text-[#2c201d] outline-none focus:border-[#8c6b42] focus:ring-2 focus:ring-[#c6a56a]/20" data-testid="select-customer-wilaya"><option value="">Sélectionnez votre wilaya</option>{wilayas.map(([code, french, arabic]) => <option key={code} value={code}>{code} · {french} / {arabic}</option>)}</select></label>
            </div>
            <div aria-live="polite" className="mt-5">
              {submitError && <p role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="status-booking-error">{submitError}</p>}
              {submitted && <div role="status" className="border border-[#9e895b]/45 bg-[#f1ecde] px-4 py-4 text-sm leading-6 text-[#3e4b32]" data-testid="status-booking-success"><strong className="block">تم حفظ طلبك على هذا الجهاز.</strong><span>Votre précommande a été enregistrée sur cet appareil, sans être envoyée aux serveurs de Granada.</span></div>}
            </div>
            <button type="submit" className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-3 bg-[#4b1827] px-5 text-[11px] font-semibold tracking-[.14em] text-[#f4e9d6] transition-colors hover:bg-[#64253a] focus:outline-none focus:ring-2 focus:ring-[#c6a56a] focus:ring-offset-2" data-testid="button-submit-prebooking">CONFIRMER MA PRÉCOMMANDE <ArrowRight size={15} /></button>
            <p className="mt-4 text-center text-[10px] leading-5 text-[#92867a]">Aucun paiement en ligne. Vos informations sont enregistrées uniquement sur cet appareil.</p>
          </form>
        </div>
      </section>

      <footer className="bg-[#211219] px-5 py-10 text-[#e6dbcd]" data-testid="section-footer">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-7 text-center sm:flex-row sm:text-left">
          <a href="#home" className="flex items-center gap-3" data-testid="link-footer-brand"><span className="grid h-10 w-10 place-items-center border border-[#c6a56a]/60 text-[#c6a56a]">✧</span><span><span className="serif block text-lg tracking-[.08em]">GRANADA</span><span className="block text-[8px] tracking-[.3em] text-[#c6a56a]">PARFUMS · ALGÉRIE</span></span></a>
          <p dir="rtl" className="text-sm text-[#d5c1a7]" data-testid="text-footer-tagline">عطر الأندلس - عبق يروي حكاية الأصالة</p>
          <a href="https://www.instagram.com/granada_officiel/" target="_blank" rel="noreferrer" className="border-b border-[#c6a56a]/55 pb-1 text-[11px] tracking-[.12em] text-[#ddc795] transition-colors hover:text-white" data-testid="link-instagram">@granada_officiel <span className="ml-1">↗</span></a>
        </div>
        <div className="mx-auto mt-8 flex max-w-[1200px] flex-col justify-between gap-2 border-t border-white/10 pt-5 text-[10px] tracking-[.08em] text-[#a89a8d] sm:flex-row"><span>© {new Date().getFullYear()} GRANADA PARFUMS · ALGÉRIE</span><a href="#home" className="transition-colors hover:text-[#ddc795]" data-testid="link-back-to-top">L’ART DU PARFUM, DEPUIS L’ALGÉRIE <span className="ml-2">↑</span></a></div>
      </footer>
    </main>
  );
}

export default App;
