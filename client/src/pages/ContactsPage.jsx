import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Phone, Mail, MapPin, Clock, Send, ChevronRight, CheckCircle2,
  MessageCircle
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


export default function ContactsPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const fadeRef1 = useFadeIn()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-light-50">
      <Header />

      <div className="mt-[120px] md:mt-[130px]">
        {/* Page Header */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-16 md:py-20 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl hidden lg:block" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl hidden lg:block" />
          <div className="absolute top-1/2 right-1/4 pointer-events-none hidden lg:block opacity-10">
            <Phone size={200} strokeWidth={0.5} className="text-primary" />
          </div>
          <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-dark-500 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight size={14} />
              <span className="text-dark-900 font-medium">Контакты</span>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-soft mb-4">
              <Phone size={12} /> Свяжитесь с нами
            </span>
            <h1 className="font-heading text-4xl md:text-6xl text-dark-900 font-bold tracking-tight mb-3">
              Контакты и <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">адрес</span>
            </h1>
            <p className="text-dark-600 text-lg max-w-xl">
              Мы всегда на связи и готовы помочь с вашими вопросами
            </p>
          </div>
        </section>
        {/* ───── Contact Info Section ───── */}
        <section className="py-12 md:py-16 bg-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-20 left-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl hidden lg:block" />
          <div className="absolute bottom-20 right-0 w-80 h-80 bg-gradient-to-tl from-secondary/5 to-transparent rounded-full blur-3xl hidden lg:block" />

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Phone size={20} className="text-white" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-dark-900 font-bold">Наши контакты</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {/* Phone Card */}
              <div className="group relative bg-white border border-dark-200/60 rounded-2xl p-5 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.25)] hover:-translate-y-2 hover:border-primary/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Phone size={24} className="text-white" />
                  </div>
                  <h3 className="text-dark-900 font-bold text-base mb-2">Телефон</h3>
                  <a href="tel:+998901234567" className="text-primary font-bold text-lg hover:text-primary-600 transition-colors block mb-1">
                    +998 (90) 123-45-67
                  </a>
                  <p className="text-dark-500 text-xs">Звонки по Узбекистану бесплатно</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="group relative bg-white border border-dark-200/60 rounded-2xl p-5 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.25)] hover:-translate-y-2 hover:border-primary/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Mail size={24} className="text-white" />
                  </div>
                  <h3 className="text-dark-900 font-bold text-base mb-2">Email</h3>
                  <a href="mailto:info@stroymarket.uz" className="text-primary font-bold text-base hover:text-primary-600 transition-colors block mb-1">
                    info@stroymarket.uz
                  </a>
                  <p className="text-dark-500 text-xs">Ответим в течение 24 часов</p>
                </div>
              </div>

              {/* Address Card */}
              <div className="group relative bg-white border border-dark-200/60 rounded-2xl p-5 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.25)] hover:-translate-y-2 hover:border-primary/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <h3 className="text-dark-900 font-bold text-base mb-2">Адрес</h3>
                  <p className="text-dark-700 text-sm font-medium mb-1">
                    г. Ташкент, ул. Навои, 42
                  </p>
                  <p className="text-dark-500 text-xs">Ориентир: рядом со станцией метро</p>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="group relative bg-white border border-dark-200/60 rounded-2xl p-5 hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.25)] hover:-translate-y-2 hover:border-primary/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Clock size={24} className="text-white" />
                  </div>
                  <h3 className="text-dark-900 font-bold text-base mb-2">Режим работы</h3>
                  <p className="text-dark-700 text-sm font-medium">
                    Пн-Пт: 09:00 – 20:00
                  </p>
                  <p className="text-dark-500 text-xs">Сб-Вс: 10:00 – 18:00</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───── Contact Form Section ───── */}
        <section className="py-12 md:py-16 bg-light-50 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl hidden lg:block" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-secondary/5 to-transparent rounded-full blur-3xl hidden lg:block" />

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Form Info */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary/20">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl text-dark-900 font-bold">Написать нам</h2>
                </div>
                <p className="text-dark-600 text-base leading-relaxed mb-8">
                  Если у вас есть вопросы о наших товарах, услугах или вам нужна помощь с заказом,
                  заполните форму справа. Наши специалисты свяжутся с вами в кратчайшие сроки.
                </p>
                <div className="bg-white border border-dark-200/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-heading text-lg text-dark-900 font-bold mb-4">Почему мы?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-dark-700 text-sm group">
                      <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0 group-hover:bg-accent-green/20 transition-colors">
                        <CheckCircle2 size={14} className="text-accent-green" />
                      </div>
                      Быстрый ответ в течение часа
                    </li>
                    <li className="flex items-center gap-3 text-dark-700 text-sm group">
                      <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0 group-hover:bg-accent-green/20 transition-colors">
                        <CheckCircle2 size={14} className="text-accent-green" />
                      </div>
                      Профессиональная консультация
                    </li>
                    <li className="flex items-center gap-3 text-dark-700 text-sm group">
                      <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0 group-hover:bg-accent-green/20 transition-colors">
                        <CheckCircle2 size={14} className="text-accent-green" />
                      </div>
                      Помощь с выбором товаров
                    </li>
                    <li className="flex items-center gap-3 text-dark-700 text-sm group">
                      <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center shrink-0 group-hover:bg-accent-green/20 transition-colors">
                        <CheckCircle2 size={14} className="text-accent-green" />
                      </div>
                      Решение любых вопросов
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Contact Form */}
              <div className="relative bg-white border border-dark-200/60 rounded-3xl p-6 md:p-8 overflow-hidden shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.2)] transition-shadow duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full" />
                <div className="relative">
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center mb-6">
                        <CheckCircle2 size={40} className="text-accent-green" />
                      </div>
                      <h3 className="font-heading text-2xl text-dark-900 font-bold mb-2">Спасибо!</h3>
                      <p className="text-dark-500 text-sm mb-6">Мы свяжемся с вами в кратчайшие сроки</p>
                      <button
                        onClick={() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }) }}
                        className="px-6 py-3 bg-light-100 text-dark-900 font-bold rounded-xl hover:bg-light-200 transition-colors text-sm"
                      >
                        Отправить ещё
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-dark-900 mb-2">Имя *</label>
                          <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Введите ваше имя"
                            className="w-full rounded-xl border-2 border-dark-200 bg-white px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-dark-900 mb-2">Телефон *</label>
                          <input
                            type="tel"
                            required
                            value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="+998 (__) ___-__-__"
                            className="w-full rounded-xl border-2 border-dark-200 bg-white px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-dark-900 mb-2">Сообщение *</label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                          placeholder="Опишите ваш вопрос или пожелания"
                          className="w-full rounded-xl border-2 border-dark-200 bg-white px-4 py-3 text-sm text-dark-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-primary-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Отправка...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Отправить сообщение
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ───── Full-width Map ───── */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <MapPin size={20} className="text-white" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl text-dark-900 font-bold">Мы на карте</h2>
            </div>
          </div>
          <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
            <iframe
              title="СтройМаркет на карте"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.7!2d69.2795!3d41.3111!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE4JzQwLjAiTiA2OcKwMTYnNDYuMiJF!5e0!3m2!1sru!2s!4v1700000000000"
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Gradient overlays for premium effect */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
