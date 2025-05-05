// renderer.js - UI logic for the Table Finder app

// Sample initial data
let currentEvent = {
  name: '',
  date: '', // Add date property
  logo: null,
  tables: [],
  guests: []
};

// DOM Elements
let searchModeBtn, floorModeBtn, adminModeBtn;
let searchSection, floorSection, adminSection;
let searchInput, alphabetBar, searchResults;
let floorTitle, floorPlan, floorGrid, availableTablesContainer;
let addTableBtn, editTablesBtn;
let clearEventNameCheckbox, clearAllDataBtn;
let modalContainer, modalTitle, modalContent, modalClose;
let pasteDataArea, processPastedDataBtn;
let eventNameInput, eventDateInput, saveEventNameBtn;
let logoDropArea, logoFileInput, logoSelectBtn, logoPreview, logoPreviewImg, removeLogoBtn;
let logoContainer, appTitle;
let viewGuestsBtn;

// Floor plan drag and drop elements
let toggleLockBtn, lockStatusText, editModeIndicator;

// Drag and drop state
let isFloorPlanLocked = true;
let draggedTable = null;
let dragStartX = 0;
let dragStartY = 0;
let tableOffset = { x: 0, y: 0 };

// Add new state variables to track table placement
let placedTables = new Set(); // IDs of tables placed on floor plan

// Initialize application
function init() {
  console.log('Initializing application...');
  
  // Get DOM elements
  checkDOMElements();
  
  // Create alphabet buttons
  createAlphabetBar();
  
  // Add event listeners
  addEventListeners();
  
  // Add some sample data if needed for testing
  if (currentEvent.tables.length === 0 && currentEvent.guests.length === 0) {
    console.log('Adding sample data for testing');
    addSampleData();
  }
  
  // Initialize UI
  updateUI();
  
  console.log('Application initialized with', currentEvent.guests.length, 'guests');
}

// Check DOM elements
function checkDOMElements() {
  console.log('Checking DOM elements...');
  
  // Mode buttons and sections
  searchModeBtn = document.getElementById('search-mode-btn');
  floorModeBtn = document.getElementById('floor-mode-btn');
  adminModeBtn = document.getElementById('admin-mode-btn');
  searchSection = document.getElementById('search-section');
  floorSection = document.getElementById('floor-section');
  adminSection = document.getElementById('admin-section');
  
  // Search elements
  searchInput = document.getElementById('search-input');
  alphabetBar = document.getElementById('alphabet-bar');
  searchResults = document.getElementById('search-results');
  
  // Log important elements
  console.log('Search Input Element:', searchInput);
  console.log('Search Results Element:', searchResults);
  
  // Floor plan elements
  floorTitle = document.getElementById('floor-title');
  floorPlan = document.getElementById('floor-plan');
  floorGrid = document.getElementById('floor-grid');
  availableTablesContainer = document.getElementById('available-tables');
  toggleLockBtn = document.getElementById('toggle-lock-btn');
  lockStatusText = document.getElementById('lock-status-text');
  editModeIndicator = document.getElementById('edit-mode-indicator');
  
  // Admin elements
  addTableBtn = document.getElementById('add-table-btn');
  editTablesBtn = document.getElementById('edit-tables-btn');
  clearEventNameCheckbox = document.getElementById('clear-event-name-checkbox');
  clearAllDataBtn = document.getElementById('clear-all-data-btn');
  pasteDataArea = document.getElementById('paste-data-area');
  processPastedDataBtn = document.getElementById('process-pasted-data-btn');
  eventNameInput = document.getElementById('event-name');
  eventDateInput = document.getElementById('event-date');
  saveEventNameBtn = document.getElementById('save-event-name');
  
  // Logo elements
  logoDropArea = document.getElementById('logo-drop-area');
  logoFileInput = document.getElementById('logo-file-input');
  logoSelectBtn = document.getElementById('logo-select-btn');
  logoPreview = document.getElementById('logo-preview');
  logoPreviewImg = document.getElementById('logo-preview-img');
  removeLogoBtn = document.getElementById('remove-logo-btn');
  logoContainer = document.getElementById('logo-container');
  appTitle = document.getElementById('app-title');
  
  // Modal elements
  modalContainer = document.getElementById('modal-container');
  modalTitle = document.getElementById('modal-title');
  modalContent = document.getElementById('modal-content');
  modalClose = document.getElementById('modal-close');
  
  // Guest Management
  viewGuestsBtn = document.getElementById('view-guests-btn');
  
  // Log missing elements
  const missingElements = [];
  [
    { name: 'searchModeBtn', element: searchModeBtn },
    { name: 'floorModeBtn', element: floorModeBtn },
    { name: 'adminModeBtn', element: adminModeBtn },
    { name: 'searchSection', element: searchSection },
    { name: 'floorSection', element: floorSection },
    { name: 'adminSection', element: adminSection },
    { name: 'searchInput', element: searchInput },
    { name: 'alphabetBar', element: alphabetBar },
    { name: 'searchResults', element: searchResults },
    { name: 'floorTitle', element: floorTitle },
    { name: 'floorPlan', element: floorPlan },
    { name: 'floorGrid', element: floorGrid },
    { name: 'availableTablesContainer', element: availableTablesContainer },
    { name: 'toggleLockBtn', element: toggleLockBtn },
    { name: 'lockStatusText', element: lockStatusText },
    { name: 'editModeIndicator', element: editModeIndicator },
    { name: 'addTableBtn', element: addTableBtn },
    { name: 'editTablesBtn', element: editTablesBtn },
    { name: 'clearEventNameCheckbox', element: clearEventNameCheckbox },
    { name: 'clearAllDataBtn', element: clearAllDataBtn },
    { name: 'pasteDataArea', element: pasteDataArea },
    { name: 'processPastedDataBtn', element: processPastedDataBtn },
    { name: 'eventNameInput', element: eventNameInput },
    { name: 'eventDateInput', element: eventDateInput },
    { name: 'saveEventNameBtn', element: saveEventNameBtn },
    { name: 'logoDropArea', element: logoDropArea },
    { name: 'logoFileInput', element: logoFileInput },
    { name: 'logoSelectBtn', element: logoSelectBtn },
    { name: 'logoPreview', element: logoPreview },
    { name: 'logoPreviewImg', element: logoPreviewImg },
    { name: 'removeLogoBtn', element: removeLogoBtn },
    { name: 'logoContainer', element: logoContainer },
    { name: 'appTitle', element: appTitle },
    { name: 'modalContainer', element: modalContainer },
    { name: 'modalTitle', element: modalTitle },
    { name: 'modalContent', element: modalContent },
    { name: 'modalClose', element: modalClose },
    { name: 'viewGuestsBtn', element: viewGuestsBtn }
  ].forEach(item => {
    if (!item.element) {
      missingElements.push(item.name);
      console.error(`Element not found: ${item.name}`);
    }
  });
  
  if (missingElements.length > 0) {
    console.error('Missing elements:', missingElements);
  } else {
    console.log('All DOM elements found');
  }
}

