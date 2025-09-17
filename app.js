// Alumni Management System - Complete Application Logic

// Simple loading screen handler
let isLoadingScreenHidden = false;

function hideLoadingScreen() {
    if (isLoadingScreenHidden) return;
    
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        console.log('Hiding loading screen...');
        isLoadingScreenHidden = true;
        loadingScreen.style.transition = 'opacity 0.3s ease-out';
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}

// Initialize data storage
let alumniData = [];
let currentUser = null;

// Setup all event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            showLoginScreen();
        });
    }
    
    // Login type radio buttons
    const adminLoginRadio = document.getElementById('adminLogin');
    const guestLoginRadio = document.getElementById('guestLogin');
    
    if (adminLoginRadio && guestLoginRadio) {
        adminLoginRadio.addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('adminFields').classList.remove('d-none');
                document.getElementById('guestFields').classList.add('d-none');
                document.getElementById('adminInfo').classList.remove('d-none');
                document.getElementById('guestInfo').classList.add('d-none');
                document.getElementById('loginBtn').textContent = 'Admin Login';
                document.getElementById('loginEmail').setAttribute('required', '');
                document.getElementById('loginPassword').setAttribute('required', '');
            }
        });
        
        guestLoginRadio.addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('adminFields').classList.add('d-none');
                document.getElementById('guestFields').classList.remove('d-none');
                document.getElementById('adminInfo').classList.add('d-none');
                document.getElementById('guestInfo').classList.remove('d-none');
                document.getElementById('loginBtn').textContent = 'Continue as Guest';
                document.getElementById('loginEmail').removeAttribute('required');
                document.getElementById('loginPassword').removeAttribute('required');
            }
        });
    }
    
    // Navigation links
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            
            // Hide all pages
            document.querySelectorAll('.page-content').forEach(p => p.classList.add('d-none'));
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Show selected page
            document.getElementById(page + 'Page').classList.remove('d-none');
            this.classList.add('active');
            
            // Check permissions for admin-only pages
            if ((page === 'add' || page === 'import') && !hasAdminPermission()) {
                showPermissionDenied();
                // Redirect back to dashboard
                document.querySelectorAll('.page-content').forEach(p => p.classList.add('d-none'));
                document.getElementById('dashboardPage').classList.remove('d-none');
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.querySelector('[data-page="dashboard"]').classList.add('active');
                return;
            }
            
            // Load page-specific data
            if (page === 'dashboard') loadDashboard();
            if (page === 'directory') loadAlumniTable();
        });
    });
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // Add alumni form
    const addAlumniForm = document.getElementById('addAlumniForm');
    if (addAlumniForm) {
        addAlumniForm.addEventListener('submit', handleAddAlumni);
    }
    
    // Import/Export buttons
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (importBtn) {
        importBtn.addEventListener('click', handleImport);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // Edit alumni save button
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditedAlumni);
    }
    
    // Theme switchers
    document.addEventListener('click', function(e) {
        if (e.target.closest('.theme-option')) {
            e.preventDefault();
            const theme = e.target.closest('.theme-option').dataset.theme;
            applyTheme(theme);
        }
    });
}

