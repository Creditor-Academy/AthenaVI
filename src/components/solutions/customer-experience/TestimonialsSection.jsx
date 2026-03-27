const styles = `
.cx-testimonials {
  padding: 100px 40px;
  background: #f8fafc;
  text-align: center;
}

.cx-testimonials-title {
  font-family: 'Georgia', serif;
  font-size: 48px;
  color: #1e3a8a;
  margin-bottom: 60px;
}

.cx-testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.cx-testimonial-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  text-align: left;
  display: flex;
  flex-direction: column;
}

.cx-testimonial-quote {
  font-size: 18px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
  font-style: italic;
}

.cx-testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: auto;
}

.cx-author-avatar {
  width: 48px;
  height: 48px;
  background: #e2e8f0;
  border-radius: 50%;
  overflow: hidden;
}

.cx-author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cx-author-info {
  display: flex;
  flex-direction: column;
}

.cx-author-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e3a8a;
}

.cx-author-role {
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 1024px) {
  .cx-testimonials-grid {
    grid-template-columns: 1fr;
    max-width: 600px;
  }
}
`

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "AthenaVI transformed our customer support. The AI avatars provide a human touch that standard chatbots just can't match.",
      name: "Sarah Jenkins",
      role: "Head of CS, TechFlow",
      image: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      quote: "Our engagement rates tripled after we started using personalized video messages for our onboarding process.",
      name: "Michael Chen",
      role: "Product Manager, Growthly",
      image: "https://i.pravatar.cc/150?u=michael"
    },
    {
      quote: "The multilingual support is a game changer. We can now support customers in their native language with ease.",
      name: "Elena Rodriguez",
      role: "Global Ops, Mundo",
      image: "https://i.pravatar.cc/150?u=elena"
    }
  ]

  return (
    <section className="cx-testimonials">
      <style>{styles}</style>
      <h2 className="cx-testimonials-title">What Our Customers Say</h2>
      <div className="cx-testimonials-grid">
        {testimonials.map((t, i) => (
          <div key={i} className="cx-testimonial-card">
            <p className="cx-testimonial-quote">"{t.quote}"</p>
            <div className="cx-testimonial-author">
              <div className="cx-author-avatar">
                <img src={t.image} alt={t.name} />
              </div>
              <div className="cx-author-info">
                <span className="cx-author-name">{t.name}</span>
                <span className="cx-author-role">{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TestimonialsSection
