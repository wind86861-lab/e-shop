import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Shield, RotateCcw, FileText, ChevronRight, CheckCircle2, ArrowRight, Sparkles,
  Wrench, Droplets, Zap, Layers, Phone, MessageCircle, Camera, Truck, CreditCard
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.unobserve(el) } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

const tabs = [
  { id: 'warranty', label: 'Гарантия на товары', hash: '' },
  { id: 'returns', label: 'Возврат и обмен', hash: '#returns' },
  { id: 'docs', label: 'Необходимые документы', hash: '#docs' },
]

const warrantyCategories = [
  { icon: Wrench, name: 'Электроинструмент', period: '6 мес – 2 года', color: 'text-primary' },
  { icon: Droplets, name: 'Сантехника', period: '1 – 3 года', color: 'text-blue-500' },
  { icon: Zap, name: 'Электрика', period: '6 мес – 2 года', color: 'text-amber-500' },
  { icon: Layers, name: 'Стройматериалы', period: 'По сертификатам', color: 'text-green-500' },
]

const warrantySteps = [
  { num: 1, title: 'Свяжитесь с нами', desc: 'По телефону или Telegram сообщите о дефекте' },
  { num: 2, title: 'Предоставьте документы', desc: 'Чек, гарантийный талон и описание проблемы' },
  { num: 3, title: 'Проверка товара', desc: 'Мы проверим и при необходимости отправим в сервисный центр' },
  { num: 4, title: 'Гарантийный ремонт', desc: 'Срок ремонта — до 30 дней' },
]

const returnConditions = [
  'Товар не был в использовании',
  'Сохранена оригинальная упаковка',
  'Есть чек или документ о покупке',
  'Товар не входит в список невозвратных товаров',
]

const returnSteps = [
  { icon: Phone, title: 'Свяжитесь с нами', desc: 'По телефону или Telegram' },
  { icon: Camera, title: 'Опишите причину', desc: 'Отправьте фото товара' },
  { icon: Truck, title: 'Передача товара', desc: 'Курьер заберёт или привезите в магазин' },
  { icon: CreditCard, title: 'Возврат средств', desc: 'В течение 3–7 дней тем же способом' },
]

const requiredDocs = [
  { title: 'Для гарантийного обслуживания', items: ['Кассовый чек или товарный чек', 'Гарантийный талон', 'Паспорт или ID карта', 'Описание дефекта'] },
  { title: 'Для возврата товара', items: ['Кассовый чек', 'Паспорт или ID карта', 'Заявление на возврат (заполняется на месте)', 'Товар в оригинальной упаковке'] },
]

