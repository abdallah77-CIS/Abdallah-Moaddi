/* ================================================================
   Abdallah Moaddi — Learning Platform
   Organized script: nav, hero editor animation, lessons portal,
   progress tracking, internal quizzes, and the certificate system.
   ================================================================ */

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

/* ---------- Hero editor: typing + syntax-highlight loop ---------- */
const snippets = [
  {
    tabId: 'tabCpp',
    raw: `#include <iostream>
using namespace std;

int main() {
    // من المنطق...
    cout << "Hello, JU!" << endl;
    return 0;
}`,
    html: `<span class="tok-kw">#include</span> &lt;iostream&gt;
<span class="tok-kw">using</span> <span class="tok-kw">namespace</span> std;

<span class="tok-kw">int</span> main() {
    <span class="tok-comment">// من المنطق...</span>
    cout &lt;&lt; <span class="tok-str">"Hello, JU!"</span> &lt;&lt; endl;
    <span class="tok-kw">return</span> 0;
}`
  },
  {
    tabId: 'tabJava',
    raw: `public class Main {
    public static void main(String[] args) {
        // ...إلى السحر
        System.out.println("Hello, JU!");
    }
}`,
    html: `<span class="tok-kw">public</span> <span class="tok-kw">class</span> Main {
    <span class="tok-kw">public</span> <span class="tok-kw">static</span> <span class="tok-kw">void</span> main(<span class="tok-kw">String</span>[] args) {
        <span class="tok-comment">// ...إلى السحر</span>
        System.out.println(<span class="tok-str">"Hello, JU!"</span>);
    }
}`
  }
];

const typedEl = document.getElementById('typedCode');
const gutterEl = document.getElementById('editorGutter');
const tabCpp = document.getElementById('tabCpp');
const tabJava = document.getElementById('tabJava');
let snippetIndex = 0;

function setGutter(lineCount) {
  gutterEl.innerHTML = '';
  for (let i = 1; i <= lineCount; i++) {
    const d = document.createElement('div');
    d.textContent = i;
    gutterEl.appendChild(d);
  }
}

function setActiveTab(tabId) {
  [tabCpp, tabJava].forEach(t => t.classList.toggle('active', t.id === tabId));
}

function typeSnippet(snippet, onDone) {
  setActiveTab(snippet.tabId);
  setGutter(snippet.raw.split('\n').length);
  let i = 0;
  typedEl.textContent = '';
  const speed = 22;
  (function step() {
    if (i <= snippet.raw.length) {
      typedEl.textContent = snippet.raw.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else {
      typedEl.innerHTML = snippet.html; // apply syntax highlighting once fully typed
      setTimeout(onDone, 1800);
    }
  })();
}

function eraseSnippet(snippet, onDone) {
  let i = snippet.raw.length;
  const speed = 10;
  (function step() {
    if (i >= 0) {
      typedEl.textContent = snippet.raw.slice(0, i);
      i--;
      setTimeout(step, speed);
    } else {
      onDone();
    }
  })();
}

function runLoop() {
  const current = snippets[snippetIndex];
  typeSnippet(current, () => {
    eraseSnippet(current, () => {
      snippetIndex = (snippetIndex + 1) % snippets.length;
      runLoop();
    });
  });
}
runLoop();

/* ================================================================
   LMS STATE — localStorage-backed progress tracking
   ================================================================ */
const LS_WATCHED = 'lms_watched_lessons_v1';   // { lessonId: true }
const LS_QUIZZES = 'lms_quiz_results_v1';       // { quizId: { score, total, passed, date } }
const LS_NAME = 'lms_student_name_v1';         // last-used full name (autofill convenience)

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}

function isLessonWatched(lessonId) {
  const watched = loadJSON(LS_WATCHED, {});
  return !!watched[lessonId];
}
function markLessonWatched(lessonId) {
  const watched = loadJSON(LS_WATCHED, {});
  watched[lessonId] = true;
  saveJSON(LS_WATCHED, watched);
  refreshAllProgressUI();
}
function unmarkLessonWatched(lessonId) {
  const watched = loadJSON(LS_WATCHED, {});
  delete watched[lessonId];
  saveJSON(LS_WATCHED, watched);
  refreshAllProgressUI();
}

