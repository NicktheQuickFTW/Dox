# DoX UI/UX Architecture Documentation
*Last Updated: January 29, 2025*

## Overview

DoX implements a sophisticated UI/UX development workflow leveraging Claude Code's sub-agent system. This modular approach separates concerns between UX structure, visual design, mobile optimization, framework implementation, and A/B testing, enabling parallel development and consistent quality.

## UI/UX Sub-Agent Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UX Engineer   │────▶│ UI Implementation│────▶│  Mobile UX Eng  │
│                 │     │                 │     │                 │
│ • Wireframes    │     │ • HELiiX Style  │     │ • Touch UI      │
│ • User Flows    │     │ • Visual Design │     │ • Mobile Nav    │
│ • Info Arch     │     │ • Animations    │     │ • Responsive    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │     UI Converter        │
                    │                         │
                    │ • HTML → React          │
                    │ • TypeScript Props      │
                    │ • Component Structure   │
                    └─────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     UI Testing          │
                    │                         │
                    │ • A/B Variants          │
                    │ • Test Strategies       │
                    │ • Success Metrics       │
                    └─────────────────────────┘
```

## HELiiX Design System

### Color Palette
```css
/* Primary Colors */
--black: #000000
--white: #FFFFFF
--gray-light: #F5F5F5
--gray-dark: #1A1A1A
--gray-medium: #333333

/* Functional Colors */
--background: 0 0% 100%     /* White */
--foreground: 0 0% 3.9%     /* Near Black */
--primary: 0 0% 9%          /* Dark Gray */
--secondary: 0 0% 96.1%     /* Light Gray */
--border: 0 0% 89.8%        /* Border Gray */
```

### Typography
```css
/* Font Stack */
font-family: Inter, "Helvetica Neue", -apple-system, sans-serif;

/* Type Scale */
--text-xs: 0.75rem     /* 12px - Badges, labels */
--text-sm: 0.875rem    /* 14px - Secondary text */
--text-base: 1rem      /* 16px - Body text */
--text-lg: 1.125rem    /* 18px - Subheadings */
--text-xl: 1.25rem     /* 20px - Section headers */
--text-2xl: 1.5rem     /* 24px - Page titles */
--text-3xl: 1.875rem   /* 30px - Hero text */
--text-4xl: 2.25rem    /* 36px - Large displays */

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System
```css
/* Based on 8px grid */
--space-0: 0           /* 0px */
--space-1: 0.25rem     /* 4px */
--space-2: 0.5rem      /* 8px */
--space-3: 0.75rem     /* 12px */
--space-4: 1rem        /* 16px */
--space-5: 1.25rem     /* 20px */
--space-6: 1.5rem      /* 24px */
--space-8: 2rem        /* 32px */
--space-10: 2.5rem     /* 40px */
--space-12: 3rem       /* 48px */
--space-16: 4rem       /* 64px */
--space-20: 5rem       /* 80px */
--space-24: 6rem       /* 96px */
```

### Component Patterns

#### Cards
```jsx
// Standard card pattern
<div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
  <div className="p-6">
    {/* Card content */}
  </div>
</div>

// Elevated card
<div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
  <div className="p-6">
    {/* Card content */}
  </div>
</div>

// Minimal card
<div className="border-l-4 border-black pl-6 py-4">
  {/* Card content */}
</div>
```

#### Buttons
```jsx
// Primary button
<button className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200 font-medium">
  Primary Action
</button>

// Secondary button
<button className="px-6 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium">
  Secondary Action
</button>

// Ghost button
<button className="px-4 py-2 text-black hover:bg-gray-100 rounded-md transition-colors duration-200">
  Ghost Action
</button>

// Icon button
<button className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-md transition-all duration-200">
  <Icon className="w-5 h-5" />
</button>
```

#### Form Elements
```jsx
// Text input
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
  placeholder="Enter text..."
/>

// Select dropdown
<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Checkbox
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
  />
  <span className="text-sm text-gray-700">Checkbox label</span>
</label>
```

### Animation Guidelines

#### Micro-interactions
```css
/* Standard transition */
transition-duration: 200ms;
transition-timing-function: ease-in-out;

/* Hover scale */
transform: scale(1);
transition: transform 200ms ease-in-out;
&:hover {
  transform: scale(1.05);
}

/* Fade in on scroll */
opacity: 0;
transform: translateY(20px);
transition: opacity 600ms ease-out, transform 600ms ease-out;
&.visible {
  opacity: 1;
  transform: translateY(0);
}
```

#### Loading States
```jsx
// Skeleton loader
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>

// Progress bar
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-black h-2 rounded-full transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>
```

## Mobile-First Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Responsive Patterns
```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Responsive typography
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

// Mobile-first visibility
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>
```

### Touch Interface Standards
- **Minimum touch target**: 44px × 44px (iOS standard)
- **Recommended touch target**: 48px × 48px
- **Touch target spacing**: Minimum 8px between targets
- **Thumb zone optimization**: Primary actions in bottom 1/3 of screen

