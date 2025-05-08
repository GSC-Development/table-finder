// renderer.js - UI logic for the SeatPlan app

// Sample initial data
let currentEvent = {
  name: '',
  date: '', // Add date property
  logo: null,
  floorPlanImage: null, // Add floor plan image
  tableScale: 100, // Add table scale (percentage)
  tables: [],
  guests: [],
  adminPassword: '9999', // Default admin password
  adminTimeout: 300000 // Default timeout (5 minutes in milliseconds)
};

// Add admin authentication state tracking
let lastAdminAuth = null; // Timestamp when admin was last authenticated
const ADMIN_GRACE_PERIOD = 5 * 60 * 1000; // 5 minutes in milliseconds

// DOM Elements
let searchModeBtn, adminModeBtn;
let guestManagementBtn, floorPlanBtn;
let searchSection, adminSection;
let guestManagementContent, floorPlanContent;
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
let tableScaleSlider, tableScaleValue;

// Drag and drop state
let isFloorPlanLocked = true;
let draggedTable = null;
let dragStartX = 0;
let dragStartY = 0;
let tableOffset = { x: 0, y: 0 };

// Table scale factor (percentage converted to decimal)
let tableScaleFactor = 1.0;

// Add new state variables to track table placement
let placedTables = new Set(); // IDs of tables placed on floor plan

// Add new DOM elements for floor plan background image
let floorImageDropArea, floorImageFileInput, floorImageSelectBtn;
let floorImagePreview, floorImagePreviewImg, removeFloorImageBtn;

// Add the new DOM elements for the floor plan image modal
let uploadFloorPlanBtn, floorImageModal, floorImageModalClose;
let confirmFloorImageBtn, cancelFloorImageBtn;

// Auto arrange modal elements
let autoArrangeBtn, autoArrangeModal, autoArrangeModalClose;
let layoutTypeSelect, tablesPerRowSelect, tableSpacingSelect;
let circleOptionsDiv, circleSelect, uShapeOptionsDiv, uShapeSelect;
let cancelAutoArrangeBtn, applyAutoArrangeBtn;

// Variables for new tab elements
let eventSettingsBtn;
let settingsBtn;
let eventSettingsContent;
let settingsContent;

// Add to the global variables at the top
let csvImportBtn, csvFileInput;

// Initialize application
function init() {
  console.log('Initializing application...');
  
  // Get DOM elements
  checkDOMElements();
  
  // Create alphabet buttons
  createAlphabetBar();
  
  // Add event listeners
  addEventListeners();
  
  // Initialize UI
  updateUI();
  
  // Explicitly call renderTablesOverview with debug
  console.log('Explicitly calling renderTablesOverview');
  renderTablesOverview();
  
  console.log('Application initialized with', currentEvent.guests.length, 'guests');
}