// Create alphabet bar
function createAlphabetBar() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet[i];
    const button = document.createElement('button');
    button.className = 'letter-button';
    button.textContent = letter;
    button.addEventListener('click', () => handleLetterClick(letter));
    alphabetBar.appendChild(button);
  }
  
  // Add clear button
  const clearBtn = document.createElement('button');
  clearBtn.className = 'clear-button';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', clearLetterFilter);
  alphabetBar.appendChild(clearBtn);
  
  console.log('Alphabet bar created');
}

// Add event listeners
function addEventListeners() {
  console.log('Adding event listeners');
  
  // Tab switching
  if (searchModeBtn && floorModeBtn && adminModeBtn) {
    searchModeBtn.addEventListener('click', () => switchMode('search'));
    floorModeBtn.addEventListener('click', () => switchMode('floor'));
    adminModeBtn.addEventListener('click', () => switchMode('admin'));
  } else {
    console.error('One or more mode buttons not found');
  }
  
  // Note: Search functionality is now handled directly in the DOMContentLoaded event
  // to ensure it's always properly attached
  
  // Modal controls
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  } else {
    console.error('Modal close button not found');
  }
  
  // Process pasted data
  if (processPastedDataBtn) {
    console.log('Adding event listener for process pasted data button');
    processPastedDataBtn.addEventListener('click', processPastedData);
  } else {
    console.error('Process pasted data button not found');
  }
  
  // Event name
  if (saveEventNameBtn) {
    console.log('Adding event listener for save event name button');
    saveEventNameBtn.addEventListener('click', saveEventName);
  } else {
    console.error('Save event name button not found');
  }
  
  // Floor plan lock/unlock
  if (toggleLockBtn) {
    console.log('Adding event listener for floor plan lock toggle');
    toggleLockBtn.addEventListener('click', toggleFloorPlanLock);
  } else {
    console.error('Toggle lock button not found');
  }
  
  // Add event listener for event date changes
  if (eventDateInput) {
    eventDateInput.addEventListener('change', () => {
      // Update date when changed (but don't save automatically to avoid confusion)
      currentEvent.date = eventDateInput.value;
    });
  }
  
  // Logo upload
  if (logoDropArea && logoFileInput && logoSelectBtn && removeLogoBtn) {
    console.log('Adding event listeners for logo upload');
    logoDropArea.addEventListener('dragover', handleDragOver);
    logoDropArea.addEventListener('dragleave', handleDragLeave);
    logoDropArea.addEventListener('drop', handleDrop);
    logoSelectBtn.addEventListener('click', () => logoFileInput.click());
    logoFileInput.addEventListener('change', handleFileSelect);
    removeLogoBtn.addEventListener('click', removeLogo);
  } else {
    console.error('One or more logo elements not found');
  }
  
  // Table management
  if (addTableBtn) {
    console.log('Adding event listener for add table button');
    addTableBtn.addEventListener('click', showAddTableModal);
  } else {
    console.error('Add table button not found');
  }
  
  if (editTablesBtn) {
    console.log('Adding event listener for edit tables button');
    editTablesBtn.addEventListener('click', showEditTablesModal);
  } else {
    console.error('Edit tables button not found');
  }
  
  // Guest Management
  if (viewGuestsBtn) {
    console.log('Adding event listener for view guests button');
    viewGuestsBtn.addEventListener('click', showGuestManagementModal);
  } else {
    console.error('View guests button not found');
  }
  
  // Search input
  if (searchInput) {
    console.log('Adding event listener for search input');
    searchInput.addEventListener('input', handleSearch);
  } else {
    console.error('Search input not found');
  }
  
  // Clear all data
  if (clearAllDataBtn) {
    console.log('Adding event listener for clear all data button');
    clearAllDataBtn.addEventListener('click', clearAllData);
  } else {
    console.error('Clear all data button not found');
  }

  // Add document event listeners for drag and drop
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

// Switch between modes (search, floor plan, admin)
function switchMode(mode) {
  // Update tab buttons
  searchModeBtn.classList.toggle('active', mode === 'search');
  floorModeBtn.classList.toggle('active', mode === 'floor');
  adminModeBtn.classList.toggle('active', mode === 'admin');
  
  // Update visible section
  searchSection.classList.toggle('active', mode === 'search');
  floorSection.classList.toggle('active', mode === 'floor');
  adminSection.classList.toggle('active', mode === 'admin');
  
  // Update UI based on mode
  if (mode === 'floor') {
    renderFloorPlan();
  }
}

// Update all UI elements
function updateUI() {
  // Update event name in header (use "Table Finder" if empty)
  appTitle.textContent = currentEvent.name || 'Table Finder';
  eventNameInput.value = currentEvent.name;
  floorTitle.textContent = `${currentEvent.name || 'Table Finder'} - Floor Plan`;
  
  // Update event date if it exists
  if (eventDateInput) {
    eventDateInput.value = currentEvent.date || '';
  }
  
  // Update logo
  updateLogoDisplay();
  
  // Clear search
  searchInput.value = '';
  clearLetterFilter();
  searchResults.innerHTML = '';
  
  // Render floor plan
  renderFloorPlan();
}

// Letter filter functionality
function handleLetterClick(letter) {
  // Clear search input
  searchInput.value = '';
  
  // Check if the letter is already active (selected)
  const letterButtons = alphabetBar.querySelectorAll('.letter-button');
  const activeButton = alphabetBar.querySelector(`.letter-button.active`);
  const isAlreadyActive = activeButton && activeButton.textContent === letter;
  
  // Clear all active states first
  letterButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // If clicking the same letter, just clear the filter
  if (isAlreadyActive) {
    searchResults.innerHTML = '';
    return;
  }
  
  // Otherwise activate the new letter
  letterButtons.forEach(btn => {
    if (btn.textContent === letter) {
      btn.classList.add('active');
    }
  });
  
  // Filter guests by letter
  const filteredGuests = currentEvent.guests.filter(guest => 
    guest.name.charAt(0).toUpperCase() === letter
  );
  
  renderSearchResults(filteredGuests);
}

// Clear letter filter
function clearLetterFilter() {
  const letterButtons = alphabetBar.querySelectorAll('.letter-button');
  letterButtons.forEach(btn => btn.classList.remove('active'));
  
  if (!searchInput.value) {
    searchResults.innerHTML = '';
  } else {
    // Re-run search to refresh layout
    handleSearch();
  }
}

