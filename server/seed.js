const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Settings = require('./models/Settings');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Branch = require('./models/Branch');
const Blog = require('./models/Blog');
const FAQ = require('./models/FAQ');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // ── Admin User ──────────────────────────────────────────
    const existingAdmin = await User.findOne({ email: 'admin@pneumax.uz' });
    if (!existingAdmin) {
      await User.create({ name: 'Admin', email: 'admin@pneumax.uz', password: 'admin123', role: 'admin', phone: '+998901234567' });
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }

    // ── Settings ────────────────────────────────────────────
    const settingsDefaults = {
      siteName: 'PneuMax', phone1: '+998 99 999-00-00', phone2: '+998 98 852-21-91',
      email: 'info@pneumax.uz', workingHours: 'Dush-Shan: 09:00 - 18:00',
      address_uz: 'Toshkent shahri, Olmazor tumani, Usta Shirin ko\'chasi, 125-uy',
      address_ru: 'г. Ташкент, Олмазарский район, ул. Уста Ширин, 125',
      address_en: 'Tashkent, Olmazor district, Usta Shirin str., 125',
      instagram: 'https://instagram.com/pneumax_uz', facebook: '',
      telegram: 'https://t.me/pneumax_uz', youtube: '',
    };
    for (const [key, value] of Object.entries(settingsDefaults)) {
      await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    }
    console.log('✓ Settings seeded');

    // ── Categories ──────────────────────────────────────────
    await Category.deleteMany({});
    const parentCats = await Category.insertMany([
      { name: { uz: 'PNEVMATIKA', ru: 'ПНЕВМАТИКА', en: 'PNEUMATICS' }, order: 1, isActive: true },
      { name: { uz: 'GIDRAVLIKA', ru: 'ГИДРАВЛИКА', en: 'HYDRAULICS' }, order: 2, isActive: true },
      { name: { uz: 'ELEKTRO TOVAR', ru: 'ЭЛЕКТРОТОВАРЫ', en: 'ELECTRICAL' }, order: 3, isActive: true },
      { name: { uz: 'BASSEYN AKSESSUARLARI', ru: 'АКСЕССУАРЫ ДЛЯ БАССЕЙНА', en: 'POOL ACCESSORIES' }, order: 4, isActive: true },
      { name: { uz: 'FANTAN AKSESSUARLARI', ru: 'АКСЕССУАРЫ ДЛЯ ФОНТАНОВ', en: 'FOUNTAIN ACCESSORIES' }, order: 5, isActive: true },
    ]);
    const [pnevmatika, gidravlika, elektro, basseyn, fantan] = parentCats;

    await Category.insertMany([
      { name: { uz: 'Havo Silindrlar', ru: 'Пневмоцилиндры', en: 'Air Cylinders' }, parent: pnevmatika._id, order: 1, isActive: true },
      { name: { uz: 'Havo Klapinlar', ru: 'Пневмоклапаны', en: 'Air Valves' }, parent: pnevmatika._id, order: 2, isActive: true },
      { name: { uz: 'Havo Filterlari', ru: 'Пневмофильтры', en: 'Air Filters' }, parent: pnevmatika._id, order: 3, isActive: true },
      { name: { uz: 'Havo Shlanglari', ru: 'Пневмошланги', en: 'Air Hoses' }, parent: pnevmatika._id, order: 4, isActive: true },
      { name: { uz: 'Gidravlik Silindrlar', ru: 'Гидроцилиндры', en: 'Hydraulic Cylinders' }, parent: gidravlika._id, order: 1, isActive: true },
      { name: { uz: 'Gidravlik Klapinlar', ru: 'Гидроклапаны', en: 'Hydraulic Valves' }, parent: gidravlika._id, order: 2, isActive: true },
      { name: { uz: 'Kontaktorlar', ru: 'Контакторы', en: 'Contactors' }, parent: elektro._id, order: 1, isActive: true },
      { name: { uz: 'Elektro Klapinlar', ru: 'Электроклапаны', en: 'Electric Valves' }, parent: elektro._id, order: 2, isActive: true },
      { name: { uz: 'Basseyn Nasoları', ru: 'Насосы для бассейна', en: 'Pool Pumps' }, parent: basseyn._id, order: 1, isActive: true },
      { name: { uz: 'Fantan Nasoları', ru: 'Насосы для фонтанов', en: 'Fountain Pumps' }, parent: fantan._id, order: 1, isActive: true },
    ]);
    console.log('✓ Categories seeded');

    // ── Products ────────────────────────────────────────────
    await Product.deleteMany({});
    await Product.insertMany([
      {
        name: { uz: 'Pnevmatik Silindr SMC C85N20-50', ru: 'Пневмоцилиндр SMC C85N20-50', en: 'Pneumatic Cylinder SMC C85N20-50' },
        description: { uz: 'Yuqori bosimga chidamli pnevmatik silindr. Sanoat uskunalari uchun ideal.', ru: 'Пневмоцилиндр высокого давления. Идеально для промышленного оборудования.', en: 'High pressure pneumatic cylinder. Ideal for industrial equipment.' },
        price: 850000, category: pnevmatika._id, stock: 45, isFeatured: true, isActive: true,
        specifications: [{ key: { uz: 'Diametr', ru: 'Диаметр', en: 'Diameter' }, value: { uz: '20 mm', ru: '20 мм', en: '20 mm' } }, { key: { uz: 'Yurib', ru: 'Ход', en: 'Stroke' }, value: { uz: '50 mm', ru: '50 мм', en: '50 mm' } }]
      },
      {
        name: { uz: 'Havo Klapini FESTO MHE2-M1H-3/2', ru: 'Пневмоклапан FESTO MHE2-M1H-3/2', en: 'Pneumatic Valve FESTO MHE2-M1H-3/2' },
        description: { uz: '3/2 yo\'naltiruvchi klapan. Tez va ishonchli boshqaruv uchun.', ru: 'Направляющий клапан 3/2. Для быстрого и надёжного управления.', en: '3/2 directional valve. For fast and reliable control.' },
        price: 620000, category: pnevmatika._id, stock: 30, isFeatured: true, isActive: true,
      },
      {
        name: { uz: 'Havo Filtri SMC AF20-02', ru: 'Воздушный фильтр SMC AF20-02', en: 'Air Filter SMC AF20-02' },
        description: { uz: 'Siqilgan havo filtratsiyasi uchun. 5 mkm filtrlash.', ru: 'Для фильтрации сжатого воздуха. Фильтрация 5 мкм.', en: 'For compressed air filtration. 5 micron filtration.' },
        price: 390000, category: pnevmatika._id, stock: 60, isFeatured: false, isActive: true,
      },
      {
        name: { uz: 'Gidravlik Silindr Parker CB 63/50', ru: 'Гидроцилиндр Parker CB 63/50', en: 'Hydraulic Cylinder Parker CB 63/50' },
        description: { uz: 'Og\'ir yuklarni ko\'tarish uchun kuchli gidravlik silindr.', ru: 'Мощный гидроцилиндр для подъёма тяжёлых грузов.', en: 'Powerful hydraulic cylinder for heavy lifting.' },
        price: 2100000, category: gidravlika._id, stock: 12, isFeatured: true, isActive: true,
        specifications: [{ key: { uz: 'Diametr', ru: 'Диаметр', en: 'Diameter' }, value: { uz: '63 mm', ru: '63 мм', en: '63 mm' } }]
      },
      {
        name: { uz: 'Gidravlik Klapan Sun Hydraulics CBCA', ru: 'Гидроклапан Sun Hydraulics CBCA', en: 'Hydraulic Valve Sun Hydraulics CBCA' },
        description: { uz: 'Yukni ushlab turuvchi klapan. Xavfsiz boshqaruv uchun.', ru: 'Клапан удержания нагрузки. Для безопасного управления.', en: 'Load-holding valve. For safe control.' },
        price: 1450000, category: gidravlika._id, stock: 18, isFeatured: false, isActive: true,
      },
      {
        name: { uz: 'Kontaktor Schneider LC1D09', ru: 'Контактор Schneider LC1D09', en: 'Contactor Schneider LC1D09' },
        description: { uz: '9A kontaktor. Elektr motorlar va uskunalar uchun.', ru: 'Контактор 9А. Для электродвигателей и оборудования.', en: '9A contactor. For electric motors and equipment.' },
        price: 185000, category: elektro._id, stock: 85, isFeatured: true, isActive: true,
      },
      {
        name: { uz: 'Elektromagnit Klapan ASCO EF8210', ru: 'Электромагнитный клапан ASCO EF8210', en: 'Solenoid Valve ASCO EF8210' },
        description: { uz: '2/2 elektromagnit klapan. Suv va havo uchun.', ru: 'Электромагнитный клапан 2/2. Для воды и воздуха.', en: '2/2 solenoid valve. For water and air.' },
        price: 530000, category: elektro._id, stock: 40, isFeatured: false, isActive: true,
      },
      {
        name: { uz: 'Basseyn Nasosi Hayward SP2807', ru: 'Насос для бассейна Hayward SP2807', en: 'Pool Pump Hayward SP2807' },
        description: { uz: 'Kuchli va tejamkor basseyn nasosi. 0.75 kW quvvat.', ru: 'Мощный и экономичный насос для бассейна. Мощность 0.75 кВт.', en: 'Powerful and efficient pool pump. 0.75 kW power.' },
        price: 2500000, category: basseyn._id, stock: 20, isFeatured: true, isActive: true,
        discountPrice: 2200000,
      },
      {
        name: { uz: 'Fantan Nasosi Oase Aquarius 3500', ru: 'Насос для фонтана Oase Aquarius 3500', en: 'Fountain Pump Oase Aquarius 3500' },
        description: { uz: 'Dekorativ fantanlar uchun sirlangan nasос. 3500 l/h.', ru: 'Насос для декоративных фонтанов. 3500 л/ч.', en: 'Pump for decorative fountains. 3500 l/h.' },
        price: 1800000, category: fantan._id, stock: 15, isFeatured: true, isActive: true,
      },
      {
        name: { uz: 'Havo Shlang Festo PUN-H 8x1.25', ru: 'Пневмошланг Festo PUN-H 8x1.25', en: 'Air Hose Festo PUN-H 8x1.25' },
        description: { uz: 'Yuqori bosimga chidamli pnevmatik shlang. Metrlab sotiladi.', ru: 'Высокопрочный пневматический шланг. Продаётся метрами.', en: 'High pressure pneumatic hose. Sold by meter.' },
        price: 12000, category: pnevmatika._id, stock: 500, isFeatured: false, isActive: true,
      },
    ]);
    console.log('✓ Products seeded');

    // ── Branches ────────────────────────────────────────────
    await Branch.deleteMany({});
    await Branch.insertMany([
      {
        title: { uz: 'Filial №1', ru: 'Филиал №1', en: 'Branch №1' },
        company: '"PNEUMATIC ELECTRONIK MARKET" MCHJ',
        inn: '311 055 835',
        director: { uz: 'Kucharov Javlonbek Begali o\'g\'li', ru: 'Кучаров Жавлонбек Бегали угли', en: 'Kucharov Javlonbek Begali o\'g\'li' },
        founded: '24.01.2024',
        address: { uz: 'Do\'kon №1-31', ru: 'Магазин №1-31', en: 'Store №1-31' },
        fullAddress: 'Toshkent shahri, Olmazor tumani, Miskin MFY, Usta Shirin ko\'chasi, 125-uy',
        phones: ['+998 98 852 21 91', '+998 98 309 36 18'],
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.0!2d69.2401!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwIk4gNjnCsDE0JzI0IkU!5e0!3m2!1sen!2s!4v1',
        order: 1, isActive: true,
      },
      {
        title: { uz: 'Filial №2', ru: 'Филиал №2', en: 'Branch №2' },
        company: 'OOO "OMAD ELEKTRO SAVDO"',
        inn: '307 123 456',
        director: { uz: 'Xursanov Burxon Xayitovich', ru: 'Хурсанов Бурхон Хайитович', en: 'Xursanov Burxon Xayitovich' },
        founded: '27.01.2014',
        address: { uz: 'Do\'kon №43 Pneumax', ru: 'Магазин №43 Pneumax', en: 'Store №43 Pneumax' },
        fullAddress: 'Toshkent shahri, Olmazor tumani, Miskin MFY, Usta Shirin ko\'chasi, 125-uy',
        phones: ['+998 90 901 90 92', '+998 95 246 16 16'],
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.0!2d69.2401!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwIk4gNjnCsDE0JzI0IkU!5e0!3m2!1sen!2s!4v2',
        order: 2, isActive: true,
      },
    ]);
    console.log('✓ Branches seeded');

    // ── Blogs ───────────────────────────────────────────────
    await Blog.deleteMany({});
    await Blog.insertMany([
      {
        title: { uz: 'Yangi mahsulotlar keldi', ru: 'Поступили новые товары', en: 'New products arrived' },
        excerpt: { uz: 'Bizning do\'konimizga yangi pnevmatik va gidravlik mahsulotlar keldi.', ru: 'В наш магазин поступили новые пневматические и гидравлические товары.', en: 'New pneumatic and hydraulic products have arrived in our store.' },
        content: { uz: 'Biz yangi mahsulotlar assortimentini kengaytirdik. SMC, FESTO, Parker va boshqa yetakchi ishlab chiqaruvchilarning yangi mahsulotlari mavjud.', ru: 'Мы расширили ассортимент новых товаров. Доступны новые изделия от ведущих производителей SMC, FESTO, Parker и других.', en: 'We expanded our range of new products. New items from leading manufacturers SMC, FESTO, Parker and others are available.' },
        author: 'Admin', category: 'Yangiliklar', isPublished: true,
      },
      {
        title: { uz: 'Pnevmatik tizimlar haqida', ru: 'О пневматических системах', en: 'About pneumatic systems' },
        excerpt: { uz: 'Pnevmatik tizimlar sanoatda keng qo\'llaniladi. Ularning afzalliklari va qo\'llanish sohalari haqida.', ru: 'Пневматические системы широко применяются в промышленности. О преимуществах и областях применения.', en: 'Pneumatic systems are widely used in industry. About their advantages and application areas.' },
        content: { uz: 'Pnevmatik tizimlar siqilgan havo yordamida ishlaydigan mexanik tizimlardir. Ular tez, ishonchli va tejamkor hisoblanadi.', ru: 'Пневматические системы — это механические системы, работающие на сжатом воздухе. Они быстрые, надёжные и экономичные.', en: 'Pneumatic systems are mechanical systems powered by compressed air. They are fast, reliable and economical.' },
        author: 'Mutaxassis', category: 'Maqolalar', isPublished: true,
      },
      {
        title: { uz: 'Gidravlik uskunalarni tanlash', ru: 'Выбор гидравлического оборудования', en: 'Choosing hydraulic equipment' },
        excerpt: { uz: 'To\'g\'ri gidravlik uskuna tanlash ishlab chiqarish samaradorligini oshiradi.', ru: 'Правильный выбор гидравлического оборудования повышает эффективность производства.', en: 'Choosing the right hydraulic equipment increases production efficiency.' },
        content: { uz: 'Gidravlik uskunalarni tanlashda ishchi bosim, temperatura va muhit sharoitlarini hisobga olish kerak.', ru: 'При выборе гидравлического оборудования необходимо учитывать рабочее давление, температуру и условия среды.', en: 'When choosing hydraulic equipment, it is necessary to consider working pressure, temperature and environmental conditions.' },
        author: 'Mutaxassis', category: 'Maslahatlar', isPublished: true,
      },
      {
        title: { uz: 'Texnik xizmat ko\'rsatish', ru: 'Техническое обслуживание', en: 'Technical maintenance' },
        excerpt: { uz: 'Uskunangizni qanday to\'g\'ri parvarishlash kerak? Foydali maslahatlar.', ru: 'Как правильно ухаживать за оборудованием? Полезные советы.', en: 'How to properly maintain your equipment? Useful tips.' },
        content: { uz: 'Muntazam texnik xizmat ko\'rsatish uskunaning uzoq muddatli va samarali ishlashini ta\'minlaydi.', ru: 'Регулярное техническое обслуживание обеспечивает долгосрочную и эффективную работу оборудования.', en: 'Regular maintenance ensures long-term and efficient operation of equipment.' },
        author: 'Mutaxassis', category: 'Maslahatlar', isPublished: true,
      },
      {
        title: { uz: 'Sifatli ehtiyot qismlar', ru: 'Качественные запчасти', en: 'Quality spare parts' },
        excerpt: { uz: 'Sifatli ehtiyot qismlarni qanday tanlash mumkin? Asosiy mezonlar.', ru: 'Как выбрать качественные запчасти? Основные критерии.', en: 'How to choose quality spare parts? Key criteria.' },
        content: { uz: 'Sifatli ehtiyot qismlar tanlashda sertifikat, brend va kafolat muddatiga e\'tibor bering.', ru: 'При выборе качественных запчастей обращайте внимание на сертификат, бренд и гарантийный срок.', en: 'When choosing quality spare parts, pay attention to certification, brand and warranty period.' },
        author: 'Admin', category: 'Maslahatlar', isPublished: true,
      },
      {
        title: { uz: 'Yangi filial ochildi', ru: 'Открылся новый филиал', en: 'New branch opened' },
        excerpt: { uz: 'Toshkentda yangi filialimiz ochildi. Sizni kutamiz!', ru: 'В Ташкенте открылся наш новый филиал. Ждём вас!', en: 'Our new branch has opened in Tashkent. We are waiting for you!' },
        content: { uz: 'Yangi filialimiz Olmazor tumanida joylashgan. Barcha pnevmatik va gidravlik mahsulotlar mavjud.', ru: 'Наш новый филиал расположен в Олмазарском районе. Доступны все пневматические и гидравлические изделия.', en: 'Our new branch is located in Olmazor district. All pneumatic and hydraulic products are available.' },
        author: 'Admin', category: 'Yangiliklar', isPublished: true,
      },
    ]);
    console.log('✓ Blogs seeded');

    // ── FAQs ─────────────────────────────────────────────────
    await FAQ.deleteMany({});
    await FAQ.insertMany([
      {
        question: { uz: 'Yetkazib berish xizmati mavjudmi?', ru: 'Есть ли служба доставки?', en: 'Is delivery service available?' },
        answer: { uz: 'Ha, Toshkent shahri bo\'yicha 1-2 kun, viloyatlarga 3-5 kun ichida yetkazib beramiz.', ru: 'Да, по Ташкенту 1-2 дня, в регионы 3-5 дней.', en: 'Yes, within Tashkent 1-2 days, to regions 3-5 days.' },
        order: 1, isActive: true,
      },
      {
        question: { uz: 'To\'lov usullari qanday?', ru: 'Какие способы оплаты?', en: 'What payment methods are available?' },
        answer: { uz: 'Naqd, plastik karta, bank o\'tkazmasi va nasiya to\'lovlarini qabul qilamiz.', ru: 'Принимаем наличные, пластиковые карты, банковский перевод и рассрочку.', en: 'We accept cash, plastic cards, bank transfer and installment payments.' },
        order: 2, isActive: true,
      },
      {
        question: { uz: 'Mahsulotlarga kafolat beriladi?', ru: 'Предоставляется ли гарантия?', en: 'Is warranty provided?' },
        answer: { uz: 'Ha, barcha mahsulotlarga ishlab chiqaruvchi kafolati beriladi. Muddati mahsulotga qarab farq qiladi.', ru: 'Да, на все товары предоставляется гарантия производителя. Срок зависит от товара.', en: 'Yes, all products come with manufacturer\'s warranty. Duration varies by product.' },
        order: 3, isActive: true,
      },
      {
        question: { uz: 'Mahsulotlar qayerda ishlab chiqarilgan?', ru: 'Где производятся товары?', en: 'Where are products manufactured?' },
        answer: { uz: 'Biz SMC (Yaponiya), FESTO (Germaniya), Parker (AQSh) va boshqa yetakchi ishlab chiqaruvchilar bilan hamkorlik qilamiz.', ru: 'Мы сотрудничаем с SMC (Япония), FESTO (Германия), Parker (США) и другими ведущими производителями.', en: 'We work with SMC (Japan), FESTO (Germany), Parker (USA) and other leading manufacturers.' },
        order: 4, isActive: true,
      },
      {
        question: { uz: 'Nasiyaga olish imkoniyati mavjudmi?', ru: 'Есть ли возможность рассрочки?', en: 'Is installment payment available?' },
        answer: { uz: 'Ha, doimiy mijozlar va ulgurji xaridlar uchun nasiya sharoitlari mavjud. Batafsil ma\'lumot uchun bog\'laning.', ru: 'Да, для постоянных клиентов и оптовых покупок доступны условия рассрочки. Свяжитесь для деталей.', en: 'Yes, installment conditions are available for regular customers and wholesale purchases. Contact for details.' },
        order: 5, isActive: true,
      },
      {
        question: { uz: 'Minimal buyurtma miqdori bormi?', ru: 'Есть ли минимальный заказ?', en: 'Is there a minimum order?' },
        answer: { uz: 'Chakana savdo uchun minimal miqdor yo\'q. Ulgurji buyurtmalar uchun alohida narxlar taklif qilamiz.', ru: 'Для розничной торговли нет минимального количества. Для оптовых заказов предлагаем специальные цены.', en: 'No minimum for retail. We offer special prices for wholesale orders.' },
        order: 6, isActive: true,
      },
    ]);
    console.log('✓ FAQs seeded');

    console.log('\n✅ All seed data inserted successfully!');
    console.log('   Admin login: admin@pneumax.uz / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
