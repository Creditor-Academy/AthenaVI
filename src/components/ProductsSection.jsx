import { useState } from 'react'
import { MdKeyboardArrowDown, MdArrowOutward } from 'react-icons/md'

const styles = `
.products-section {
  padding: 100px 40px;
  background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%);
  color: #ffffff;
}

.products-section-content {
  max-width: 1400px;
  margin: 0 auto;
}

.products-section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 48px;
  font-weight: 500;
  text-align: center;
  margin: 0 0 60px;
  color: #ffffff;
}

.products-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
  align-items: start;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}

.product-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.product-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
}

.product-card-arrow {
  color: #60a5fa;
  font-size: 24px;
  transition: transform 0.3s ease;
}

.product-card.active .product-card-arrow {
  transform: rotate(180deg);
}

.product-card-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.product-card.active .product-card-content {
  max-height: 1000px;
}

.product-card-description {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 24px;
}

.product-card-button {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  color: #000;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.product-card-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.product-preview {
  position: sticky;
  top: 100px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  border-radius: 16px;
}

@media (max-width: 1024px) {
  .products-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .product-preview {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .products-section {
    padding: 60px 24px;
  }

  .products-section-title {
    font-size: 36px;
  }
}
`

const products = [
  {
    id: 'visual-ai-agents',
    title: 'Visual AI Agents',
    description: 'Redefining digital connections. Craft a lifelike conversational AI Agent that knows everything about you, your products, and services, all while reflecting your brand\'s look, voice, and tone.',
    buttonText: 'BUILD AN AGENT'
  },
  {
    id: 'video-studio',
    title: 'Video Studio',
    description: 'Create professional videos with our advanced video editing tools and AI-powered features.',
    buttonText: 'EXPLORE STUDIO'
  },
  {
    id: 'video-translate',
    title: 'Video Translate',
    description: 'Automatically translate your videos into multiple languages with perfect lip-sync and natural voice.',
    buttonText: 'TRY TRANSLATE'
  },
  {
    id: 'video-campaigns',
    title: 'Video Campaigns',
    description: 'Launch and manage video marketing campaigns with analytics and optimization tools.',
    buttonText: 'START CAMPAIGN'
  }
]

function ProductsSection() {
  const [activeProduct, setActiveProduct] = useState('visual-ai-agents')

  const toggleProduct = (id) => {
    setActiveProduct(activeProduct === id ? null : id)
  }

  return (
    <>
      <style>{styles}</style>
      <section className="products-section">
        <div className="products-section-content">
          <h2 className="products-section-title">Experience our products</h2>
          
          <div className="products-layout">
            <div className="products-list">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`product-card ${activeProduct === product.id ? 'active' : ''}`}
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="product-card-header">
                    <h3 className="product-card-title">{product.title}</h3>
                    <MdKeyboardArrowDown className="product-card-arrow" />
                  </div>
                  <div className="product-card-content">
                    <p className="product-card-description">{product.description}</p>
                    <button className="product-card-button">
                      {product.buttonText}
                      <MdArrowOutward />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="product-preview">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=80"
                alt="Product preview"
                className="preview-image"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductsSection

