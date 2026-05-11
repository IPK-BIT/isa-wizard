# ISA Wizard Widget - Usage Guide

The ISA Wizard is an embeddable widget that allows you to collect user information through a multi-step form. It can be embedded in any web application using either a Web Component or JavaScript API.

## Installation

### Via NPM/PNPM

```bash
npm install isa-wizard-2
# or
pnpm add isa-wizard-2
```

### Via Script Tag (UMD Bundle)

```html
<script src="https://your-cdn.com/dist/widget.umd.js"></script>
```

## Quick Start

### Method 1: Web Component (Recommended)

The simplest way to embed the widget is using the `<isa-wizard>` custom HTML element:

```html
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="https://your-cdn.com/dist/style.css" />
	</head>
	<body>
		<isa-wizard config-url="/config.json"></isa-wizard>

		<script src="https://your-cdn.com/dist/widget.umd.js"></script>
		<script>
			// Listen on the widget element for the public finish event
			const widget = document.querySelector('isa-wizard');
			widget.addEventListener('finish', (event) => {
				console.log('Form completed:', event.detail);
				// event.detail contains: { responses: {...}, timestamp: ... }
			});
		</script>
	</body>
</html>
```

### Method 2: JavaScript API (ESM)

For modern bundlers (webpack, Vite, etc.):

```javascript
import ISAWizardElement from 'isa-wizard-2';
import 'isa-wizard-2/style';

// Create and configure widget
const widget = document.createElement('isa-wizard');
widget.setAttribute('config-url', '/config.json');

// Add event listener
widget.addEventListener('finish', (event) => {
	console.log('Form completed:', event.detail);
});

// Mount to DOM
document.body.appendChild(widget);
```

### Method 3: Programmatic Configuration with Callback

```javascript
import ISAWizardElement from 'isa-wizard-2';
import 'isa-wizard-2/style';

const config = {
	title: 'Sign Up',
	steps: [
		{
			id: 'step-1',
			title: 'Personal Info',
			fields: [
				{
					name: 'name',
					label: 'Full Name',
					type: 'text',
					required: true
				}
			]
		}
	]
};

const widget = document.createElement('isa-wizard');

// Set onFinish callback
widget.onFinish = async (data) => {
	console.log('User completed the wizard:', data.responses);
	console.log('Timestamp:', data.timestamp);

	// Send to server
	await fetch('/api/submissions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data.responses)
	});
};

// Set config directly as object
widget.setConfig(config);

// Or as JSON string
widget.setAttribute('config', JSON.stringify(config));

document.body.appendChild(widget);
```

## Configuration Schema

The widget is configured via a JSON object with the following structure:

```typescript
interface WizardConfig {
	title: string; // Main title of the wizard
	description?: string; // Optional subtitle/description
	steps: StepConfig[]; // Array of form steps
	submitButtonLabel?: string; // Custom submit button text (default: "Submit")
	cancelButtonLabel?: string; // Custom cancel button text (default: "Previous")
}

interface StepConfig {
	id: string; // Unique step identifier
	title: string; // Step title shown to user
	description?: string; // Optional step description
	fields: FieldConfig[]; // Fields to display in this step
}

interface FieldConfig {
	name: string; // Unique field identifier (used in responses)
	label: string; // Field label shown to user
	type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea' | 'radio';
	required?: boolean; // Is field required? (default: false)
	placeholder?: string; // Input placeholder text
	options?: Array<{
		// For select/radio: available options
		label: string;
		value: string | number;
	}>;
	validation?: {
		// Optional validation rules
		pattern?: string; // Regex pattern for validation
		message?: string; // Error message
	};
}
```

### Example Configuration

See [public/example-config.json](../public/example-config.json) for a complete example.

## Events

### `finish` Event

Fired when the user completes all steps and submits the form:

```javascript
widget.addEventListener('finish', (event) => {
	// event.detail = {
	//   responses: { fieldName: value, ... },
	//   timestamp: number (milliseconds since epoch)
	// }
});
```

### `error` Event

Fired if configuration loading fails:

```javascript
widget.addEventListener('error', (event) => {
	console.error('Widget error:', event.detail.error);
});
```

### `stepChanged` Event

Fired when user navigates to a new step:

```javascript
widget.addEventListener('stepChanged', (event) => {
	console.log('Now on step:', event.detail.stepIndex);
});
```

## API Reference

### Web Component Methods

