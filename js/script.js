

/* 
========================================================================
   CARRERSETU - CORE JAVASCRIPT
   Vanilla JS implementation of CRUD, LocalStorage, Search/Filter, Theme, and Notifications
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLoader();
  initTheme();
  initNavbar();
  initBackToTop();

  // Page-specific initializations
  const currentPage = getPageName();

  if (currentPage === 'index' || currentPage === '') {
    initHome();
  } else if (currentPage === 'register') {
    initRegister();
  } else if (currentPage === 'dashboard') {
    initDashboard();
  } else if (currentPage === 'internships') {
    initInternships();
  } else if (currentPage === 'progress') {
    initProgress();
  } else if (currentPage === 'tasks') {
    initTasks();
  } else if (currentPage === 'certificate') {
    initCertificate();
  } else if (currentPage === 'contact') {
    initContact();
  }
});

/* ========================================================================
   AUTHENTICATION GUARDS & LOGOUT ACTIONS
   ======================================================================== */
function checkAuth() {
  const currentPage = getPageName();
  const protectedPages = ['dashboard', 'progress', 'tasks', 'certificate'];
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const hasProfile = localStorage.getItem('registeredStudent') !== null;

  if (protectedPages.includes(currentPage)) {
    if (!isLoggedIn || !hasProfile) {
      window.location.href = 'register.html?redirect=true';
    }
  }
}

function handleLogout() {
  localStorage.setItem('isLoggedIn', 'false');
  showToast('Logged out successfully', 'info');
  // Log activity
  const activities = JSON.parse(localStorage.getItem('activities')) || [];
  activities.unshift({
    title: 'Logged Out',
    description: 'Ended student dashboard session.',
    type: 'info',
    time: new Date().toLocaleString()
  });
  localStorage.setItem('activities', JSON.stringify(activities.slice(0, 10)));

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

/* ========================================================================
   GLOBAL HELPERS & SYSTEMS
   ======================================================================== */

// Page detection helper
function getPageName() {
  const path = window.location.pathname;
  const page = path.split('/').pop().split('.').shift();
  return page.toLowerCase();
}

// 1. Loading Screen
function initLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 600);
    });
    // Fallback if load event already fired
    if (document.readyState === 'complete') {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 600);
    }
  }
}