// Check DOM elements
function checkDOMElements() {
  console.log('Checking DOM elements...');
  
  // Mode buttons and sections
  searchModeBtn = document.getElementById('search-mode-btn');
  adminModeBtn = document.getElementById('admin-mode-btn');
  searchSection = document.getElementById('search-section');
  adminSection = document.getElementById('admin-section');
  
  // Admin sub-navigation
  guestManagementBtn = document.getElementById('guest-management-btn');
  eventSettingsBtn = document.getElementById('event-settings-btn');
  floorPlanBtn = document.getElementById('floor-plan-btn');
  settingsBtn = document.getElementById('settings-btn');
  
  // Get admin sub-content sections
  guestManagementContent = document.getElementById('guest-management-content');
  eventSettingsContent = document.getElementById('event-settings-content');
  floorPlanContent = document.getElementById('floor-plan-content');
  settingsContent = document.getElementById('settings-content');
  
  // Search elements
  searchInput = document.getElementById('search-input');
  alphabetBar = document.getElementById('alphabet-bar');
  searchResults = document.getElementById('search-results');
  
  // Log important elements
  console.log('Search Input Element:', searchInput);
  console.log('Search Results Element:', searchResults);
  
  // Tables overview container - add explicit check
  const tablesOverviewContainer = document.getElementById('tables-overview-container');
  console.log('Tables Overview Container:', tablesOverviewContainer);
  
  // Floor plan elements
  floorTitle = document.getElementById('floor-title');
  floorPlan = document.getElementById('floor-plan');
  floorGrid = document.getElementById('floor-grid');
  availableTablesContainer = document.getElementById('available-tables');
  toggleLockBtn = document.getElementById('toggle-lock-btn');
  lockStatusText = document.getElementById('lock-status-text');
  editModeIndicator = document.getElementById('edit-mode-indicator');
  tableScaleSlider = document.getElementById('table-scale-slider');
  tableScaleValue = document.getElementById('table-scale-value');
  
  // Add floor-title if it doesn't exist in the DOM but is referenced in the code
  if (!floorTitle) {
    console.warn('floor-title element not found, creating it for internal use');
    floorTitle = document.createElement('div');
    floorTitle.id = 'floor-title';
    floorTitle.style.display = 'none';
    document.body.appendChild(floorTitle);
  }
  
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
  
  // Floor plan image elements
  floorImageDropArea = document.getElementById('floor-image-drop-area');
  floorImageFileInput = document.getElementById('floor-image-file-input');
  floorImageSelectBtn = document.getElementById('floor-image-select-btn');
  floorImagePreview = document.getElementById('floor-image-preview');
  floorImagePreviewImg = document.getElementById('floor-image-preview-img');
  removeFloorImageBtn = document.getElementById('remove-floor-image-btn');
  
  // Floor plan image modal elements
  uploadFloorPlanBtn = document.getElementById('upload-floor-plan-btn');
  floorImageModal = document.getElementById('floor-image-modal');
  floorImageModalClose = document.getElementById('floor-image-modal-close');
  confirmFloorImageBtn = document.getElementById('confirm-floor-image-btn');
  cancelFloorImageBtn = document.getElementById('cancel-floor-image-btn');
  
  // Auto arrange modal elements
  autoArrangeBtn = document.getElementById('auto-arrange-btn');
  autoArrangeModal = document.getElementById('auto-arrange-modal');
  autoArrangeModalClose = document.getElementById('auto-arrange-modal-close');
  layoutTypeSelect = document.getElementById('layout-type');
  tablesPerRowSelect = document.getElementById('tables-per-row');
  tableSpacingSelect = document.getElementById('table-spacing');
  circleOptionsDiv = document.getElementById('circle-options');
  circleSelect = document.getElementById('circle-size');
  uShapeOptionsDiv = document.getElementById('u-shape-options');
  uShapeSelect = document.getElementById('u-shape-size');
  cancelAutoArrangeBtn = document.getElementById('cancel-auto-arrange');
  applyAutoArrangeBtn = document.getElementById('apply-auto-arrange');
  
  // Log missing elements
  const missingElements = [];
  [
    { name: 'searchModeBtn', element: searchModeBtn },
    { name: 'adminModeBtn', element: adminModeBtn },
    { name: 'searchSection', element: searchSection },
    { name: 'adminSection', element: adminSection },
    { name: 'guestManagementBtn', element: guestManagementBtn },
    { name: 'eventSettingsBtn', element: eventSettingsBtn },
    { name: 'floorPlanBtn', element: floorPlanBtn },
    { name: 'settingsBtn', element: settingsBtn },
    { name: 'guestManagementContent', element: guestManagementContent },
    { name: 'eventSettingsContent', element: eventSettingsContent },
    { name: 'floorPlanContent', element: floorPlanContent },
    { name: 'settingsContent', element: settingsContent },
    { name: 'searchInput', element: searchInput },
    { name: 'alphabetBar', element: alphabetBar },
    { name: 'searchResults', element: searchResults },
    { name: 'floorPlan', element: floorPlan },
    { name: 'floorGrid', element: floorGrid },
    { name: 'availableTablesContainer', element: availableTablesContainer },
    { name: 'toggleLockBtn', element: toggleLockBtn },
    { name: 'lockStatusText', element: lockStatusText },
    { name: 'tableScaleSlider', element: tableScaleSlider },
    { name: 'tableScaleValue', element: tableScaleValue },
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
    { name: 'viewGuestsBtn', element: viewGuestsBtn },
    { name: 'floorImageDropArea', element: floorImageDropArea },
    { name: 'floorImageFileInput', element: floorImageFileInput },
    { name: 'floorImageSelectBtn', element: floorImageSelectBtn },
    { name: 'floorImagePreview', element: floorImagePreview },
    { name: 'floorImagePreviewImg', element: floorImagePreviewImg },
    { name: 'removeFloorImageBtn', element: removeFloorImageBtn },
    { name: 'uploadFloorPlanBtn', element: uploadFloorPlanBtn },
    { name: 'floorImageModal', element: floorImageModal },
    { name: 'floorImageModalClose', element: floorImageModalClose },
    { name: 'confirmFloorImageBtn', element: confirmFloorImageBtn },
    { name: 'cancelFloorImageBtn', element: cancelFloorImageBtn },
    { name: 'autoArrangeBtn', element: autoArrangeBtn },
    { name: 'autoArrangeModal', element: autoArrangeModal },
    { name: 'autoArrangeModalClose', element: autoArrangeModalClose },
    { name: 'layoutTypeSelect', element: layoutTypeSelect },
    { name: 'tablesPerRowSelect', element: tablesPerRowSelect },
    { name: 'tableSpacingSelect', element: tableSpacingSelect },
    { name: 'circleOptionsDiv', element: circleOptionsDiv },
    { name: 'circleSelect', element: circleSelect },
    { name: 'uShapeOptionsDiv', element: uShapeOptionsDiv },
    { name: 'uShapeSelect', element: uShapeSelect },
    { name: 'cancelAutoArrangeBtn', element: cancelAutoArrangeBtn },
    { name: 'applyAutoArrangeBtn', element: applyAutoArrangeBtn }
  ].forEach(item => {
    if (!item.element) {
      missingElements.push(item.name);
      console.error(`Element not found: ${item.name}`);
    }
  });
  
  // CSV import elements
  csvImportBtn = document.getElementById('csv-import-btn');
  csvFileInput = document.getElementById('csv-file-input');
  
  if (!csvImportBtn || !csvFileInput) {
    console.error('CSV import elements not found:', { csvImportBtn, csvFileInput });
  } else {
    console.log('CSV import elements found:', { csvImportBtn, csvFileInput });
  }
  
  // Add CSV elements to the missing elements check
  missingElements.push(
    { name: 'csvImportBtn', element: csvImportBtn },
    { name: 'csvFileInput', element: csvFileInput }
  );
  
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
  console.log('Adding event listeners...');
  
  // Mode switching
  searchModeBtn.addEventListener('click', () => switchMode('search'));
  adminModeBtn.addEventListener('click', () => showAdminPasswordPrompt());
  
  // Admin sub-navigation
  guestManagementBtn.addEventListener('click', () => switchAdminSubTab('guest-management'));
  eventSettingsBtn.addEventListener('click', () => switchAdminSubTab('event-settings'));
  floorPlanBtn.addEventListener('click', () => switchAdminSubTab('floor-plan'));
  settingsBtn.addEventListener('click', () => switchAdminSubTab('settings'));
  
  // Admin actions
  clearAllDataBtn.addEventListener('click', clearAllData);
  processPastedDataBtn.addEventListener('click', processPastedData);
  saveEventNameBtn.addEventListener('click', saveEventName);
  
  // CSV import - with improved error handling and logging
  const csvImportBtn = document.getElementById('csv-import-btn');
  const csvFileInput = document.getElementById('csv-file-input');
  
  if (csvImportBtn && csvFileInput) {
    console.log('Setting up CSV import event listeners');
    
    // Remove any existing listeners first
    const newCsvImportBtn = csvImportBtn.cloneNode(true);
    const newCsvFileInput = csvFileInput.cloneNode(true);
    
    csvImportBtn.parentNode.replaceChild(newCsvImportBtn, csvImportBtn);
    csvFileInput.parentNode.replaceChild(newCsvFileInput, csvFileInput);
    
    // Add new event listeners with logging
    newCsvFileInput.addEventListener('change', function(e) {
      console.log('CSV file input change event triggered');
      if (e.target.files.length > 0) {
        console.log('File selected:', e.target.files[0]);
        importCsv(e.target.files[0]);
      }
    });
    
    newCsvImportBtn.addEventListener('click', function() {
      console.log('CSV import button clicked');
      newCsvFileInput.click();
    });
  } else {
    console.error('CSV import elements not found during initialization');
  }
  
  // Search functionality - use performSearch instead of handleSearch
  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // Tables management
  addTableBtn.addEventListener('click', showAddTableModal);
  editTablesBtn.addEventListener('click', showEditTablesModal);
  
  // Floor plan interaction
  toggleLockBtn.addEventListener('click', toggleFloorPlanLock);
  tableScaleSlider.addEventListener('input', handleTableScaleChange);
  
  // Logo upload
  logoDropArea.addEventListener('dragover', handleDragOver);
  logoDropArea.addEventListener('dragleave', handleDragLeave);
  logoDropArea.addEventListener('drop', handleDrop);
  logoSelectBtn.addEventListener('click', () => logoFileInput.click());
  logoFileInput.addEventListener('change', handleFileSelect);
  removeLogoBtn.addEventListener('click', removeLogo);
  
  // Guest management
  viewGuestsBtn.addEventListener('click', showGuestManagementModal);
  
  // Modal close button
  modalClose.addEventListener('click', closeModal);
  
  // Floor plan image upload
  uploadFloorPlanBtn.addEventListener('click', showFloorImageModal);
  removeFloorImageBtn.addEventListener('click', removeFloorPlanImage);
  
  // Floor plan image modal
  floorImageModalClose.addEventListener('click', hideFloorImageModal);
  cancelFloorImageBtn.addEventListener('click', hideFloorImageModal);
  confirmFloorImageBtn.addEventListener('click', confirmFloorImage);
  floorImageDropArea.addEventListener('dragover', handleFloorImageDragOver);
  floorImageDropArea.addEventListener('dragleave', handleFloorImageDragLeave);
  floorImageDropArea.addEventListener('drop', handleFloorImageDrop);
  floorImageSelectBtn.addEventListener('click', () => floorImageFileInput.click());
  floorImageFileInput.addEventListener('change', handleFloorImageSelect);
  
  // Auto arrange modal
  autoArrangeBtn.addEventListener('click', showAutoArrangeModal);
  autoArrangeModalClose.addEventListener('click', hideAutoArrangeModal);
  cancelAutoArrangeBtn.addEventListener('click', hideAutoArrangeModal);
  applyAutoArrangeBtn.addEventListener('click', applyAutoArrange);
  
  // Layout type change handler
  layoutTypeSelect.addEventListener('change', updateLayoutOptions);
  
  // Add document event listeners for drag and drop
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  console.log('Event listeners added');
}

