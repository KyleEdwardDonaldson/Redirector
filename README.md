# Redirector

A Firefox extension for managing URL redirections with a modern interface, logging, and advanced features.

**[Download from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/kedredirector/)**

## Features

### Core Functionality
- **URL Redirection**: Automatically redirect URLs based on configurable rules
- **Enable/Disable Rules**: Toggle individual rules on and off without deleting them
- **Rule Management**: Add, edit, and delete redirection rules through an intuitive interface

### Advanced Features
- **Import/Export**: Backup and share your rules by exporting to JSON files
- **Statistics Tracking**: Monitor how many times each rule has been triggered
- **Quick Access Popup**: Manage rules quickly from the browser toolbar
- **URL Validation**: Automatic validation of URLs to prevent configuration errors
- **Manifest V3**: Updated to use the latest Firefox extension standards

## Installation

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the Redirector folder and select `manifest.json`

## Usage

### Managing Rules

1. Click the extension icon in the toolbar or go to Add-ons → Advanced URL Redirector → Options
2. Click "Add Rule" to create a new redirection rule
3. Enter the source URL and destination URL
4. Use the checkbox to enable/disable the rule
5. Rules are automatically saved as you make changes

### Quick Access Popup

Click the extension icon to:
- View active rules count and total redirects
- Quickly enable/disable individual rules
- Toggle all rules on/off at once
- Access the full options page

### Import/Export Rules

**Export:**
1. Open the options page
2. Click "Export Rules"
3. A JSON file will be downloaded with all your rules

**Import:**
1. Open the options page
2. Click "Import Rules"
3. Select a previously exported JSON file

### Statistics

The options page displays:
- Number of times each rule has been triggered
- Last redirect timestamp for each rule
- Rules sorted by usage count

## File Structure

```
Redirector/
├── manifest.json       # Extension manifest (Manifest V3)
├── background.js       # Service worker handling redirections
├── options.html        # Options page UI
├── options.js          # Options page logic
├── popup.html          # Quick access popup UI
├── popup.js            # Popup logic
├── styles.css          # Modern styling
└── README.md           # This file
```

## Rule Format

Rules are stored in the following format:

```json
[
  {
    "source": "https://example.com/old",
    "destination": "https://example.com/new",
    "enabled": true
  }
]
```

## Improvements from v1.0

1. **Fixed manifest filename** (was `mainfest.json`)
2. **Upgraded to Manifest V3** with service workers
3. **Modern UI** with gradient design and responsive layout
4. **Enable/disable toggles** for individual rules
5. **Import/export functionality** for rule management
6. **Statistics tracking** with redirect counts
7. **URL validation** to prevent errors
8. **Quick access popup** for toolbar convenience
9. **Better error handling** with user-friendly messages
10. **Table-based interface** replacing raw JSON editing

## Technical Details

- **Storage**: Uses `chrome.storage.sync` for cross-device synchronization
- **Redirection**: Uses `webRequest` API for efficient URL interception
- **Compatibility**: Firefox Manifest V3 compatible
- **Performance**: Minimal memory footprint with efficient rule matching

## License

Free to use and modify.

## Version History

- **v2.0**: Complete redesign with modern UI and advanced features
- **v1.0**: Basic URL redirection functionality