// Handle search - completely rebuilt
function handleSearch(event) {
  // Get the search input value directly from the DOM to ensure we're getting the current value
  const searchInputElement = document.getElementById('search-input');
  if (!searchInputElement) {
    console.error('Search input element not found when handling search');
    return;
  }
  
  const searchText = searchInputElement.value.trim().toLowerCase();
  console.log('Search triggered with text:', searchText);
  
  // Clear letter filter
  clearLetterFilter();
  
  // If empty search, clear results
  if (!searchText) {
    searchResults.innerHTML = '';
    return;
  }
  
  // Get all guests
  const allGuests = currentEvent.guests;
  if (!allGuests || allGuests.length === 0) {
    console.log('No guests found in data');
    searchResults.innerHTML = '<div class="no-results">No guests available</div>';
    return;
  }
  
  // Filter guests by name match
  const filteredGuests = allGuests.filter(guest => 
    guest.name.toLowerCase().includes(searchText)
  );
  
  console.log(`Found ${filteredGuests.length} matching guests for '${searchText}'`);
  
  if (filteredGuests.length === 0) {
    searchResults.innerHTML = `<div class="no-results">No guests found matching '${searchText}'</div>`;
    return;
  }
  
  // Render results
  renderSearchResults(filteredGuests);
}

// Render search results
function renderSearchResults(guests) {
  searchResults.innerHTML = '';
  
  if (guests.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No guests found';
    searchResults.appendChild(noResults);
    return;
  }
  
  // If only one result, show table view
  if (guests.length === 1) {
    showTableView(guests[0]);
    return;
  }
  
  // Check if this is from letter selection
  const activeLetterButton = alphabetBar.querySelector('.letter-button.active');
  const isLetterSelection = activeLetterButton !== null;
  
  // Create a container for guest cards
  const resultsContainer = document.createElement('div');
  resultsContainer.className = isLetterSelection ? 'two-column-results' : 'single-column-results';
  searchResults.appendChild(resultsContainer);
  
  // Show list of guests
  guests.forEach(guest => {
    const card = createGuestCard(guest);
    card.addEventListener('click', () => showTableView(guest));
    resultsContainer.appendChild(card);
  });
}

// Create guest card
function createGuestCard(guest) {
  const table = currentEvent.tables.find(t => t.id === guest.tableId);
  
  const card = document.createElement('div');
  card.className = 'result-card';
  
  card.innerHTML = `
    <div class="result-header">
      <div class="guest-name">${guest.name}</div>
      <div class="table-badge">${table ? table.name : 'Unknown Table'}</div>
    </div>
    ${guest.role ? `<div class="guest-role">${guest.role}</div>` : ''}
  `;
  
  return card;
}

// Show table view (all guests at same table)
function showTableView(selectedGuest) {
  const table = currentEvent.tables.find(t => t.id === selectedGuest.tableId);
  const tableGuests = currentEvent.guests.filter(g => g.tableId === selectedGuest.tableId);
  
  searchResults.innerHTML = '';
  
  // Add table info header
  const tableInfo = document.createElement('div');
  tableInfo.className = 'table-info';
  tableInfo.innerHTML = `
    <div class="table-title">${table ? table.name : 'Unknown Table'}</div>
    <div class="table-subtitle">Showing all guests seated with ${selectedGuest.name}</div>
  `;
  searchResults.appendChild(tableInfo);
  
  // Create a container for guest cards with grid layout
  const guestContainer = document.createElement('div');
  guestContainer.className = 'guest-grid-container';
  
  // Add all guests at this table
  tableGuests.forEach(guest => {
    const card = document.createElement('div');
    card.className = 'result-card grid-card';
    if (guest.id === selectedGuest.id) {
      card.classList.add('highlighted');
    }
    
    card.innerHTML = `
      <div class="guest-name">${guest.name}</div>
      ${guest.role ? `<div class="guest-role">${guest.role}</div>` : ''}
    `;
    
    guestContainer.appendChild(card);
  });
  
  searchResults.appendChild(guestContainer);
  
  // Add back button
  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.innerHTML = '&#8592; Back to search results';
  backButton.addEventListener('click', () => {
    if (searchInput.value) {
      handleSearch();
    } else {
      searchResults.innerHTML = '';
    }
  });
  searchResults.appendChild(backButton);
  
  // Highlight table in floor plan
  if (floorSection.classList.contains('active')) {
    highlightTable(selectedGuest.tableId);
  }
}

// Render floor plan
function renderFloorPlan() {
  // Clear the floor grid and available tables
  floorGrid.innerHTML = '';
  availableTablesContainer.innerHTML = '';
  
  if (!currentEvent.tables.length) {
    availableTablesContainer.innerHTML = `
      <div class="no-results">
        No tables have been created yet.<br>
        Go to Admin to add tables.
      </div>
    `;
    return;
  }
  
  // Update lock status display
  updateLockStatus();
  
  // Separate tables into available and placed
  const availableTables = currentEvent.tables.filter(table => !placedTables.has(table.id));
  const placedTablesArray = currentEvent.tables.filter(table => placedTables.has(table.id));
  
  // Render available tables in the side panel
  availableTables.forEach(table => {
    const tableGuests = currentEvent.guests.filter(g => g.tableId === table.id);
    
    const tableEl = document.createElement('div');
    tableEl.className = 'available-table';
    tableEl.dataset.tableId = table.id;
    
    tableEl.innerHTML = `
      <div class="table-name">${table.name}</div>
      <div class="table-count">${tableGuests.length} guests</div>
    `;
    
    // Make available tables draggable if unlocked
    if (!isFloorPlanLocked) {
      tableEl.classList.add('draggable');
      tableEl.draggable = true;
      
      // Add drag start event
      tableEl.addEventListener('dragstart', (e) => {
        draggedTable = table;
        e.dataTransfer.setData('text/plain', table.id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
          tableEl.classList.add('dragging');
        }, 0);
      });
      
      // Add drag end event
      tableEl.addEventListener('dragend', () => {
        tableEl.classList.remove('dragging');
        draggedTable = null;
      });
    }
    
    availableTablesContainer.appendChild(tableEl);
  });
  
  // Make the floor grid a drop target
  if (!isFloorPlanLocked) {
    floorGrid.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    
    floorGrid.addEventListener('drop', handleGridDrop);
  }
  
  // Render placed tables on the grid
  placedTablesArray.forEach(table => {
    renderTableOnGrid(table);
  });
}

// Handle dropping a table on the grid
function handleGridDrop(e) {
  e.preventDefault();
  
  if (!draggedTable || isFloorPlanLocked) return;
  
  // Get the drop position relative to the grid
  const rect = floorGrid.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Calculate position as percentage of grid dimensions (for responsive positioning)
  const xPercent = (x / rect.width) * 100;
  const yPercent = (y / rect.height) * 100;
  
  // Update table position
  draggedTable.xPercent = xPercent;
  draggedTable.yPercent = yPercent;
  
  // Mark table as placed
  placedTables.add(draggedTable.id);
  
  // Render the table on the grid
  renderTableOnGrid(draggedTable);
  
  // Re-render the floor plan to update both panels
  renderFloorPlan();
}