// Switch between modes (search, admin)
function switchMode(mode) {
  // For Admin mode, check password first
  if (mode === 'admin') {
    // Check if we're within the grace period
    const currentTime = Date.now();
    const isGracePeriodActive = lastAdminAuth && (currentTime - lastAdminAuth < ADMIN_GRACE_PERIOD);
    
    // Only prompt for password if not already in admin mode and not in grace period
    if (!adminSection.classList.contains('active') && !isGracePeriodActive) {
      showAdminPasswordPrompt();
      return; // Stop here, actual switch will happen after password check
    }
    
    // Stop auto-advance timer when switching to admin mode
    if (window.autoAdvanceTimer) {
      clearInterval(window.autoAdvanceTimer);
      window.autoAdvanceTimer = null;
    }
  }
  
  // Update tab buttons
  searchModeBtn.classList.toggle('active', mode === 'search');
  adminModeBtn.classList.toggle('active', mode === 'admin');
  
  // Update visible section
  searchSection.classList.toggle('active', mode === 'search');
  adminSection.classList.toggle('active', mode === 'admin');
  
  // If switching back to search mode, restart the auto-advance
  if (mode === 'search') {
    // Make sure tables are visible
    const tablesOverviewEl = document.querySelector('.tables-overview');
    if (tablesOverviewEl) tablesOverviewEl.style.display = 'block';
    
    // Clear any search results
    searchResults.innerHTML = '';
    
    // Re-render tables to restart auto-advance
    renderTablesOverview();
  }
  // If switching to admin mode, make sure floor plan is rendered if needed
  else if (mode === 'admin' && floorPlanContent.classList.contains('active')) {
    renderFloorPlan();
    updateTableScale();
  }
}

// Switch between admin sub-tabs
function switchAdminSubTab(tab) {
  // Update sub-tab buttons
  guestManagementBtn.classList.toggle('active', tab === 'guest-management');
  eventSettingsBtn.classList.toggle('active', tab === 'event-settings');
  floorPlanBtn.classList.toggle('active', tab === 'floor-plan');
  settingsBtn.classList.toggle('active', tab === 'settings');
  
  // Update visible content
  guestManagementContent.classList.toggle('active', tab === 'guest-management');
  eventSettingsContent.classList.toggle('active', tab === 'event-settings');
  floorPlanContent.classList.toggle('active', tab === 'floor-plan');
  settingsContent.classList.toggle('active', tab === 'settings');
  
  // If switching to floor plan, render it
  if (tab === 'floor-plan') {
    renderFloorPlan();
    updateTableScale();
  }
}

