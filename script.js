/* ==========================================================
   FloatingTextbook AI — script.js
   Frontend-only prototype. All "AI" behavior below is MOCK DATA.
   Functions are separated so a real backend/AI API can be wired
   in later without restructuring the UI layer.
   ========================================================== */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  const state = {
    currentPage: 'home',
  };

  /* ----------------------------------------------------------
     DOM REFERENCES (set on init)
     ---------------------------------------------------------- */
  const mainContent = document.getElementById('mainContent');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');

  /* ==========================================================
     PAGE ROUTING
     ========================================================== */

  /**
   * Renders the given page id into the main content area
   * using the matching <template>.
   */
  function renderPage(pageId) {
    const template = document.getElementById('tpl-' + pageId);
    if (!template) return;

    mainContent.innerHTML = '';
    mainContent.appendChild(template.content.cloneNode(true));
    state.currentPage = pageId;

    // Move focus to main content for accessibility on nav change
    mainContent.focus();

    // Re-bind interactions scoped to whichever page just rendered
    bindHomePageEvents();
    bindTeacherPageEvents();
    bindDoubtPageEvents();

    // Animate any progress/mastery bars freshly inserted
    animateProgressBars();
  }

  /**
   * Updates active states on sidebar + bottom nav buttons.
   */
  function setActiveNav(pageId) {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
    document.querySelectorAll('.bnav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
  }

  function goToPage(pageId) {
    renderPage(pageId);
    setActiveNav(pageId);
    closeMobileSidebar();
  }

  /* ==========================================================
     MOBILE SIDEBAR (hamburger + overlay)
     ========================================================== */
  function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMobileSidebar() {
    if (sidebar.classList.contains('open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  }

  /* ==========================================================
     PROGRESS BAR ANIMATION
     Bars are set to width:0 first, then animated to target width
     so the fill motion is visible on page load / nav change.
     ========================================================== */
  function animateProgressBars() {
    const bars = mainContent.querySelectorAll(
      '.mastery-fill, .inline-progress-fill'
    );
    bars.forEach((bar) => {
      const target = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => {
          bar.style.width = target;
        }, 60);
      });
    });
  }

  /* ==========================================================
     MOCK AI TEACHER — sendMessage()
     This is the seam where a real AI API call would go later.
     Given the user's text, it returns a structured mock lesson.
     ========================================================== */
  function sendMessage(rawText, { responseEl, inputEl }) {
    const text = (rawText || '').trim();
    if (!text) {
      inputEl && inputEl.focus();
      return;
    }

    const lesson = buildMockLesson(text);
    renderAIResponse(lesson, responseEl);
  }

  /**
   * Builds a mock structured lesson response.
   * A real implementation would replace this with an API call, e.g.:
   *   const lesson = await fetchLessonFromAI(text);
   */
  function buildMockLesson(topicText) {
    const lower = topicText.toLowerCase();

    if (lower.includes('photosynthesis')) {
      return {
        intro: "Sure! Let's understand photosynthesis step by step.",
        steps: [
          'What is photosynthesis?',
          'Where does it happen?',
          'What does the plant need?',
          'What is produced?',
        ],
      };
    }

    if (lower.includes('calculus') || lower.includes('integration')) {
      return {
        intro: "Great choice — let's build up calculus one idea at a time.",
        steps: [
          'What does a derivative represent?',
          'What does an integral represent?',
          'How are they connected?',
          "Let's try a simple example together.",
        ],
      };
    }

    if (lower.includes('compound interest')) {
      return {
        intro: "No problem, compound interest trips a lot of learners up. Let's untangle it.",
        steps: [
          'What makes interest "compound"?',
          'How is it different from simple interest?',
          'The formula, explained piece by piece',
          'A worked example with real numbers',
        ],
      };
    }

    if (lower.includes('quiz')) {
      return {
        intro: "Happy to quiz you! Here's how we'll approach it.",
        steps: [
          'Pick the chapter or topic to focus on',
          "I'll ask a mix of easy and challenging questions",
          "We'll review anything you get wrong, right away",
          'You get a mastery score at the end',
        ],
      };
    }

    if (lower.includes('revision') || lower.includes('revise')) {
      return {
        intro: "Let's turn your material into a focused revision set.",
        steps: [
          'Upload the PDF or notes you want to revise from',
          "I'll pull out the key concepts and definitions",
          "We'll organize them into short, reviewable notes",
          "You can turn these into flashcards afterward",
        ],
      };
    }

    // Generic fallback lesson for any other topic
    return {
      intro: `Sure! Let's understand "${topicText}" step by step.`,
      steps: [
        `What exactly is ${topicText}?`,
        'Why does it matter / where is it used?',
        'The core idea, broken down simply',
        'A quick example to make it concrete',
      ],
    };
  }

  /**
   * Renders a lesson object into the given response container.
   */
  function renderAIResponse(lesson, responseEl) {
    if (!responseEl) return;

    responseEl.innerHTML = '';

    const introEl = document.createElement('p');
    introEl.className = 'ar-intro';
    introEl.textContent = lesson.intro;
    responseEl.appendChild(introEl);

    const listEl = document.createElement('ol');
    lesson.steps.forEach((step) => {
      const li = document.createElement('li');
      li.textContent = step;
      listEl.appendChild(li);
    });
    responseEl.appendChild(listEl);

    const actionsEl = document.createElement('div');
    actionsEl.className = 'ar-actions';
    actionsEl.innerHTML = `
      <button type="button" class="ar-btn primary" data-mock-action="explain-more">Explain More</button>
      <button type="button" class="ar-btn" data-mock-action="give-example">Give an Example</button>
      <button type="button" class="ar-btn" data-mock-action="quiz-me">Quiz Me</button>
    `;
    responseEl.appendChild(actionsEl);

    responseEl.hidden = false;

    actionsEl.querySelectorAll('[data-mock-action]').forEach((btn) => {
      btn.addEventListener('click', () => handleMockAction(btn.dataset.mockAction, responseEl));
    });
  }

  /**
   * Handles the mock follow-up action buttons under a lesson.
   * Placeholder for where deeper AI API calls would be triggered.
   */
  function handleMockAction(action, responseEl) {
    const followUp = document.createElement('p');
    followUp.className = 'ar-intro';
    followUp.style.marginTop = '16px';

    if (action === 'explain-more') {
      followUp.textContent = "Sure — going a little deeper into this concept now…";
    } else if (action === 'give-example') {
      followUp.textContent = 'Here is a worked example to make this concrete…';
    } else if (action === 'quiz-me') {
      followUp.textContent = 'Alright, here is your first practice question…';
    }

    responseEl.appendChild(followUp);
  }

  /* ==========================================================
     MOCK FILE UPLOAD — uploadMaterial()
     ========================================================== */
  function uploadMaterial(kind, fileInputEl, statusEl, hintEl) {
    fileInputEl.value = ''; // reset so selecting the same file re-fires change
    fileInputEl.click();

    fileInputEl.onchange = () => {
      const file = fileInputEl.files && fileInputEl.files[0];
      if (!file) return;

      showUploadStatus(file.name, statusEl, hintEl);
      // Real implementation would upload/parse the file here, e.g.:
      //   await sendFileToBackend(file, kind);
    };
  }

  function showUploadStatus(filename, statusEl, hintEl) {
    if (!statusEl) return;
    const nameEl = statusEl.querySelector('.upload-filename');
    if (nameEl) {
      nameEl.innerHTML = `File selected<br><strong>${escapeHTML(filename)}</strong>`;
    }
    if (hintEl) hintEl.textContent = 'Ready to learn from this material.';
    statusEl.hidden = false;
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==========================================================
     MOCK VOICE INPUT — startVoiceInput()
     ========================================================== */
  function startVoiceInput(voiceBtnEl, voiceStatusEl, inputEl) {
    if (voiceBtnEl.classList.contains('listening')) return; // already running

    voiceBtnEl.classList.add('listening');
    const labelEl = voiceBtnEl.querySelector('.voice-label');
    const originalLabel = labelEl ? labelEl.textContent : null;
    if (labelEl) labelEl.textContent = 'Listening…';
    voiceBtnEl.querySelector('.voice-icon').textContent = '🎙';

    voiceStatusEl.hidden = false;
    voiceStatusEl.textContent = '🎙 Listening…';

    // Simulated delay standing in for real speech-to-text processing
    setTimeout(() => {
      voiceBtnEl.classList.remove('listening');
      if (labelEl) labelEl.textContent = originalLabel || 'Voice';
      voiceStatusEl.textContent = '✓ Voice input captured.';

      // Drop a sample transcribed phrase into the input, as a real
      // speech-to-text integration would.
      if (inputEl && !inputEl.value) {
        inputEl.value = 'Explain photosynthesis';
      }

      setTimeout(() => {
        voiceStatusEl.hidden = true;
      }, 2200);
    }, 1800);
  }

  /* ==========================================================
     MOCK PROGRESS LOADER — loadLearningProgress()
     Placeholder seam for fetching real progress data later.
     Currently a no-op since mock data is baked into the templates.
     ========================================================== */
  function loadLearningProgress() {
    // Example future implementation:
    //   const progress = await fetchProgressFromBackend();
    //   updateDashboardWithProgress(progress);
    return null;
  }

  /* ==========================================================
     HOME PAGE EVENT BINDING
     ========================================================== */
  function bindHomePageEvents() {
    const learningInput = document.getElementById('learningInput');
    const sendBtn = document.getElementById('sendBtn');
    const aiResponse = document.getElementById('aiResponse');
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadHint = uploadStatus ? uploadStatus.querySelector('#uploadHint') : null;

    if (!learningInput) return; // not on home page

    // Send message (click + Enter key, Shift+Enter for newline)
    sendBtn.addEventListener('click', () => {
      sendMessage(learningInput.value, { responseEl: aiResponse, inputEl: learningInput });
    });
    learningInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(learningInput.value, { responseEl: aiResponse, inputEl: learningInput });
      }
    });

    // Upload chips
    const uploadMap = {
      pdf: 'fileInputPdf',
      notes: 'fileInputNotes',
      image: 'fileInputImage',
      slides: 'fileInputSlides',
    };
    document.querySelectorAll('.upload-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const kind = chip.dataset.upload;
        const inputId = uploadMap[kind];
        const fileInputEl = document.getElementById(inputId);
        if (fileInputEl) {
          uploadMaterial(kind, fileInputEl, uploadStatus, uploadHint);
        }
      });
    });

    // Voice button
    voiceBtn.addEventListener('click', () => {
      startVoiceInput(voiceBtn, voiceStatus, learningInput);
    });

    // Quick prompt chips
    document.querySelectorAll('.prompt-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        learningInput.value = chip.textContent.trim();
        learningInput.focus();
      });
    });

    // Insight "Start Practice" button -> jump to Practice page
    const insightBtn = document.querySelector('.insight-btn');
    if (insightBtn) {
      insightBtn.addEventListener('click', () => goToPage('practice'));
    }

    // Topic card actions -> jump to Mastery page as a sensible mock destination
    document.querySelectorAll('.topic-action').forEach((btn) => {
      btn.addEventListener('click', () => goToPage('mastery'));
    });

    // Feature cards -> lightly interactive, no navigation needed
  }

  /* ==========================================================
     AI TEACHER PAGE EVENT BINDING
     ========================================================== */
  function bindTeacherPageEvents() {
    const teacherInput = document.getElementById('teacherInput');
    const sendBtnTeacher = document.getElementById('sendBtnTeacher');
    const aiResponseTeacher = document.getElementById('aiResponseTeacher');
    const voiceBtnTeacher = document.getElementById('voiceBtnTeacher');
    const voiceStatusTeacher = document.getElementById('voiceStatusTeacher');

    if (!teacherInput) return; // not on AI teacher page

    sendBtnTeacher.addEventListener('click', () => {
      sendMessage(teacherInput.value, { responseEl: aiResponseTeacher, inputEl: teacherInput });
    });
    teacherInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(teacherInput.value, { responseEl: aiResponseTeacher, inputEl: teacherInput });
      }
    });
    voiceBtnTeacher.addEventListener('click', () => {
      startVoiceInput(voiceBtnTeacher, voiceStatusTeacher, teacherInput);
    });

    // Upload chips on this page reuse the same hidden file inputs from home
    const uploadMap = { pdf: 'fileInputPdf', notes: 'fileInputNotes' };
    document.querySelectorAll('.page-ai-teacher .upload-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const kind = chip.dataset.upload;
        let fileInputEl = document.getElementById(uploadMap[kind]);
        if (!fileInputEl) {
          // Fallback hidden input if home page inputs aren't in the DOM
          fileInputEl = document.createElement('input');
          fileInputEl.type = 'file';
          fileInputEl.style.display = 'none';
          document.body.appendChild(fileInputEl);
        }
        fileInputEl.value = '';
        fileInputEl.click();
        fileInputEl.onchange = () => {
          const file = fileInputEl.files && fileInputEl.files[0];
          if (!file) return;
          const note = document.createElement('p');
          note.className = 'ar-intro';
          note.textContent = `✓ ${file.name} — ready to learn from this material.`;
          aiResponseTeacher.innerHTML = '';
          aiResponseTeacher.appendChild(note);
          aiResponseTeacher.hidden = false;
        };
      });
    });
  }

  /* ==========================================================
     DOUBT SOLVING PAGE EVENT BINDING
     ========================================================== */
  function bindDoubtPageEvents() {
    const doubtInput = document.querySelector('.doubt-input');
    const doubtSendBtn = document.getElementById('doubtSendBtn');
    if (!doubtInput || !doubtSendBtn) return;

    const submitDoubt = () => {
      const text = doubtInput.value.trim();
      if (!text) return;
      doubtInput.value = '';
      doubtInput.placeholder = 'Doubt received — your AI teacher is preparing an explanation…';
    };

    doubtSendBtn.addEventListener('click', submitDoubt);
    doubtInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitDoubt();
      }
    });
  }

  /* ==========================================================
     GLOBAL NAV EVENT BINDING (sidebar + bottom nav, bound once)
     ========================================================== */
  function bindGlobalNavEvents() {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => goToPage(btn.dataset.page));
    });
    document.querySelectorAll('.bnav-item').forEach((btn) => {
      btn.addEventListener('click', () => goToPage(btn.dataset.page));
    });

    hamburgerBtn.addEventListener('click', toggleMobileSidebar);
    sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // Close mobile sidebar on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileSidebar();
    });
  }

  /* ==========================================================
     INIT
     ========================================================== */
  function init() {
    bindGlobalNavEvents();
    renderPage('home');
    setActiveNav('home');
    loadLearningProgress();
  }

  document.addEventListener('DOMContentLoaded', init);
})();