function courseStats(course) {
  const lessons = ALL_LESSONS.filter(l => l.course === course);
  const watched = loadJSON(LS_WATCHED, {});
  const watchedCount = lessons.filter(l => watched[l.id]).length;
  const total = lessons.length;
  const percent = total ? Math.round((watchedCount / total) * 100) : 0;
  return { watchedCount, total, percent };
}

/* ================================================================
   Lessons Portal: unified lesson data, dropdown filter, video modal
   -> To add real lessons, edit the ALL_LESSONS array below.
      course   = 'cpp' or 'java' — determines which dropdown option
                 the lesson appears under, and which progress bar it
                 counts toward.
      videoSrc = a DIRECT link to your video file (.mp4 recommended),
                 hosted on your own server / cloud storage (S3, Bunny CDN,
                 Cloudflare R2, etc). Must be a link that ends in the
                 file itself, not a page — e.g.:
                 https://cdn.yoursite.com/videos/cpp-lesson-1.mp4
      poster   = (optional) a thumbnail image URL for the video card.
                 Leave empty ('') to use the default dot-grid thumbnail.
   ================================================================ */
const ALL_LESSONS = [
    { id:"cpp-1", course:"cpp", title:"Download visual studio community", desc:"", duration:"2:54", youtubeId:"Lj5whjaOEp8" },
    { id:"cpp-2", course:"cpp", title:"First program", desc:"", duration:"6:14", youtubeId:"mLllYfwiEFc" },
    { id:"cpp-3", course:"cpp", title:"Data types & variable declaration & initialization", desc:"", duration:"12:59", youtubeId:"i_w47tWS0KQ" },
    { id:"cpp-4", course:"cpp", title:"cin & Mathematical operation", desc:"", duration:"11:09", youtubeId:"9qNpDSLzWoo" },
    { id:"java-1", course:"java", title:"Chapter 1", desc:"", duration:"9:32", youtubeId:"tmKuap6YdfE" },
    { id:"java-2", course:"java", title:"Introduction to java application Part 1", desc:"", duration:"29:51", youtubeId:"84fXBgDaP6o" },
    { id:"java-3", course:"java", title:"Introduction to java application Part 2", desc:"", duration:"27:10", youtubeId:"uenZwitpKyE" },
    { id:"java-4", course:"java", title:"Selection statements part 1", desc:"", duration:"14:51", youtubeId:"YY77bBY49u4" },
    { id:"java-5", course:"java", title:"Selection statements part 2", desc:"", duration:"20:46", youtubeId:"UFbkVeoJf28" },
    { id:"java-6", course:"java", title:"Repetition statements (looping statements)", desc:"", duration:"36:24", youtubeId:"80k3Xu6b91o" },
    { id:"java-7", course:"java", title:"Classes and Objects", desc:"", duration:"32:11", youtubeId:"Ezh-rNpgelM" },
    { id:"java-8", course:"java", title:"Methods", desc:"", duration:"35:53", youtubeId:"nXSPBKl5Frk" },
    { id:"java-9", course:"java", title:"Revision", desc:"", duration:"50:06", youtubeId:"gTTchHG4O98" },
  ];

const courseLabel = { cpp: 'C++', java: 'Java' };
const lessonGrid = document.getElementById('lessonGrid');

