import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Landing.css";

function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  const popularSkills = [
    { name: "React & Node.js", category: "Development", icon: "💻" },
    { name: "UI/UX & Figma", category: "Design", icon: "🎨" },
    { name: "Spanish & French", category: "Languages", icon: "🌎" },
    { name: "Digital Marketing", category: "Business", icon: "📈" },
    { name: "Acoustic Guitar", category: "Music", icon: "🎸" },
    { name: "Portrait Photography", category: "Art", icon: "📷" },
  ];

  const features = [
    {
      title: "Smart Matching",
      description: "Get automatically paired with creators whose learning requests align with what you teach.",
      icon: "⚡"
    },
    {
      title: "Real-time Messaging",
      description: "Chat instantly with potential swap partners to discuss lesson structures and learning goals.",
      icon: "💬"
    },
    {
      title: "Integrated Video Rooms",
      description: "Conduct 1-on-1 face-to-face learning sessions directly in the browser with no extra apps required.",
      icon: "🎥"
    },
    {
      title: "Reputation & Reviews",
      description: "Build a reliable portfolio, earn teaching stars, and gain credibility from past learners.",
      icon: "🏆"
    }
  ];

  return (
    <div className="landing-wrapper fade-in">
      {/* Header / Navigation */}
      <header className="landing-header">
        <div className="logo-container">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">SkillSwap</span>
        </div>
        
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#skills">Popular Skills</a>
        </nav>

        <div className="auth-buttons">
          <Link to="/login" className="btn-secondary">Log In</Link>
          <Link to="/register" className="btn-primary">Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">✨ Share Knowledge, Learn Together</div>
        <h1 className="hero-title">
          Where Curiosity <br />
          Meets <span className="gradient-text">Expertise</span>
        </h1>
        <p className="hero-subtitle">
          Swap your skills, collaborate with global mentors, and grow your portfolio peer-to-peer. Zero cost, infinite learning possibilities.
        </p>
        <div className="hero-ctas">
          <button onClick={handleGetStarted} className="btn-primary-large">
            Get Started Free
          </button>
          <a href="#skills" className="btn-outline-large">
            Explore Skills
          </a>
        </div>

        {/* Floating preview element (Glassmorphic Mockup) */}
        <div className="hero-mockup-wrapper">
          <div className="hero-mockup">
            <div className="mockup-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
              <div className="mockup-search">🔍 Search &apos;UI/UX Design&apos; or &apos;Python&apos;...</div>
            </div>
            <div className="mockup-content">
              <div className="mockup-card">
                <div className="card-avatar">👨‍💻</div>
                <div className="card-details">
                  <h4>Alex Rivera</h4>
                  <p>Teaches: React, Node.js • Wants: Spanish</p>
                </div>
                <span className="match-badge">98% Match</span>
              </div>
              <div className="mockup-card">
                <div className="card-avatar">🎨</div>
                <div className="card-details">
                  <h4>Elena Rostova</h4>
                  <p>Teaches: UI/UX, Typography • Wants: React</p>
                </div>
                <span className="match-badge">95% Match</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Engineered for Seamless Learning</h2>
          <p>Everything you need to exchange skills, manage scheduling, and learn in one modern dashboard.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="section-header">
          <h2>How SkillSwap Works</h2>
          <p>Start your collaborative learning journey in three simple steps.</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>List Your Skills</h3>
            <p>Define the skills you excel at and the skills you are desperate to learn. We use this to calculate perfect matches.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Connect with Peers</h3>
            <p>Browse matched users, review their bios, and send instant swap requests to start chatting.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Start Swapping</h3>
            <p>Hop on a live video session to share your expertise and learn something brand new in return.</p>
          </div>
        </div>
      </section>

      {/* Popular Skills Section */}
      <section id="skills" className="skills-showcase">
        <div className="section-header">
          <h2>Trending Exchanges</h2>
          <p>Join sessions in these highly sought-after domains.</p>
        </div>
        <div className="skills-showcase-grid">
          {popularSkills.map((skill, index) => (
            <div key={index} className="skill-pill-card">
              <span className="skill-pill-icon">{skill.icon}</span>
              <div className="skill-pill-info">
                <h4>{skill.name}</h4>
                <p>{skill.category}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to Unlock Peer-to-Peer Learning?</h2>
          <p>Create your profile now and join thousands of students, professionals, and hobbyists teaching each other worldwide.</p>
          <button onClick={handleGetStarted} className="btn-primary-large glow-effect">
            Join SkillSwap Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">SkillSwap</span>
          </div>
          <p>The global peer-to-peer knowledge network.</p>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SkillSwap. Built with love for continuous learners.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
