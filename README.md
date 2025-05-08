# SeatPlan

A powerful desktop application built with Electron to help event organizers manage seating arrangements and guest lists efficiently. Perfect for weddings, corporate events, conferences, and any gathering that requires organized seating management.

## Key Features

### Guest Management
- **Intuitive Search**: 
  - Quick search by guest name
  - Alphabetical filtering with A-Z quick access
  - Real-time search results
  - View detailed guest information including role/title

### Table Management
- **Dynamic Table Creation**:
  - Create and customize tables
  - Set table capacity (up to 12 guests per table)
  - Name tables according to your event's needs
  - Edit or remove tables as needed

### Floor Plan Management
- **Interactive Floor Plan**:
  - Drag-and-drop table placement
  - Visual representation of all tables
  - Lock/unlock floor plan for editing
  - Adjust table scale for better visibility
  - Upload custom floor plan background images
  - Auto-arrange tables in different layouts:
    - Grid layout
    - Circular layout
    - U-shaped layout

### Guest Import & Data Management
- **Flexible Import Options**:
  - Import guest lists from CSV files
  - Paste guest data directly
  - Format: Name, Role, Table Number
  - Automatic table creation for new table numbers
  - Validation to prevent table overcrowding

### Admin Features
- **Secure Access**:
  - Password-protected admin area
  - Configurable session timeout
  - Change admin password functionality

### Event Customization
- **Event Details**:
  - Set event name and date
  - Upload event logo
  - Customize display settings

### User Interface
- **Dual Mode Interface**:
  - Search Mode: For quick guest lookup during events
  - Admin Mode: For setup and management
- **Responsive Design**:
  - Clean, modern interface
  - Easy navigation between sections
  - Real-time updates

## Getting Started

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/GSC-Development/table-finder.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

### Initial Setup

1. Launch the application
2. Access admin mode (default password: 9999)
3. Set up your event:
   - Enter event name and date
   - Upload logo (optional)
   - Create tables
   - Import guest list

### Importing Guests

#### CSV Format
```csv
Name,Role,TableNumber
John Doe,Guest,1
Jane Smith,VIP,2
```

#### Direct Paste Format
```
Name,Role,TableNumber
```

## Development

### Technology Stack
- **Frontend**: 
  - Vanilla JavaScript
  - HTML5
  - CSS3
- **Backend**: 
  - Electron
  - Node.js

### Project Structure
```
seatplan/
├── main.js           # Main Electron process
├── preload.js        # Preload script for IPC
├── renderer.js       # UI logic and event handling
├── index.html        # Main application HTML
├── styles.css        # Application styling
└── package.json      # Project configuration
```

### Building for Production

Build distributions for your platform:
```bash
npm run build
```

## Best Practices

### Guest List Management
- Import guests before creating manual table assignments
- Use consistent table naming conventions
- Regularly save changes
- Clear data with caution

### Floor Plan Organization
- Lock floor plan when not actively editing
- Use appropriate scale for your venue
- Consider traffic flow when arranging tables
- Utilize auto-arrange features for initial layouts

## Troubleshooting

### Common Issues
1. **CSV Import Issues**
   - Ensure correct format (Name,Role,TableNumber)
   - Check for special characters
   - Verify file encoding (UTF-8 recommended)

2. **Table Management**
   - Maximum 12 guests per table
   - Table names must be unique
   - Clear data affects all guest and table information

## License

ISC

## Support

For issues and feature requests, please create an issue in the GitHub repository.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.