/**
* Template Name: MyResume
* Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Dark Mode Toggle
   */
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Check for saved theme preference or default to 'light' mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
  }

  // Toggle dark mode
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');

      // Save theme preference
      const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);

      // Add smooth transition effect
      themeToggle.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
      }, 300);
    });
  }

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    const icon = headerToggleBtn.querySelector('i');
    icon.classList.toggle('bi-list');
    icon.classList.toggle('bi-x');
  }

  if (headerToggleBtn) {
    headerToggleBtn.addEventListener('click', headerToggle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * Chatbot Functionality - Portfolio Assistant
   */
  const chatToggle = document.getElementById('chat-toggle');
  const chatWindow = document.getElementById('chat-window');
  const closeChat = document.getElementById('close-chat');
  const chatInput = document.getElementById('chat-input');
  const sendMessage = document.getElementById('send-message');
  const chatMessages = document.getElementById('chat-messages');
  const chatBadge = document.querySelector('.chat-badge');

  // Knowledge base for the chatbot
  const knowledgeBase = {
    'who is thushan': 'Thushan Vithana is a talented Software Engineering graduate from SLIIT with a CGPA of 3.17. He specializes in full-stack development, mobile applications, and modern web technologies including React Native, .NET, Java, and cloud solutions.',

    'skills': 'Thushan has expertise in:\n• Frontend: React, React Native, Next.js, JavaScript, HTML/CSS\n• Backend: .NET, Java, Node.js, Python\n• Databases: MS SQL Server, MongoDB\n• Cloud & DevOps: Docker, Microsoft Power Apps\n• Mobile: iOS (SwiftUI), Android (Kotlin)\n• Version Control: Git, GitHub',

    'projects': 'Thushan has worked on several impressive projects including:\n• SCOLA - Scholarship Requester Mobile App (React Native + .NET)\n• DR Management Platform\n• Vehicle Spare Parts Management System\n• AUTOWAG - Vehicle Rental System\n• Virtual Dressing Room (AR Technology)\n• And many more! Check the Projects section for details.',

    'education': 'Thushan graduated from Sri Lanka Institute of Information Technology (SLIIT) in March 2025 with a BSc (Hons) in Software Engineering, achieving an overall CGPA of 3.17.',

    'contact': 'You can reach Thushan through:\n• Email: Check the Contact section\n• LinkedIn: https://www.linkedin.com/in/thushan-vithana-89256917b/\n• GitHub: https://github.com/thushanvithana\n• YouTube: @ThushanVithana',

    'experience': 'Thushan has experience as an Intern Software Engineer at SEER, where he contributed to projects using ASP.NET MVC, .NET Framework, Entity Framework, MS SQL Server, and Microsoft Power Apps, focusing on integrations with Microsoft Dynamics 365.',

    'services': 'Thushan offers:\n• Mobile Application Development (iOS & Android)\n• Full-Stack Web Development (MERN Stack)\n• Cloud Solutions & Deployment\n• Custom Software Solutions\n• UI/UX Design Implementation',

    'hello': 'Hello! 👋 I\'m here to help you learn more about Thushan Vithana\'s portfolio. Feel free to ask me anything!',

    'help': 'I can help you with information about:\n• Thushan\'s background and education\n• Technical skills and expertise\n• Project portfolio\n• Work experience\n• Contact information\n• Services offered\n\nJust ask me anything!',
  };

  // Toggle chat window
  if (chatToggle) {
    chatToggle.addEventListener('click', () => {
      chatWindow.classList.toggle('active');
      if (chatWindow.classList.contains('active')) {
        chatInput.focus();
        if (chatBadge) {
          chatBadge.style.display = 'none';
        }
      }
    });
  }

  // Close chat
  if (closeChat) {
    closeChat.addEventListener('click', () => {
      chatWindow.classList.remove('active');
    });
  }

  // Send message function
  function handleSendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';

    // Get bot response
    setTimeout(() => {
      const response = getBotResponse(message);
      addMessage(response, 'bot');
    }, 500);
  }

  // Send message on button click
  if (sendMessage) {
    sendMessage.addEventListener('click', handleSendMessage);
  }

  // Send message on Enter key
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }

  // Quick suggestion buttons
  const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-question');
      addMessage(question, 'user');
      setTimeout(() => {
        const response = getBotResponse(question);
        addMessage(response, 'bot');
      }, 500);
    });
  });

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'bot' ? '<i class="bi bi-robot"></i>' : '<i class="bi bi-person-fill"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const messageP = document.createElement('p');
    messageP.textContent = text;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    contentDiv.appendChild(messageP);
    contentDiv.appendChild(timeSpan);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Remove suggestions after first message
    const suggestions = document.querySelector('.quick-suggestions');
    if (suggestions && sender === 'user') {
      suggestions.remove();
    }
  }

  // Get bot response based on user input
  function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for exact or partial matches
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(key)) {
        return value;
      }
    }

    // Check for specific keywords
    if (lowerMessage.includes('email') || lowerMessage.includes('mail')) {
      return 'You can find Thushan\'s email address in the Contact section at the bottom of the page!';
    }

    if (lowerMessage.includes('phone') || lowerMessage.includes('mobile')) {
      return 'Thushan\'s contact number is available in the Contact section of the portfolio!';
    }

    if (lowerMessage.includes('github') || lowerMessage.includes('git')) {
      return 'You can find Thushan on GitHub at: https://github.com/thushanvithana';
    }

    if (lowerMessage.includes('linkedin')) {
      return 'Connect with Thushan on LinkedIn: https://www.linkedin.com/in/thushan-vithana-89256917b/';
    }

    if (lowerMessage.includes('youtube')) {
      return 'Check out Thushan\'s YouTube channel: @ThushanVithana';
    }

    // Default response
    return 'I\'m not sure about that specific question. You can ask me about Thushan\'s skills, projects, education, experience, services, or contact information. How can I help you?';
  }

})();