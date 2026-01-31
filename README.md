# SST-Docs - Modern React Documentation System

A powerful, feature-rich React documentation platform built with Vite, designed for creating beautiful, searchable, and versioned documentation sites from structured JSON data. Perfect for technical documentation, API references, product guides, and knowledge bases.

<img width="1645" height="1025" alt="image" src="https://github.com/user-attachments/assets/e3580e04-f168-4b24-ad4c-dc5227b11666" />
<img width="1645" height="1025" alt="image" src="https://github.com/user-attachments/assets/20564de1-abb6-40fb-97ab-3eb6b871233e" />

## ✨ Key Features

### Content Management
- **JSON-Driven Architecture**: All documentation stored as structured JSON for easy version control and automation
- **Multi-Product Support**: Manage documentation for multiple products from a single installation
- **Version Control**: Built-in versioning system with per-version assets and content
- **Rich Content Blocks**: 16+ specialized content types including code, math, charts, media, and interactive elements

### User Experience
- **Powerful Search**: Real-time search with highlighted snippets and keyboard navigation (`/` or `Ctrl+K`)
- **Keyboard-First Navigation**: 
  - `F` - Focus filter
  - `Ctrl + Arrow Keys` - Navigate documentation tree
  - `Ctrl + Enter` - Open selected item
  - Arrow keys in search results
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Theme Support**: Light and dark modes with smooth transitions
- **Deep Linking**: Direct links to any document or category

### Developer Experience
- **Modern Stack**: React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4
- **Smart Generators**: Automatic code splitting based on actual content usage
- **Static Export**: Generate offline-ready HTML with pre-rendered charts
- **Hot Module Replacement**: Instant updates during development
- **Type Safety**: Full TypeScript support throughout

## 📦 Content Blocks

SST-Docs includes a comprehensive library of content blocks:

| Block Type | Description | Use Case |
|------------|-------------|----------|
| **Title** | Hierarchical headings (H1-H3) with anchor links | Document structure |
| **Text** | Rich text with HTML sanitization | Paragraphs, descriptions |
| **Code** | Syntax-highlighted code with Prism.js | Code examples, snippets |
| **List** | Ordered and unordered lists | Feature lists, steps |
| **Table** | Responsive tables with multiple layouts | Data presentation |
| **MessageBox** | Info, warning, error, success boxes | Callouts, alerts |
| **Math** | LaTeX equations with KaTeX | Mathematical formulas |
| **Chart** | Interactive charts with Chart.js | Data visualization |
| **Image** | Responsive images with captions | Screenshots, diagrams |
| **ImageGrid** | Multi-column image galleries | Visual showcases |
| **ImageCarousel** | Splide-powered image sliders | Image sequences |
| **ImageCompare** | Before/after image comparisons | Visual changes |
| **Audio** | Audio player with controls | Podcasts, sound samples |
| **YouTube** | Embedded YouTube videos | Video tutorials |
| **Divider** | Visual section separators | Content organization |

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 20.0.0
- npm ≥ 10.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/ShadowShardTools/SST-Docs.git
cd SST-Docs

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` to see your documentation site.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run start

# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
SST-Docs/
├── public/SST-Docs/data/          # Documentation content
│   ├── products.json               # Product list
│   └── <product>/
│       ├── versions.json           # Version list
│       └── <version>/
│           ├── index.json          # Auto-generated index
│           ├── categories/         # Category definitions
│           ├── items/              # Document content
│           ├── images/             # Image assets
│           ├── audio/              # Audio files
│           ├── charts/             # Chart data
│           └── static/             # Static export output
├── src/
│   ├── application/                # App configuration
│   ├── generators/                 # Build-time generators
│   ├── layouts/                    # UI components
│   │   ├── blocks/                 # Content block components
│   │   ├── navigation/             # Navigation UI
│   │   ├── render/                 # Document rendering
│   │   └── searchModal/            # Search functionality
│   ├── services/                   # Data loading services
│   └── workers/                    # Web Workers
├── sst-docs.config.json            # Main configuration
└── vite.config.ts                  # Vite configuration
```

## ⚙️ Configuration

### Main Configuration (`sst-docs.config.json`)

```json
{
  "FS_DATA_PATH": "./public/SST-Docs/data",
  "PRODUCT_VERSIONING": true,
  "HEADER_BRANDING": {
    "logoSrc": "https://avatars.githubusercontent.com/u/107807003",
    "logoAlt": "SST Docs",
    "logoText": "SST Docs"
  },
  "HTML_GENERATOR_SETTINGS": {
    "OUTPUT_DIRECTORY": "./public/SST-Docs/data",
    "PAGE_SIZE": "Letter",
    "PAGE_PADDINGS": [20, 10, 10, 20],
    "INCLUDE_TOC": true,
    "THEME": "default"
  }
}
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run start` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run generate` | Generate optimized imports (production) |
| `npm run generate:dev` | Generate full imports (development) |
| `npm run generate:static-html` | Export static HTML |
| `npm run format` | Format code with Prettier |

## 📝 Creating Content

SST-Docs provides two ways to create and manage documentation:

### Visual Editor (Recommended)

The built-in visual editor provides a user-friendly interface for creating and editing documentation:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173/SST-Docs/#/editor/`
3. Select a product and version from the interface, or access directly via URL:
   - Example: `http://localhost:5173/SST-Docs/#/editor/my-document?product=myProduct&version=v1.0`