function renderLessons(filter) {
  lessonGrid.innerHTML = '';
  const list = filter === 'all' ? ALL_LESSONS : ALL_LESSONS.filter(l => l.course === filter);
  list.forEach(lesson => {
    const watched = isLessonWatched(lesson.id);
    const card = document.createElement('article');
    card.className = 'lesson-card' + (watched ? ' watched' : '');
    card.innerHTML = `
    <div class="lesson-thumb">
      ${(() => {
        const thumb = lesson.poster || (lesson.youtubeId ? `https://i.ytimg.com/vi/${lesson.youtubeId}/mqdefault.jpg` : '');
        return thumb ? `<img src="${thumb}" alt="" onerror="this.style.display='none'">` : '';
      })()}
      <span class="lesson-badge ${lesson.course}">${courseLabel[lesson.course]}</span>
      ${watched ? `<span class="lesson-watched-badge" title="تمت المشاهدة">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </span>` : ''}
      <span class="lesson-duration">${lesson.duration}</span>
      <span class="lesson-play">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </span>
    </div>
    <div class="lesson-body">
      <h4>${lesson.title}</h4>
      <p>${lesson.desc}</p>
    </div>`;
    card.addEventListener('click', () => openLessonModal(lesson));
    lessonGrid.appendChild(card);
  });
}

// Course dropdown filter
const courseSelect = document.getElementById('courseSelect');
function setActiveCourseTab(filter) {
  courseSelect.value = filter;
  renderLessons(filter);
}
courseSelect.addEventListener('change', () => renderLessons(courseSelect.value));

// Nav links / hero CTA with data-course also update the dropdown and scroll to it
document.querySelectorAll('a[data-course]').forEach(a => {
  a.addEventListener('click', () => setActiveCourseTab(a.dataset.course));
});

renderLessons('all');

/* ================================================================
   Progress overview: one bar per course, updated live from watched
   lesson counts. Shows the "استلام الشهادة" button once a course
   hits 100%.
   ================================================================ */
const progressOverview = document.getElementById('progressOverview');

function renderProgressOverview() {
  progressOverview.innerHTML = '';
  Object.keys(courseLabel).forEach(course => {
    const stats = courseStats(course);
    const card = document.createElement('div');
    card.className = 'progress-card';
    card.innerHTML = `
      <div class="progress-card-head">
        <div class="progress-card-title">
          <span class="progress-dot ${course}"></span>
          <h4>دورة ${courseLabel[course]}</h4>
        </div>
        <span class="progress-percent">${stats.percent}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${stats.percent}%"></div>
      </div>
      <div class="progress-meta">
        <span class="progress-count">${stats.watchedCount} / ${stats.total} فيديو تمت مشاهدته</span>
        <button type="button" class="certificate-claim-btn ${stats.percent === 100 ? 'ready' : ''}" data-course="${course}">
          🎓 استلام الشهادة
        </button>
      </div>`;
    progressOverview.appendChild(card);
  });

  progressOverview.querySelectorAll('.certificate-claim-btn').forEach(btn => {
    btn.addEventListener('click', () => openNameModal(btn.dataset.course));
  });
}

function refreshAllProgressUI() {
  renderProgressOverview();
  renderLessons(courseSelect.value);
}
renderProgressOverview();

/* ================================================================
   Video modal — lessons are unlocked and play immediately, no
   subscribe gate. A footer lets the student mark the lesson as
   complete (feeding the progress bar) and jump into its quiz.
   ================================================================ */
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const videoPlayer = document.getElementById('videoPlayer');
const videoIframe = document.getElementById('videoIframe');
const lessonModalStatus = document.getElementById('lessonModalStatus');
const markWatchedBtn = document.getElementById('markWatchedBtn');
const goToQuizBtn = document.getElementById('goToQuizBtn');

let currentLesson = null;

function resetPlayers() {
  videoPlayer.style.display = 'none';
  videoPlayer.pause();
  videoPlayer.removeAttribute('src');
  videoPlayer.load();
  videoIframe.style.display = 'none';
  videoIframe.src = '';
}

function updateLessonModalStatus() {
  if (!currentLesson) return;
  const watched = isLessonWatched(currentLesson.id);
  lessonModalStatus.classList.toggle('done', watched);
  lessonModalStatus.innerHTML = watched
    ? '✓ تم تحديد هذا الدرس كمكتمل'
    : 'لم يتم تحديد هذا الدرس كمكتمل بعد';
  markWatchedBtn.textContent = watched ? 'إلغاء التحديد' : 'تحديد الدرس كمكتمل ✓';
}

// Lessons open unlocked immediately — playback source per lesson:
//   1) lesson.youtubeId  -> plays via YouTube's embedded player
//   2) lesson.videoSrc   -> plays via your own self-hosted file
function openLessonModal(lesson) {
  currentLesson = lesson;
  modalTitle.textContent = lesson.title;
  resetPlayers();

  if (lesson.youtubeId) {
    videoIframe.style.display = 'block';
    videoIframe.src = `https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1&rel=0`;
  } else if (lesson.videoSrc) {
    videoPlayer.style.display = 'block';
    videoPlayer.src = lesson.videoSrc;
    videoPlayer.play().catch(() => { });
  }

  updateLessonModalStatus();
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLessonModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  resetPlayers();
  currentLesson = null;
}

// Self-hosted <video> auto-marks the lesson watched once playback ends.
videoPlayer.addEventListener('ended', () => {
  if (currentLesson) {
    markLessonWatched(currentLesson.id);
    updateLessonModalStatus();
  }
});

markWatchedBtn.addEventListener('click', () => {
  if (!currentLesson) return;
  if (isLessonWatched(currentLesson.id)) {
    unmarkLessonWatched(currentLesson.id);
  } else {
    markLessonWatched(currentLesson.id);
  }
  updateLessonModalStatus();
});

goToQuizBtn.addEventListener('click', () => {
  if (!currentLesson) return;
  const lesson = currentLesson;
  closeLessonModal();
  openQuizModal(lesson);
});

modalClose.addEventListener('click', closeLessonModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeLessonModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeLessonModal(); });

/* ---------- Nav dropdown ("الدورات") ---------- */
const navDropdown = document.getElementById('navDropdown');
const navDropdownToggle = document.getElementById('navDropdownToggle');

function closeNavDropdown() {
  navDropdown.classList.remove('open');
  navDropdownToggle.setAttribute('aria-expanded', 'false');
}
navDropdownToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = navDropdown.classList.toggle('open');
  navDropdownToggle.setAttribute('aria-expanded', String(isOpen));
});
document.addEventListener('click', (e) => {
  if (!navDropdown.contains(e.target)) closeNavDropdown();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNavDropdown();
});
// Selecting a course from the dropdown closes it and closes the mobile menu too
navDropdown.querySelectorAll('a[data-course]').forEach(a => {
  a.addEventListener('click', () => { closeNavDropdown(); navLinks.classList.remove('open'); });
});

/* ================================================================
   Internal quiz system (replaces Google Forms).
   -> QUIZ_BANK holds a real multiple-choice quiz per lesson id.
      Edit `questions` to change wording; `correct` is the zero-based
      index of the right option. Lessons without a curated entry fall
      back to buildGenericQuiz(), so every lesson always has a quiz.
   ================================================================ */
const QUIZ_BANK = {
  'cpp-1': {
    title: 'اختبار: مقدمة إلى C++ ومتغيرات',
    questions: [
      { q: 'ما الدالة التي تبدأ تنفيذ أي برنامج C++؟', options: ['main()', 'start()', 'init()', 'run()'], correct: 0 },
      { q: 'أي مكتبة نحتاج تضمينها لاستخدام cout و cin؟', options: ['<cmath>', '<iostream>', '<string>', '<vector>'], correct: 1 },
      { q: 'أي نوع بيانات مناسب لتخزين رقم عشري؟', options: ['int', 'char', 'double', 'bool'], correct: 2 },
    ]
  },
  'cpp-2': {
    title: 'اختبار: الشروط والحلقات التكرارية',
    questions: [
      { q: 'أي جملة تُستخدم لتكرار كود عدد معروف من المرات؟', options: ['if', 'for', 'switch', 'return'], correct: 1 },
      { q: 'ماذا تفعل جملة else if؟', options: ['تكرر الحلقة', 'تفحص شرطاً إضافياً بعد if', 'تنهي البرنامج', 'تعرّف متغيراً'], correct: 1 },
      { q: 'أي حلقة تُنفَّذ مرة واحدة على الأقل مهما كان الشرط؟', options: ['for', 'while', 'do...while', 'foreach'], correct: 2 },
    ]
  },
  'cpp-3': {
    title: 'اختبار: الدوال والذاكرة (Pointers)',
    questions: [
      { q: 'ما فائدة تمرير متغير بالإشارة (reference) لدالة؟', options: ['نسخ القيمة فقط', 'تعديل القيمة الأصلية مباشرة', 'حذف المتغير', 'لا فائدة له'], correct: 1 },
      { q: 'ماذا يخزن الـ Pointer؟', options: ['قيمة نصية', 'عنوان مكان في الذاكرة', 'اسم الدالة', 'نوع البيانات'], correct: 1 },
      { q: 'ما الرمز المستخدم لتعريف Pointer في C++؟', options: ['&', '*', '#', '%'], correct: 1 },
    ]
  },
  'java-1': {
    title: 'اختبار: Chapter 1 — أساسيات Java',
    questions: [
      { q: 'ما امتداد ملفات كود Java المصدري؟', options: ['.java', '.class', '.jar', '.js'], correct: 0 },
      { q: 'أي أداة تُترجم كود Java إلى Bytecode؟', options: ['JVM', 'JDK javac', 'JRE فقط', 'IDE'], correct: 1 },
    ]
  },
  'java-2': {
    title: 'اختبار: مقدمة إلى تطبيقات Java (١)',
    questions: [
      { q: 'ما اسم الدالة الرئيسية في أي تطبيق Java؟', options: ['main', 'start', 'run', 'init'], correct: 0 },
      { q: 'أي جملة تطبع نصاً على الشاشة في Java؟', options: ['echo()', 'print.out()', 'System.out.println()', 'console.log()'], correct: 2 },
    ]
  },
  'java-4': {
    title: 'اختبار: جمل الاختيار (Selection) — الجزء ١',
    questions: [
      { q: 'أي جملة تُستخدم لاختيار مسار من عدة مسارات بناءً على قيمة متغير؟', options: ['for', 'switch', 'while', 'try'], correct: 1 },
      { q: 'ما نتيجة تنفيذ else بدون else if سابقة صحيحة؟', options: ['خطأ دائماً', 'تُنفَّذ إذا لم يتحقق شرط if', 'تُنفَّذ دائماً أولاً', 'لا تُنفَّذ أبداً'], correct: 1 },
    ]
  },
  'java-6': {
    title: 'اختبار: جمل التكرار (Repetition)',
    questions: [
      { q: 'أي حلقة الأنسب عندما لا نعرف عدد التكرارات مسبقاً؟', options: ['for', 'while', 'do...for', 'switch'], correct: 1 },
      { q: 'ماذا تفعل جملة break داخل حلقة؟', options: ['تُعيد الحلقة من البداية', 'تخرج من الحلقة فوراً', 'تتجاهل التكرار الحالي فقط', 'توقف البرنامج بالكامل'], correct: 1 },
    ]
  },
  'java-7': {
    title: 'اختبار: الأصناف والكائنات (Classes & Objects)',
    questions: [
      { q: 'ما الفرق بين Class و Object؟', options: ['لا فرق بينهما', 'Class قالب و Object نسخة منه', 'Object هو الأصل وClass نسخة منه', 'كلاهما دالة'], correct: 1 },
      { q: 'أي كلمة مفتاحية تُستخدم لإنشاء كائن جديد؟', options: ['create', 'new', 'make', 'object'], correct: 1 },
    ]
  },
  'java-8': {
    title: 'اختبار: التوابع (Methods)',
    questions: [
      { q: 'ما فائدة استخدام Methods في البرمجة؟', options: ['تكرار الكود دون داعٍ', 'إعادة استخدام الكود وتنظيمه', 'إبطاء البرنامج', 'لا فائدة'], correct: 1 },
      { q: 'ماذا تحدد "قيمة الإرجاع" (return type) لأي Method؟', options: ['اسم الدالة', 'نوع القيمة التي تُعيدها الدالة', 'عدد المعاملات', 'مكان الدالة في الملف'], correct: 1 },
    ]
  },
};

// Fallback for lessons without a curated quiz yet — keeps the flow
// working end-to-end; replace with real questions in QUIZ_BANK above.
function buildGenericQuiz(lesson) {
  return {
    title: `اختبار: ${lesson.title}`,
    questions: [
      { q: `ما المادة التي ينتمي إليها درس "${lesson.title}"؟`, options: [courseLabel[lesson.course], courseLabel[lesson.course === 'cpp' ? 'java' : 'cpp'], 'لا شيء مما سبق', 'كلاهما'], correct: 0 },
      { q: 'هل شاهدت محتوى الدرس بالكامل قبل بدء الاختبار؟', options: ['نعم', 'لا'], correct: 0 },
    ]
  };
}

function getQuizForLesson(lesson) {
  return QUIZ_BANK[lesson.id] || buildGenericQuiz(lesson);
}

const quizModalOverlay = document.getElementById('quizModalOverlay');
const quizModalTitle = document.getElementById('quizModalTitle');
const quizModalBody = document.getElementById('quizModalBody');
const quizModalClose = document.getElementById('quizModalClose');
const quizSubmitBtn = document.getElementById('quizSubmitBtn');
const quizResultEl = document.getElementById('quizResult');

let activeQuiz = null;
let activeQuizLesson = null;

function openQuizModal(lesson) {
  activeQuizLesson = lesson || null;
  activeQuiz = lesson ? getQuizForLesson(lesson) : null;
  if (!activeQuiz) return;
  renderQuiz(activeQuiz);
  quizModalTitle.textContent = activeQuiz.title;
  quizResultEl.textContent = '';
  quizResultEl.className = 'quiz-result';
  quizSubmitBtn.disabled = false;
  quizSubmitBtn.textContent = 'تصحيح الاختبار';
  quizModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuizModal() {
  quizModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  activeQuiz = null;
  activeQuizLesson = null;
}

function renderQuiz(quiz) {
  quizModalBody.innerHTML = quiz.questions.map((item, qIndex) => `
    <div class="quiz-question" data-q="${qIndex}">
      <div class="quiz-question-title"><span class="quiz-question-num">${qIndex + 1}.</span><span>${item.q}</span></div>
      <div class="quiz-options">
        ${item.options.map((opt, oIndex) => `
          <label class="quiz-option" data-o="${oIndex}">
            <input type="radio" name="q${qIndex}" value="${oIndex}">
            <span>${opt}</span>
          </label>`).join('')}
      </div>
    </div>`).join('');

  quizModalBody.querySelectorAll('.quiz-option').forEach(label => {
    label.addEventListener('click', () => {
      const group = label.closest('.quiz-question');
      group.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      label.classList.add('selected');
      label.querySelector('input').checked = true;
    });
  });
}

// Auto-grading: compares each selected answer to the correct index,
// highlights every option green/red, and reports the final score.
quizSubmitBtn.addEventListener('click', () => {
  if (!activeQuiz) return;
  let score = 0;
  const total = activeQuiz.questions.length;

  activeQuiz.questions.forEach((item, qIndex) => {
    const group = quizModalBody.querySelector(`.quiz-question[data-q="${qIndex}"]`);
    const selected = group.querySelector('input:checked');
    const selectedIndex = selected ? Number(selected.value) : -1;
    const isCorrect = selectedIndex === item.correct;
    if (isCorrect) score++;

    group.querySelectorAll('.quiz-option').forEach(opt => {
      const oIndex = Number(opt.dataset.o);
      opt.querySelector('input').disabled = true;
      if (oIndex === item.correct) opt.classList.add('correct');
      else if (oIndex === selectedIndex) opt.classList.add('incorrect');
    });
  });

  const percent = total ? Math.round((score / total) * 100) : 0;
  const passed = percent >= 60;

  quizResultEl.textContent = `النتيجة: ${score} / ${total} (${percent}%) — ${passed ? 'ناجح ✓' : 'راجع الدرس وحاول مجدداً'}`;
  quizResultEl.className = 'quiz-result ' + (passed ? 'pass' : 'fail');
  quizSubmitBtn.disabled = true;
  quizSubmitBtn.textContent = 'تم التصحيح ✓';

  if (activeQuizLesson) {
    const results = loadJSON(LS_QUIZZES, {});
    results[activeQuizLesson.id] = { score, total, passed, date: new Date().toISOString() };
    saveJSON(LS_QUIZZES, results);
  }
});

quizModalClose.addEventListener('click', closeQuizModal);
quizModalOverlay.addEventListener('click', (e) => { if (e.target === quizModalOverlay) closeQuizModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && quizModalOverlay.classList.contains('open')) closeQuizModal(); });

/* ================================================================
   Quizzes section (standalone, browsable by subject) — reuses the
   same internal quiz modal instead of linking out to Google Forms.
   ================================================================ */
const QUIZZES = [
  { id: 'quiz-cpp-1', course: 'cpp', lessonId: 'cpp-1', title: 'اختبار: الأساسيات والمتغيرات', level: 'مبتدئ' },
  { id: 'quiz-cpp-2', course: 'cpp', lessonId: 'cpp-2', title: 'اختبار: الشروط والحلقات التكرارية', level: 'متوسط' },
  { id: 'quiz-cpp-3', course: 'cpp', lessonId: 'cpp-3', title: 'اختبار: الدوال والذاكرة', level: 'متقدم' },
  { id: 'quiz-java-1', course: 'java', lessonId: 'java-1', title: 'اختبار: أساسيات Java', level: 'مبتدئ' },
  { id: 'quiz-java-4', course: 'java', lessonId: 'java-4', title: 'اختبار: جمل الاختيار', level: 'متوسط' },
  { id: 'quiz-java-7', course: 'java', lessonId: 'java-7', title: 'اختبار: الأصناف والكائنات', level: 'متقدم' },
];

const SUBJECTS = [
  {
    course: 'cpp', name: 'C++', desc: 'دورة C++ الكاملة',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline><line x1="12" y1="4" x2="12" y2="20"></line></svg>`
  },
  {
    course: 'java', name: 'Java', desc: 'دورة Java الكاملة',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`
  }
];

const quizSubjects = document.getElementById('quizSubjects');

function renderQuizList(course) {
  const items = QUIZZES.filter(q => q.course === course);
  if (!items.length) return `<p class="gate-hint">لا توجد اختبارات مضافة بعد لهذه المادة.</p>`;
  return items.map(q => {
    const quizData = QUIZ_BANK[q.lessonId];
    const qCount = quizData ? quizData.questions.length : 2;
    return `
    <div class="quiz-item">
      <div class="quiz-item-info">
        <h4>${q.title}</h4>
        <div class="quiz-item-meta"><span>${qCount} أسئلة</span><span>·</span><span>${q.level}</span></div>
      </div>
      <button type="button" class="quiz-start-btn" data-lesson="${q.lessonId}">ابدأ الاختبار ←</button>
    </div>`;
  }).join('');
}

function renderQuizSubjects() {
  quizSubjects.innerHTML = '';
  SUBJECTS.forEach(subject => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
    <div class="quiz-card-head">
      <div class="quiz-card-info">
        <span class="quiz-card-icon ${subject.course}">${subject.icon}</span>
        <div class="quiz-card-title">
          <h3>${subject.name}</h3>
          <span>${subject.desc}</span>
        </div>
      </div>
      <button class="quiz-toggle-btn" type="button">
        اختبارات
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
    </div>
    <div class="quiz-panel">
      <div class="quiz-panel-inner">${renderQuizList(subject.course)}</div>
    </div>`;

    const head = card.querySelector('.quiz-card-head');
    const panel = card.querySelector('.quiz-panel');
    head.addEventListener('click', () => {
      const isOpen = card.classList.toggle('open');
      panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0px';
    });

    card.querySelectorAll('.quiz-start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lesson = ALL_LESSONS.find(l => l.id === btn.dataset.lesson);
        if (lesson) openQuizModal(lesson);
      });
    });

    quizSubjects.appendChild(card);
  });
}
renderQuizSubjects();

