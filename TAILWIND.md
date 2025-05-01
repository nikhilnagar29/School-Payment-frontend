# Tailwind CSS Integration

This document provides an overview of how Tailwind CSS is integrated into the School Payment & Dashboard System frontend.

## Setup

Tailwind CSS has been set up with the following components:

1. **Core Dependencies**:

   - tailwindcss (v3.3.3)
   - postcss
   - autoprefixer

2. **Configuration Files**:

   - `tailwind.config.js`: Main Tailwind configuration
   - `postcss.config.js`: PostCSS integration with Tailwind

3. **CSS Integration**:
   - `src/index.css`: Contains Tailwind directives and custom component classes
   - `src/App.css`: Contains app-specific styles that complement Tailwind

## Theme Configuration

The Tailwind configuration includes:

- **Custom Color Palette**: Primary and secondary color schemes
- **Dark Mode Support**: Using the 'class' strategy for dark mode
- **Component Classes**: Predefined utility classes for common UI elements

## Dark Mode

Dark mode is implemented using Tailwind's class strategy:

1. The `DarkModeToggle` component (`src/components/DarkModeToggle.tsx`) provides a toggle button
2. Dark mode preference is saved in localStorage
3. System preference is used as a fallback if no preference is saved
4. The `dark` class is added to the `html` element when dark mode is enabled

## Custom Components

We've created several Tailwind component classes in `index.css`:

```css
@layer components {
  .btn {
    ...;
  }
  .btn-primary {
    ...;
  }
  .btn-secondary {
    ...;
  }
  .btn-outline {
    ...;
  }
  .input {
    ...;
  }
  .card {
    ...;
  }
}
```

These classes provide consistent styling across the application.

## Material UI Integration

Material UI components are used alongside Tailwind:

1. MUI components can be styled with Tailwind classes using the `className` prop
2. The Material UI theme (`src/main.tsx`) is configured to use colors that match the Tailwind palette
3. Some MUI component default styles are overridden to better integrate with Tailwind

## Usage Examples

### Basic Styling

```jsx
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Title</h2>
  <p className="text-gray-600 dark:text-gray-300">Content</p>
</div>
```

### Using Component Classes

```jsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-outline">Outline Button</button>
<div className="card">Card Content</div>
```

### Responsive Design

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content will be 1 column on mobile, 2 on tablets, 3 on desktops */}
</div>
```

### Dark Mode

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  This content changes in dark mode
</div>
```

## Best Practices

1. **Use Tailwind classes first** before writing custom CSS
2. **Leverage component classes** for consistency across the application
3. **Consider dark mode** when adding new components
4. **Use responsive utilities** for different screen sizes
5. **Keep the HTML semantic** despite using utility classes