// Render a single table on the grid
function renderTableOnGrid(table) {
  const tableEl = document.createElement('div');
  tableEl.className = 'table-object';
  tableEl.id = `table-${table.id}`;
  
  // Position using percentages for responsiveness
  tableEl.style.left = `${table.xPercent}%`;
  tableEl.style.top = `${table.yPercent}%`;
  
  // Adjust for centering (half of table width/height)
  tableEl.style.transform = 'translate(-50%, -50%)';
  
  // Add draggable class if plan is unlocked
  if (!isFloorPlanLocked) {
    tableEl.classList.add('draggable');
  }
  
  const tableGuests = currentEvent.guests.filter(g => g.tableId === table.id);
  
  tableEl.innerHTML = `
    <div>
      <div class="table-name">${table.name}</div>
      <div class="table-count">${tableGuests.length} guests</div>
    </div>
    ${!isFloorPlanLocked ? '<span class="table-remove-btn">×</span>' : ''}
  `;
  
  // Handle interactions based on lock state
  if (!isFloorPlanLocked) {
    tableEl.addEventListener('mousedown', (e) => {
      // Don't initiate drag if clicking the remove button
      if (e.target.classList.contains('table-remove-btn')) {
        e.stopPropagation();
        return;
      }
      handleTableMouseDown(e, table);
    });
    
    // Add remove button click handler
    const removeBtn = tableEl.querySelector('.table-remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove table from placed tables
        placedTables.delete(table.id);
        // Re-render the floor plan
        renderFloorPlan();
      });
    }
  } else {
    tableEl.addEventListener('click', (e) => {
      e.stopPropagation();
      showTableInfoFloating(table, tableEl);
    });
  }
  
  floorGrid.appendChild(tableEl);
}

// Handle mouse move while dragging
function handleMouseMove(e) {
  if (!draggedTable || isFloorPlanLocked) return;
  
  if (placedTables.has(draggedTable.id)) {
    // Get grid dimensions
    const gridRect = floorGrid.getBoundingClientRect();
    
    // Calculate new position as percentage
    const xPercent = ((e.clientX - gridRect.left) / gridRect.width) * 100;
    const yPercent = ((e.clientY - gridRect.top) / gridRect.height) * 100;
    
    // Constrain to boundaries (0-100%)
    const constrainedX = Math.max(0, Math.min(xPercent, 100));
    const constrainedY = Math.max(0, Math.min(yPercent, 100));
    
    // Update table element position
    const tableEl = document.getElementById(`table-${draggedTable.id}`);
    if (tableEl) {
      tableEl.style.left = `${constrainedX}%`;
      tableEl.style.top = `${constrainedY}%`;
    }
    
    // Update the data model
    draggedTable.xPercent = constrainedX;
    draggedTable.yPercent = constrainedY;
    
    // Hide any floating info while dragging
    hideTableInfoFloating();
  }
}

// Handle mouse up after dragging
function handleMouseUp(e) {
  if (!draggedTable || isFloorPlanLocked) return;
  
  // Get table element
  const tableEl = document.getElementById(`table-${draggedTable.id}`);
  if (tableEl) {
    tableEl.classList.remove('dragging');
  }
  
  // Reset drag state
  draggedTable = null;
}

// Import CSV
function importCsv() {
  alert('Import CSV functionality has been removed');
}

// Export CSV
function exportCsv() {
  alert('Export CSV functionality has been removed');
}

// Save project
function saveProject() {
  alert('Save project functionality has been removed');
}

// Open project
function openProject() {
  alert('Open project functionality has been removed');
}

// Show add table modal
function showAddTableModal() {
  modalTitle.textContent = 'Add New Table';
  modalContent.innerHTML = `
    <div class="form-group">
      <label for="table-name">Table Name</label>
      <input type="text" id="table-name" class="modal-input" placeholder="e.g., Table 1">
    </div>
    <div class="form-group">
      <label for="table-seats">Number of Seats</label>
      <input type="number" id="table-seats" class="modal-input" value="10" min="1">
    </div>
    <div class="modal-actions">
      <button id="cancel-add-table" class="btn">Cancel</button>
      <button id="create-table" class="btn primary">Add Table</button>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('cancel-add-table').addEventListener('click', closeModal);
  document.getElementById('create-table').addEventListener('click', addNewTable);
  
  // Show modal
  modalContainer.classList.remove('hidden');
}

// Add new table
function addNewTable() {
  const tableName = document.getElementById('table-name').value.trim();
  const tableShape = 'circle'; // Always use circle shape
  const tableSeats = parseInt(document.getElementById('table-seats').value) || 10;
  
  if (!tableName) {
    alert('Please enter a table name');
    return;
  }
  
  // Create new table
  const newTable = {
    id: `table${Date.now()}`,
    name: tableName,
    shape: 'circle', // Always use circle shape
    seats: tableSeats,
    xPercent: 50, // Default to center if placed
    yPercent: 50
  };
  
  // Add to event
  currentEvent.tables.push(newTable);
  
  // Update UI
  renderFloorPlan();
  closeModal();
}

// Show edit tables modal
function showEditTablesModal() {
  const event = currentEvent;
  
  if (!event || !event.tables.length) {
    alert('No tables to edit');
    return;
  }
  
  modalTitle.textContent = 'Edit Tables';
  
  let tableListHtml = '';
  event.tables.forEach(table => {
    const guestCount = event.guests.filter(g => g.tableId === table.id).length;
    
    tableListHtml += `
      <div class="table-edit-item">
        <div class="table-edit-info">
          <div class="table-edit-name">${table.name}</div>
          <div class="table-edit-details">
            ${table.shape}, ${table.seats} seats, ${guestCount} guests
          </div>
        </div>
        <div class="table-edit-actions">
          <button class="btn edit-table-btn" data-id="${table.id}">Edit</button>
          <button class="btn danger delete-table-btn" data-id="${table.id}">Delete</button>
        </div>
      </div>
    `;
  });
  
  modalContent.innerHTML = `
    <div class="table-edit-list">
      ${tableListHtml}
    </div>
    <div class="modal-actions">
      <button id="close-edit-tables" class="btn">Close</button>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('close-edit-tables').addEventListener('click', closeModal);
  
  // Add listeners for edit buttons
  const editButtons = modalContent.querySelectorAll('.edit-table-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tableId = btn.getAttribute('data-id');
      showEditTableModal(tableId);
    });
  });
  
  // Add listeners for delete buttons
  const deleteButtons = modalContent.querySelectorAll('.delete-table-btn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tableId = btn.getAttribute('data-id');
      deleteTable(tableId);
    });
  });
  
  // Show modal
  modalContainer.classList.remove('hidden');
}