4. Use the visual interface to:
   - Create and manage products
   - Add versions
   - Create categories and documents
   - Add and configure content blocks
   - Upload images and assets
   - Preview changes in real-time

The editor automatically generates the proper JSON structure and saves files to the correct locations.
<img width="1645" height="1032" alt="Screenshot 2026-01-30 220553" src="https://github.com/user-attachments/assets/08c0359e-0eb4-4655-9a1f-166839d64bf0" />

### Manual JSON Editing

For advanced users or automation, you can directly edit the JSON files:

#### 1. Add a Product

Edit `public/SST-Docs/data/products.json`:

```json
[
  {
    "product": "my-product",
    "label": "My Product"
  }
]
```

#### 2. Add Versions

Create `public/SST-Docs/data/my-product/versions.json`:

```json
[
  {
    "version": "1.0",
    "label": "Version 1.0"
  }
]
```

#### 3. Create Documentation

Create `public/SST-Docs/data/my-product/1.0/items/getting-started.json`:

```json
{
  "id": "getting-started",
  "title": "Getting Started",
  "description": "Quick start guide",
  "content": [
    {
      "type": "title",
      "titleData": {
        "text": "Getting Started",
        "level": 1,
        "enableAnchorLink": true
      }
    },
    {
      "type": "text",
      "textData": {
        "text": "Welcome to the documentation!"
      }
    },
    {
      "type": "code",
      "codeData": {
        "language": "javascript",
        "content": "console.log('Hello, World!');",
        "name": "example.js"
      }
    }
  ]
}
```

#### 4. Regenerate Imports

```bash
npm run generate
```

## 🎨 Customization

### Themes

The system supports light and dark themes. Customize colors in `src/index.css` using Tailwind CSS variables.

### Styling

SST-Docs uses Tailwind CSS 4. Modify styles in:
- `src/index.css` - Global styles
- Component files - Component-specific styles
- `sst-docs.config.json` - Branding configuration

### Adding Custom Blocks

1. Create a new component in `src/layouts/blocks/components/`
2. Export it from `src/layouts/blocks/components/index.ts`
3. Run `npm run generate:dev` to update imports
4. Use the block type in your JSON content

## 🔧 Advanced Features

### Static HTML Export

Generate offline-ready documentation:

```bash
npm run generate:html
```

This creates:
- Static HTML pages for each document
- Pre-rendered charts as images
- Asset manifests for download functionality
- Standalone CSS and resources

### Smart Code Splitting

The generator system analyzes your content and only bundles:
- Block components actually used
- Prism.js languages referenced in code blocks

This keeps bundle sizes minimal for production.

### Search Optimization

The search system:
- Indexes all content on load
- Provides real-time filtering
- Highlights matching terms
- Ranks results by relevance
- Supports keyboard navigation

## 🌐 Deployment

### GitHub Pages

The project is pre-configured for GitHub Pages:

```bash
npm run deploy
```

### Custom Domain

1. Update `base` in `vite.config.ts`
2. Configure your hosting provider
3. Build and deploy: `npm run build`

### Environment Variables

Set `BASE_URL` in your build environment to customize the base path.

## 🛠️ Technology Stack

- **SST-Docs-Core**: https://github.com/ShadowShardTools/SST-Docs-Core
- **Framework**: React 19.2
- **Build Tool**: Vite 7.3
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Routing**: React Router 7.11
- **Code Highlighting**: Prism.js 1.30
- **Math Rendering**: KaTeX 0.16
- **Charts**: Chart.js 4.5
- **Icons**: Lucide React 0.562

## 📄 License

Apache Version 2.0 License - see [LICENSE](LICENSE) for details

## 🔗 Links

- **Website**: https://shadowshardtools.github.io
- **GitHub**: https://github.com/ShadowShardTools
- **Unity Asset Store**: https://assetstore.unity.com/publishers/46006
- **YouTube**: https://www.youtube.com/@shadowshardtools
- **LinkedIn**: https://www.linkedin.com/company/shadowshardtools
- **Discord**: https://discord.gg/QyQACA5YvA

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
**The repository needs real developers and someone who can take over further development!**

## 📞 Support

For questions and support:
- Open an issue on GitHub
- Join our Discord community
- Check the documentation at https://shadowshardtools.github.io/SST-Docs/

---

Built with ❤️ by [ShadowShardTools](https://shadowshardtools.github.io)