/* ================================================================
   Certificate system:
   1) "استلام الشهادة" (from the progress card) opens a name-entry modal.
   2) Confirming the name renders the certificate with course + date.
   3) The certificate can be printed / saved as PDF via the browser's
      print dialog, scoped by the @media print rules in style.css.
   ================================================================ */
const nameModalOverlay = document.getElementById('nameModalOverlay');
const studentNameInput = document.getElementById('studentNameInput');
const nameModalCancel = document.getElementById('nameModalCancel');
const nameModalConfirm = document.getElementById('nameModalConfirm');

let pendingCertCourse = null;

function openNameModal(course) {
  pendingCertCourse = course;
  studentNameInput.value = loadJSON(LS_NAME, '') || '';
  nameModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => studentNameInput.focus(), 150);
}
function closeNameModal() {
  nameModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  pendingCertCourse = null;
}

nameModalCancel.addEventListener('click', closeNameModal);
nameModalOverlay.addEventListener('click', (e) => { if (e.target === nameModalOverlay) closeNameModal(); });

function confirmCertificateName() {
  const name = studentNameInput.value.trim();
  if (!name) {
    studentNameInput.focus();
    studentNameInput.style.borderColor = '#F27E7E';
    setTimeout(() => { studentNameInput.style.borderColor = ''; }, 900);
    return;
  }
  saveJSON(LS_NAME, name);
  const course = pendingCertCourse;
  closeNameModal();
  openCertificate(course, name);
}
nameModalConfirm.addEventListener('click', confirmCertificateName);
studentNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmCertificateName(); });

