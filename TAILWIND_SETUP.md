# Tailwind CSS & shadcn/ui Setup

## Installation

Run the following command to install all required dependencies:

```bash
cd frontend
npm install
```

This will install:
- Tailwind CSS
- shadcn/ui components (Button, Card, Dialog, Input, Badge)
- Lucide React icons
- Utility libraries (clsx, tailwind-merge, class-variance-authority)

## What's Been Added

### 1. Tailwind Configuration
- `tailwind.config.js` - Tailwind configuration with shadcn theme
- `postcss.config.js` - PostCSS configuration
- Updated `globals.css` - Tailwind directives and CSS variables

### 2. shadcn/ui Components
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/card.tsx` - Card components
- `src/components/ui/dialog.tsx` - Dialog/Modal component
- `src/components/ui/input.tsx` - Input component
- `src/components/ui/badge.tsx` - Badge component

### 3. Utility Functions
- `src/lib/utils.ts` - `cn()` function for merging Tailwind classes

### 4. Redesigned Components
- `StationCard.tsx` - Modern card design with Tailwind
- `AddItemModal.tsx` - Beautiful modal with shadcn Dialog
- `page.tsx` - Clean, minimalistic layout

## Features

✨ **Modern Design**
- Clean, minimalistic UI
- Smooth animations and transitions
- Responsive grid layout
- Beautiful gradient background

🎨 **Styling**
- Tailwind CSS utility classes
- shadcn/ui component library
- Consistent design system
- Dark/light mode ready (currently light)

📱 **Responsive**
- Mobile-first design
- Responsive grid (1-4 columns based on screen size)
- Touch-friendly buttons

## After Installation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The UI should now have:
   - Modern card designs with hover effects
   - Beautiful gradient background
   - Clean typography
   - Smooth animations
   - Professional button styles

## Customization

You can customize colors in `src/app/globals.css` by modifying the CSS variables:
- `--primary` - Primary color (purple)
- `--destructive` - Error/destructive actions (red)
- `--background` - Background color
- `--foreground` - Text color

## Notes

- The import path issue has been fixed (`@/*` now points to `./src/*`)
- All components use Tailwind classes instead of inline styles
- Icons are from Lucide React
- The design is production-ready and follows modern UI/UX best practices


