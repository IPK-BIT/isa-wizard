# ISA Wizard 2 - Embeddable Widget Implementation

This is a fully functional embeddable widget built with Svelte 5, TypeScript, TailwindCSS, and daisyUI. The widget collects user information through multi-step forms and can be embedded in any web application.

## What's Implemented ✅

### Core Architecture

- **Web Component** (`<isa-wizard>`) - Custom HTML element for easy embedding
- **JavaScript API** - Programmatic control via ESM and UMD bundles
- **Configuration System** - JSON-based configuration with full validation
- **Event System** - Callback support for form completion and errors
- **Multi-step Forms** - Build complex wizards with flexible field types

### Features

✅ Dual bundle formats (ESM + UMD)
✅ Web Component with Shadow DOM style encapsulation
✅ Flexible configuration (URL-based or inline JSON)
✅ TailwindCSS + daisyUI styling
✅ Form validation and required field checks
✅ Event-driven architecture (`finish`, `error`, `stepChanged`)
✅ TypeScript support with full type definitions
✅ Responsive design
✅ Dark mode support via daisyUI themes

### Generated Files

```
dist/
├── widget.mjs              # ESM bundle for modern bundlers
├── widget.umd.js           # UMD bundle for <script> tags
├── isa-wizard-2.css        # Compiled CSS with TailwindCSS
├── example-config.json     # Sample configuration file
└── [other static assets]
```

## Quick Start

### Method 1: Web Component (Easiest)

```html
<!DOCTYPE html>
<html>
	<head>
		<!-- No CSS needed - styles are bundled -->
	</head>
	<body>
		<!-- Add widget with config URL -->
		<isa-wizard config-url="/example-config.json"></isa-wizard>

		<!-- Load the widget script -->
		<script src="dist/widget.umd.js"></script>

		<script>
			// Listen for form completion
			document.addEventListener('finish', (event) => {
				console.log('Form completed:', event.detail.responses);
			});
		</script>
	</body>
</html>
```

### Method 2: Modern Bundler (Vite, Webpack, etc.)

```javascript
import ISAWizardElement from './dist/widget.mjs';

// Use as Web Component
const widget = document.createElement('isa-wizard');
widget.setAttribute('config-url', '/example-config.json');

// Listen for events
widget.addEventListener('finish', (event) => {
	console.log('Submitted:', event.detail.responses);
});

document.body.appendChild(widget);
```

### Method 3: Inline Configuration

```javascript
const widget = document.createElement('isa-wizard');

// Define config directly
widget.onFinish = (data) => {
	console.log('User data:', data.responses);
	console.log('Submitted at:', new Date(data.timestamp));
};

widget.setConfig({
	title: 'Sign Up',
	steps: [
		{
			id: 'step-1',
			title: 'Your Info',
			fields: [
				{
					name: 'email',
					label: 'Email',
					type: 'email',
					required: true
				}
			]
		}
	]
});

document.body.appendChild(widget);
```

## Configuration Schema

### Example Config Structure

```json
{
	"title": "Customer Information",
	"description": "Please provide your details",
	"steps": [
		{
			"id": "personal-info",
			"title": "Personal Information",
			"fields": [
				{
					"name": "firstName",
					"label": "First Name",
					"type": "text",
					"required": true,
					"placeholder": "John"
				}
			]
		}
	],
	"submitButtonLabel": "Complete",
	"cancelButtonLabel": "Back"
}
```

### Field Types

- `text` - Standard text input
- `email` - Email input with validation
- `number` - Numeric input
- `textarea` - Multi-line text area
- `select` - Dropdown with options
- `radio` - Radio button group
- `checkbox` - Checkbox input

See [WIDGET_USAGE.md](./WIDGET_USAGE.md) for complete configuration documentation.

## File Structure

```
src/
├── main.ts                           # Dev entry point
├── App.svelte                        # Demo app
├── ISAWidget.svelte                  # Main widget component
├── ISAWidget.css                     # Widget styles
├── web-component.ts                  # Custom element registration ⭐
├── app.css                           # Global styles with Tailwind directives
├── lib/
│   ├── configLoader.ts               # Config loading & validation
│   ├── eventBus.ts                   # Event emitter utility
│   ├── Counter.svelte                # Example component
│   └── types/
│       ├── Config.ts                 # Configuration types
│       └── Events.ts                 # Event types

public/
├── example-config.json               # Sample form configuration

Build outputs:
dist/
├── widget.mjs                        # ESM bundle
├── widget.umd.js                     # UMD bundle
└── isa-wizard-2.css                  # CSS bundle
```

## Build & Development

### Development Server

```bash
pnpm install
pnpm dev
# Opens http://localhost:5173
```

### Production Build

```bash
pnpm build
# Generates dist/widget.mjs, dist/widget.umd.js, dist/isa-wizard-2.css
```

### Type Checking

```bash
pnpm check
```

## API Reference

### Web Component Properties

```javascript
const widget = document.querySelector('isa-wizard');

// Set configuration from URL
widget.setAttribute('config-url', '/path/to/config.json');

// Or inline JSON
widget.setAttribute('config', JSON.stringify(configObject));

// Set completion callback
widget.onFinish = (data) => {
	// data = { responses: {...}, timestamp: number }
};
```

### Events

```javascript
// Form completed successfully
widget.addEventListener('finish', (event) => {
	const { responses, timestamp } = event.detail;
});

// Configuration loading error
widget.addEventListener('error', (event) => {
	const { error } = event.detail;
});

// User navigated to a different step
widget.addEventListener('stepChanged', (event) => {
	const { stepIndex } = event.detail;
});
```

## Styling & Customization

The widget uses **TailwindCSS** and **daisyUI** for styling:

- **Light/Dark themes** - Automatically switch based on system preference
- **Responsive** - Works on all screen sizes
- **Shadow DOM** - Styles are isolated from the host application
- **Customizable** - Override daisyUI themes via CSS custom properties

### Using Custom Theme

```html
<style>
	:root {
		--primary: #6366f1;
		--secondary: #8b5cf6;
	}
</style>
<isa-wizard config-url="/config.json"></isa-wizard>
```

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari 12+, Chrome Mobile)

## Example Usage

See [public/example-config.json](./public/example-config.json) for a complete multi-step form example with various field types.

## Documentation

For detailed usage instructions and advanced examples, see [WIDGET_USAGE.md](./WIDGET_USAGE.md).

## Technical Details

### Entry Points

- **Web Component**: `src/web-component.ts` - Registers `<isa-wizard>` custom element
- **Widget Component**: `src/ISAWidget.svelte` - Main React-free Svelte component
- **Configuration**: `src/lib/configLoader.ts` - Loads & validates form configs

### Key Dependencies

- **Svelte 5.55** - UI framework
- **TailwindCSS 4** - CSS utility framework
- **daisyUI 5** - Tailwind component library
- **TypeScript** - Type safety

### Build Configuration

- **Vite 8** - Fast build tool
- **ESM + UMD** - Multiple formats for broader compatibility
- **PostCSS** - CSS processing
- **Terser** - JavaScript minification

## Next Steps

### For Developers Using This Widget

1. Get the built files from `dist/`
2. Include the appropriate bundle (ESM or UMD) in your application
3. Configure with a JSON file or inline object
4. Listen for the `finish` event to get form responses

### For Contributors

1. Modify components in `src/`
2. Run `pnpm dev` for live development
3. Run `pnpm build` to create production bundles
4. The widget is fully self-contained and shareable

---

**Happy widget building!** 🚀
