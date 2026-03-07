import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import product1 from '../image/Top mahsulotlar1.png'

export default function Cart() {
  const { t, language } = useLanguage()
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Sand Filter Pump Combo AQD-650YH-A',
      price: 2500000,
      quantity: 2,
      image: product1
    }
  ])

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 py-6 md:py-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1e3d69] mb-5 md:mb-8">
          {language === 'uz' && 'Sizning buyurtmangiz:'}
          {language === 'ru' && 'Ваш заказ:'}
          {language === 'en' && 'Your order:'}
        </h1>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-start gap-3 md:gap-6">
                {/* Product Image */}
                <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-base md:text-xl font-bold text-[#1e3d69] mb-3 md:mb-4">
                    {formatPrice(item.price)} so'm
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 font-semibold"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="text-right mb-6">
          <p className="text-lg text-gray-600 mb-2">
            {language === 'uz' && 'Сумма:'}
            {language === 'ru' && 'Сумма:'}
            {language === 'en' && 'Total:'}
            <span className="font-bold text-2xl text-[#1e3d69] ml-2">
              {formatPrice(calculateTotal())} so'm
            </span>
          </p>
        </div>

        {/* Phone Input */}
        <div className="mb-6">
          <input
            type="tel"
            placeholder="+998 (00) 000-00-00"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#3563e9]"
          />
        </div>

        {/* Total Again */}
        <div className="text-right mb-6">
          <p className="text-lg text-gray-600 mb-2">
            {language === 'uz' && 'Сумма:'}
            {language === 'ru' && 'Сумма:'}
            {language === 'en' && 'Total:'}
            <span className="font-bold text-2xl text-[#1e3d69] ml-2">
              {formatPrice(calculateTotal())} so'm
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <button className="w-full bg-[#3563e9] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#2952d1] transition-colors shadow-lg">
          {language === 'uz' && 'Buyurtmani rasmiylashtirish'}
          {language === 'ru' && 'Оформить заказ'}
          {language === 'en' && 'Confirm order'}
        </button>
      </div>

      <Footer />
    </div>
  )
}
