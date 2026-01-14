import { useState, useEffect } from 'react'
import './LandingPage.css'

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const featuredBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 15.99,
      category: "Classics",
      condition: "New"
    },
    {
      id: 2,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      price: 2500.00,
      category: "Rare Books",
      condition: "First Edition"
    },
    {
      id: 3,
      title: "Dune",
      author: "Frank Herbert",
      price: 18.99,
      category: "Science Fiction",
      condition: "New"
    },
    {
      id: 4,
      title: "1984",
      author: "George Orwell",
      price: 13.99,
      category: "Classics",
      condition: "New"
    }
  ]

  const categories = [
    { name: "Fiction", icon: "📖", count: 245 },
    { name: "Rare Books", icon: "✨", count: 38 },
    { name: "Science Fiction", icon: "🚀", count: 89 },
    { name: "Mystery", icon: "🔍", count: 67 },
    { name: "Classics", icon: "🏛️", count: 156 },
    { name: "Non-Fiction", icon: "📚", count: 112 }
  ]

  return (
    <div className={`landing ${isLoaded ? 'loaded' : ''}`}>
      {/* Navigation */}
      <header className={`nav ${scrollY > 50 ? 'nav--scrolled' : ''}`}>
        <div className="nav__container">
          <a href="/" className="nav__logo">
            <span className="nav__logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 32V8h20v4H12v16h15v-12h-5v8H15V12h13v20H8z" fill="currentColor"/>
                <path d="M28 6c8 4 3 22 0 26m0-26c-1 4 1 20 0 26" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </span>
            <span className="nav__logo-text">
              <span className="nav__logo-main">The Reading Room</span>
            </span>
          </a>
          
          <nav className="nav__menu">
            <a href="#browse" className="nav__link">Browse</a>
            <a href="#rare" className="nav__link">Rare Books</a>
            <a href="#about" className="nav__link">Our Story</a>
            <a href="#contact" className="nav__link">Contact</a>
          </nav>
          
          <div className="nav__actions">
            <button className="nav__search" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <a href="/login" className="nav__btn nav__btn--ghost">Sign In</a>
            <a href="/register" className="nav__btn nav__btn--primary">Join Us</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__gradient"></div>
          <div className="hero__pattern"></div>
        </div>
        
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-icon">★</span>
            <span>Est. 1987 — Curators of Literary Treasures</span>
          </div>
          
          <h1 className="hero__title">
            <span className="hero__title-line">Discover</span>
            <span className="hero__title-line hero__title-line--accent">Extraordinary</span>
            <span className="hero__title-line">Books</span>
          </h1>
          
          <p className="hero__subtitle">
            From rare first editions to beloved classics, embark on a journey through 
            centuries of literary wonder. Every book has a story—find yours.
          </p>
          
          <div className="hero__cta">
            <a href="#browse" className="btn btn--large btn--primary">
              <span>Explore Collection</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#rare" className="btn btn--large btn--outline">
              View Rare Books
            </a>
          </div>
          
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-number">12,000+</span>
              <span className="hero__stat-label">Titles Available</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">500+</span>
              <span className="hero__stat-label">Rare Editions</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">37</span>
              <span className="hero__stat-label">Years of Trust</span>
            </div>
          </div>
        </div>
        
        <div className="hero__visual">
          <div className="hero__book-stack">
            <div className="hero__book hero__book--1">
              <div className="hero__book-spine"></div>
              <div className="hero__book-cover">
                <div className="hero__book-title">The Great Gatsby</div>
                <div className="hero__book-author">Fitzgerald</div>
              </div>
            </div>
            <div className="hero__book hero__book--2">
              <div className="hero__book-spine"></div>
              <div className="hero__book-cover">
                <div className="hero__book-title">1984</div>
                <div className="hero__book-author">Orwell</div>
              </div>
            </div>
            <div className="hero__book hero__book--3">
              <div className="hero__book-spine"></div>
              <div className="hero__book-cover">
                <div className="hero__book-title">Dune</div>
                <div className="hero__book-author">Herbert</div>
              </div>
            </div>
          </div>
          <div className="hero__float-element hero__float-element--quill">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 45Q35 35 20 5Q18 3 25 5Q50 15 30 55Q28 58 26 55L28 50Q30 45 28 40Q50 10 25 5" fill="currentColor" opacity="0.3"/>
              <path d="M20 48Q40 38 25 8Q50 18 32 52Q30 55 28 52L30 48Q32 43 30 38Q52 12 25 8" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
          <div className="hero__float-element hero__float-element--leaf">❧</div>
        </div>
        
        <div className="hero__scroll-indicator">
          <span>Scroll to explore</span>
          <div className="hero__scroll-line"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories" id="browse">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse By</span>
            <h2 className="section-title">Categories</h2>
            <p className="section-desc">
              Navigate our carefully curated collection across genres and eras
            </p>
          </div>
          
          <div className="categories__grid">
            {categories.map((cat, index) => (
              <a 
                href={`/category/${cat.name.toLowerCase().replace(' ', '-')}`} 
                className="category-card"
                key={cat.name}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="category-card__icon">{cat.icon}</span>
                <h3 className="category-card__name">{cat.name}</h3>
                <span className="category-card__count">{cat.count} books</span>
                <div className="category-card__arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured">
        <div className="featured__bg"></div>
        <div className="container">
          <div className="section-header section-header--light">
            <span className="section-label">Hand-Picked</span>
            <h2 className="section-title">Featured Volumes</h2>
            <p className="section-desc">
              Our booksellers' current recommendations from the collection
            </p>
          </div>
          
          <div className="featured__grid">
            {featuredBooks.map((book, index) => (
              <article 
                className="book-card"
                key={book.id}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="book-card__cover">
                  <div className="book-card__spine"></div>
                  <div className="book-card__front">
                    <div className="book-card__texture"></div>
                    <div className="book-card__content">
                      <span className="book-card__category">{book.category}</span>
                      <h4 className="book-card__title">{book.title}</h4>
                      <p className="book-card__author">by {book.author}</p>
                    </div>
                    <div className="book-card__decoration">
                      <span>❦</span>
                    </div>
                  </div>
                </div>
                <div className="book-card__info">
                  <div className="book-card__meta">
                    <span className="book-card__condition">{book.condition}</span>
                    <span className="book-card__price">
                      ${book.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button className="book-card__btn">
                    <span>Add to Cart</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6h15l-1.5 9h-12z"/>
                      <circle cx="9" cy="20" r="1"/>
                      <circle cx="18" cy="20" r="1"/>
                      <path d="M6 6L5 3H2"/>
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
          
          <div className="featured__cta">
            <a href="/books" className="btn btn--large btn--outline btn--light">
              View All Books
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Rare Books Callout */}
      <section className="rare-callout" id="rare">
        <div className="container">
          <div className="rare-callout__inner">
            <div className="rare-callout__content">
              <span className="rare-callout__label">For Collectors</span>
              <h2 className="rare-callout__title">
                Rare & First Editions
              </h2>
              <p className="rare-callout__desc">
                Discover our exclusive collection of rare books, first editions, and signed 
                copies. Each piece is authenticated and comes with provenance documentation. 
                From literary treasures to historical manuscripts, find pieces that transcend 
                the ordinary.
              </p>
              <ul className="rare-callout__features">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Certificate of Authenticity
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Climate-Controlled Shipping
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Expert Appraisal Services
                </li>
              </ul>
              <a href="/rare-books" className="btn btn--large btn--primary">
                Explore Rare Collection
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
            <div className="rare-callout__visual">
              <div className="rare-callout__frame">
                <div className="rare-callout__book">
                  <div className="rare-callout__book-cover">
                    <div className="rare-callout__book-texture"></div>
                    <div className="rare-callout__book-content">
                      <div className="rare-callout__book-ornament">✦</div>
                      <h4>Pride & Prejudice</h4>
                      <p>Jane Austen</p>
                      <div className="rare-callout__book-year">First Edition · 1813</div>
                      <div className="rare-callout__book-ornament">✦</div>
                    </div>
                  </div>
                </div>
                <div className="rare-callout__badge">
                  <span>Authenticated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / About Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="about__grid">
            <div className="about__story">
              <span className="section-label">Our Story</span>
              <h2 className="section-title">Three Generations of Book Lovers</h2>
              <p>
                Founded in 1987, The Reading Room began as a small 
                corner shop with a passion for connecting readers with remarkable stories. 
                Today, we've grown into one of the most trusted sources for rare and 
                antiquarian books, while never losing our dedication to personal service.
              </p>
              <p>
                Every book in our collection is hand-selected by our team of bibliophiles. 
                We believe that the right book, at the right moment, can change a life.
              </p>
              <div className="about__signature">
                <div className="about__signature-text">The Reading Room</div>
                <div className="about__signature-title">Established 1987</div>
              </div>
            </div>
            <div className="about__values">
              <div className="value-card">
                <div className="value-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h4 className="value-card__title">Curated Excellence</h4>
                <p className="value-card__desc">
                  Each book passes through our expert curation process
                </p>
              </div>
              <div className="value-card">
                <div className="value-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4 className="value-card__title">Trusted Authenticity</h4>
                <p className="value-card__desc">
                  Verified provenance on every rare volume we sell
                </p>
              </div>
              <div className="value-card">
                <div className="value-card__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <h4 className="value-card__title">Passion & Care</h4>
                <p className="value-card__desc">
                  Books handled with the reverence they deserve
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter__inner">
            <div className="newsletter__content">
              <h3 className="newsletter__title">Join the Literary Circle</h3>
              <p className="newsletter__desc">
                Receive curated recommendations, early access to rare acquisitions, 
                and exclusive offers delivered to your inbox.
              </p>
            </div>
            <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
              <div className="newsletter__input-group">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="newsletter__input"
                  required
                />
                <button type="submit" className="newsletter__btn">
                  Subscribe
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              <p className="newsletter__privacy">
                By subscribing, you agree to our privacy policy. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <a href="/" className="footer__logo">
                <span className="footer__logo-icon">
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 32V8h20v4H12v16h15v-12h-5v8H15V12h13v20H8z" fill="currentColor"/>
                    <path d="M28 6c8 4 3 22 0 26m0-26c-1 4 1 20 0 26" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </span>
                <span className="footer__logo-text">The Reading Room</span>
              </a>
              <p className="footer__tagline">
                Curators of literary treasures since 1987
              </p>
              <div className="footer__social">
                <a href="#" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="18" cy="6" r="1" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
                <a href="#" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="footer__links">
              <h4>Shop</h4>
              <ul>
                <li><a href="/books">All Books</a></li>
                <li><a href="/rare-books">Rare Books</a></li>
                <li><a href="/new-arrivals">New Arrivals</a></li>
                <li><a href="/bestsellers">Bestsellers</a></li>
                <li><a href="/gift-cards">Gift Cards</a></li>
              </ul>
            </div>
            
            <div className="footer__links">
              <h4>Categories</h4>
              <ul>
                <li><a href="/category/fiction">Fiction</a></li>
                <li><a href="/category/non-fiction">Non-Fiction</a></li>
                <li><a href="/category/classics">Classics</a></li>
                <li><a href="/category/mystery">Mystery</a></li>
                <li><a href="/category/science-fiction">Science Fiction</a></li>
              </ul>
            </div>
            
            <div className="footer__links">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">Our Story</a></li>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/press">Press</a></li>
              </ul>
            </div>
            
            <div className="footer__links">
              <h4>Support</h4>
              <ul>
                <li><a href="/shipping">Shipping Info</a></li>
                <li><a href="/returns">Returns</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer__bottom">
            <p className="footer__copyright">
              © 2025 The Reading Room. All rights reserved.
            </p>
            <p className="footer__made">
              Crafted with ❦ for book lovers everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
