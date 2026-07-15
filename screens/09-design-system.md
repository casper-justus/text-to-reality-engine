---
name: High-Trust Marketplace (EduMarket)
note: Token names below match the actual Tailwind config used across all exported screens.
colors:
  primary: '#00346f'
  on-primary: '#ffffff'
  primary-container: '#004a99'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#abc7ff'
  secondary: '#3b6934'
  on-secondary: '#ffffff'
  secondary-container: '#b9eeab'
  on-secondary-container: '#3f6d38'
  tertiary: '#661a00'
  on-tertiary: '#ffffff'
  on-tertiary-container: '#ffa68a'
  surface: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4fa'
  surface-container: '#ebeef4'
  surface-container-high: '#e5e8ee'
  surface-container-highest: '#dfe3e9'
  surface-variant: '#dfe3e9'
  on-surface: '#181c20'
  on-surface-variant: '#424751'
  outline: '#737783'
  outline-variant: '#c2c6d3'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f7'
  background: '#f7f9ff'
  on-background: '#181c20'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  verified: '#0369A1'
  success: '#15803D'

typography:
  headline: Plus Jakarta Sans   # headers, prices, card titles
  body: Inter                   # body copy, data, bios
  label: Source Sans 3          # uppercase labels, metadata

brand:
  primary: deep navy "#00346f" (trust / institutional)
  tertiary: "#661a00" (CTAs / "Request Shortlist")
  verified: "#0369A1"          # TSC-verified checkmarks
  success: "#15803D"           # completed / positive status
  surface: "#f7f9ff"           # app background
  surface-container-lowest: "#ffffff"  # cards

components:
  buttons:
    primary: solid tertiary (#661a00), white text, rounded-full, high intent
    secondary: outline 1px primary, navy text
    ghost: navy text only
  teacher-card:
    header: avatar/photo left, name + subject, quality Band badge top-right
    bands: A = gold (#FEF3C7 bg / #B45309 text), B = slate (#F1F5F9 / #475569), C = bronze (#FFEDD5 / #78350F)
    salary: bold pill, primary color
    footer CTA: "View profile" -> opens detail; "Request this teacher" -> post-hiring-request
  quality-band-badge: monospaced label, pill shaped
  verified-mark: material-symbols "verified" filled, verified-blue

layout:
  grid: 12-col desktop; marketplace cards 3-up (sm:2, xl:3)
  spacing: 8px base; section-gap 80px
  radius: cards lg (0.5rem), pills full
---