// Show edit table modal
function showEditTableModal(tableId) {
  const event = currentEvent;
  const table = event.tables.find(t => t.id === tableId);
  
  if (!table) return;
  
  modalTitle.textContent = `Edit ${table.name}`;
  modalContent.innerHTML = `
    <div class="form-group">
      <label for="edit-table-name">Table Name</label>
      <input type="text" id="edit-table-name" class="modal-input" value="${table.name}">
    </div>
    <div class="form-group">
      <label for="edit-table-seats">Number of Seats</label>
      <input type="number" id="edit-table-seats" class="modal-input" value="${table.seats}" min="1">
    </div>
    <div class="modal-actions">
      <button id="cancel-edit-table" class="btn">Cancel</button>
      <button id="save-table" class="btn primary" data-id="${tableId}">Save Changes</button>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('cancel-edit-table').addEventListener('click', () => showEditTablesModal());
  document.getElementById('save-table').addEventListener('click', () => saveTableChanges(tableId));
  
  // Show modal
  modalContainer.classList.remove('hidden');
}

// Save table changes
function saveTableChanges(tableId) {
  const event = currentEvent;
  const table = event.tables.find(t => t.id === tableId);
  
  if (!table) return;
  
  // Get updated values
  const newName = document.getElementById('edit-table-name').value.trim();
  const newSeats = parseInt(document.getElementById('edit-table-seats').value) || table.seats;
  
  if (!newName) {
    alert('Please enter a table name');
    return;
  }
  
  // Update table
  table.name = newName;
  table.shape = 'circle'; // Always use circle shape
  table.seats = newSeats;
  
  // Update UI
  renderFloorPlan();
  showEditTablesModal();
}

// Delete table
function deleteTable(tableId) {
  const event = currentEvent;
  const table = event.tables.find(t => t.id === tableId);
  
  if (!table) return;
  
  // Check if table has guests
  const guestsAtTable = event.guests.filter(g => g.tableId === tableId);
  
  if (guestsAtTable.length > 0) {
    if (!confirm(`This table has ${guestsAtTable.length} guests assigned to it. Are you sure you want to delete it? Guests will need to be reassigned.`)) {
      return;
    }
  } else {
    if (!confirm(`Are you sure you want to delete ${table.name}?`)) {
      return;
    }
  }
  
  // Remove table
  event.tables = event.tables.filter(t => t.id !== tableId);
  
  // Mark guests as unassigned
  event.guests.forEach(guest => {
    if (guest.tableId === tableId) {
      guest.tableId = 'unassigned';
    }
  });
  
  // Update UI
  renderFloorPlan();
  showEditTablesModal();
}

// Show modal
function showModal(title, content) {
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  modalContainer.classList.remove('hidden');
}

// Close modal
function closeModal() {
  modalContainer.classList.add('hidden');
}

// Process pasted data
function processPastedData() {
  const pastedText = pasteDataArea.value.trim();
  
  if (!pastedText) {
    alert('Please paste some data first');
    return;
  }
  
  // Split into lines
  const lines = pastedText.split('\n');
  
  if (lines.length === 0) {
    alert('No valid data found');
    return;
  }
  
  // Process each line
  const newGuests = [];
  const tableMap = new Map();
  let count = 0;
  
  // Create a map of existing tables
  currentEvent.tables.forEach(table => {
    tableMap.set(table.name.toLowerCase(), table.id);
  });
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Split by comma
    const parts = line.split(',');
    if (parts.length < 2) continue;
    
    const name = parts[0].trim();
    const role = parts[1] ? parts[1].trim() : '';
    let tableName = parts[2] ? parts[2].trim() : '';
    
    // Extract table number from format like "2 - This is my table name"
    let tableNumber = '';
    if (tableName.includes('-')) {
      const tableMatch = tableName.match(/^(\d+)\s*-/);
      if (tableMatch) {
        tableNumber = tableMatch[1];
        tableName = 'Table ' + tableNumber;
      }
    } else if (!isNaN(tableName)) {
      // If it's just a number, use "Table X" format
      tableNumber = tableName;
      tableName = 'Table ' + tableNumber;
    }
    
    if (!name || !tableName) continue;
    
    // Check if table exists, create if not
    let tableId = tableMap.get(tableName.toLowerCase());
    if (!tableId) {
      // Create new table
      tableId = `table${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const tableCount = currentEvent.tables.length;
      
      // Position in grid pattern
      const col = tableCount % 3;
      const row = Math.floor(tableCount / 3);
      
      const newTable = {
        id: tableId,
        name: tableName,
        shape: 'circle', // Always use circle shape
        seats: 10,
        xPercent: 50, // Default to center if placed
        yPercent: 50
      };
      
      currentEvent.tables.push(newTable);
      tableMap.set(tableName.toLowerCase(), tableId);
    }
    
    // Create guest
    const guest = {
      id: `guest${Date.now()}-${Math.floor(Math.random() * 1000)}-${count}`,
      name,
      role,
      tableId
    };
    
    newGuests.push(guest);
    count++;
  }
  
  if (newGuests.length === 0) {
    alert('No valid guest data found');
    return;
  }
  
  // Add guests to event
  currentEvent.guests = [...currentEvent.guests, ...newGuests];
  
  // Clear the textarea
  pasteDataArea.value = '';
  
  // Refresh UI
  renderFloorPlan();
  alert(`Successfully added ${newGuests.length} guests`);
}

// Save event name
function saveEventName() {
  const newName = eventNameInput.value.trim();
  const newDate = eventDateInput ? eventDateInput.value : '';
  
  if (!newName) {
    alert('Please enter an event name');
    return;
  }
  
  // Update event data
  currentEvent.name = newName;
  currentEvent.date = newDate;
  
  // Update UI
  updateUI();
  
  // Show confirmation message
  alert('Event details saved successfully');
}

// Logo handling functions
function handleDragOver(e) {
  e.preventDefault();
  logoDropArea.classList.add('highlight');
}

function handleDragLeave() {
  logoDropArea.classList.remove('highlight');
}

function handleDrop(e) {
  e.preventDefault();
  logoDropArea.classList.remove('highlight');
  
  const files = e.dataTransfer.files;
  if (files.length) {
    processLogoFile(files[0]);
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length) {
    processLogoFile(files[0]);
  }
}

function processLogoFile(file) {
  if (!file.type.match('image.*')) {
    alert('Please select an image file');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    currentEvent.logo = e.target.result;
    updateLogoDisplay();
  };
  
  reader.readAsDataURL(file);
}

function updateLogoDisplay() {
  // Update logo in preview
  if (currentEvent.logo) {
    logoPreviewImg.src = currentEvent.logo;
    logoPreview.classList.remove('hidden');
    logoDropArea.classList.add('hidden');
    
    // Update logo in header
    const headerLogo = document.createElement('img');
    headerLogo.src = currentEvent.logo;
    headerLogo.alt = 'Event Logo';
    logoContainer.innerHTML = '';
    logoContainer.appendChild(headerLogo);
  } else {
    logoPreview.classList.add('hidden');
    logoDropArea.classList.remove('hidden');
    logoContainer.innerHTML = '';
  }
}

