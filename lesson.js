/* ================================================================
   lesson.js — standalone lesson page
   Each lesson now opens on its own page (lesson.html?id=...) instead
   of a modal on top of the homepage. Handles:
     - loading the correct lesson from ALL_LESSONS (common.js)
     - playing it (YouTube IFrame API, so we can detect "ended")
     - auto-marking the lesson complete the moment playback finishes
     - a manual complete/undo toggle as a backup
     - the "start quiz" action (reuses quiz.js)
     - a same-course lesson sidebar with live watched state
   ================================================================ */

const params = new URLSearchParams(window.location.search);
const lessonId = params.get('id');
let currentLesson = ALL_LESSONS.find(l => l.id === lessonId) || null;

const lessonTitleEl = document.getElementById('lessonTitle');
const lessonBadgeEl = document.getElementById('lessonCourseBadge');
const lessonDurationEl = document.getElementById('lessonDuration');
const lessonDescEl = document.getElementById('lessonDesc');
const lessonPlayerHost = document.getElementById('lessonPlayer');
const lessonStatusEl = document.getElementById('lessonStatus');
const markWatchedBtn = document.getElementById('markWatchedBtn');
const goToQuizBtn = document.getElementById('goToQuizBtn');
const nextLessonBtn = document.getElementById('nextLessonBtn');
const sidebarListEl = document.getElementById('lessonSidebarList');
const sidebarCourseTitleEl = document.getElementById('lessonSidebarCourseTitle');
const sidebarProgressText = document.getElementById('lessonSidebarProgressText');
const sidebarProgressFill = document.getElementById('lessonSidebarProgressFill');
const notFoundEl = document.getElementById('lessonNotFound');
const lessonPageContent = document.getElementById('lessonPageContent');

if (!currentLesson) {
  // Bad or missing ?id= — show a friendly message instead of a blank page.
  lessonPageContent.style.display = 'none';
  notFoundEl.style.display = 'block';
} else {
  initLessonPage(currentLesson);
}

function initLessonPage(lesson) {
  document.title = `${lesson.title} | Abdallah Moaddi`;
  lessonTitleEl.textContent = lesson.title;
  lessonBadgeEl.textContent = courseLabel[lesson.course];
  lessonBadgeEl.className = 'lesson-badge ' + lesson.course;
  lessonDurationEl.textContent = lesson.duration || '';
  lessonDescEl.textContent = lesson.desc || '';
  lessonDescEl.style.display = lesson.desc ? 'block' : 'none';

  renderPlayer(lesson);
  updateStatusUI();
  renderSidebar(lesson);
  setupNextLessonButton(lesson);
}

/* ---------- Player: plays the lesson and detects when it ends ---------- */
let ytPlayer = null;

function renderPlayer(lesson) {
  if (lesson.youtubeId) {
    loadYouTubeApi(() => {
      ytPlayer = new YT.Player(lessonPlayerHost, {
        videoId: lesson.youtubeId,
        playerVars: { rel: 0, autoplay: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              markLessonWatched(lesson.id);
              updateStatusUI();
            }
          }
        }
      });
    });
  } else if (lesson.videoSrc) {
    const video = document.createElement('video');
    video.id = 'lessonVideoTag';
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#000;';
    video.src = lesson.videoSrc;
    lessonPlayerHost.replaceWith(video);
    video.play().catch(() => { });
    // Self-hosted video ends -> mark complete immediately.
    video.addEventListener('ended', () => {
      markLessonWatched(lesson.id);
      updateStatusUI();
    });
  }
}

function loadYouTubeApi(callback) {
  if (window.YT && window.YT.Player) { callback(); return; }
  const existingCallback = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (typeof existingCallback === 'function') existingCallback();
    callback();
  };
  if (!document.getElementById('youtubeIframeApiScript')) {
    const tag = document.createElement('script');
    tag.id = 'youtubeIframeApiScript';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
}

/* ---------- Completion status + manual toggle ---------- */
function updateStatusUI() {
  const watched = isLessonWatched(currentLesson.id);
  lessonStatusEl.classList.toggle('done', watched);
  lessonStatusEl.innerHTML = watched
    ? '✓ تم تحديد هذا الدرس كمكتمل'
    : 'يُحدَّد الدرس كمكتمل تلقائياً عند انتهاء الفيديو';
  markWatchedBtn.textContent = watched ? 'إلغاء التحديد' : 'تحديد الدرس كمكتمل ✓';
  renderSidebar(currentLesson); // keep checkmarks + progress bar in sync
}

markWatchedBtn.addEventListener('click', () => {
  if (!currentLesson) return;
  if (isLessonWatched(currentLesson.id)) {
    unmarkLessonWatched(currentLesson.id);
  } else {
    markLessonWatched(currentLesson.id);
  }
  updateStatusUI();
});

goToQuizBtn.addEventListener('click', () => {
  if (currentLesson) openQuizModal(currentLesson);
});

/* ---------- Sidebar: other lessons in the same course ---------- */
function renderSidebar(lesson) {
  const courseLessons = ALL_LESSONS.filter(l => l.course === lesson.course);
  const stats = courseStats(lesson.course);

  sidebarCourseTitleEl.textContent = `دورة ${courseLabel[lesson.course]}`;
  sidebarProgressText.textContent = `${stats.watchedCount} / ${stats.total} مكتمل (${stats.percent}%)`;
  sidebarProgressFill.style.width = stats.percent + '%';

  sidebarListEl.innerHTML = '';
  courseLessons.forEach(l => {
    const watched = isLessonWatched(l.id);
    const item = document.createElement('a');
    item.href = `lesson.html?id=${encodeURIComponent(l.id)}`;
    item.className = 'lesson-sidebar-item' + (l.id === lesson.id ? ' active' : '') + (watched ? ' watched' : '');
    item.innerHTML = `
      <span class="lesson-sidebar-check">${watched ? '✓' : ''}</span>
      <span class="lesson-sidebar-info">
        <span class="lesson-sidebar-title">${l.title}</span>
        <span class="lesson-sidebar-duration">${l.duration}</span>
      </span>`;
    sidebarListEl.appendChild(item);
  });
}

/* ---------- Next-lesson shortcut ---------- */
function setupNextLessonButton(lesson) {
  const courseLessons = ALL_LESSONS.filter(l => l.course === lesson.course);
  const idx = courseLessons.findIndex(l => l.id === lesson.id);
  const next = idx >= 0 ? courseLessons[idx + 1] : null;
  if (next) {
    nextLessonBtn.style.display = 'inline-flex';
    nextLessonBtn.textContent = 'الدرس التالي ←';
    nextLessonBtn.addEventListener('click', () => {
      window.location.href = `lesson.html?id=${encodeURIComponent(next.id)}`;
    });
  } else {
    nextLessonBtn.style.display = 'none';
  }
}