export default function GuaranteePage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('warranty')

  useEffect(() => {
    if (location.hash === '#returns') setActiveTab('returns')
    else if (location.hash === '#docs') setActiveTab('docs')
    else setActiveTab('warranty')
  }, [location.hash])

  return (
    <div className="min-h-screen bg-light-50">
      <Header />

      <div className="mt-[120px] md:mt-[130px]">
        {/* Page Header */}
        <section className="relative bg-gradient-to-br from-green-50 via-white to-primary-50 py-16 md:py-20 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl hidden lg:block" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl hidden lg:block" />
          <div className="absolute top-1/2 right-1/4 pointer-events-none hidden lg:block opacity-10">
            <Shield size={200} strokeWidth={0.5} className="text-green-500" />
          </div>
          <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-dark-500 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight size={14} />
              <span className="text-dark-900 font-medium">Гарантия и возврат</span>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-soft mb-4">
              <Shield size={12} /> 100% гарантия качества
            </span>
            <h1 className="font-heading text-4xl md:text-6xl text-dark-900 font-bold tracking-tight mb-3">
              Гарантия и <span className="bg-gradient-to-r from-green-500 to-primary bg-clip-text text-transparent">возврат</span>
            </h1>
            <p className="text-dark-600 text-lg max-w-xl">
              Мы гарантируем качество всех товаров
            </p>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="space-y-12">
            {/* Гарантия на товары Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                  <Shield size={20} className="text-white" />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl text-dark-900 font-bold">Гарантия на товары</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Warranty Categories */}
                <div className="relative bg-white border border-dark-200 rounded-3xl p-6 md:p-8 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full" />
                  <h3 className="font-heading text-xl text-dark-900 font-bold mb-6">Сроки гарантии по категориям</h3>
                  <div className="space-y-3">
                    {warrantyCategories.map((cat, i) => (
                      <div key={i} className="group flex items-center justify-between p-3 bg-light-50 rounded-2xl border border-dark-100 hover:border-primary/30 hover:shadow-sm transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-white border border-dark-200 flex items-center justify-center ${cat.color} shadow-sm group-hover:scale-110 transition-transform`}>
                            <cat.icon size={20} />
                          </div>
                          <span className="text-dark-900 font-bold text-sm">{cat.name}</span>
                        </div>
                        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-accent-green/10 text-accent-green shadow-sm">
                          {cat.period}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warranty Steps */}
                <div className="relative bg-white border border-dark-200 rounded-3xl p-6 md:p-8 overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full" />
                  <h3 className="font-heading text-xl text-dark-900 font-bold mb-6">Гарантийное обслуживание</h3>
                  <div className="relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent-green" />
                    <div className="space-y-6">
                      {warrantySteps.map((step, i) => (
                        <div key={i} className="group flex gap-4 relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg z-10 group-hover:scale-110 transition-transform">
                            {step.num}
                          </div>
                          <div className="pt-1 flex-1">
                            <h4 className="text-dark-900 font-bold text-sm mb-1">{step.title}</h4>
                            <p className="text-dark-600 text-xs leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Возврат и обмен Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-md">
                  <RotateCcw size={20} className="text-white" />
                </div>
                <h2 className="font-heading text-2xl md:text-3xl text-dark-900 font-bold">Возврат и обмен</h2>
              </div>

              {/* Return Policy Card */}
              <div className="relative bg-white border border-dark-200 rounded-3xl p-6 md:p-8 overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg">
                      <RotateCcw size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-dark-900 font-bold">Возврат в течение 10 дней</h3>
                      <p className="text-dark-500 text-sm">С момента покупки</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {returnConditions.map((condition, i) => (
                      <div key={i} className="flex items-center gap-3 text-dark-700 text-sm p-3 bg-light-50 rounded-xl border border-dark-100">
                        <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} className="text-accent-green" />
                        </div>
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Return Process */}
              <div className="mb-8">
                <h3 className="font-heading text-xl text-dark-900 font-bold mb-2 text-center">Процесс возврата</h3>
                <p className="text-dark-600 text-center mb-8 max-w-md mx-auto text-sm">Простой и быстрый процесс возврата товара</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {returnSteps.map((step, i) => (
                    <div key={i} className="relative bg-white border border-dark-200 rounded-2xl p-6 text-center hover:shadow-hover hover:-translate-y-1 transition-all duration-500 group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                      <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold flex items-center justify-center shadow-md z-10">
                        {i + 1}
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center mx-auto mb-4 mt-2 group-hover:scale-110 transition-all duration-500">
                        <step.icon size={24} className="text-primary" />
                      </div>
                      <h4 className="text-dark-900 font-bold text-sm mb-1">{step.title}</h4>
                      <p className="text-dark-600 text-xs leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Docs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {requiredDocs.map((doc, i) => (
                  <div key={i} className="bg-white border border-dark-200 rounded-2xl p-5 md:p-6 hover:shadow-hover transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-md">
                        <FileText size={20} className="text-white" />
                      </div>
                      <h3 className="font-heading text-base text-dark-900 font-bold">{doc.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {doc.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-3 text-dark-700 text-sm">
                          <CheckCircle2 size={14} className="text-accent-green shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Важно знать Section */}
            <section className="relative bg-gradient-to-br from-amber-50 via-white to-primary-50 border border-amber-100 rounded-3xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                    <Shield size={20} className="text-white" />
                  </div>
                  <h2 className="font-heading text-xl md:text-2xl text-dark-900 font-bold">Важно знать</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-white/80 rounded-2xl border border-dark-100">
                    <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-accent-green" />
                    </div>
                    <div>
                      <h4 className="text-dark-900 font-bold text-sm mb-1">Обмен и возврат</h4>
                      <p className="text-dark-600 text-sm">Товар можно обменять или вернуть в течение 10 дней с момента покупки при сохранении товарного вида и упаковки</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white/80 rounded-2xl border border-dark-100">
                    <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-accent-green" />
                    </div>
                    <div>
                      <h4 className="text-dark-900 font-bold text-sm mb-1">Невозвратные товары</h4>
                      <p className="text-dark-600 text-sm">Возврат не принимается на товары с поврежденной упаковкой, а также использованные товары личной гигиены</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white/80 rounded-2xl border border-dark-100">
                    <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-accent-green" />
                    </div>
                    <div>
                      <h4 className="text-dark-900 font-bold text-sm mb-1">Возврат средств</h4>
                      <p className="text-dark-600 text-sm">Деньги возвращаются тем же способом, которым был оплачен товар, в течение 3-7 рабочих дней</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white/80 rounded-2xl border border-dark-100">
                    <div className="w-8 h-8 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-accent-green" />
                    </div>
                    <div>
                      <h4 className="text-dark-900 font-bold text-sm mb-1">Доставка при возврате</h4>
                      <p className="text-dark-600 text-sm">При возврате товара надлежащего качества стоимость доставки не возвращается</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Form Section */}
            <section className="relative bg-white border border-dark-200 rounded-3xl p-6 md:p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-md">
                    <Phone size={20} className="text-white" />
                  </div>
                  <h2 className="font-heading text-xl md:text-2xl text-dark-900 font-bold">Оставить заявку</h2>
                </div>
                <p className="text-dark-600 text-sm mb-6">Заполните форму ниже и наш специалист свяжется с вами для решения вопроса</p>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-dark-900 mb-2">Имя *</label>
                    <input
                      type="text"
                      placeholder="Введите ваше имя"
                      className="w-full rounded-xl border-2 border-dark-200 bg-white px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-dark-900 mb-2">Телефон *</label>
                    <input
                      type="tel"
                      placeholder="+998 (__) ___-__-__"
                      className="w-full rounded-xl border-2 border-dark-200 bg-white px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-dark-900 mb-2">Сообщение *</label>
                    <textarea
                      rows={4}
                      placeholder="Опишите ваш вопрос или пожелания"
                      className="w-full rounded-xl border-2 border-dark-200 bg-white px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    >
                      Отправить сообщение
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}
