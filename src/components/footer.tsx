import "@/styles/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-container">

        {/* Logo */}
        <div className="footer-brand">
          <img
            src="/image.webp"
            alt="Muyalogy"
            className="footer-logo"
          />
        </div>

        {/* Links */}
        <nav className="footer-links">
          <a href="/contact">Contact Us</a>
          <a href="/press-kit">Press Kit</a>
          <a href="/faq">FAQ</a>
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>

      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">

        <p>
          2026 Muyalogy Digital Services SC.
          All Rights Reserved
        </p>

        <div className="footer-socials">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="X">𝕏</a>
          <a href="#" aria-label="Telegram">➤</a>
          <a href="#" aria-label="LinkedIn">ln</a>

        </div>

      </div>

      <div className="footer-powered">
        <span>Powered by</span>
        <strong> Jiret</strong>
      </div>

    </footer>
  );
}