```javascript
const widget = document.querySelector('isa-wizard')

// Load config from URL
widget.setConfig('/path/to/config.json')

// Set config from object
widget.setConfig({
  title: 'My Form',
  steps: [...]
})

// Get current responses
const responses = widget.getResponses()
```

### Web Component Properties

```javascript
// Set callback function (receives: { responses, timestamp })
widget.onFinish = (data) => {
	console.log('Form submitted:', data);
};

// Set attributes
widget.setAttribute('config-url', '/config.json');
widget.setAttribute('config', JSON.stringify(configObject));
```

## Styling

The widget uses TailwindCSS and daisyUI for styling. By default, it's styled with a light theme and responsive design.

### Custom Styling

To customize the widget appearance, include the CSS and override variables:

```html
<link rel="stylesheet" href="https://your-cdn.com/dist/style.css" />
<style>
	:root {
		--primary: #6366f1;
		--secondary: #8b5cf6;
	}
</style>
```

### Shadow DOM Isolation

The widget uses Shadow DOM to prevent style conflicts with your host application. This means:

- Widget styles won't leak into your app
- Your app styles won't affect the widget (except inherited properties)
- You can still customize via CSS custom properties

## Error Handling

### Configuration Loading Errors

```javascript
const widget = document.createElement('isa-wizard');

widget.addEventListener('error', (event) => {
	const { error } = event.detail;
	console.error('Failed to load configuration:', error.message);

	// Show user-friendly error message
	alert('Unable to load the form. Please refresh the page.');
});

widget.setConfig('https://invalid-url.com/config.json');
```

### Network Errors

If the config URL is unreachable, the widget will display an error message. Ensure:

- Config URL is accessible from your domain
- CORS headers are properly configured (if cross-origin)
- JSON is valid

## Multiple Instances

You can embed multiple widget instances on the same page:

```html
<div id="form-1">
	<isa-wizard config-url="/forms/contact.json"></isa-wizard>
</div>

<div id="form-2">
	<isa-wizard config-url="/forms/survey.json"></isa-wizard>
</div>

<script src="https://your-cdn.com/dist/widget.umd.js"></script>
<script>
	// Each instance fires its own events
	document.querySelectorAll('isa-wizard').forEach((widget, index) => {
		widget.addEventListener('finish', (event) => {
			console.log(`Form ${index + 1} submitted:`, event.detail);
		});
	});
</script>
```

## Advanced Usage

### Submitting to a Server

```javascript
const widget = document.createElement('isa-wizard');

widget.onFinish = async (data) => {
	try {
		const response = await fetch('/api/submit-form', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				formData: data.responses,
				submittedAt: new Date(data.timestamp).toISOString()
			})
		});

		if (response.ok) {
			alert('Form submitted successfully!');
		} else {
			throw new Error('Server error: ' + response.status);
		}
	} catch (error) {
		console.error('Submission failed:', error);
		alert('Failed to submit form. Please try again.');
	}
};

widget.setConfig('/config.json');
document.body.appendChild(widget);
```

### Dynamic Configuration

```javascript
// Load configuration based on user choice
async function loadFormForRole(role) {
	const config = await fetch(`/configs/form-${role}.json`).then((r) => r.json());
	widget.setConfig(config);
}

// User selects role
document.querySelector('#role-select').addEventListener('change', (e) => {
	loadFormForRole(e.target.value);
});
```

### Form Validation Before Submission

```javascript
widget.onFinish = async (data) => {
	const { responses } = data;

	// Custom validation
	if (!validateEmail(responses.email)) {
		alert('Invalid email address');
		return;
	}

	// Proceed with submission
	await submitToServer(responses);
};
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Mobile latest

**Note:** Web Components require a modern browser. For older browser support, use a Web Components polyfill.

## Troubleshooting

### Widget doesn't appear

1. Ensure CSS is loaded: `<link rel="stylesheet" href="...dist/style.css">`
2. Check console for errors: `F12` → Console tab
3. Verify element is added to DOM: `document.querySelector('isa-wizard')`

### Events not firing

- Ensure you're listening on the correct element
- Check that `onFinish` callback is set before mounting
- Verify event names in listener: `'finish'` not `'onfinish'`

### Style issues

- Widget uses TailwindCSS classes via daisyUI
- If styles are broken, ensure CSS is loaded after JS
- Check for CSS framework conflicts

### CORS errors when loading config

- Configure server to include `Access-Control-Allow-Origin` header
- Or serve config from same domain
- Or use relative URLs like `/config.json`

## Support

For issues, feature requests, or contributions, visit the [GitHub repository](https://github.com/your-org/isa-wizard-2).