// Show admin password prompt
function showAdminPasswordPrompt() {
  // Check if grace period is active
  const currentTime = Date.now();
  const isGracePeriodActive = lastAdminAuth && (currentTime - lastAdminAuth < ADMIN_GRACE_PERIOD);
  
  // If grace period is active, switch directly to admin mode
  if (isGracePeriodActive) {
    switchMode('admin');
    return;
  }
  
  // Otherwise show the password prompt
  modalTitle.textContent = 'Admin Access';
  modalContent.innerHTML = `
    <div class="form-group">
      <label for="admin-password">Enter Admin Password</label>
      <input type="password" id="admin-password" class="modal-input" placeholder="Password">
    </div>
    <div class="modal-actions">
      <button id="cancel-admin-login" class="btn">Cancel</button>
      <button id="submit-admin-password" class="btn primary">Login</button>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('cancel-admin-login').addEventListener('click', () => {
    closeModal();
    // Revert to previous tab if canceling
    if (searchSection.classList.contains('active')) {
      searchModeBtn.classList.add('active');
      adminModeBtn.classList.remove('active');
    } else if (floorPlanContent.classList.contains('active')) {
      floorPlanBtn.classList.add('active');
      adminModeBtn.classList.remove('active');
    }
  });
  
  document.getElementById('submit-admin-password').addEventListener('click', checkAdminPassword);
  
  // Allow Enter key to submit
  const passwordInput = document.getElementById('admin-password');
  passwordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      checkAdminPassword();
    }
  });
  
  // Focus on the password input
  passwordInput.focus();
  
  // Show modal
  modalContainer.classList.remove('hidden');
}

// Check admin password
function checkAdminPassword() {
  const passwordInput = document.getElementById('admin-password');
  const enteredPassword = passwordInput.value.trim();
  
  if (enteredPassword === currentEvent.adminPassword) {
    // Update the last authentication time
    lastAdminAuth = Date.now();
    
    closeModal();
    // Complete the switch to admin mode
    searchModeBtn.classList.remove('active');
    adminModeBtn.classList.add('active');
    
    searchSection.classList.remove('active');
    adminSection.classList.add('active');
    
    // Ensure guest management tab is active by default
    switchAdminSubTab('guest-management');
  } else {
    // Show error message - but only if we're in the password modal
    if (modalTitle && modalTitle.textContent === 'Admin Access') {
      // Create error message element
      const errorMsg = document.createElement('div');
      errorMsg.className = 'password-error';
      errorMsg.textContent = 'Incorrect password. Please try again.';
      errorMsg.style.color = '#ef4444';
      errorMsg.style.marginTop = '0.5rem';
      errorMsg.style.fontSize = '0.875rem';
      
      // Remove any existing error messages first
      const existingError = modalContent.querySelector('.password-error');
      if (existingError) {
        existingError.remove();
      }
      
      // Find the correct form group in the modal to add the error
      const formGroup = modalContent.querySelector('.form-group');
      if (formGroup) {
        formGroup.appendChild(errorMsg);
      }
      
      // Clear the password field
      passwordInput.value = '';
      passwordInput.focus();
    }
  }
}

// Update all UI elements
function updateUI() {
  console.log('Starting updateUI function');
  
  // Update event name in header (use "SeatPlan" if empty)
  appTitle.textContent = currentEvent.name || 'SeatPlan';
  eventNameInput.value = currentEvent.name;
  
  // Check if floorTitle exists before trying to update it
  if (floorTitle) {
    floorTitle.textContent = `${currentEvent.name || 'SeatPlan'} - Floor Plan`;
  } else {
    console.warn('floorTitle element not found, skipping update');
  }
  
  // Update event date if it exists
  if (eventDateInput) {
    eventDateInput.value = currentEvent.date || '';
  }
  
  // Update table scale
  const savedScale = currentEvent.tableScale || 100;
  tableScaleSlider.value = savedScale;
  tableScaleValue.textContent = `${savedScale}%`;
  tableScaleFactor = savedScale / 100;
  
  // Update logo
  updateLogoDisplay();
  
  // Clear search
  searchInput.value = '';
  clearLetterFilter();
  searchResults.innerHTML = '';
  
  // Render floor plan
  renderFloorPlan();
  
  // Render tables overview
  console.log('Calling renderTablesOverview from updateUI');
  renderTablesOverview();
  
  console.log('Finished updateUI');
}

// Render tables overview in grid layout with pagination
function renderTablesOverview() {
  console.log('Starting renderTablesOverview function');
  
  const tablesOverviewContainer = document.getElementById('tables-overview-container');
  if (!tablesOverviewContainer) {
    console.error('Tables overview container not found');
    return;
  }
  
  console.log('Tables container found');
  
  // Clear container and stop any existing auto-advance timer
  tablesOverviewContainer.innerHTML = '';
  if (window.autoAdvanceTimer) {
    clearInterval(window.autoAdvanceTimer);
    window.autoAdvanceTimer = null;
  }
  
  // If no tables, show message
  if (!currentEvent.tables || currentEvent.tables.length === 0) {
    console.log('No tables found in current event');
    tablesOverviewContainer.innerHTML = '<div class="no-tables-message">No tables have been created yet.</div>';
    return;
  }
  
  console.log(`Found ${currentEvent.tables.length} tables to display`);
  
  // Calculate pagination - showing 5 tables per page in a single row
  const tablesPerPage = 5; // Changed to 5 tables per page
  
  // Initialize pagination state if it doesn't exist
  if (!window.paginationState) {
    window.paginationState = {
      currentPage: 0,
      totalPages: Math.ceil(currentEvent.tables.length / tablesPerPage)
    };
  } else {
    // Update total pages in case tables have been added/removed
    window.paginationState.totalPages = Math.ceil(currentEvent.tables.length / tablesPerPage);
    // Make sure current page is valid
    if (window.paginationState.currentPage >= window.paginationState.totalPages) {
      window.paginationState.currentPage = 0; // Reset to first page if current page is no longer valid
    }
  }
  
  console.log(`Pagination: Page ${window.paginationState.currentPage + 1} of ${window.paginationState.totalPages}`);
  
  // Get current page data
  const startIndex = window.paginationState.currentPage * tablesPerPage;
  const endIndex = Math.min(startIndex + tablesPerPage, currentEvent.tables.length);
  const currentPageTables = currentEvent.tables.slice(startIndex, endIndex);
  
  console.log(`Displaying tables ${startIndex + 1} to ${endIndex} (${currentPageTables.length} tables)`);
  
  // Create container for table cards - single row grid layout
  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-row-container';
  
  // Create table cards for each table on the current page
  currentPageTables.forEach(table => {
    // Get guests at this table
    const tableGuests = currentEvent.guests.filter(g => g.tableId === table.id);
    
    // Create table card
    const tableCard = document.createElement('div');
    tableCard.className = 'table-card table-row-card';
    
    // Create table card header
    const tableCardHeader = document.createElement('div');
    tableCardHeader.className = 'table-card-header';
    
    tableCardHeader.innerHTML = `
      <div class="table-card-title">${table.name}</div>
    `;
    
    // Create guest list
    const guestList = document.createElement('ul');
    guestList.className = 'table-card-guests';
    
    // Add guests to list (show all guests)
    tableGuests.forEach(guest => {
      const guestItem = document.createElement('li');
      guestItem.className = 'table-card-guest';
      guestItem.innerHTML = `
        <strong>${guest.name}</strong><br>
        <span class="guest-role">${guest.role || ''}</span>
      `;
      guestList.appendChild(guestItem);
    });
    
    // If no guests, show message
    if (tableGuests.length === 0) {
      const noGuestsItem = document.createElement('li');
      noGuestsItem.className = 'table-card-guest no-guests';
      noGuestsItem.textContent = 'No guests assigned';
      guestList.appendChild(noGuestsItem);
    }
    
    // Assemble table card
    tableCard.appendChild(tableCardHeader);
    tableCard.appendChild(guestList);
    
    // Add click handler to show table details
    tableCard.addEventListener('click', () => {
      if (tableGuests.length > 0) {
        showTableView(tableGuests[0]);
      }
    });
    
    // Add to container
    tableContainer.appendChild(tableCard);
  });
  
  // Create pagination controls
  const paginationControls = document.createElement('div');
  paginationControls.className = 'pagination-controls';
  
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-btn prev-btn';
  prevButton.innerHTML = '&larr; Previous';
  prevButton.addEventListener('click', () => {
    if (window.paginationState.currentPage > 0) {
      window.paginationState.currentPage--;
    } else {
      // Loop to the last page
      window.paginationState.currentPage = window.paginationState.totalPages - 1;
    }
    renderTablesOverview();
  });
  
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-btn next-btn';
  nextButton.innerHTML = 'Next &rarr;';
  nextButton.addEventListener('click', () => {
    advanceToNextTable();
  });
  
  const pageInfo = document.createElement('div');
  pageInfo.className = 'page-info';
  pageInfo.textContent = `Page ${window.paginationState.currentPage + 1} of ${window.paginationState.totalPages}`;
  
  // Only show pagination controls if there's more than one page
  if (window.paginationState.totalPages > 1) {
    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(pageInfo);
    paginationControls.appendChild(nextButton);
  }
  
  // Add container and pagination to the main container
  tablesOverviewContainer.appendChild(tableContainer);
  tablesOverviewContainer.appendChild(paginationControls);
  
  // Set up auto-advance timer (10 seconds)
  if (window.paginationState.totalPages > 1) {
    window.autoAdvanceTimer = setInterval(() => {
      advanceToNextTable();
    }, 10000);
  }
  
  console.log('Finished rendering tables overview');
}

// Helper function to advance to the next table
function advanceToNextTable() {
  if (window.paginationState.currentPage < window.paginationState.totalPages - 1) {
    window.paginationState.currentPage++;
  } else {
    // Loop back to the first page
    window.paginationState.currentPage = 0;
  }
  renderTablesOverview();
}

// Letter filter functionality
function handleLetterClick(letter) {
  // Clear search input
  searchInput.value = '';
  
  // Check if the letter is already active (selected)
  const letterButtons = alphabetBar.querySelectorAll('.letter-button');
  const activeButton = alphabetBar.querySelector(`.letter-button.active`);
  const isAlreadyActive = activeButton && activeButton.textContent === letter;
  
  // Access tables overview element
  const tablesOverviewEl = document.querySelector('.tables-overview');
  
  // Clear all active states first
  letterButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // If clicking the same letter, just clear the filter and show tables
  if (isAlreadyActive) {
    searchResults.innerHTML = '';
    if (tablesOverviewEl) tablesOverviewEl.style.display = 'block';
    // Re-render tables to restart auto-advance
    renderTablesOverview();
    return;
  }
  
  // Otherwise activate the new letter
  letterButtons.forEach(btn => {
    if (btn.textContent === letter) {
      btn.classList.add('active');
    }
  });
  
  // Stop auto-advance timer when showing letter filter results
  if (window.autoAdvanceTimer) {
    clearInterval(window.autoAdvanceTimer);
    window.autoAdvanceTimer = null;
  }
  
  // Hide tables overview when showing letter search results
  if (tablesOverviewEl) tablesOverviewEl.style.display = 'none';
  
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
  
  // Clear search input value
  searchInput.value = '';
  
  // Get tables overview element
  const tablesOverviewEl = document.querySelector('.tables-overview');
  
  // Always clear search results
  searchResults.innerHTML = '';
  
  // Show tables overview
  if (tablesOverviewEl) tablesOverviewEl.style.display = 'block';
  
  // Re-render tables to restart auto-advance
  renderTablesOverview();
}

// Render search results
function renderSearchResults(guests) {
  // Access the search results and tables overview elements
  const searchResultsEl = document.getElementById('search-results');
  const tablesOverviewEl = document.querySelector('.tables-overview');
  
  if (!searchResultsEl) {
    console.error('Search results element not found');
    return;
  }
  
  // Hide tables overview when showing search results
  if (tablesOverviewEl) tablesOverviewEl.style.display = 'none';
  
  // Clear search results
  searchResultsEl.innerHTML = '';
  
  if (guests.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No guests found';
    searchResultsEl.appendChild(noResults);
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
  searchResultsEl.appendChild(resultsContainer);
  
  // Show list of guests
  guests.forEach(guest => {
    const card = createGuestCard(guest);
    card.addEventListener('click', () => showTableView(guest));
    resultsContainer.appendChild(card);
  });
  
  // Add back button for letter filters
  if (isLetterSelection) {
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px;">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Back to tables
    `;
    backButton.addEventListener('click', () => {
      clearLetterFilter();
      searchResultsEl.innerHTML = '';
      if (tablesOverviewEl) tablesOverviewEl.style.display = 'block';
    });
    searchResultsEl.appendChild(backButton);
  }
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
  
  // Get references to important elements
  const searchResultsEl = document.getElementById('search-results');
  const tablesOverviewEl = document.querySelector('.tables-overview');
  
  // Stop auto-advance timer when showing table view
  if (window.autoAdvanceTimer) {
    clearInterval(window.autoAdvanceTimer);
    window.autoAdvanceTimer = null;
  }
  
  // Hide tables overview when showing table view
  if (tablesOverviewEl) tablesOverviewEl.style.display = 'none';
  
  // Clear search results
  searchResultsEl.innerHTML = '';
  
  // Add table info header
  const tableInfo = document.createElement('div');
  tableInfo.className = 'table-info';
  tableInfo.innerHTML = `
    <div class="table-title">${table ? table.name : 'Unknown Table'}</div>
    <div class="table-subtitle">Showing all guests seated with ${selectedGuest.name}</div>
  `;
  searchResultsEl.appendChild(tableInfo);
  
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
      <div class="result-header">
        <div class="guest-name">${guest.name}</div>
      </div>
      ${guest.role ? `<div class="guest-role">${guest.role}</div>` : ''}
    `;
    
    guestContainer.appendChild(card);
  });
  
  searchResultsEl.appendChild(guestContainer);
  
  // Add back button
  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; margin-right: 8px;">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
    Back to search results
  `;
  backButton.addEventListener('click', () => {
    if (searchInput.value) {
      performSearch();
    } else {
      searchResultsEl.innerHTML = '';
      if (tablesOverviewEl) tablesOverviewEl.style.display = 'block';
      // Re-render tables to restart auto-advance
      renderTablesOverview();
    }
  });
  searchResultsEl.appendChild(backButton);
  
  // Highlight table in floor plan
  if (floorPlanContent.classList.contains('active')) {
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
  
  // Add background image if available
  if (currentEvent.floorPlanImage) {
    floorGrid.classList.add('has-bg-image');
    
    // Check if we already have a background image
    let bgImage = floorGrid.querySelector('.floor-grid-bg-image');
    
    // Create new background image if none exists
    if (!bgImage) {
      bgImage = document.createElement('img');
      bgImage.className = 'floor-grid-bg-image';
      bgImage.alt = 'Floor Plan Background';
      // Add important inline styles
      bgImage.style.position = 'absolute';
      bgImage.style.top = '0';
      bgImage.style.left = '0';
      bgImage.style.width = '100%';
      bgImage.style.height = '100%';
      bgImage.style.objectFit = 'contain';
      bgImage.style.opacity = '0.8';
      bgImage.style.zIndex = '0';
      bgImage.style.pointerEvents = 'none';
      floorGrid.appendChild(bgImage);
    }
    
    bgImage.src = currentEvent.floorPlanImage;
  } else {
    floorGrid.classList.remove('has-bg-image');
    
    // Remove any existing background image
    const bgImage = floorGrid.querySelector('.floor-grid-bg-image');
    if (bgImage) {
      bgImage.remove();
    }
  }
  
  // Separate tables into available and placed
  const availableTables = currentEvent.tables.filter(table => !placedTables.has(table.id));
  const placedTablesArray = currentEvent.tables.filter(table => placedTables.has(table.id));
  
  // Render available tables in the side panel
  availableTables.forEach(table => {
    const tableGuests = currentEvent.guests.filter(g => g.tableId === table.id);
    
    const tableEl = document.createElement('div');
    tableEl.className = 'available-table';
    tableEl.dataset.tableId = table.id;
    
    // Apply scale factor
    tableEl.style.transform = `scale(${tableScaleFactor})`;
    
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
  
  // Apply scale factor along with centering transform
  tableEl.style.transform = `translate(-50%, -50%) scale(${tableScaleFactor})`;
  
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

// Handle table scale slider change
function handleTableScaleChange() {
  // Get the scale value from the slider (50-100)
  const scalePercent = parseInt(tableScaleSlider.value);
  
  // Update the display
  tableScaleValue.textContent = `${scalePercent}%`;
  
  // Update the scale factor (convert percentage to decimal)
  tableScaleFactor = scalePercent / 100;
  
  // Save in the event data
  currentEvent.tableScale = scalePercent;
  
  // Re-render tables with the new scale
  updateTableScale();
}

// Update all tables with the current scale
function updateTableScale() {
  // Apply scale to all table objects on the grid
  const tableObjects = document.querySelectorAll('.table-object');
  tableObjects.forEach(table => {
    // Combine translate for centering with scale
    table.style.transform = `translate(-50%, -50%) scale(${tableScaleFactor})`;
  });
  
  // Also update available tables for consistency
  const availableTables = document.querySelectorAll('.available-table');
  availableTables.forEach(table => {
    table.style.transform = `scale(${tableScaleFactor})`;
  });
}

// Import CSV
async function importCsv(file) {
  try {
    console.log('importCsv called with file:', file);
    
    // If a file is provided directly (from file input), use it
    if (file) {
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        console.log('FileReader onload triggered');
        const csvData = e.target.result;
        console.log('CSV data length:', csvData.length);
        processImportedCSV(csvData);
      };
      
      reader.onerror = (e) => {
        console.error('FileReader error:', e);
        console.error('Error details:', reader.error);
        alert('Error reading CSV file: ' + e.message);
      };
      
      console.log('Starting to read file...');
      reader.readAsText(file);
      console.log('Read operation initiated');
    } else {
      console.error('No file provided to importCsv');
      alert('Please select a CSV file');
    }
  } catch (error) {
    console.error('Error in importCsv:', error);
    console.error('Error stack:', error.stack);
    alert('Error importing CSV file: ' + error.message);
  }
}

// Process imported CSV data
function processImportedCSV(csvData) {
  console.log('processImportedCSV called');
  
  if (!csvData) {
    console.error('No CSV data provided');
    alert('No data found in CSV file');
    return;
  }
  
  try {
    // Split into lines and remove any BOM characters or special characters
    const lines = csvData.replace(/^\ufeff/, '').split('\n');
    console.log(`Processing ${lines.length} lines from CSV`);
    
    const result = processGuestImportData(lines, true);
    console.log('processGuestImportData result:', result);
    
    if (!result.success) {
      console.error('Failed to process guest data:', result.message);
      alert(result.message);
      return;
    }
    
    // Refresh UI
    updateUI();
    renderFloorPlan();
    
    // Create message for alerts
    let message = `Successfully imported ${result.count} guests from CSV file`;
    
    // Show errors if any
    if (result.errors && result.errors.length > 0) {
      // Format the errors to be more user-friendly
      const formattedErrors = result.errors.slice(0, 5).map(err => `• ${err}`).join('\n');
      const additionalErrorsMsg = result.errors.length > 5 ? `\n• And ${result.errors.length - 5} more issues...` : '';
      
      alert(`${message}\n\nNotes:\n${formattedErrors}${additionalErrorsMsg}`);
    } else {
      alert(message);
    }
  } catch (error) {
    console.error('Error processing CSV:', error);
    console.error('Error stack:', error.stack);
    alert('Error processing CSV file: ' + error.message);
  }
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
  
  const result = processGuestImportData(lines, false);
  
  if (!result.success) {
    alert(result.message);
    return;
  }
  
  // Clear the textarea
  pasteDataArea.value = '';
  
  // Refresh UI
  updateUI();
  renderFloorPlan();
  
  // Create message for alerts
  let message = `Successfully imported ${result.count} guests`;
  
  // Show errors and warnings if any
  let additionalDetails = '';
  
  if (result.errors && result.errors.length > 0) {
    // Format the errors to be more user-friendly
    const formattedErrors = result.errors.slice(0, 3).map(err => `• ${err}`).join('\n');
    const additionalErrorsMsg = result.errors.length > 3 ? `\n• And ${result.errors.length - 3} more errors...` : '';
    additionalDetails += `\n\nErrors:\n${formattedErrors}${additionalErrorsMsg}`;
  }
  
  if (result.warnings && result.warnings.length > 0) {
    // Format the warnings to be more user-friendly
    const formattedWarnings = result.warnings.slice(0, 3).map(warn => `• ${warn}`).join('\n');
    const additionalWarningsMsg = result.warnings.length > 3 ? `\n• And ${result.warnings.length - 3} more warnings...` : '';
    additionalDetails += `\n\nWarnings:\n${formattedWarnings}${additionalWarningsMsg}`;
  }
  
  // Show alert with appropriate details
  if (additionalDetails) {
    alert(message + additionalDetails);
  } else {
    alert(message);
  }
}

// Common function to process guest import data (used by both paste and CSV import)
function processGuestImportData(lines, isCSV = false) {
  if (lines.length === 0) {
    return { success: false, message: 'No valid data found' };
  }
  
  console.log(`Processing ${lines.length} lines of import data`);
  
  // Process each line
  const newGuests = [];
  const tableMap = new Map();
  const errors = [];
  let count = 0;
  
  // Track guest counts per table to enforce capacity limits
  const tableGuestCounts = {};
  const MAX_GUESTS_PER_TABLE = 12; // Increased from 10 to 12
  
  // Create a map of existing tables with normalized names
  currentEvent.tables.forEach(table => {
    // Normalize table name: lowercase, remove extra spaces, and extract numbers
    const normalizedName = normalizeTableName(table.name);
    console.log(`Mapped existing table: "${table.name}" → "${normalizedName}" (ID: ${table.id})`);
    tableMap.set(normalizedName, table.id);
    
    // Initialize guest counts for existing tables (including already assigned guests)
    tableGuestCounts[table.id] = currentEvent.guests.filter(g => g.tableId === table.id).length;
    console.log(`Table "${table.name}" already has ${tableGuestCounts[table.id]} guests`);
    
    // Only map the number if this specific table follows the "Table X" pattern
    // This prevents all tables from mapping to the same numeric key
    const tableNumberMatch = table.name.match(/^table\s*(\d+)$/i);
    if (tableNumberMatch) {
      const tableNumber = tableNumberMatch[1];
      // Only add this mapping if another table isn't already using this number
      if (!tableMap.has(tableNumber)) {
        tableMap.set(tableNumber, table.id);
        console.log(`  Also mapped as number: "${tableNumber}" → "${table.id}"`);
      } else {
        console.log(`  Can't map as number: "${tableNumber}" is already used by another table`);
      }
    }
  });
  
  // Skip header row for CSV if it exists
  const startIndex = (isCSV && lines[0].toLowerCase().includes('name')) ? 1 : 0;
  
  // Track tables created during this import by their actual names (not normalized)
  // This ensures tables with similar normalized names are still treated as distinct
  const newTables = new Map();
  
  // First pass - group guests by actual table name to count how many per table
  const guestsByTable = {};
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Get parts, handling CSV parsing if needed
    const parts = isCSV ? parseCSVLine(line) : line.split(',');
    
    if (parts.length < 3) {
      errors.push(`Line ${i+1}: Not enough columns (expected at least 3, got ${parts.length})`);
      continue;
    }
    
    const name = parts[0].trim();
    const role = parts[1] ? parts[1].trim() : '';
    let tableName = parts[2] ? parts[2].trim() : '';
    
    if (!name) {
      errors.push(`Line ${i+1}: Missing guest name`);
      continue;
    }
    
    if (!tableName) {
      errors.push(`Line ${i+1}: Missing table name/number for guest "${name}"`);
      continue;
    }
    
    // Add to the count for this original table name
    if (!guestsByTable[tableName]) {
      guestsByTable[tableName] = [];
    }
    guestsByTable[tableName].push({ name, role, lineNum: i+1 });
  }
  
  // Second pass - process each table and validate capacity
  Object.entries(guestsByTable).forEach(([originalTableName, tableGuests]) => {
    // Format the table name if it's just a number
    let displayTableName = originalTableName;
    if (/^\d+$/.test(originalTableName)) {
      displayTableName = `Table ${originalTableName}`;
    }
    
    // Normalize for lookup
    const normalizedName = normalizeTableName(originalTableName);
    
    // Try to find the table by normal means
    let tableId = newTables.get(originalTableName);
    
    // If not found in new tables, try to find in existing tables
    if (!tableId) {
      tableId = findTableIdByName(tableMap, normalizedName);
    }
    
    // Check total guest count for this table
    const existingGuestCount = tableId ? (tableGuestCounts[tableId] || 0) : 0;
    const newGuestCount = tableGuests.length;
    
    // If adding these guests would exceed capacity, show error
    if (existingGuestCount + newGuestCount > MAX_GUESTS_PER_TABLE) {
      errors.push(`Table "${displayTableName}" would exceed capacity (${existingGuestCount} + ${newGuestCount} > ${MAX_GUESTS_PER_TABLE}). Some guests won't be added.`);
      
      // Only process guests up to capacity
      tableGuests = tableGuests.slice(0, MAX_GUESTS_PER_TABLE - existingGuestCount);
      
      if (tableGuests.length === 0) {
        return; // Skip this table entirely if it's already at capacity
      }
    }
    
    // If the table doesn't exist, create it
    if (!tableId) {
      // Create new table
      tableId = `table${Date.now()}-${Math.floor(Math.random() * 1000)}-${count}`;
      
      const newTable = {
        id: tableId,
        name: displayTableName,
        shape: 'circle',
        seats: MAX_GUESTS_PER_TABLE,
        xPercent: 50, 
        yPercent: 50
      };
      
      // Add to current event
      currentEvent.tables.push(newTable);
      
      // Update maps
      tableMap.set(normalizeTableName(displayTableName), tableId);
      newTables.set(originalTableName, tableId);
      tableGuestCounts[tableId] = 0;
      
      console.log(`Created new table: "${displayTableName}" with ID: ${tableId}`);
    }
    
    // Process all guests for this table
    tableGuests.forEach(({ name, role, lineNum }) => {
      // Safety check for table capacity
      if (tableGuestCounts[tableId] >= MAX_GUESTS_PER_TABLE) {
        errors.push(`Line ${lineNum}: Couldn't add guest "${name}" - table "${displayTableName}" is at capacity (${MAX_GUESTS_PER_TABLE} guests)`);
        return;
      }
      
      // Create guest
      const guest = {
        id: `guest${Date.now()}-${Math.floor(Math.random() * 1000)}-${count}`,
        name,
        role,
        tableId
      };
      
      // Increment guest count for this table
      tableGuestCounts[tableId] = (tableGuestCounts[tableId] || 0) + 1;
      
      console.log(`Added guest: "${name}" to table "${displayTableName}" (ID: ${tableId}) - Now ${tableGuestCounts[tableId]}/${MAX_GUESTS_PER_TABLE}`);
      newGuests.push(guest);
      count++;
    });
  });
  
  // Log any import issues
  if (errors.length > 0) {
    console.error('Import issues:');
    errors.forEach(err => console.error(' - ' + err));
  }
  
  if (newGuests.length === 0) {
    return { 
      success: false, 
      message: 'No valid guest data found' + (errors.length > 0 ? `. Errors: ${errors.join(', ')}` : '')
    };
  }
  
  // Add guests to event
  currentEvent.guests = [...currentEvent.guests, ...newGuests];
  
  // Return success
  return { 
    success: true, 
    count: newGuests.length,
    errors: errors.length > 0 ? errors : null
  };
}

// Helper function to normalize table names for consistent matching
function normalizeTableName(name) {
  if (!name) return '';
  
  // Start by trimming and converting to lowercase
  let normalized = name.trim().toLowerCase();
  
  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // If it's just a number, that's our normalized form
  if (/^\d+$/.test(normalized)) {
    return normalized;
  }
  
  // For "Table X" or "Table - X" or variations, extract and normalize
  const tableNumberMatch = normalized.match(/^table\s*[-:]?\s*(\d+)/i) || 
                          normalized.match(/^t\s*[-:]?\s*(\d+)/i) ||
                          normalized.match(/^(\d+)$/);
  
  if (tableNumberMatch) {
    return `table${tableNumberMatch[1]}`;
  }
  
  return normalized;
}

// Helper function to find a table ID by trying various matching methods
function findTableIdByName(tableMap, normalizedName) {
  // Direct match with normalized name
  if (tableMap.has(normalizedName)) {
    return tableMap.get(normalizedName);
  }
  
  // Try to extract just the number if it's a "table X" format
  const numberMatch = normalizedName.match(/table\s*(\d+)/i);
  if (numberMatch && tableMap.has(numberMatch[1])) {
    return tableMap.get(numberMatch[1]);
  }
  
  // If the name itself is just a number, try that
  if (/^\d+$/.test(normalizedName) && tableMap.has(normalizedName)) {
    return tableMap.get(normalizedName);
  }
  
  // If all else fails, try a more fuzzy match (checking if any mapped key contains this name)
  for (const [key, id] of tableMap.entries()) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      console.log(`Fuzzy match: "${normalizedName}" matched with "${key}"`);
      return id;
    }
  }
  
  return null;
}