// Load data from localStorage on startup (optimized)
function loadData() {
    try {
        const stored = localStorage.getItem('alumniData');
        if (stored) {
            alumniData = JSON.parse(stored);
        } else {
            // Initialize with minimal sample data for faster loading
            alumniData = [
            {
                id: generateId(),
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "+1234567890",
                studentId: "2018CS001",
                department: "Computer Science",
                graduationYear: 2022,
                batch: "2018-2022",
                degree: "B.Tech",
                cgpa: 8.5,
                currentJobTitle: "Software Engineer",
                currentCompany: "Tech Corp",
                industry: "Technology",
                workLocation: "San Francisco, CA",
                linkedin: "https://linkedin.com/in/johndoe",
                isVerified: true,
                isActive: true,
                dataSource: "Import",
                lastUpdated: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@example.com",
                phone: "+1234567891",
                studentId: "2019EC015",
                department: "Electronics",
                graduationYear: 2023,
                batch: "2019-2023",
                degree: "B.Tech",
                cgpa: 9.1,
                currentJobTitle: "Product Manager",
                currentCompany: "Innovation Labs",
                industry: "Technology",
                workLocation: "New York, NY",
                linkedin: "https://linkedin.com/in/janesmith",
                isVerified: true,
                isActive: true,
                dataSource: "Self-Registration",
                lastUpdated: new Date().toISOString()
            },
            {
                id: generateId(),
                firstName: "Michael",
                lastName: "Johnson",
                email: "michael.j@example.com",
                phone: "+1234567892",
                studentId: "2017ME023",
                department: "Mechanical Engineering",
                graduationYear: 2021,
                batch: "2017-2021",
                degree: "B.Tech",
                cgpa: 7.8,
                currentJobTitle: "Design Engineer",
                currentCompany: "AutoTech Solutions",
                industry: "Automotive",
                workLocation: "Detroit, MI",
                linkedin: "",
                isVerified: false,
                isActive: true,
                dataSource: "Manual",
                lastUpdated: new Date().toISOString()
            }
        ];
            saveData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alumniData = [];
    }
}

// Save data to localStorage (with error handling)
function saveData() {
    try {
        localStorage.setItem('alumniData', JSON.stringify(alumniData));
    } catch (error) {
        console.error('Error saving data:', error);
        // If localStorage is full, try to clear old data
        if (error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, clearing old data...');
            localStorage.removeItem('alumniData');
        }
    }
}

// Generate unique ID
function generateId() {
    return 'alumni_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const loginType = document.querySelector('input[name="loginType"]:checked').value;
    console.log('Login type:', loginType);
    
    if (loginType === 'guest') {
        console.log('Guest login successful');
        currentUser = { email: 'guest@alumni.edu', role: 'guest', name: 'Guest User' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Hide loading screen first, then show main app
        hideLoadingScreen();
        setTimeout(() => {
            showMainApp();
        }, 100);
    } else {
        // Admin login
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Attempting admin login with:', email);
        
        if (email === 'admin@alumni.edu' && password === 'admin123') {
            console.log('Admin login successful');
            currentUser = { email, role: 'admin', name: 'Administrator' };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Hide loading screen first, then show main app
            hideLoadingScreen();
            setTimeout(() => {
                showMainApp();
            }, 100);
        } else {
            console.log('Admin login failed');
            alert('Invalid admin credentials! Use admin@alumni.edu / admin123');
        }
    }
}


// Navigation
function showLoginScreen() {
    console.log('Showing login screen...');
    // Ensure loading screen is hidden
    hideLoadingScreen();
    
    document.getElementById('loginScreen').classList.remove('d-none');
    document.getElementById('mainApp').classList.add('d-none');
}

function showMainApp() {
    console.log('Showing main app...');
    // Ensure loading screen is hidden
    hideLoadingScreen();
    
    // Hide login screen and show main app
    document.getElementById('loginScreen').classList.add('d-none');
    document.getElementById('mainApp').classList.remove('d-none');
    
    // Update navbar user display
    const userDisplay = document.querySelector('.navbar-text');
    if (userDisplay && currentUser) {
        const icon = currentUser.role === 'admin' ? 'person-fill-gear' : 'person';
        userDisplay.innerHTML = `<i class="bi bi-${icon}"></i> ${currentUser.name}`;
    }
    
    // Apply role-based permissions
    applyRoleBasedPermissions();
    
    // Load initial data
    loadDashboard();
    loadAlumniTable();
    
    console.log('Main app loaded successfully');
}

// Role-based permission system
function applyRoleBasedPermissions() {
    if (!currentUser) return;
    
    const isAdmin = currentUser.role === 'admin';
    const isGuest = currentUser.role === 'guest';
    console.log('Applying permissions for role:', currentUser.role);
    
    // Navigation items
    const addAlumniNav = document.querySelector('[data-page="add"]');
    const importExportNav = document.querySelector('[data-page="import"]');
    
    if (addAlumniNav) {
        addAlumniNav.parentElement.style.display = isAdmin ? 'block' : 'none';
    }
    
    if (importExportNav) {
        importExportNav.parentElement.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Show/hide contact admin sections based on user role
    const contactAdminCard = document.getElementById('contactAdminCard');
    const directoryContactBar = document.getElementById('directoryContactBar');
    const floatingContactBtn = document.getElementById('floatingContactBtn');
    
    if (contactAdminCard) {
        contactAdminCard.style.display = isGuest ? 'block' : 'none';
    }
    
    if (directoryContactBar) {
        directoryContactBar.style.display = isGuest ? 'block' : 'none';
    }
    
    if (floatingContactBtn) {
        floatingContactBtn.style.display = isGuest ? 'block' : 'none';
    }
    
    // If guest user tries to access admin-only pages, redirect to dashboard
    if (!isAdmin) {
        const currentPage = document.querySelector('.page-content:not(.d-none)');
        if (currentPage && (currentPage.id === 'addPage' || currentPage.id === 'importPage')) {
            // Redirect to dashboard
            document.querySelectorAll('.page-content').forEach(p => p.classList.add('d-none'));
            document.getElementById('dashboardPage').classList.remove('d-none');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('[data-page="dashboard"]').classList.add('active');
        }
    }
}

// Check if user has admin permissions
function hasAdminPermission() {
    return currentUser && currentUser.role === 'admin';
}

// Show permission denied message for guests
function showPermissionDenied() {
    alert('Access denied. This feature is only available to administrators.');
}

// Scroll to contact section for guest users
function scrollToContact() {
    // Navigate to dashboard first
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('d-none'));
    document.getElementById('dashboardPage').classList.remove('d-none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-page="dashboard"]').classList.add('active');
    
    // Then scroll to contact card
    setTimeout(() => {
        const contactCard = document.getElementById('contactAdminCard');
        if (contactCard) {
            contactCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a highlight effect
            contactCard.classList.add('shadow-lg');
            contactCard.style.transform = 'scale(1.02)';
            setTimeout(() => {
                contactCard.style.transform = 'scale(1)';
            }, 300);
        }
    }, 100);
}


// Dashboard functionality
function loadDashboard() {
    const total = alumniData.filter(a => a.isActive).length;
    const verified = alumniData.filter(a => a.isActive && a.isVerified).length;
    const employed = alumniData.filter(a => a.isActive && a.currentCompany).length;
    const employmentRate = total > 0 ? ((employed / total) * 100).toFixed(1) : 0;
    
    document.getElementById('totalAlumni').textContent = total;
    document.getElementById('verifiedAlumni').textContent = verified;
    document.getElementById('employedAlumni').textContent = employed;
    document.getElementById('employmentRate').textContent = employmentRate + '%';
    
    // Load department chart
    loadDepartmentChart();
    
    // Load year chart
    loadYearChart();
}

function loadDepartmentChart() {
    const deptCounts = {};
    alumniData.filter(a => a.isActive).forEach(a => {
        deptCounts[a.department] = (deptCounts[a.department] || 0) + 1;
    });
    
    const chartHTML = Object.entries(deptCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([dept, count]) => {
            const percentage = (count / alumniData.length * 100).toFixed(1);
            return `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <small>${dept}</small>
                        <small>${count} alumni</small>
                    </div>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');
    
    document.getElementById('departmentChart').innerHTML = chartHTML || '<p class="text-muted">No data available</p>';
}

function loadYearChart() {
    const yearCounts = {};
    alumniData.filter(a => a.isActive).forEach(a => {
        yearCounts[a.graduationYear] = (yearCounts[a.graduationYear] || 0) + 1;
    });
    
    const chartHTML = Object.entries(yearCounts)
        .sort((a, b) => b[0] - a[0])
        .slice(0, 5)
        .map(([year, count]) => {
            const percentage = (count / alumniData.length * 100).toFixed(1);
            return `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <small>Class of ${year}</small>
                        <small>${count} alumni</small>
                    </div>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-info" style="width: ${percentage}%">${percentage}%</div>
                    </div>
                </div>
            `;
        }).join('');
    
    document.getElementById('yearChart').innerHTML = chartHTML || '<p class="text-muted">No data available</p>';
}

// Alumni Directory functionality
function loadAlumniTable(filterData = null) {
    const data = filterData || alumniData.filter(a => a.isActive);
    const tbody = document.getElementById('alumniTableBody');
    
    // Load filter options
    loadFilterOptions();
    
    const isAdmin = hasAdminPermission();
    
    tbody.innerHTML = data.map(alumni => `
        <tr>
            <td>${alumni.firstName} ${alumni.lastName}</td>
            <td>${alumni.studentId}</td>
            <td>${alumni.email}</td>
            <td>${alumni.department}</td>
            <td>${alumni.batch}</td>
            <td>${alumni.currentCompany || '-'}</td>
            <td>
                ${alumni.isVerified 
                    ? '<span class="badge bg-success"><i class="bi bi-check-circle"></i> Verified</span>' 
                    : '<span class="badge bg-warning"><i class="bi bi-exclamation-circle"></i> Unverified</span>'}
            </td>
            <td>
                <div class="btn-group" role="group">
                    ${isAdmin ? `
                        <button class="btn btn-sm ${alumni.isVerified ? 'btn-warning' : 'btn-success'}" 
                                onclick="toggleVerification('${alumni.id}')" 
                                title="${alumni.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}">
                            ${alumni.isVerified 
                                ? '<i class="bi bi-x-circle"></i>' 
                                : '<i class="bi bi-check-circle"></i>'}
                        </button>` : ''}
                    <button class="btn btn-sm btn-info" onclick="viewAlumni('${alumni.id}')" title="View Details">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${isAdmin ? `
                        <button class="btn btn-sm btn-primary" onclick="editAlumni('${alumni.id}')" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteAlumni('${alumni.id}')" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function loadFilterOptions() {
    // Load departments
    const departments = [...new Set(alumniData.map(a => a.department))];
    const deptFilter = document.getElementById('departmentFilter');
    deptFilter.innerHTML = '<option value="">All Departments</option>' + 
        departments.map(d => `<option value="${d}">${d}</option>`).join('');
    
    // Load years
    const years = [...new Set(alumniData.map(a => a.graduationYear))].sort((a, b) => b - a);
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = '<option value="">All Years</option>' + 
        years.map(y => `<option value="${y}">${y}</option>`).join('');
}

// Search function
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const year = document.getElementById('yearFilter').value;
    const verified = document.getElementById('verifiedFilter').value;
    
    let filtered = alumniData.filter(a => a.isActive);
    
    if (searchTerm) {
        filtered = filtered.filter(a => 
            a.firstName.toLowerCase().includes(searchTerm) ||
            a.lastName.toLowerCase().includes(searchTerm) ||
            a.email.toLowerCase().includes(searchTerm) ||
            (a.currentCompany && a.currentCompany.toLowerCase().includes(searchTerm))
        );
    }
    
    if (department) {
        filtered = filtered.filter(a => a.department === department);
    }
    
    if (year) {
        filtered = filtered.filter(a => a.graduationYear === parseInt(year));
    }
    
    if (verified) {
        filtered = filtered.filter(a => a.isVerified === (verified === 'true'));
    }
    
    loadAlumniTable(filtered);
}

// Add Alumni functionality
function handleAddAlumni(e) {
    e.preventDefault();
    
    if (!hasAdminPermission()) {
        showPermissionDenied();
        return;
    }
    
    const newAlumni = {
        id: generateId(),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        studentId: document.getElementById('studentId').value,
        department: document.getElementById('department').value,
        graduationYear: parseInt(document.getElementById('graduationYear').value),
        batch: document.getElementById('batch').value,
        degree: document.getElementById('degree').value,
        cgpa: parseFloat(document.getElementById('cgpa').value) || null,
        currentJobTitle: document.getElementById('currentJobTitle').value,
        currentCompany: document.getElementById('currentCompany').value,
        industry: document.getElementById('industry').value,
        workLocation: document.getElementById('workLocation').value,
        linkedin: document.getElementById('linkedin').value,
        isVerified: false,
        isActive: true,
        dataSource: "Manual",
        lastUpdated: new Date().toISOString()
    };
    
    alumniData.push(newAlumni);
    saveData();
    
    alert('Alumni added successfully!');
    e.target.reset();
    
    // Refresh dashboard
    loadDashboard();
}

// Alumni operations
function viewAlumni(id) {
    const alumni = alumniData.find(a => a.id === id);
    if (alumni) {
        alert(`
Alumni Details:
Name: ${alumni.firstName} ${alumni.lastName}
Email: ${alumni.email}
Student ID: ${alumni.studentId}
Department: ${alumni.department}
Graduation Year: ${alumni.graduationYear}
Current Company: ${alumni.currentCompany || 'N/A'}
Status: ${alumni.isVerified ? 'Verified' : 'Unverified'}
        `);
    }
}

function editAlumni(id) {
    if (!hasAdminPermission()) {
        showPermissionDenied();
        return;
    }
    
    const alumni = alumniData.find(a => a.id === id);
    if (alumni) {
        // Populate the edit form with current data
        document.getElementById('editAlumniId').value = alumni.id;
        document.getElementById('editFirstName').value = alumni.firstName || '';
        document.getElementById('editLastName').value = alumni.lastName || '';
        document.getElementById('editEmail').value = alumni.email || '';
        document.getElementById('editPhone').value = alumni.phone || '';
        document.getElementById('editStudentId').value = alumni.studentId || '';
        document.getElementById('editDepartment').value = alumni.department || '';
        document.getElementById('editGraduationYear').value = alumni.graduationYear || '';
        document.getElementById('editBatch').value = alumni.batch || '';
        document.getElementById('editDegree').value = alumni.degree || '';
        document.getElementById('editCgpa').value = alumni.cgpa || '';
        document.getElementById('editCurrentJobTitle').value = alumni.currentJobTitle || '';
        document.getElementById('editCurrentCompany').value = alumni.currentCompany || '';
        document.getElementById('editIndustry').value = alumni.industry || '';
        document.getElementById('editWorkLocation').value = alumni.workLocation || '';
        document.getElementById('editLinkedin').value = alumni.linkedin || '';
        
        // Set verification checkbox with explicit boolean conversion
        const verifyCheckbox = document.getElementById('editIsVerified');
        verifyCheckbox.checked = Boolean(alumni.isVerified);
        
        // Add change listener for immediate visual feedback
        verifyCheckbox.onchange = function() {
            const label = this.nextElementSibling;
            if (this.checked) {
                label.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i> Mark this alumni as verified';
            } else {
                label.innerHTML = '<i class="bi bi-exclamation-triangle-fill text-warning"></i> Mark this alumni as verified';
            }
        };
        
        // Trigger change event to set initial icon
        verifyCheckbox.onchange();
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editAlumniModal'));
        modal.show();
    }
}

function deleteAlumni(id) {
    if (!hasAdminPermission()) {
        showPermissionDenied();
        return;
    }
    
    if (confirm('Are you sure you want to delete this alumni?')) {
        const alumni = alumniData.find(a => a.id === id);
        if (alumni) {
            alumni.isActive = false;
            saveData();
            loadAlumniTable();
            loadDashboard();
        }
    }
}

// Toggle verification status
function toggleVerification(id) {
    if (!hasAdminPermission()) {
        showPermissionDenied();
        return;
    }
    
    const alumni = alumniData.find(a => a.id === id);
    if (alumni) {
        alumni.isVerified = !alumni.isVerified;
        alumni.lastUpdated = new Date().toISOString();
        saveData();
        
        // Show success message
        const message = alumni.isVerified 
            ? `${alumni.firstName} ${alumni.lastName} has been verified!` 
            : `${alumni.firstName} ${alumni.lastName} has been marked as unverified.`;
        
        showNotification(message, alumni.isVerified ? 'success' : 'warning');
        
        // Refresh the table and dashboard
        loadAlumniTable();
        loadDashboard();
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-toast alert alert-${type} position-fixed`;
    notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; animation: slideIn 0.3s ease-out;';
    
    // Set icon based on type
    const icon = type === 'success' ? 'check-circle-fill' : 
                 type === 'warning' ? 'exclamation-triangle-fill' : 
                 type === 'danger' ? 'x-circle-fill' : 'info-circle-fill';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${icon} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Save Edit Functionality
function saveEditedAlumni() {
    const alumniId = document.getElementById('editAlumniId').value;
    const alumni = alumniData.find(a => a.id === alumniId);
    
    if (alumni) {
        // Get the checkbox value explicitly
        const verificationCheckbox = document.getElementById('editIsVerified');
        const wasVerified = alumni.isVerified;
        const isNowVerified = verificationCheckbox.checked;
        
        // Update alumni data with form values
        alumni.firstName = document.getElementById('editFirstName').value;
        alumni.lastName = document.getElementById('editLastName').value;
        alumni.email = document.getElementById('editEmail').value;
        alumni.phone = document.getElementById('editPhone').value;
        alumni.studentId = document.getElementById('editStudentId').value;
        alumni.department = document.getElementById('editDepartment').value;
        alumni.graduationYear = parseInt(document.getElementById('editGraduationYear').value);
        alumni.batch = document.getElementById('editBatch').value;
        alumni.degree = document.getElementById('editDegree').value;
        alumni.cgpa = parseFloat(document.getElementById('editCgpa').value) || null;
        alumni.currentJobTitle = document.getElementById('editCurrentJobTitle').value;
        alumni.currentCompany = document.getElementById('editCurrentCompany').value;
        alumni.industry = document.getElementById('editIndustry').value;
        alumni.workLocation = document.getElementById('editWorkLocation').value;
        alumni.linkedin = document.getElementById('editLinkedin').value;
        alumni.isVerified = isNowVerified;
        alumni.lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        saveData();
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editAlumniModal'));
        modal.hide();
        
        // Show appropriate notification
        let message = `${alumni.firstName} ${alumni.lastName}'s information has been updated successfully!`;
        if (wasVerified !== isNowVerified) {
            message += isNowVerified ? ' (Marked as verified)' : ' (Marked as unverified)';
        }
        showNotification(message, 'success');
        
        // Refresh the table and dashboard
        loadAlumniTable();
        loadDashboard();
    }
}


// Import functionality
function handleImport() {
    if (!hasAdminPermission()) {
        showPermissionDenied();
        return;
    }
    
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a CSV file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const alumni = {
                    id: generateId(),
                    firstName: values[0] || '',
                    lastName: values[1] || '',
                    email: values[2] || '',
                    studentId: values[3] || '',
                    department: values[4] || '',
                    graduationYear: parseInt(values[5]) || 2020,
                    batch: values[6] || '',
                    degree: values[7] || 'B.Tech',
                    phone: values[8] || '',
                    currentCompany: values[9] || '',
                    currentJobTitle: values[10] || '',
                    isVerified: false,
                    isActive: true,
                    dataSource: "Import",
                    lastUpdated: new Date().toISOString()
                };
                alumniData.push(alumni);
            }
        }
        
        saveData();
        loadAlumniTable();
        loadDashboard();
        alert('Import completed successfully!');
        fileInput.value = '';
    };
    
    reader.readAsText(file);
}

// Export functionality
function handleExport() {
    if (!hasAdminPermission()) {
        showPermissionDenied();
        return;
    }
    
    const csvContent = [
        ['firstName', 'lastName', 'email', 'studentId', 'department', 'graduationYear', 'batch', 'degree', 'phone', 'currentCompany', 'currentJobTitle', 'isVerified'].join(','),
        ...alumniData.filter(a => a.isActive).map(a => [
            a.firstName,
            a.lastName,
            a.email,
            a.studentId,
            a.department,
            a.graduationYear,
            a.batch,
            a.degree,
            a.phone || '',
            a.currentCompany || '',
            a.currentJobTitle || '',
            a.isVerified
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alumni_data_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('light-theme', 'dark-theme', 'glass-theme');
    
    // Remove any injected styles
    const existingStyle = document.getElementById('theme-override-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Apply selected theme
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        // Inject dark theme styles to ensure text visibility
        const style = document.createElement('style');
        style.id = 'theme-override-styles';
        style.innerHTML = `
            body.dark-theme {
                color: white !important;
            }
            body.dark-theme .navbar, body.dark-theme .navbar * {
                color: white !important;
            }
            body.dark-theme .text-muted {
                color: #9ca3af !important;
            }
            /* Alumni data tables and cards - black text on lighter background */
            body.dark-theme .table {
                background-color: #f3f4f6 !important;
            }
            body.dark-theme .table td, 
            body.dark-theme .table th {
                color: #111827 !important;
                background-color: transparent !important;
            }
            body.dark-theme .table thead th {
                background-color: #e5e7eb !important;
                color: #111827 !important;
                font-weight: 600;
            }
            body.dark-theme .table-hover tbody tr:hover {
                background-color: #e5e7eb !important;
            }
            /* Dashboard cards with alumni data */
            body.dark-theme #alumniTableBody td,
            body.dark-theme #alumniTableBody th {
                color: #111827 !important;
            }
            body.dark-theme .card-body h3,
            body.dark-theme .card-body h6 {
                color: white !important;
            }
            /* Form inputs */
            body.dark-theme input, body.dark-theme select, body.dark-theme textarea {
                color: white !important;
                background-color: rgba(30, 41, 59, 0.8) !important;
            }
            body.dark-theme input::placeholder {
                color: #9ca3af !important;
            }
            /* Badge colors */
            body.dark-theme .badge {
                color: white !important;
            }
        `;
        document.head.appendChild(style);
    } else if (theme === 'glass') {
        document.body.classList.add('glass-theme');
        // Inject glass theme styles to ensure text visibility
        const style = document.createElement('style');
        style.id = 'theme-override-styles';
        style.innerHTML = `
            body.glass-theme {
                color: white !important;
            }
            body.glass-theme .navbar, body.glass-theme .navbar * {
                color: white !important;
            }
            body.glass-theme .text-muted {
                color: rgba(255, 255, 255, 0.9) !important;
            }
            body.glass-theme h1, body.glass-theme h2,
            body.glass-theme h4, body.glass-theme h5 {
                color: white !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            /* Alumni data tables - black text on white glass background */
            body.glass-theme .table {
                background: rgba(255, 255, 255, 0.9) !important;
                backdrop-filter: blur(10px);
            }
            body.glass-theme .table td,
            body.glass-theme .table th {
                color: #111827 !important;
                border-color: rgba(0, 0, 0, 0.1) !important;
            }
            body.glass-theme .table thead th {
                background: rgba(255, 255, 255, 0.95) !important;
                color: #111827 !important;
                font-weight: 600;
            }
            body.glass-theme .table-hover tbody tr:hover {
                background-color: rgba(59, 130, 246, 0.1) !important;
            }
            /* Alumni data in cards */
            body.glass-theme #alumniTableBody td,
            body.glass-theme #alumniTableBody th {
                color: #111827 !important;
            }
            /* Dashboard stat cards - keep numbers white but make them stand out */
            body.glass-theme .card-body h3 {
                color: white !important;
                font-weight: bold;
                text-shadow: 2px 2px 6px rgba(0,0,0,0.7);
            }
            body.glass-theme .card-body h6 {
                color: white !important;
            }
            /* Form inputs */
            body.glass-theme input, body.glass-theme select, body.glass-theme textarea {
                color: #111827 !important;
                background: rgba(255, 255, 255, 0.8) !important;
            }
            body.glass-theme input::placeholder {
                color: rgba(0, 0, 0, 0.5) !important;
            }
            /* Badges in table */
            body.glass-theme .badge.bg-success {
                background-color: #10b981 !important;
                color: white !important;
            }
            body.glass-theme .badge.bg-warning {
                background-color: #f59e0b !important;
                color: white !important;
            }
        `;
        document.head.appendChild(style);
    }
    // Light theme is default (no class needed)
    
    // Save theme preference
    localStorage.setItem('selectedTheme', theme);
    
    // Update active theme indicator
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        }
    });
}



// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting initialization...');
    
    try {
        // Load data first
        loadData();
        
        // Initialize theme
        initTheme();
        
        // Set up login form event listener
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Set up other event listeners
        setupEventListeners();
        
        // Check if user is already logged in
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            showMainApp();
        } else {
            showLoginScreen();
        }
        
    } catch (error) {
        console.error('Error during initialization:', error);
        // Even if there's an error, show login screen
        showLoginScreen();
    }
});

// Simple fallback to ensure loading screen doesn't stay forever
setTimeout(() => {
    if (!isLoadingScreenHidden) {
        console.warn('Emergency fallback: Hiding loading screen after 5 seconds');
        hideLoadingScreen();
    }
}, 5000);
