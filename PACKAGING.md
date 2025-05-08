# SeatPlan Application

## Icon Setup
To set a custom application icon:

1. Create a 1024×1024 PNG file named `icon.png`
2. Place it in the root directory of your project
3. For macOS, you can convert it to .icns format using tools like:
   - iconutil (command line)
   - https://iconverticons.com/ (online)
   - Icon Composer (macOS app)

## Building the Application
Run one of the following commands:

- `npm run build` - Build for all platforms
- `npm run build:mac` - Build for macOS only
- `npm run build:win` - Build for Windows only

The packaged application will be in the `dist` folder.