// Helper function to parse CSV lines properly handling quotes
function parseCSVLine(text) {
  const result = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"') {
      // Handle quotes - toggle quote state
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // Add cell to result when comma is encountered outside quotes
      result.push(cell);
      cell = '';
    } else {
      // Add character to current cell
      cell += char;
    }
  }
  
  // Add the last cell
  result.push(cell);
  return result;
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
      <input type="number" id="table-seats" class="modal-input" value="12" min="1">
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
  const tableSeats = parseInt(document.getElementById('table-seats').value) || 12;
  
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
  if (floorPlanContent.classList.contains('active')) {
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
  if (floorPlanContent.classList.contains('active')) {
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
  
  // Create empty tables and guests arrays
  const sampleTables = [];
  const sampleGuests = [];
  
  // Add empty data to currentEvent
  currentEvent.tables = sampleTables;
  currentEvent.guests = sampleGuests;
  
  console.log('Empty data initialized:', currentEvent);
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded - initializing application');
  
  // Initialize the application
  init();
  
  // DO NOT add extra search listeners here, they're already added in addEventListeners()
  const searchInputEl = document.getElementById('search-input');
  if (searchInputEl) {
    console.log('Search input found:', searchInputEl);
    
    // Add a manual search button next to the search input for clarity
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
  const tablesOverviewEl = document.querySelector('.tables-overview');
  
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
  
  // If empty search, clear results and show tables overview
  if (!searchText) {
    searchResultsEl.innerHTML = '';
    if (tablesOverviewEl) tablesOverviewEl.style.display = 'block';
    // Re-render tables to restart auto-advance
    renderTablesOverview();
    return;
  }
  
  // Stop auto-advance timer when showing search results
  if (window.autoAdvanceTimer) {
    clearInterval(window.autoAdvanceTimer);
    window.autoAdvanceTimer = null;
  }
  
  // Hide tables overview when showing search results
  if (tablesOverviewEl) tablesOverviewEl.style.display = 'none';
  
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
  
  console.log('Clearing all data...');
  
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
  
  // Reinitialize CSV import functionality
  console.log('Starting CSV import reinitialization...');
  
  // Get fresh references to the elements
  const csvImportBtn = document.getElementById('csv-import-btn');
  const csvFileInput = document.getElementById('csv-file-input');
  
  console.log('Current CSV elements:', {
    importBtn: csvImportBtn,
    fileInput: csvFileInput
  });
  
  if (csvImportBtn && csvFileInput) {
    console.log('Found CSV elements, reinitializing...');
    
    // Remove existing event listeners
    const oldImportBtn = csvImportBtn;
    const oldFileInput = csvFileInput;
    
    // Create new elements
    const newImportBtn = document.createElement('button');
    newImportBtn.id = 'csv-import-btn';
    newImportBtn.className = oldImportBtn.className;
    newImportBtn.textContent = 'Import CSV';
    
    const newFileInput = document.createElement('input');
    newFileInput.id = 'csv-file-input';
    newFileInput.type = 'file';
    newFileInput.accept = '.csv';
    newFileInput.style.display = 'none';
    
    // Replace old elements
    oldImportBtn.parentNode.replaceChild(newImportBtn, oldImportBtn);
    oldFileInput.parentNode.replaceChild(newFileInput, oldFileInput);
    
    // Add event listeners to new elements
    newFileInput.addEventListener('change', function(e) {
      console.log('CSV file input change event triggered');
      if (e.target.files.length > 0) {
        console.log('File selected:', e.target.files[0]);
        importCsv(e.target.files[0]);
      }
    });
    
    newImportBtn.addEventListener('click', function() {
      console.log('CSV import button clicked');
      newFileInput.click();
    });
    
    console.log('CSV import elements reinitialized successfully');
  } else {
    console.error('Could not find CSV import elements for reinitialization');
  }
  
  // Show confirmation
  alert('All data has been cleared successfully');
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
  } else {
    toggleLockBtn.classList.add('unlocked');
    lockStatusText.textContent = 'Unlocked';
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

// Floor plan image handling functions
function handleFloorImageDragOver(e) {
  e.preventDefault();
  floorImageDropArea.classList.add('highlight');
}

function handleFloorImageDragLeave() {
  floorImageDropArea.classList.remove('highlight');
}

function handleFloorImageDrop(e) {
  e.preventDefault();
  floorImageDropArea.classList.remove('highlight');
  
  const files = e.dataTransfer.files;
  if (files.length) {
    processFloorPlanImage(files[0]);
  }
}

function handleFloorImageSelect(e) {
  const files = e.target.files;
  if (files.length) {
    processFloorPlanImage(files[0]);
  }
}

function processFloorPlanImage(file) {
  if (!file.type.match('image.*')) {
    alert('Please select an image file');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    currentEvent.floorPlanImage = e.target.result;
    updateFloorPlanImageDisplay();
    
    // If floor plan section is active, re-render it
    if (floorPlanContent.classList.contains('active')) {
      renderFloorPlan();
    }
  };
  
  reader.readAsDataURL(file);
}

function updateFloorPlanImageDisplay() {
  // Update preview in modal
  if (currentEvent.floorPlanImage) {
    if (floorImagePreviewImg) {
      floorImagePreviewImg.src = currentEvent.floorPlanImage;
      floorImagePreview.classList.remove('hidden');
    }
    if (removeFloorImageBtn) {
      removeFloorImageBtn.classList.remove('hidden');
    }
  } else {
    if (floorImagePreview) {
      floorImagePreview.classList.add('hidden');
    }
    if (removeFloorImageBtn) {
      removeFloorImageBtn.classList.add('hidden');
    }
  }
}

function removeFloorPlanImage() {
  currentEvent.floorPlanImage = null;
  updateFloorPlanImageDisplay();
  
  // If floor plan section is active, re-render it
  if (floorPlanContent && floorPlanContent.classList.contains('active')) {
    renderFloorPlan();
  }
}

// Add the new functions for handling the floor plan image modal
function showFloorImageModal() {
  // Reset the preview
  if (floorImagePreview) {
    floorImagePreview.classList.add('hidden');
  }
  
  // Show the modal
  floorImageModal.classList.remove('hidden');
}

function hideFloorImageModal() {
  floorImageModal.classList.add('hidden');
}

function confirmFloorImage() {
  // Update the display in the main UI
  updateFloorPlanImageDisplay();
  
  // Hide the modal
  hideFloorImageModal();
  
  // Update the remove button visibility
  if (removeFloorImageBtn) {
    removeFloorImageBtn.classList.toggle('hidden', !currentEvent.floorPlanImage);
  }
  
  // Wait a moment before rendering to ensure modal is closed and DOM is ready
  setTimeout(() => {
    // Render the floor plan with the new image
    renderFloorPlan();
  }, 100);
}

// Show auto arrange modal
function showAutoArrangeModal() {
  // Check if we have tables first
  if (!currentEvent.tables || currentEvent.tables.length === 0) {
    alert('No tables available to arrange. Please add tables first.');
    return;
  }
  
  // Reset layout type to grid
  layoutTypeSelect.value = 'grid';
  updateLayoutOptions();
  
  // Show modal
  autoArrangeModal.classList.remove('hidden');
}

// Hide auto arrange modal
function hideAutoArrangeModal() {
  autoArrangeModal.classList.add('hidden');
}

// Update layout options based on selected layout type
function updateLayoutOptions() {
  const layoutType = layoutTypeSelect.value;
  
  // Hide all option divs first
  circleOptionsDiv.style.display = 'none';
  uShapeOptionsDiv.style.display = 'none';
  
  // Show options based on selected layout
  if (layoutType === 'grid') {
    document.getElementById('grid-options').style.display = 'block';
  } else if (layoutType === 'circle') {
    document.getElementById('circle-options').style.display = 'block';
  } else if (layoutType === 'u-shape') {
    document.getElementById('u-shape-options').style.display = 'block';
  }
}

// Apply the selected auto arrange layout
function applyAutoArrange() {
  // Unlock the floor plan first
  isFloorPlanLocked = false;
  updateLockStatus();
  
  const layoutType = layoutTypeSelect.value;
  
  // Get appropriate layout function
  if (layoutType === 'grid') {
    applyGridLayout();
  } else if (layoutType === 'circle') {
    applyCircleLayout();
  } else if (layoutType === 'u-shape') {
    applyUShapeLayout();
  }
  
  // Close the modal
  hideAutoArrangeModal();
  
  // Re-render the floor plan
  renderFloorPlan();
}

// Apply grid layout
function applyGridLayout() {
  const tables = currentEvent.tables;
  const tablesPerRow = parseInt(tablesPerRowSelect.value);
  const spacing = tableSpacingSelect.value;
  
  // Define spacing values
  let spacingFactor = 0.6; // Normal spacing
  if (spacing === 'tight') {
    spacingFactor = 0.4;
  } else if (spacing === 'spacious') {
    spacingFactor = 0.8;
  }
  
  // Calculate the number of rows needed
  const numRows = Math.ceil(tables.length / tablesPerRow);
  
  // Calculate the grid dimensions as percentages of the container
  const cellWidth = 100 / tablesPerRow;
  const cellHeight = 100 / numRows;
  
  // Calculate effective cell size with margins
  const effectiveCellWidth = cellWidth * (1 - spacingFactor);
  const effectiveCellHeight = cellHeight * (1 - spacingFactor);
  
  // Position each table
  tables.forEach((table, index) => {
    // Calculate grid position
    const row = Math.floor(index / tablesPerRow);
    const col = index % tablesPerRow;
    
    // Calculate center of the cell
    const xPercent = (col * cellWidth) + (cellWidth / 2);
    const yPercent = (row * cellHeight) + (cellHeight / 2);
    
    // Update table position
    table.xPercent = xPercent;
    table.yPercent = yPercent;
    
    // Mark table as placed
    placedTables.add(table.id);
  });
  
  // Show confirmation
  alert(`${tables.length} tables arranged in a grid layout with ${tablesPerRow} tables per row.`);
}

// Apply circle layout
function applyCircleLayout() {
  const tables = currentEvent.tables;
  const size = circleSelect.value;
  
  // Define radius as percentage of container
  let radius = 35; // Medium circle size
  if (size === 'small') {
    radius = 25;
  } else if (size === 'large') {
    radius = 45;
  }
  
  // Calculate center of container
  const centerX = 50;
  const centerY = 50;
  
  // Position each table in a circle
  tables.forEach((table, index) => {
    // Calculate angle for this table (distribute evenly)
    const angleStep = (2 * Math.PI) / tables.length;
    const angle = index * angleStep;
    
    // Calculate position using circle equation
    const xPercent = centerX + radius * Math.cos(angle);
    const yPercent = centerY + radius * Math.sin(angle);
    
    // Update table position
    table.xPercent = xPercent;
    table.yPercent = yPercent;
    
    // Mark table as placed
    placedTables.add(table.id);
  });
  
  // Show confirmation
  alert(`${tables.length} tables arranged in a circular layout.`);
}

// Apply U-shape layout
function applyUShapeLayout() {
  const tables = currentEvent.tables;
  const size = uShapeSelect.value;
  
  // Define dimensions of U shape
  let width = 60; // Medium U shape width
  let height = 40; // Height of U shape
  
  if (size === 'small') {
    width = 50;
    height = 30;
  } else if (size === 'large') {
    width = 70;
    height = 50;
  }
  
  // Calculate dimensions
  const centerX = 50;
  const bottomY = 80;
  
  // Determine number of tables for each segment
  const leftLegTables = Math.floor(tables.length / 3);
  const rightLegTables = Math.floor(tables.length / 3);
  const bottomTables = tables.length - leftLegTables - rightLegTables;
  
  // Position tables
  let tableIndex = 0;
  
  // Left leg (bottom to top)
  for (let i = 0; i < leftLegTables; i++) {
    if (tableIndex >= tables.length) break;
    
    const yPos = bottomY - (height * (i / leftLegTables));
    tables[tableIndex].xPercent = centerX - (width / 2);
    tables[tableIndex].yPercent = yPos;
    placedTables.add(tables[tableIndex].id);
    tableIndex++;
  }
  
  // Bottom row (left to right)
  for (let i = 0; i < bottomTables; i++) {
    if (tableIndex >= tables.length) break;
    
    const xPos = (centerX - (width / 2)) + (width * (i / Math.max(1, bottomTables - 1)));
    tables[tableIndex].xPercent = xPos;
    tables[tableIndex].yPercent = bottomY;
    placedTables.add(tables[tableIndex].id);
    tableIndex++;
  }
  
  // Right leg (bottom to top)
  for (let i = 0; i < rightLegTables; i++) {
    if (tableIndex >= tables.length) break;
    
    const yPos = bottomY - (height * (i / rightLegTables));
    tables[tableIndex].xPercent = centerX + (width / 2);
    tables[tableIndex].yPercent = yPos;
    placedTables.add(tables[tableIndex].id);
    tableIndex++;
  }
  
  // Show confirmation
  alert(`${tables.length} tables arranged in a U-shape layout.`);
}

// Add new function to handle password change
function changeAdminPassword() {
  const currentPassword = document.getElementById('current-password').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  if (currentPassword !== currentEvent.adminPassword) {
    alert('Current password is incorrect');
    return;
  }

  if (newPassword === '') {
    alert('New password cannot be empty');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }

  currentEvent.adminPassword = newPassword;
  alert('Password changed successfully');

  // Clear the form
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
}

// Add new function to handle timeout change
function changeAdminTimeout() {
  const timeoutSelect = document.getElementById('admin-timeout');
  const selectedValue = timeoutSelect.value;
  
  // Update the timeout value
  currentEvent.adminTimeout = parseInt(selectedValue);
  
  // Update the ADMIN_GRACE_PERIOD constant
  ADMIN_GRACE_PERIOD = parseInt(selectedValue);
  
  alert('Admin timeout updated successfully');
}