function removeLogo() {
  currentEvent.logo = null;
  updateLogoDisplay();
}

// Show guest management modal
function showGuestManagementModal() {
  // Count the total number of guests
  const guestCount = currentEvent.guests.length;
  
  modalTitle.textContent = `Guest Management (${guestCount} guests)`;
  
  // Build guest list
  const guestListHTML = buildGuestListHTML();
  
  modalContent.innerHTML = `
    <div class="action-bar">
      <button id="add-guest-btn" class="btn primary">Add Guest</button>
      <input type="text" id="guest-search" class="guest-search" placeholder="Search guests...">
    </div>
    
    <div class="guest-list-container">
      <table id="guest-list-table" class="guest-list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Table</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="guest-list-body">
          ${guestListHTML}
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button id="close-guest-mgmt" class="btn">Close</button>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('close-guest-mgmt').addEventListener('click', closeModal);
  document.getElementById('guest-search').addEventListener('input', filterGuestList);
  document.getElementById('add-guest-btn').addEventListener('click', showAddGuestForm);
  
  // Show modal
  modalContainer.classList.remove('hidden');
}

// Show add guest form
function showAddGuestForm() {
  // Create table options
  let tableOptions = '<option value="">Not assigned</option>';
  currentEvent.tables.forEach(table => {
    tableOptions += `<option value="${table.id}">${table.name}</option>`;
  });
  
  // Create add guest form modal
  modalTitle.textContent = 'Add New Guest';
  modalContent.innerHTML = `
    <div class="form-group">
      <label for="new-guest-name">Guest Name *</label>
      <input type="text" id="new-guest-name" class="modal-input" placeholder="Enter guest name">
    </div>
    <div class="form-group">
      <label for="new-guest-role">Role/Title</label>
      <input type="text" id="new-guest-role" class="modal-input" placeholder="Enter guest role or title (optional)">
    </div>
    <div class="form-group">
      <label for="new-guest-table">Table</label>
      <select id="new-guest-table" class="modal-input">
        ${tableOptions}
      </select>
    </div>
    <div class="modal-footer">
      <button id="cancel-add-guest" class="btn">Cancel</button>
      <button id="save-new-guest" class="btn primary">Add Guest</button>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('cancel-add-guest').addEventListener('click', () => showGuestManagementModal());
  document.getElementById('save-new-guest').addEventListener('click', saveNewGuest);
  
  // Focus on name input
  document.getElementById('new-guest-name').focus();
}