const certModalOverlay = document.getElementById('certModalOverlay');
const certPrintArea = document.getElementById('certPrintArea');
const certClose = document.getElementById('certClose');
const certPrintBtn = document.getElementById('certPrintBtn');

function formatArabicDate(date) {
  try {
    return date.toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return date.toISOString().slice(0, 10);
  }
}

function openCertificate(course, name) {
  const today = formatArabicDate(new Date());
  certPrintArea.innerHTML = `
    <div class="certificate">
      <div class="cert-inner">
        <p class="cert-eyebrow">Certificate of Completion</p>
        <h2 class="cert-heading">شهادة إتمام الدورة</h2>
        <p class="cert-presented">تُمنح هذه الشهادة إلى</p>
        <p class="cert-name">${escapeHtml(name)}</p>
        <p class="cert-body-text">
          تقديراً لإتمامه/إتمامها بنجاح جميع دروس <strong>دورة ${courseLabel[course]}</strong>
          ضمن منصة Abdallah Moaddi التعليمية، وإنهاء كافة الفيديوهات المقررة بنسبة 100%.
        </p>
        <div class="cert-footer">
          <div class="cert-footer-block">
            <div class="label">الدورة</div>
            <div class="value">${courseLabel[course]}</div>
          </div>
          <div class="cert-seal">
            <svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3L22 9.3l-5 4.9 1.2 7-6.2-3.6L5.8 21.2 7 14.2l-5-4.9 7.1-1z"/></svg>
          </div>
          <div class="cert-footer-block">
            <div class="label">التاريخ</div>
            <div class="value">${today}</div>
          </div>
        </div>
      </div>
    </div>`;

  certModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function closeCertificate() {
  certModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
certClose.addEventListener('click', closeCertificate);
certModalOverlay.addEventListener('click', (e) => { if (e.target === certModalOverlay) closeCertificate(); });
certPrintBtn.addEventListener('click', () => window.print());

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}