// 2. Dark/Light Theme Switching
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeToggle.addEventListener('click', () => {
    const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    updateThemeIcon(targetTheme);
    showToast(`Switched to ${targetTheme} theme`, 'info');
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-toggle i');
  if (!icon) return;
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';
  } else {
    icon.className = 'fas fa-moon';
  }
}

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('registeredStudent') !== null;

  // Re-render nav links based on login state
  if (navLinks) {
    if (isLoggedIn) {
      navLinks.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="dashboard.html">Dashboard</a></li>
        <li><a href="internships.html">Internships</a></li>
        <li><a href="progress.html">Progress</a></li>
        <li><a href="certificate.html">Certificate</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="#" id="nav-logout-btn" class="logout-btn-nav"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
      `;
      // Attach logout listener
      document.getElementById('nav-logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
      });
    } else {
      navLinks.innerHTML = `
        <li><a href="index.html">Home</a></li>
        <li><a href="internships.html">Internships</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="register.html" class="btn btn-primary" style="padding: 0.4rem 1.2rem; color: white;"><i class="fas fa-user-plus"></i> Login / Register</a></li>
      `;
    }
  }

  // Sticky behavior
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active link highlighting
  const currentPage = getPageName() || 'index';
  const navItems = document.querySelectorAll('.nav-links a');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    const pageName = href ? href.split('.').shift() : '';
    if (pageName === currentPage || (currentPage === 'index' && pageName === '')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
}

// 4. Back to Top Button
function initBackToTop() {
  const bttBtn = document.getElementById('back-to-top');
  if (!bttBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      bttBtn.classList.add('visible');
    } else {
      bttBtn.classList.remove('visible');
    }
  });

  bttBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// 5. Toast Notification System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-times-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';
  if (type === 'info') iconClass = 'fa-info-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('fadeOut');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

// 6. Generic Counter Animation
function animateCounters(elements) {
  elements.forEach(element => {
    const target = +element.getAttribute('data-target');
    const duration = 1200; // ms
    const increment = target / (duration / 16); // ~60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.innerText = Math.ceil(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.innerText = target;
      }
    };
    updateCounter();
  });
}

// Recent activity helper
function addActivity(title, description, type = 'default') {
  const activities = JSON.parse(localStorage.getItem('activities')) || [];
  const newActivity = {
    title,
    description,
    type,
    time: new Date().toLocaleString()
  };
  activities.unshift(newActivity);
  localStorage.setItem('activities', JSON.stringify(activities.slice(0, 10))); // keep last 10
}

// Get student details helper
function getStudentProfile() {
  const student = localStorage.getItem('registeredStudent');
  if (student) {
    return JSON.parse(student);
  }
  return null; // Null implies not registered
}

// Default dummy student profile
const DEFAULT_STUDENT = {
  fullName: 'Hardik Lavti',
  collegeName: 'National Institute of Technology',
  branch: 'Computer Science & Engineering',
  email: 'hardik.lavti@college.edu',
  phone: '+91 98765 43210',
  year: '3rd Year',
  skills: 'React, Node.js, JavaScript, Python',
  profilePhoto: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=150&auto=format&fit=crop&q=80',
  currentInternship: 'Full Stack Development Intern at Wipro'
};

/* ========================================================================
   1. INDEX / HOME PAGE LOGIC
   ======================================================================== */
function initHome() {
  // Stats counter animation
  const statNumbers = document.querySelectorAll('.stat-number');

  // Set random targets for demonstration if not set
  if (statNumbers.length > 0) {
    // Dynamic loading from localstorage
    const appliedList = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    const completedList = JSON.parse(localStorage.getItem('completedInternships')) || [];
    const tasksList = JSON.parse(localStorage.getItem('studentTasks')) || [];

    document.getElementById('stat-total-internships').setAttribute('data-target', '12');
    document.getElementById('stat-active-apps').setAttribute('data-target', appliedList.length || '3');
    document.getElementById('stat-completed').setAttribute('data-target', completedList.length || '1');
    document.getElementById('stat-certificates').setAttribute('data-target', completedList.length ? '1' : '0');

    // Intersection observer to animate counters when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters(statNumbers);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(document.querySelector('.stats-grid'));
  }
}

/* ========================================================================
   2. REGISTRATION PAGE LOGIC
   ======================================================================== */
function initRegister() {
  const form = document.getElementById('register-form');
  const avatarInput = document.getElementById('avatar-upload');
  const avatarBox = document.getElementById('avatar-box');
  const avatarImg = document.getElementById('avatar-img-preview');
  const resumeInput = document.getElementById('resume-upload');
  const resumeBox = document.getElementById('resume-box');
  const resumeNamePreview = document.getElementById('resume-name-preview');

  let profilePhotoBase64 = '';

  // Check if redirected from a guard
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('redirect') === 'true') {
    setTimeout(() => {
      showToast('Please login or register to access protected dashboard areas.', 'warning');
    }, 500);
  }

  // Handle Tab Switch Toggles
  const tabReg = document.getElementById('tab-register-btn');
  const tabLog = document.getElementById('tab-login-btn');
  const segReg = document.getElementById('register-segment');
  const segLog = document.getElementById('login-segment');

  if (tabReg && tabLog && segReg && segLog) {
    tabReg.addEventListener('click', () => {
      tabReg.classList.add('active');
      tabLog.classList.remove('active');
      segReg.classList.add('active');
      segLog.classList.remove('active');
    });
    tabLog.addEventListener('click', () => {
      tabLog.classList.add('active');
      tabReg.classList.remove('active');
      segLog.classList.add('active');
      segReg.classList.remove('active');
    });
  }

  // Handle Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loginEmail = document.getElementById('login-email').value.trim();
      const errorMsg = document.getElementById('login-email-error');

      if (errorMsg) errorMsg.style.display = 'none';

      if (!loginEmail || !validateEmail(loginEmail)) {
        if (errorMsg) {
          errorMsg.innerText = 'Please enter a valid email address';
          errorMsg.style.display = 'block';
        }
        return;
      }

      const storedStudent = localStorage.getItem('registeredStudent');
      if (storedStudent) {
        const student = JSON.parse(storedStudent);
        if (student.email.toLowerCase() === loginEmail.toLowerCase()) {
          localStorage.setItem('isLoggedIn', 'true');
          // Add activity
          const activities = JSON.parse(localStorage.getItem('activities')) || [];
          activities.unshift({
            title: 'Logged In',
            description: `Student logged in as ${student.fullName}.`,
            type: 'info',
            time: new Date().toLocaleString()
          });
          localStorage.setItem('activities', JSON.stringify(activities.slice(0, 10)));

          showToast('Login successful! Redirecting to Dashboard...', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1500);
          return;
        }
      }

      if (errorMsg) {
        errorMsg.innerText = 'Email not registered. Please register first.';
        errorMsg.style.display = 'block';
      }
      showToast('Login failed. Email not found.', 'error');
    });
  }

  if (!form) return;

  // Handle Avatar conversion to Base64
  avatarBox.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profilePhotoBase64 = event.target.result;
        avatarImg.src = profilePhotoBase64;
        avatarImg.style.display = 'block';
        avatarBox.querySelector('i').style.display = 'none';
        avatarBox.querySelector('p').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle Resume upload preview
  resumeBox.addEventListener('click', () => resumeInput.click());
  resumeInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      resumeNamePreview.innerText = `Uploaded: ${file.name}`;
    }
  });

  // Handle drag and drop for files
  [avatarBox, resumeBox].forEach(box => {
    box.addEventListener('dragover', (e) => {
      e.preventDefault();
      box.style.borderColor = 'var(--primary)';
    });
    box.addEventListener('dragleave', () => {
      box.style.borderColor = 'var(--panel-border)';
    });
    box.addEventListener('drop', (e) => {
      e.preventDefault();
      box.style.borderColor = 'var(--panel-border)';
      const file = e.dataTransfer.files[0];
      if (box === avatarBox && file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          profilePhotoBase64 = event.target.result;
          avatarImg.src = profilePhotoBase64;
          avatarImg.style.display = 'block';
          avatarBox.querySelector('i').style.display = 'none';
          avatarBox.querySelector('p').style.display = 'none';
        };
        reader.readAsDataURL(file);
      } else if (box === resumeBox && file) {
        resumeInput.files = e.dataTransfer.files;
        resumeNamePreview.innerText = `Uploaded: ${file.name}`;
      }
    });
  });

  // Handle form submission and validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const collegeName = document.getElementById('reg-college').value.trim();
    const branch = document.getElementById('reg-branch').value.trim();
    const year = document.getElementById('reg-year').value;
    const skills = document.getElementById('reg-skills').value.trim();

    let isValid = true;

    // Reset error messages
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

    if (!fullName) {
      showError('reg-name', 'Full Name is required');
      isValid = false;
    }
    if (!email || !validateEmail(email)) {
      showError('reg-email', 'Please enter a valid email address');
      isValid = false;
    }
    if (!phone || !validatePhone(phone)) {
      showError('reg-phone', 'Please enter a valid phone number (10+ digits)');
      isValid = false;
    }
    if (!collegeName) {
      showError('reg-college', 'College Name is required');
      isValid = false;
    }
    if (!branch) {
      showError('reg-branch', 'Branch is required');
      isValid = false;
    }
    if (!skills) {
      showError('reg-skills', 'Please enter at least one skill');
      isValid = false;
    }

    if (isValid) {
      const studentProfile = {
        fullName,
        email,
        phone,
        collegeName,
        branch,
        year,
        skills,
        profilePhoto: profilePhotoBase64 || DEFAULT_STUDENT.profilePhoto,
        resumeName: resumeInput.files[0] ? resumeInput.files[0].name : 'resume.pdf',
        currentInternship: 'Unassigned (Apply for internships)'
      };

      localStorage.setItem('registeredStudent', JSON.stringify(studentProfile));
      localStorage.setItem('isLoggedIn', 'true');

      // Add activity
      const activities = JSON.parse(localStorage.getItem('activities')) || [];
      activities.unshift({
        title: 'Registered Account',
        description: `Student account registered for ${fullName}`,
        type: 'success',
        time: new Date().toLocaleString()
      });
      localStorage.setItem('activities', JSON.stringify(activities.slice(0, 10)));

      showToast('Registration successful! Redirecting to Dashboard...', 'success');

      // Auto-assign week 1 task to get started
      const currentTasks = JSON.parse(localStorage.getItem('studentTasks')) || [];
      if (currentTasks.length === 0) {
        currentTasks.push(
          { id: 1, title: 'Profile Setup & Onboarding', desc: 'Complete registration details and explore dashboard settings.', date: new Date().toLocaleDateString(), status: 'completed' },
          { id: 2, title: 'Explore Available Internships', desc: 'Browse through catalog and submit your first application.', date: new Date().toLocaleDateString(), status: 'pending' }
        );
        localStorage.setItem('studentTasks', JSON.stringify(currentTasks));
      }

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    }
  });

  // Handle Form reset
  form.addEventListener('reset', () => {
    avatarImg.style.display = 'none';
    avatarBox.querySelector('i').style.display = 'block';
    avatarBox.querySelector('p').style.display = 'block';
    resumeNamePreview.innerText = '';
    profilePhotoBase64 = '';
  });
}

function showError(inputId, message) {
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    const errorEl = inputEl.parentElement.querySelector('.error-msg');
    if (errorEl) {
      errorEl.innerText = message;
      errorEl.style.display = 'block';
    }
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/* ========================================================================
   3. DASHBOARD PAGE LOGIC
   ======================================================================== */
function initDashboard() {
  const profile = getStudentProfile() || DEFAULT_STUDENT;

  // Hydrate Student Profile
  const dashName = document.getElementById('dash-student-name');
  if (dashName) dashName.innerText = profile.fullName;

  const dashCollege = document.getElementById('dash-college');
  if (dashCollege) dashCollege.innerText = profile.collegeName;

  const dashBranch = document.getElementById('dash-branch');
  if (dashBranch) dashBranch.innerText = `${profile.branch} (${profile.year || '3rd Year'})`;

  const dashEmail = document.getElementById('dash-email');
  if (dashEmail) dashEmail.innerText = profile.email;

  const dashIntern = document.getElementById('dash-internship');
  if (dashIntern) {
    const appliedList = JSON.parse(localStorage.getItem('appliedInternships')) || [];
    if (appliedList.length > 0) {
      dashIntern.innerText = `${appliedList[0].title} at ${appliedList[0].company}`;
    } else {
      dashIntern.innerText = profile.currentInternship || 'Unassigned';
    }
  }

  const dashPhoto = document.getElementById('dash-profile-photo');
  if (dashPhoto && profile.profilePhoto) {
    dashPhoto.src = profile.profilePhoto;
  }

  // Set greeting text based on local time
  const welcomeText = document.getElementById('welcome-greeting');
  if (welcomeText) {
    const hour = new Date().getHours();
    let greeting = 'Welcome back';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    welcomeText.innerText = `${greeting}, ${profile.fullName.split(' ')[0]}!`;
  }

  // Dashboard Stats calculation
  const appliedList = JSON.parse(localStorage.getItem('appliedInternships')) || [];
  const completedList = JSON.parse(localStorage.getItem('completedInternships')) || [];
  const tasks = JSON.parse(localStorage.getItem('studentTasks')) || [];
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  const statApplied = document.getElementById('dash-stat-applied');
  if (statApplied) statApplied.innerText = appliedList.length;

  const statOngoing = document.getElementById('dash-stat-ongoing');
  if (statOngoing) statOngoing.innerText = appliedList.length > 0 && completedList.length === 0 ? '1' : '0';

  const statCompleted = document.getElementById('dash-stat-completed');
  if (statCompleted) statCompleted.innerText = completedList.length;

  const statPendingTasks = document.getElementById('dash-stat-tasks');
  if (statPendingTasks) statPendingTasks.innerText = pendingTasks;

  // Recent Activity Timeline hydration
  const timelineContainer = document.getElementById('dashboard-timeline');
  if (timelineContainer) {
    const activities = JSON.parse(localStorage.getItem('activities')) || [
      { title: 'Welcome to CarrerSetu', description: 'Explore internships, set up your profile and manage tasks.', type: 'info', time: new Date().toLocaleString() }
    ];

    timelineContainer.innerHTML = activities.map(act => {
      let dotColorClass = '';
      if (act.type === 'success') dotColorClass = 'completed';
      if (act.type === 'warning' || act.type === 'error') dotColorClass = 'warning';

      return `
        <div class="timeline-item">
          <div class="timeline-dot ${dotColorClass}"></div>
          <div class="timeline-time">${act.time}</div>
          <div class="timeline-title">${act.title}</div>
          <div class="timeline-desc">${act.description}</div>
        </div>
      `;
    }).join('');
  }
}

/* ========================================================================
   4. AVAILABLE INTERNSHIPS PAGE LOGIC
   ======================================================================== */
const INTERNSHIPS_DATA = [
  {
    id: 1,
    title: 'Frontend Web Developer',
    company: 'Tata Consultancy Services (TCS)',
    duration: '3 Months',
    location: 'Remote (India)',
    stipend: '₹15,000 / month',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React'],
    lastDate: '2026-08-15',
    category: 'Frontend',
    colorClass: 'c1'
  },
  {
    id: 2,
    title: 'Backend Engineer Intern',
    company: 'Infosys Limited',
    duration: '6 Months',
    location: 'Hybrid (Bengaluru)',
    stipend: '₹25,000 / month',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
    lastDate: '2026-08-20',
    category: 'Backend',
    colorClass: 'c2'
  },
  {
    id: 3,
    title: 'Full Stack Development Intern',
    company: 'Wipro Limited',
    duration: '3 Months',
    location: 'Remote (India)',
    stipend: '₹18,000 / month',
    skills: ['MERN Stack', 'Redux', 'Git', 'CSS Grid'],
    lastDate: '2026-08-10',
    category: 'Full Stack',
    colorClass: 'c3'
  },
  {
    id: 4,
    title: 'UI/UX Design Intern',
    company: 'Reliance Jio Digital',
    duration: '4 Months',
    location: 'Hybrid (Mumbai)',
    stipend: '₹12,000 / month',
    skills: ['Figma', 'Prototyping', 'User Research', 'Wireframes'],
    lastDate: '2026-08-25',
    category: 'UI/UX',
    colorClass: 'c4'
  },
  {
    id: 5,
    title: 'Data Science Analyst',
    company: 'HCL Technologies',
    duration: '6 Months',
    location: 'Office (Noida)',
    stipend: '₹30,000 / month',
    skills: ['Python', 'Pandas', 'SQL', 'Data Visualization'],
    lastDate: '2026-08-18',
    category: 'Data Science',
    colorClass: 'c1'
  },
  {
    id: 6,
    title: 'AI & Machine Learning Intern',
    company: 'Mahindra Digital Solutions',
    duration: '6 Months',
    location: 'Remote (India)',
    stipend: '₹35,000 / month',
    skills: ['TensorFlow', 'Python', 'Deep Learning', 'PyTorch'],
    lastDate: '2026-09-01',
    category: 'AI',
    colorClass: 'c2'
  },
  {
    id: 7,
    title: 'Web Application Developer',
    company: 'Tech Mahindra',
    duration: '3 Months',
    location: 'Remote (India)',
    stipend: '₹10,000 / month',
    skills: ['JavaScript', 'HTML5', 'CSS Variables', 'API Integration'],
    lastDate: '2026-08-30',
    category: 'Web Development',
    colorClass: 'c3'
  },
  {
    id: 8,
    title: 'Vue.js Frontend Architect',
    company: 'L&T Technology Services',
    duration: '3 Months',
    location: 'Remote (India)',
    stipend: '₹16,500 / month',
    skills: ['Vue.js', 'Vuex', 'JavaScript', 'TailwindCSS'],
    lastDate: '2026-08-22',
    category: 'Frontend',
    colorClass: 'c4'
  },
  {
    id: 9,
    title: 'Database Engineer Intern',
    company: 'Cognizant India',
    duration: '6 Months',
    location: 'Hybrid (Hyderabad)',
    stipend: '₹26,000 / month',
    skills: ['PostgreSQL', 'Database Design', 'NoSQL', 'Redis'],
    lastDate: '2026-08-29',
    category: 'Backend',
    colorClass: 'c1'
  },
  {
    id: 10,
    title: 'Next.js Fullstack Developer',
    company: 'Zoho Corporation',
    duration: '6 Months',
    location: 'Remote (India)',
    stipend: '₹28,000 / month',
    skills: ['Next.js', 'TypeScript', 'Prisma', 'TailwindCSS'],
    lastDate: '2026-09-05',
    category: 'Full Stack',
    colorClass: 'c2'
  },
  {
    id: 11,
    title: 'Business Intelligence Intern',
    company: 'Flipkart Internet',
    duration: '4 Months',
    location: 'Office (Bengaluru)',
    stipend: '₹20,000 / month',
    skills: ['PowerBI', 'Excel', 'Tableau', 'SQL'],
    lastDate: '2026-08-14',
    category: 'Data Science',
    colorClass: 'c3'
  },
  {
    id: 12,
    title: 'NLP Research Engineer',
    company: 'Paytm Digital Labs',
    duration: '6 Months',
    location: 'Remote (India)',
    stipend: '₹32,000 / month',
    skills: ['NLP', 'HuggingFace', 'Python', 'NLTK'],
    lastDate: '2026-08-28',
    category: 'AI',
    colorClass: 'c4'
  }
];

function initInternships() {
  const container = document.getElementById('internships-list');
  const searchInput = document.getElementById('search-internship');
  const filterContainer = document.getElementById('filters-container');
  const modal = document.getElementById('apply-modal');
  const confirmApplyBtn = document.getElementById('confirm-apply-btn');
  const cancelApplyBtn = document.getElementById('cancel-apply-btn');
  const modalCloseBtn = document.querySelector('.modal-close');

  let currentFilter = 'All';
  let searchQuery = '';
  let selectedInternship = null;

  if (!container) return;

  // Hydrate filter categories dynamically based on unique filters
  const categories = ['All', 'Web Development', 'Frontend', 'Backend', 'Full Stack', 'Data Science', 'AI', 'UI/UX'];
  if (filterContainer) {
    filterContainer.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join('');

    // Handle filter switching
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-category');
        renderInternships();
      });
    });
  }

  // Handle Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderInternships();
    });
  }

  // Core renderer
  function renderInternships() {
    const appliedList = JSON.parse(localStorage.getItem('appliedInternships')) || [];

    const filtered = INTERNSHIPS_DATA.filter(item => {
      const matchCat = currentFilter === 'All' || item.category === currentFilter;
      const matchQuery = item.title.toLowerCase().includes(searchQuery) ||
        item.company.toLowerCase().includes(searchQuery) ||
        item.skills.some(skill => skill.toLowerCase().includes(searchQuery));
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="intern-no-results">No internships found matching your criteria. Try another filter or search search word.</div>`;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const alreadyApplied = appliedList.some(app => app.id === item.id);
      const applyBtnText = alreadyApplied ? 'Applied' : 'Apply Now';
      const applyBtnDisabled = alreadyApplied ? 'disabled style="opacity: 0.65; cursor: not-allowed; background: var(--success); color: white;"' : '';

      return `
        <div class="glass-panel internship-card">
          <div class="intern-header">
            <div class="logo-placeholder ${item.colorClass}">${item.company.charAt(0)}</div>
            <div class="intern-meta">
              <h3 class="intern-title">${item.title}</h3>
              <div class="intern-company">${item.company}</div>
            </div>
          </div>
          <div class="intern-info">
            <div class="intern-info-item"><i class="fas fa-clock"></i> ${item.duration}</div>
            <div class="intern-info-item"><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
            <div class="intern-info-item"><i class="fas fa-money-bill-wave"></i> ${item.stipend}</div>
            <div class="intern-info-item"><i class="fas fa-tag"></i> ${item.category}</div>
          </div>
          <div class="intern-skills">
            ${item.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
          <div class="intern-footer">
            <div class="intern-date">Last Date: <span>${item.lastDate}</span></div>
            <button class="btn btn-primary apply-trigger-btn" data-id="${item.id}" ${applyBtnDisabled}>
              ${alreadyApplied ? '<i class="fas fa-check"></i> ' : ''}${applyBtnText}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to Apply triggers
    container.querySelectorAll('.apply-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = +e.currentTarget.getAttribute('data-id');
        selectedInternship = INTERNSHIPS_DATA.find(i => i.id === id);
        openModal();
      });
    });
  }

  // Apply workflow modals
  function openModal() {
    // Check if registered first
    const profile = getStudentProfile();
    if (!profile) {
      showToast('Please register an account before applying for internships.', 'warning');
      setTimeout(() => {
        window.location.href = 'register.html';
      }, 2000);
      return;
    }

    if (!modal) return;

    document.getElementById('modal-intern-title').innerText = selectedInternship.title;
    document.getElementById('modal-company-name').innerText = selectedInternship.company;

    modal.classList.add('active');
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (cancelApplyBtn) cancelApplyBtn.addEventListener('click', closeModal);

  if (confirmApplyBtn) {
    confirmApplyBtn.addEventListener('click', () => {
      if (selectedInternship) {
        const appliedList = JSON.parse(localStorage.getItem('appliedInternships')) || [];
        appliedList.push(selectedInternship);
        localStorage.setItem('appliedInternships', JSON.stringify(appliedList));

        addActivity('Applied to Internship', `Submitted application for ${selectedInternship.title} role at ${selectedInternship.company}.`, 'success');
        showToast(`Successfully applied to ${selectedInternship.title} at ${selectedInternship.company}!`, 'success');

        // Auto add corresponding onboarding tasks to progress tasks
        const currentTasks = JSON.parse(localStorage.getItem('studentTasks')) || [];
        currentTasks.push({
          id: Date.now(),
          title: `Onboarding: ${selectedInternship.title}`,
          desc: `Complete initialization tasks and align schedules with project supervisor at ${selectedInternship.company}.`,
          date: new Date().toLocaleDateString(),
          status: 'pending'
        });
        localStorage.setItem('studentTasks', JSON.stringify(currentTasks));

        closeModal();
        renderInternships();
      }
    });
  }

  // Initial draw
  renderInternships();
}

/* ========================================================================
   5. PROGRESS PAGE LOGIC
   ======================================================================== */
function initProgress() {
  const fgCircle = document.querySelector('.circular-progress .fg-circle');
  const pctText = document.getElementById('progress-percentage-text');

  const tasksCompleted = document.getElementById('metric-tasks-completed');
  const tasksRemaining = document.getElementById('metric-tasks-remaining');
  const attendanceFill = document.getElementById('attendance-fill');
  const performanceFill = document.getElementById('performance-fill');
  const attendanceText = document.getElementById('attendance-percent');
  const performanceText = document.getElementById('performance-percent');

  // Calculation parameters
  const appliedList = JSON.parse(localStorage.getItem('appliedInternships')) || [];
  const completedList = JSON.parse(localStorage.getItem('completedInternships')) || [];
  const tasks = JSON.parse(localStorage.getItem('studentTasks')) || [];

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'completed').length;
  const remTasks = totalTasks - doneTasks;

  // Attendance & performance metrics mock settings based on task completion
  let attendance = totalTasks > 0 ? Math.min(60 + (doneTasks / totalTasks) * 40, 100) : 0;
  let performance = totalTasks > 0 ? Math.min(50 + (doneTasks / totalTasks) * 50, 100) : 0;

  // Overall progress percentage weighted calculation
  let overallPercentage = 0;
  if (totalTasks > 0) {
    overallPercentage = Math.round((doneTasks / totalTasks) * 60 + (attendance * 0.2) + (performance * 0.2));
  } else if (getStudentProfile()) {
    overallPercentage = 15; // registered but no tasks completed yet
  }

  if (completedList.length > 0) {
    overallPercentage = 100;
    attendance = 100;
    performance = 95;
  }

  // Render variables
  if (tasksCompleted) tasksCompleted.innerText = doneTasks;
  if (tasksRemaining) tasksRemaining.innerText = remTasks;

  if (attendanceFill) {
    setTimeout(() => {
      attendanceFill.style.width = `${attendance}%`;
      if (attendanceText) attendanceText.innerText = `${Math.round(attendance)}%`;
    }, 200);
  }
  if (performanceFill) {
    setTimeout(() => {
      performanceFill.style.width = `${performance}%`;
      if (performanceText) performanceText.innerText = `${Math.round(performance)}%`;
    }, 400);
  }

  // Animate SVG circular chart
  if (fgCircle && pctText) {
    // Circumference = 2 * PI * r = 2 * 3.14159 * 100 = 628
    const circumference = 628;
    const offset = circumference - (overallPercentage / 100) * circumference;

    setTimeout(() => {
      fgCircle.style.strokeDashoffset = offset;
      pctText.innerText = `${overallPercentage}%`;
    }, 300);
  }

  // Hydrate milestone checkpoints
  const milestones = [
    { key: 'reg', title: 'Registration Complete', desc: 'Registered your student profile details', check: !!getStudentProfile() },
    { key: 'apply', title: 'Internship Started', desc: 'Submitted internship application and initiated track', check: appliedList.length > 0 },
    { key: 'week1', title: 'Week 1 Tasks', desc: 'Finished starting tasks and onboarded with company', check: doneTasks >= 1 },
    { key: 'week2', title: 'Week 2 Tasks', desc: 'Maintained pipeline deliverables', check: doneTasks >= 3 },
    { key: 'mid', title: 'Mid Review Milestone', desc: 'Mid-term tasks approved by coordinators', check: doneTasks >= 4 },
    { key: 'final', title: 'Final Review Assessment', desc: 'Completed all core project checklist tasks', check: doneTasks >= 5 },
    { key: 'complete', title: 'Internship Completed', desc: 'Marked internship as complete and unlocked certificate', check: completedList.length > 0 || overallPercentage >= 95 }
  ];

  const milestoneContainer = document.getElementById('milestones-list');
  if (milestoneContainer) {
    // If the student has completed the internship, check all
    if (completedList.length > 0) {
      milestones.forEach(m => m.check = true);
    }

    let currentFound = false;

    milestoneContainer.innerHTML = milestones.map((m, index) => {
      let statusClass = '';
      let icon = '<i class="far fa-circle"></i>';

      if (m.check) {
        statusClass = 'checked';
        icon = '<i class="fas fa-check-circle"></i>';
      } else if (!currentFound) {
        statusClass = 'current';
        icon = '<i class="fas fa-dot-circle"></i>';
        currentFound = true;
      }

      return `
        <div class="milestone-item ${statusClass}">
          <div class="milestone-status">${icon}</div>
          <div class="milestone-content">
            <div class="milestone-title">${m.title}</div>
            <div class="milestone-desc">${m.desc}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

/* ========================================================================
   6. DAILY TASK TRACKER PAGE LOGIC
   ======================================================================== */
function initTasks() {
  const form = document.getElementById('task-form');
  const taskTitle = document.getElementById('task-title');
  const taskDesc = document.getElementById('task-desc');
  const taskDate = document.getElementById('task-date');
  const clearBtn = document.getElementById('clear-task-btn');
  const taskListContainer = document.getElementById('tasks-list-container');
  const taskStat = document.getElementById('tasks-stats-count');

  let editingTaskId = null;

  if (!taskListContainer) return;

  // Set current date in input default
  if (taskDate) {
    const today = new Date().toISOString().split('T')[0];
    taskDate.value = today;
  }

  // Add/Edit Task
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = taskTitle.value.trim();
      const desc = taskDesc.value.trim();
      const date = taskDate.value;

      if (!title) {
        showToast('Task Title is required', 'error');
        return;
      }

      const tasks = JSON.parse(localStorage.getItem('studentTasks')) || [];

      if (editingTaskId) {
        // Edit flow
        const taskIdx = tasks.findIndex(t => t.id === editingTaskId);
        if (taskIdx > -1) {
          tasks[taskIdx].title = title;
          tasks[taskIdx].desc = desc;
          tasks[taskIdx].date = date;

          localStorage.setItem('studentTasks', JSON.stringify(tasks));
          showToast('Task updated successfully', 'success');
          addActivity('Updated Task', `Modified parameters of task: "${title}".`, 'info');

          editingTaskId = null;
          form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
        }
      } else {
        // Create flow
        const newTask = {
          id: Date.now(),
          title,
          desc,
          date: date || new Date().toLocaleDateString(),
          status: 'pending' // pending, in-progress, completed
        };

        tasks.push(newTask);
        localStorage.setItem('studentTasks', JSON.stringify(tasks));
        showToast('Task added successfully', 'success');
        addActivity('Created Task', `Added new task to tracker: "${title}".`, 'success');
      }

      form.reset();
      const today = new Date().toISOString().split('T')[0];
      taskDate.value = today;

      renderTasks();
    });
  }

  // Clear Form button
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      form.reset();
      const today = new Date().toISOString().split('T')[0];
      taskDate.value = today;
      editingTaskId = null;
      form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
      showToast('Form cleared', 'info');
    });
  }

  // Draw list and recalculate
  function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem('studentTasks')) || [];

    // Update stats counter text
    const completed = tasks.filter(t => t.status === 'completed').length;
    if (taskStat) {
      taskStat.innerText = `${completed} / ${tasks.length} Completed`;
    }

    if (tasks.length === 0) {
      taskListContainer.innerHTML = `
        <div class="glass-panel task-empty">
          <i class="fas fa-tasks-alt" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 10px; display: block;"></i>
          No tasks tracked yet. Add one in the form on the left to start charting progress!
        </div>
      `;
      return;
    }

    taskListContainer.innerHTML = tasks.map(task => {
      let cardClass = '';
      if (task.status === 'in-progress') cardClass = 'in-progress';
      if (task.status === 'completed') cardClass = 'completed';

      return `
        <div class="glass-panel task-item-card ${cardClass}" data-id="${task.id}">
          <div class="task-header-row">
            <div class="task-item-title">${task.title}</div>
            <div class="task-actions">
              <button class="task-btn-action edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
              <button class="task-btn-action delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
          ${task.desc ? `<div class="task-item-desc">${task.desc}</div>` : ''}
          <div class="task-footer-row">
            <div class="task-item-date"><i class="far fa-calendar"></i> Due: ${task.date}</div>
            <div class="task-status-selector">
              <button class="status-pill pending ${task.status === 'pending' ? 'active' : ''}" data-status="pending">Pending</button>
              <button class="status-pill progress ${task.status === 'in-progress' ? 'active' : ''}" data-status="in-progress">In Progress</button>
              <button class="status-pill completed ${task.status === 'completed' ? 'active' : ''}" data-status="completed">Completed</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach event listeners for edits
    taskListContainer.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.task-item-card');
        const id = +card.getAttribute('data-id');
        const task = tasks.find(t => t.id === id);

        if (task) {
          editingTaskId = task.id;
          taskTitle.value = task.title;
          taskDesc.value = task.desc || '';
          taskDate.value = task.date;
          form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Save Task';
          taskTitle.focus();
        }
      });
    });

    // Attach listeners for deletes
    taskListContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.task-item-card');
        const id = +card.getAttribute('data-id');
        const task = tasks.find(t => t.id === id);

        let filtered = tasks.filter(t => t.id !== id);
        localStorage.setItem('studentTasks', JSON.stringify(filtered));
        showToast('Task deleted', 'warning');
        if (task) {
          addActivity('Deleted Task', `Removed task: "${task.title}" from registry.`, 'warning');
        }

        if (editingTaskId === id) {
          editingTaskId = null;
          form.reset();
          form.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Task';
        }

        renderTasks();
      });
    });

    // Status Pill switches
    taskListContainer.querySelectorAll('.status-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.task-item-card');
        const id = +card.getAttribute('data-id');
        const targetStatus = e.currentTarget.getAttribute('data-status');

        const taskIdx = tasks.findIndex(t => t.id === id);
        if (taskIdx > -1) {
          const oldStatus = tasks[taskIdx].status;
          tasks[taskIdx].status = targetStatus;
          localStorage.setItem('studentTasks', JSON.stringify(tasks));

          if (targetStatus === 'completed' && oldStatus !== 'completed') {
            showToast('Task marked as Completed! Great job!', 'success');
            addActivity('Task Completed', `Successfully accomplished target deliverables for: "${tasks[taskIdx].title}".`, 'success');
          } else {
            showToast(`Task status set to: ${targetStatus === 'in-progress' ? 'In Progress' : 'Pending'}`, 'info');
          }

          renderTasks();
        }
      });
    });
  }

  // Initial draw
  renderTasks();
}

/* ========================================================================
   7. CERTIFICATE PAGE LOGIC
   ======================================================================== */
function initCertificate() {
  const profile = getStudentProfile() || DEFAULT_STUDENT;
  const appliedList = JSON.parse(localStorage.getItem('appliedInternships')) || [];

  const certName = document.getElementById('cert-student-name');
  const certIntern = document.getElementById('cert-intern-name');
  const certComp = document.getElementById('cert-company-name');
  const certDur = document.getElementById('cert-duration');
  const certDate = document.getElementById('cert-date');

  const previewBtn = document.getElementById('btn-preview-cert');
  const printBtn = document.getElementById('btn-print-cert');
  const downloadBtn = document.getElementById('btn-download-cert');

  // Populate data
  if (certName) certName.innerText = profile.fullName;

  let currentInternshipTitle = 'Full Stack Development Intern';
  let currentCompany = 'Wipro Limited';
  let currentDuration = '3 Months';

  if (appliedList.length > 0) {
    currentInternshipTitle = appliedList[0].title;
    currentCompany = appliedList[0].company;
    currentDuration = appliedList[0].duration;
  }

  if (certIntern) certIntern.innerText = currentInternshipTitle;
  if (certComp) certComp.innerText = currentCompany;
  if (certDur) certDur.innerText = currentDuration;

  if (certDate) {
    // Current date format: Month Day, Year
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    certDate.innerText = dateStr;
  }

  // Preview click animation trigger
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      showToast('Generating certificate preview...', 'info');
      // Add completion record if not present
      const completedList = JSON.parse(localStorage.getItem('completedInternships')) || [];
      if (completedList.length === 0) {
        completedList.push({
          title: currentInternshipTitle,
          company: currentCompany,
          duration: currentDuration,
          date: new Date().toLocaleDateString()
        });
        localStorage.setItem('completedInternships', JSON.stringify(completedList));
        addActivity('Certificate Earned', `Successfully unlocked completion credentials for ${currentInternshipTitle} at ${currentCompany}.`, 'success');
      }
      setTimeout(() => {
        showToast('Certificate loaded. You can now download or print it.', 'success');
      }, 1000);
    });
  }

  // Print trigger (native browser dialog)
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // Ensure completion record matches
      const completedList = JSON.parse(localStorage.getItem('completedInternships')) || [];
      if (completedList.length === 0) {
        completedList.push({
          title: currentInternshipTitle,
          company: currentCompany,
          duration: currentDuration,
          date: new Date().toLocaleDateString()
        });
        localStorage.setItem('completedInternships', JSON.stringify(completedList));
      }
      window.print();
    });
  }

  // Mock Download Button
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      showToast('Preparing PDF download payload...', 'info');
      setTimeout(() => {
        showToast('Download started! Saved as Internship_Certificate.pdf', 'success');
      }, 1500);
    });
  }
}

/* ========================================================================
   8. CONTACT PAGE LOGIC
   ======================================================================== */
function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    let isValid = true;
    document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');

    if (!name) {
      showError('contact-name', 'Name is required');
      isValid = false;
    }
    if (!email || !validateEmail(email)) {
      showError('contact-email', 'Please enter a valid email address');
      isValid = false;
    }
    if (!subject) {
      showError('contact-subject', 'Subject is required');
      isValid = false;
    }
    if (!message) {
      showError('contact-message', 'Message description is required');
      isValid = false;
    }

    if (isValid) {
      showToast('Thank you! Your message has been sent successfully.', 'success');
      addActivity('Contact Support Form Submitted', `Submitted ticket for subject: "${subject}".`, 'default');
      form.reset();
    }
  });
}