// Save new guest
function saveNewGuest() {
  const nameInput = document.getElementById('new-guest-name');
  const roleInput = document.getElementById('new-guest-role');
  const tableSelect = document.getElementById('new-guest-table');
  
  const guestName = nameInput.value.trim();
  const guestRole = roleInput.value.trim();
  const tableId = tableSelect.value;
  
  // Validate input
  if (!guestName) {
    alert('Please enter a guest name');
    nameInput.focus();
    return;
  }
  
  // Create new guest object
  const newGuest = {
    id: `guest${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: guestName,
    role: guestRole,
    tableId: tableId
  };
  
  // Add to guests array
  currentEvent.guests.push(newGuest);
  
  // Show success message and return to guest management
  alert(`Guest '${guestName}' added successfully`);
  showGuestManagementModal();
  
  // Update floor plan if it's visible
  if (floorSection.classList.contains('active')) {
    renderFloorPlan();
  }
}

// Build guest list HTML
function buildGuestListHTML() {
  if (!currentEvent.guests.length) {
    return '<tr><td colspan="4">No guests found</td></tr>';
  }
  
  // Sort guests by name
  const sortedGuests = [...currentEvent.guests].sort((a, b) => a.name.localeCompare(b.name));
  
  return sortedGuests.map(guest => {
    const table = currentEvent.tables.find(t => t.id === guest.tableId);
    const tableName = table ? table.name : 'Not assigned';
    
    return `
      <tr data-guest-id="${guest.id}">
        <td>${guest.name}</td>
        <td>${guest.role || ''}</td>
        <td>${tableName}</td>
        <td class="action-cell">
          <button class="edit-guest-btn" onclick="editGuest('${guest.id}')">Edit</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Filter guest list based on search input
function filterGuestList(e) {
  const searchText = e.target.value.toLowerCase();
  const guestRows = document.querySelectorAll('#guest-list-body tr');
  
  guestRows.forEach(row => {
    const guestName = row.cells[0].textContent.toLowerCase();
    const guestRole = row.cells[1].textContent.toLowerCase();
    const tableName = row.cells[2].textContent.toLowerCase();
    
    if (guestName.includes(searchText) || 
        guestRole.includes(searchText) || 
        tableName.includes(searchText)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Edit guest
function editGuest(guestId) {
  const guest = currentEvent.guests.find(g => g.id === guestId);
  if (!guest) return;
  
  const row = document.querySelector(`tr[data-guest-id="${guestId}"]`);
  const table = currentEvent.tables.find(t => t.id === guest.tableId);
  
  // Create table options
  let tableOptions = '<option value="">Not assigned</option>';
  currentEvent.tables.forEach(t => {
    tableOptions += `<option value="${t.id}" ${t.id === guest.tableId ? 'selected' : ''}>${t.name}</option>`;
  });
  
  // Replace row content with editable fields
  row.innerHTML = `
    <td><input type="text" class="guest-input" id="edit-name-${guestId}" value="${guest.name}"></td>
    <td><input type="text" class="guest-input" id="edit-role-${guestId}" value="${guest.role || ''}"></td>
    <td>
      <select class="table-select" id="edit-table-${guestId}">
        ${tableOptions}
      </select>
    </td>
    <td class="action-cell">
      <button class="save-guest-btn" onclick="saveGuestChanges('${guestId}')">Save</button>
      <button class="cancel-edit-btn" onclick="cancelGuestEdit('${guestId}')">Cancel</button>
    </td>
  `;
}

// Save guest changes
function saveGuestChanges(guestId) {
  const guest = currentEvent.guests.find(g => g.id === guestId);
  if (!guest) return;
  
  const newName = document.getElementById(`edit-name-${guestId}`).value.trim();
  const newRole = document.getElementById(`edit-role-${guestId}`).value.trim();
  const newTableId = document.getElementById(`edit-table-${guestId}`).value;
  
  if (!newName) {
    alert('Guest name cannot be empty');
    return;
  }
  
  // Update guest data
  guest.name = newName;
  guest.role = newRole;
  guest.tableId = newTableId;
  
  // Update the row
  const row = document.querySelector(`tr[data-guest-id="${guestId}"]`);
  const table = currentEvent.tables.find(t => t.id === newTableId);
  const tableName = table ? table.name : 'Not assigned';
  
  row.innerHTML = `
    <td>${newName}</td>
    <td>${newRole}</td>
    <td>${tableName}</td>
    <td class="action-cell">
      <button class="edit-guest-btn" onclick="editGuest('${guestId}')">Edit</button>
    </td>
  `;
  
  // Update floor plan if it's visible
  if (floorSection.classList.contains('active')) {
    renderFloorPlan();
  }
}

// Cancel guest edit
function cancelGuestEdit(guestId) {
  const guest = currentEvent.guests.find(g => g.id === guestId);
  if (!guest) return;
  
  const row = document.querySelector(`tr[data-guest-id="${guestId}"]`);
  const table = currentEvent.tables.find(t => t.id === guest.tableId);
  const tableName = table ? table.name : 'Not assigned';
  
  row.innerHTML = `
    <td>${guest.name}</td>
    <td>${guest.role || ''}</td>
    <td>${tableName}</td>
    <td class="action-cell">
      <button class="edit-guest-btn" onclick="editGuest('${guestId}')">Edit</button>
    </td>
  `;
}

// Make these functions accessible globally for onclick events
window.editGuest = editGuest;
window.saveGuestChanges = saveGuestChanges;
window.cancelGuestEdit = cancelGuestEdit;

// Build table guest statistics
function buildTableGuestStats() {
  // Group guests by table
  const tableStats = {};
  
  // Initialize counts for all tables
  currentEvent.tables.forEach(table => {
    tableStats[table.id] = {
      count: 0,
      name: table.name
    };
  });
  
  // Count guests per table
  currentEvent.guests.forEach(guest => {
    if (guest.tableId && tableStats[guest.tableId]) {
      tableStats[guest.tableId].count++;
    }
  });
  
  // Convert to array and sort by table name
  const tableStatsArray = Object.values(tableStats).sort((a, b) => a.name.localeCompare(b.name));
  
  // Create HTML for table stats
  let html = '<div class="table-stats-grid">';
  tableStatsArray.forEach(stat => {
    html += `
      <div class="table-stat-item">
        <span class="table-name">${stat.name}</span>
        <span class="table-count">${stat.count} guests</span>
      </div>
    `;
  });
  html += '</div>';
  
  return html;
}

// Add sample data for testing
function addSampleData() {
  // Add sample event date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  currentEvent.date = `${yyyy}-${mm}-${dd}`;
  
  // Add some sample tables
  const sampleTables = [
    { id: 'table1', name: 'Table 1', shape: 'circle', seats: 10, xPercent: 50, yPercent: 50 },
    { id: 'table2', name: 'Table 2', shape: 'circle', seats: 8, xPercent: 50, yPercent: 50 },
    { id: 'table3', name: 'Table 3', shape: 'circle', seats: 8, xPercent: 50, yPercent: 50 },
    { id: 'table4', name: 'Table 4', shape: 'circle', seats: 10, xPercent: 50, yPercent: 50 },
    { id: 'table5', name: 'Table 5', shape: 'circle', seats: 8, xPercent: 50, yPercent: 50 },
    { id: 'table6', name: 'Table 6', shape: 'circle', seats: 8, xPercent: 50, yPercent: 50 },
  ];
  
  // Add sample guests
  const sampleGuests = [
    { id: 'guest1', name: 'James Murphy', role: 'CEO', tableId: 'table1' },
    { id: 'guest2', name: 'John Rawlinson', role: 'CTO', tableId: 'table1' },
    { id: 'guest3', name: 'Jeremy Mellish', role: 'Developer', tableId: 'table1' },
    { id: 'guest4', name: 'James Booth', role: 'Designer', tableId: 'table2' },
    { id: 'guest5', name: 'James McNally', role: 'Marketing', tableId: 'table2' },
    { id: 'guest6', name: 'John Joe Ip', role: 'Developer', tableId: 'table4' },
    { id: 'guest7', name: 'James Evans', role: 'Sales', tableId: 'table6' },
    { id: 'guest8', name: 'Jill Rowlinson', role: 'HR', tableId: 'table6' },
  ];
  
  // Add data to currentEvent
  currentEvent.tables = sampleTables;
  currentEvent.guests = sampleGuests;
  
  console.log('Sample data added:', currentEvent);
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded - initializing application');
  
  // Initialize the application
  init();
  
  // Directly bind search input after DOM is definitely loaded
  const searchInputEl = document.getElementById('search-input');
  if (searchInputEl) {
    console.log('Binding search input after DOM loaded:', searchInputEl);
    
    // Use multiple event types to ensure we catch the input
    searchInputEl.addEventListener('input', performSearch);
    searchInputEl.addEventListener('keyup', performSearch);
    searchInputEl.addEventListener('change', performSearch);
    
    // Add a manual search button next to the search input for testing
    const searchContainer = document.querySelector('.search-input-wrapper');
    if (searchContainer) {
      const searchButton = document.createElement('button');
      searchButton.textContent = 'Search';
      searchButton.className = 'search-button';
      searchButton.addEventListener('click', () => performSearch());
      searchContainer.appendChild(searchButton);
    }
  }
});

// Expose search function globally for debugging
window.performSearch = performSearch;

// Completely new search implementation
function performSearch() {
  console.log('performSearch called');
  const searchInputEl = document.getElementById('search-input');
  const searchResultsEl = document.getElementById('search-results');
  
  if (!searchInputEl || !searchResultsEl) {
    console.error('Search elements not found:', {searchInputEl, searchResultsEl});
    return;
  }
  
  // Get search text
  const searchText = searchInputEl.value.trim().toLowerCase();
  console.log('Performing search for:', searchText);
  
  // Clear letter filter visually
  const letterButtons = document.querySelectorAll('.letter-button');
  letterButtons.forEach(btn => btn.classList.remove('active'));
  
  // If empty search, clear results
  if (!searchText) {
    searchResultsEl.innerHTML = '';
    return;
  }
  
  // Check if we have guest data
  if (!currentEvent.guests || !Array.isArray(currentEvent.guests) || currentEvent.guests.length === 0) {
    console.error('No guest data available for search');
    searchResultsEl.innerHTML = '<div class="no-results">No guest data available</div>';
    return;
  }
  
  // Log all guest names for debugging
  console.log('Available guests:', currentEvent.guests.map(g => g.name));
  
  // Filter guests
  const filteredGuests = currentEvent.guests.filter(guest => {
    if (!guest || !guest.name) {
      console.warn('Invalid guest data:', guest);
      return false;
    }
    return guest.name.toLowerCase().includes(searchText);
  });
  
  console.log(`Found ${filteredGuests.length} matching guests for "${searchText}"`);
  
  // Render results
  if (filteredGuests.length === 0) {
    searchResultsEl.innerHTML = `<div class="no-results">No guests found matching "${searchText}"</div>`;
    return;
  }
  
  // Display results directly - simpler approach
  searchResultsEl.innerHTML = '';
  
  // Create container for results
  const container = document.createElement('div');
  container.className = 'two-column-results';
  searchResultsEl.appendChild(container);
  
  // Add each guest card
  filteredGuests.forEach(guest => {
    const card = createGuestCard(guest);
    card.addEventListener('click', () => showTableView(guest));
    container.appendChild(card);
  });
}

// Clear all data
function clearAllData() {
  if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    return;
  }
  
  // Clear tables and guests
  currentEvent.tables = [];
  currentEvent.guests = [];
  
  // Clear event name if checked
  if (clearEventNameCheckbox.checked) {
    currentEvent.name = '';
    currentEvent.date = '';
    currentEvent.logo = null;
  }
  
  // Update UI
  updateUI();
  
  alert('All data has been cleared');
}

// Toggle floor plan lock/unlock
function toggleFloorPlanLock() {
  isFloorPlanLocked = !isFloorPlanLocked;
  updateLockStatus();
  renderFloorPlan(); // Re-render with new draggable status
}

// Update lock status UI
function updateLockStatus() {
  if (isFloorPlanLocked) {
    toggleLockBtn.classList.remove('unlocked');
    lockStatusText.textContent = 'Locked';
    editModeIndicator.classList.add('hidden');
  } else {
    toggleLockBtn.classList.add('unlocked');
    lockStatusText.textContent = 'Unlocked';
    editModeIndicator.classList.remove('hidden');
  }
}

// Handle mouse down on a table for dragging
function handleTableMouseDown(e, table) {
  // Only enable dragging if floor plan is unlocked
  if (isFloorPlanLocked) return;
  
  // Prevent dragging if clicking the remove button
  if (e.target.classList.contains('table-remove-btn')) return;
  
  // Prevent default behavior and propagation
  e.preventDefault();
  e.stopPropagation();
  
  // Store the dragged table
  draggedTable = table;
  
  // Get mouse position
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  
  // Calculate offset from table position
  const tableEl = document.getElementById(`table-${table.id}`);
  const rect = tableEl.getBoundingClientRect();
  tableOffset.x = dragStartX - rect.left;
  tableOffset.y = dragStartY - rect.top;
  
  // Add dragging class
  tableEl.classList.add('dragging');
}

// Show floating table info
function showTableInfoFloating(table, tableEl) {
  // Remove existing floating info if any
  hideTableInfoFloating();
  
  // Get table position
  const tableRect = tableEl.getBoundingClientRect();
  const gridRect = floorGrid.getBoundingClientRect();
  
  // Get table guests
  const tableGuests = currentEvent.guests.filter(g => g.tableId === table.id);
  
  // Create floating info element
  const infoEl = document.createElement('div');
  infoEl.className = 'table-info-floating';
  infoEl.id = 'table-info-floating';
  
  // Create content
  let guestListHTML = '';
  if (tableGuests.length > 0) {
    // If we have a lot of guests, display them in a more compact format
    if (tableGuests.length > 10) {
      guestListHTML = '<div class="guest-grid">';
      tableGuests.forEach(guest => {
        guestListHTML += `
          <div class="guest-item-compact">
            <div class="guest-name-primary">${guest.name}</div>
            ${guest.role ? `<div class="guest-role-info">${guest.role}</div>` : ''}
          </div>
        `;
      });
      guestListHTML += '</div>';
    } else {
      tableGuests.forEach(guest => {
        guestListHTML += `
          <div class="guest-item">
            <div class="guest-name-primary">${guest.name}</div>
            ${guest.role ? `<div class="guest-role-info">${guest.role}</div>` : ''}
          </div>
        `;
      });
    }
  } else {
    guestListHTML = '<div class="guest-item">No guests assigned to this table</div>';
  }
  
  infoEl.innerHTML = `
    <button class="close-btn">&times;</button>
    <div class="table-info-title">${table.name}</div>
    <div class="guest-list">
      ${guestListHTML}
    </div>
  `;
  
  // Add to floor grid first to get its dimensions
  floorGrid.appendChild(infoEl);
  
  // Get info element dimensions after it's added to the DOM
  const infoRect = infoEl.getBoundingClientRect();
  
  // Determine best position
  let posX, posY;
  
  // Calculate position relative to the grid
  const tableX = parseFloat(tableEl.style.left);
  const tableY = parseFloat(tableEl.style.top);
  
  // Try to position to the right of the table
  if (tableRect.right + infoRect.width <= gridRect.right) {
    posX = tableX + 5; // 5% to the right
    posY = tableY;
  } 
  // Try to position to the left
  else if (tableRect.left - infoRect.width >= gridRect.left) {
    posX = tableX - 5; // 5% to the left
    posY = tableY;
  } 
  // Position above or below
  else {
    posX = tableX;
    
    // Try below first
    if (tableRect.bottom + infoRect.height <= gridRect.bottom) {
      posY = tableY + 5; // 5% below
    } 
    // Try above
    else {
      posY = tableY - 5; // 5% above
    }
  }
  
  // Apply the calculated position (as percentages)
  infoEl.style.left = `${posX}%`;
  infoEl.style.top = `${posY}%`;
  
  // Add close button event
  infoEl.querySelector('.close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    hideTableInfoFloating();
  });
  
  // Highlight the selected table
  highlightTable(table.id);
}

// Hide floating table info
function hideTableInfoFloating() {
  const infoEl = document.getElementById('table-info-floating');
  if (infoEl) {
    infoEl.remove();
  }
  
  // Remove any highlighted tables
  const floorGridContentEl = floorGrid.querySelector('.floor-plan-content');
  if (floorGridContentEl) {
    const tables = floorGridContentEl.querySelectorAll('.table-object');
    tables.forEach(table => table.classList.remove('highlight'));
  }
}

// Highlight table in floor plan
function highlightTable(tableId) {
  // Clear existing highlights
  const floorGridContentEl = floorGrid.querySelector('.floor-plan-content');
  if (!floorGridContentEl) return;
  
  const tables = floorGridContentEl.querySelectorAll('.table-object');
  tables.forEach(table => table.classList.remove('highlight'));
  
  // Add highlight to selected table
  const tableEl = document.getElementById(`table-${tableId}`);
  if (tableEl) {
    tableEl.classList.add('highlight');
    
    // Scroll the table into view if needed
    const containerRect = floorGrid.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    
    // Check if table is not fully visible
    if (tableRect.top < containerRect.top || 
        tableRect.bottom > containerRect.bottom ||
        tableRect.left < containerRect.left || 
        tableRect.right > containerRect.right) {
      
      // Calculate scroll position to center the table
      const scrollLeft = tableEl.offsetLeft - (floorGrid.clientWidth / 2) + (tableEl.offsetWidth / 2);
      const scrollTop = tableEl.offsetTop - (floorGrid.clientHeight / 2) + (tableEl.offsetHeight / 2);
      
      floorGrid.scrollTo({
        left: Math.max(0, scrollLeft),
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }
}