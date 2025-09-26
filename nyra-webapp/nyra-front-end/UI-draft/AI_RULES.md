# AI Rules for Nyra Mortgage Suite

## Tech Stack Overview

- **Frontend Framework**: Vanilla HTML/CSS/JavaScript (no React/Vue/Angular)
- **CSS Framework**: Tailwind CSS via CDN for all styling and responsive design
- **Icons**: Font Awesome 6.4.0 for all iconography
- **Build System**: Static HTML - no build process required
- **Deployment**: Static hosting compatible (Hugging Face Spaces)
- **Communication APIs**: Twilio integration for SMS/voice capabilities
- **Email Integration**: Gmail and Outlook API integration support
- **CRM Integration**: LeadMailbox CRM and LendingPad integration ready

## Library and Framework Rules

### CSS and Styling
- **ALWAYS** use Tailwind CSS classes for styling
- **NEVER** write custom CSS unless absolutely necessary for animations
- Use the predefined color scheme: `primary: #2563eb`, `secondary: #0ea5e9`, `accent: #8b5cf6`
- Maintain responsive design with Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)

### Icons and Graphics
- **ONLY** use Font Awesome icons (already loaded via CDN)
- Use semantic icon classes: `fas` for solid, `fab` for brands, `far` for regular
- **NEVER** import additional icon libraries

### JavaScript
- Use vanilla JavaScript only - no frameworks
- Keep JavaScript minimal and focused on UI interactions
- Use modern ES6+ features (arrow functions, const/let, template literals)
- **AVOID** complex state management - keep it simple

### UI Components
- Build components using semantic HTML5 elements
- Use Tailwind utility classes for component styling
- Maintain consistent spacing using Tailwind's spacing scale
- Follow the existing card-based layout pattern

### Data and APIs
- Prepare for Twilio integration (voice/SMS)
- Support Gmail and Outlook email integration
- Design for CRM data integration (LeadMailbox, LendingPad)
- Use placeholder data for development/demo purposes

### File Structure
- Keep all code in the main `index.html` file
- Use `style.css` only for custom animations or Tailwind overrides
- Maintain the existing single-page application structure

### Performance and Accessibility
- Ensure all interactive elements are keyboard accessible
- Use semantic HTML for screen reader compatibility
- Optimize for mobile-first responsive design
- Keep animations smooth and purposeful

### Code Style
- Use consistent indentation (2 spaces)
- Write descriptive class names following Tailwind conventions
- Comment complex JavaScript functions
- Maintain the existing naming conventions for IDs and classes

## Forbidden Practices

- **DO NOT** add React, Vue, Angular, or any frontend framework
- **DO NOT** introduce a build system or bundler
- **DO NOT** use CSS-in-JS solutions
- **DO NOT** add unnecessary dependencies
- **DO NOT** break the single-page application structure
- **DO NOT** remove existing integrations or placeholder functionality

## Integration Guidelines

When adding new features:
1. Maintain compatibility with existing Twilio integration points
2. Preserve email integration hooks (Gmail/Outlook)
3. Keep CRM integration patterns intact
4. Follow the existing campaign management structure
5. Maintain the mortgage industry-specific terminology and workflows