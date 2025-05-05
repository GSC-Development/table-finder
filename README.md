# Table Finder

A desktop application built with Electron to help event organizers quickly find where guests are seated.

## Features

- **Search**: Quickly find guests by name
- **Floor Plan**: Visual representation of tables with guest information
- **Admin Panel**: Manage tables and guests
  - Create and edit tables
  - Add and edit guests
  - View guest statistics
  - Bulk import guests from CSV format

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the application:
   ```
   npm start
   ```

## Development

The application is built with Electron and uses:
- Vanilla JavaScript for UI logic
- CSS for styling
- HTML for markup

## Building for Production

To build the application for production:

```
npm run build
```

This will create distributions for your current platform. See the electron-builder configuration in `package.json` for more options.

## Project Structure

- `main.js` - Main Electron process
- `preload.js` - Preload script that bridges the renderer and main processes
- `index.html` - Main application HTML
- `renderer.js` - UI logic
- `styles.css` - Styling

## License

ISC 