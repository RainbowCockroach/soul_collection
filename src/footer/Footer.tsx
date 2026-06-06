import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

interface SocialLink {
  name: string;
  url: string;
  icon: typeof faInstagram;
}

// Add more socials here as needed.
const socialLinks: SocialLink[] = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/_its_sa.m_/",
    icon: faInstagram,
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <nav className="social-links" aria-label="Social media">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
            title={social.name}
          >
            <FontAwesomeIcon icon={social.icon} />
          </a>
        ))}
      </nav>
    </footer>
  );
};

export default Footer;