## Component Architecture

### File Structure
```
src/components/
├── ui/                  # Base UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── modal.tsx
├── policy/             # Domain-specific components
│   ├── policy-card.tsx
│   ├── policy-search.tsx
│   └── policy-list.tsx
├── layout/             # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
└── shared/             # Shared utilities
    ├── loading.tsx
    └── error-boundary.tsx
```

### Component Template
```tsx
import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Component: FC<ComponentProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  onClick,
  ...props
}) => {
  const baseStyles = "relative transition-all duration-200";
  
  const variants = {
    default: "bg-white text-black",
    secondary: "bg-gray-100 text-gray-800"
  };
  
  const sizes = {
    sm: "p-2 text-sm",
    md: "p-4 text-base",
    lg: "p-6 text-lg"
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
```

## A/B Testing Framework

### Test Variant Structure
```tsx
// Base component
export function PolicyCard({ policy, variant = 'control' }) {
  const variants = {
    control: <PolicyCardControl {...props} />,
    testA: <PolicyCardVariantA {...props} />,
    testB: <PolicyCardVariantB {...props} />
  };
  
  return variants[variant] || variants.control;
}

// Variant implementations
function PolicyCardControl({ policy }) {
  // Original design
}

function PolicyCardVariantA({ policy }) {
  // Test variant A - More prominent CTA
}

function PolicyCardVariantB({ policy }) {
  // Test variant B - Minimalist approach
}
```

### Success Metrics
- **Primary KPIs**: Conversion rate, click-through rate
- **Secondary KPIs**: Time on page, bounce rate
- **Technical Metrics**: Load time, error rate
- **User Experience**: Task completion time, satisfaction score

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Error Handling**: Clear error messages and recovery paths

### Implementation Checklist
```jsx
// Accessible button
<button
  aria-label="Search policies"
  aria-pressed={isActive}
  className="focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
>
  <span className="sr-only">Search</span>
  <SearchIcon aria-hidden="true" />
</button>

// Accessible form
<form aria-label="Policy search form">
  <label htmlFor="search" className="sr-only">
    Search policies
  </label>
  <input
    id="search"
    type="search"
    aria-describedby="search-hint"
    required
  />
  <span id="search-hint" className="text-sm text-gray-600">
    Enter policy number or keywords
  </span>
</form>
```

## Performance Optimization

### Image Optimization
```jsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="DoX Logo"
  width={200}
  height={50}
  priority // For above-fold images
  placeholder="blur"
  blurDataURL={shimmerDataURL}
/>
```

### Code Splitting
```jsx
import dynamic from 'next/dynamic';

const PolicyEditor = dynamic(
  () => import('@/components/policy/policy-editor'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);
```

### Performance Metrics
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 300ms
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.8s

## Development Workflow

### 1. Feature Request
- User or stakeholder requests new feature
- PRP (Product Requirement Prompt) created if complex

### 2. UX Design Phase
- **UX Engineer** creates wireframes and user flows
- Focus on structure, hierarchy, and interaction patterns
- No visual styling at this stage

### 3. Visual Design Phase
- **UI Implementation Agent** applies HELiiX design system
- Adds colors, typography, spacing, and animations
- Ensures brand consistency

### 4. Mobile Optimization
- **Mobile UX Engineer** adapts for touch interfaces
- Optimizes for small screens and thumb zones
- Creates mobile-specific navigation patterns

### 5. Framework Implementation
- **UI Converter** transforms designs to React components
- Adds TypeScript interfaces and props
- Implements state management and interactivity

### 6. A/B Testing
- **UI Testing Agent** creates variant designs
- Defines success metrics and test strategies
- Generates multiple approaches for optimization

## Best Practices

### Component Design
1. **Single Responsibility**: Each component does one thing well
2. **Composition Over Inheritance**: Build complex UIs from simple pieces
3. **Props Over State**: Prefer controlled components
4. **Accessibility First**: Build inclusive from the start
5. **Performance Aware**: Optimize for speed and efficiency

### Code Quality
1. **TypeScript Strict Mode**: Catch errors at compile time
2. **ESLint + Prettier**: Consistent code formatting
3. **Component Testing**: Unit and integration tests
4. **Documentation**: Clear prop descriptions and examples
5. **Code Reviews**: Maintain quality standards

### Design Consistency
1. **Design Tokens**: Use predefined values for spacing, colors
2. **Component Library**: Reuse existing components
3. **Pattern Consistency**: Similar actions have similar UI
4. **Responsive First**: Design for all screen sizes
5. **Brand Adherence**: Follow HELiiX design system

## Conclusion

The DoX UI/UX architecture provides a robust foundation for building consistent, accessible, and performant user interfaces. By leveraging Claude Code's sub-agent system and following the HELiiX design system, we ensure high-quality UI development that scales with the project's needs.

---

*For implementation details, refer to individual agent documentation in `.claude/agents/`*