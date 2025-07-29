import { useEffect } from "react";

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  canonicalUrl,
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      updateMetaTag("name", "description", description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag("name", "keywords", keywords);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaTag("property", "og:title", title);
    }
    if (description) {
      updateMetaTag("property", "og:description", description);
    }
    if (image) {
      updateMetaTag("property", "og:image", image);
    }
    if (url) {
      updateMetaTag("property", "og:url", url);
    }
    if (type) {
      updateMetaTag("property", "og:type", type);
    }

    // Update Twitter tags
    if (title) {
      updateMetaTag("property", "twitter:title", title);
    }
    if (description) {
      updateMetaTag("property", "twitter:description", description);
    }
    if (image) {
      updateMetaTag("property", "twitter:image", image);
    }

    // Update canonical URL
    if (canonicalUrl) {
      updateCanonicalUrl(canonicalUrl);
    }
  }, [title, description, keywords, image, url, type, canonicalUrl]);

  const updateMetaTag = (attribute, attributeValue, content) => {
    let element = document.querySelector(
      `meta[${attribute}="${attributeValue}"]`
    );

    if (element) {
      element.setAttribute("content", content);
    } else {
      element = document.createElement("meta");
      element.setAttribute(attribute, attributeValue);
      element.setAttribute("content", content);
      document.head.appendChild(element);
    }
  };

  const updateCanonicalUrl = (url) => {
    let element = document.querySelector('link[rel="canonical"]');

    if (element) {
      element.setAttribute("href", url);
    } else {
      element = document.createElement("link");
      element.setAttribute("rel", "canonical");
      element.setAttribute("href", url);
      document.head.appendChild(element);
    }
  };

  return null; // This component doesn't render anything
};

export default SEO;
