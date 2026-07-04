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
      
        System.out.println("Hello, JU!");
    }
}`,
    html: `<span class="tok-kw">public</span> <span class="tok-kw">class</span> Main {
    <span class="tok-kw">public</span> <span class="tok-kw">static</span> <span class="tok-kw">void</span> main(<span class="tok-kw">String</span>[] args) {
        <span class="tok-comment"></span>
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
   Lessons Portal: dropdown filter + lesson cards.
   Shared lesson data (ALL_LESSONS, courseLabel) and progress/watched
   helpers now live in common.js (loaded before this file) so they
   can be reused by the standalone lesson.html page too.
   ================================================================ */
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
    // Each lesson now opens on its own page instead of a modal.
    card.addEventListener('click', () => {
      window.location.href = `lesson.html?id=${encodeURIComponent(lesson.id)}`;
    });
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
   Quizzes section (standalone, browsable by subject) — reuses the
   internal quiz modal/engine from quiz.js instead of linking out to
   Google Forms.
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
const certDownloadImgBtn = document.getElementById('certDownloadImgBtn');

// Keep the data behind the currently-open certificate around so the
// download button can (re)draw it on demand.
let currentCertCourse = null;
let currentCertName = null;
let currentCertDate = null;

// escapeHtml() and formatArabicDate() now live in common.js.
function openCertificate(course, name) {
  const today = formatArabicDate(new Date());
  currentCertCourse = course;
  currentCertName = name;
  currentCertDate = today;

  certPrintArea.innerHTML = `
    <div class="certificate">
      <div class="cert-inner">
        <p class="cert-eyebrow">Certificate of Completion</p>
        <h2 class="cert-heading">شهادة إتمام الدورة</h2>
        <p class="cert-presented">تُمنح هذه الشهادة إلى</p>
        <p class="cert-name">${escapeHtml(name)}</p>
        <p class="cert-body-text">
          تقديراً لإتمامه/إتمامها بنجاح جميع دروس <strong>دورة ${courseLabel[course]}</strong>
           وإنهاء كافة الفيديوهات المقررة بنسبة 100%.
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
        <p class="cert-issuer"> مُصدرة بإشراف Abdallah Moaddi</p>
      </div>
    </div>`;

  certModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCertificate() {
  certModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
certClose.addEventListener('click', closeCertificate);
certModalOverlay.addEventListener('click', (e) => { if (e.target === certModalOverlay) closeCertificate(); });

/* ================================================================
   Download certificate as an image (PNG)
   Drawn straight onto a <canvas> (no external library, no CORS/
   font-loading dependency on a CDN) so it always works offline too.
   ================================================================ */
function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Wraps `text` (space-separated, works fine for Arabic) to `maxWidth`,
// drawing each line centered on `x` starting at `y`. Returns the y
// position right after the last line.
function wrapCenteredText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) { ctx.fillText(line, x, curY); curY += lineHeight; }
  return curY;
}

function drawCertificateCanvas(course, name, dateStr) {
  const W = 1000, H = 620, SCALE = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  ctx.direction = 'rtl';

  const inkColor = '#E8EEF2';
  const mutedColor = '#9FB0BC';
  const dimColor = '#5C6B78';
  const keyword = '#67E8DB';
  const arabicFont = (weight, size) => `${weight} ${size}px "IBM Plex Sans Arabic", "Segoe UI", sans-serif`;
  const monoFont = (weight, size) => `${weight} ${size}px "IBM Plex Mono", monospace`;

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#131F2C');
  bg.addColorStop(1, '#070C13');
  ctx.fillStyle = bg;
  roundedRectPath(ctx, 0, 0, W, H, 22);
  ctx.fill();

  // faint dot grid
  ctx.fillStyle = 'rgba(163, 191, 206, 0.10)';
  for (let gx = 24; gx < W - 20; gx += 22) {
    for (let gy = 24; gy < H - 20; gy += 22) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // outer + inner borders
  ctx.strokeStyle = 'rgba(163, 191, 206, 0.24)';
  ctx.lineWidth = 1;
  roundedRectPath(ctx, 0.5, 0.5, W - 1, H - 1, 22);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(103, 232, 219, 0.28)';
  roundedRectPath(ctx, 16, 16, W - 32, H - 32, 14);
  ctx.stroke();

  const cx = W / 2;
  let y = 96;

  ctx.textAlign = 'center';
  ctx.fillStyle = keyword;
  ctx.font = monoFont(600, 13);
  ctx.fillText('CERTIFICATE OF COMPLETION', cx, y);

  y += 46;
  ctx.fillStyle = inkColor;
  ctx.font = arabicFont(700, 30);
  ctx.fillText('شهادة إتمام الدورة', cx, y);

  y += 38;
  ctx.fillStyle = mutedColor;
  ctx.font = arabicFont(400, 15);
  ctx.fillText('تُمنح هذه الشهادة إلى', cx, y);

  y += 46;
  ctx.fillStyle = keyword;
  ctx.font = arabicFont(700, 36);
  ctx.fillText(name, cx, y);

  y += 42;
  ctx.fillStyle = mutedColor;
  ctx.font = arabicFont(400, 15);
  const bodyText = `تقديراً لإتمامه/إتمامها بنجاح جميع دروس دورة ${courseLabel[course]} وإنهاء كافة الفيديوهات المقررة بنسبة 100%.`;
  y = wrapCenteredText(ctx, bodyText, cx, y, 640, 24);

  y += 26;
  ctx.strokeStyle = 'rgba(163, 191, 206, 0.16)';
  ctx.beginPath();
  ctx.moveTo(70, y);
  ctx.lineTo(W - 70, y);
  ctx.stroke();

  y += 50;
  ctx.textAlign = 'right';
  ctx.fillStyle = dimColor;
  ctx.font = monoFont(600, 10.5);
  ctx.fillText('الدورة', W - 70, y - 20);
  ctx.fillStyle = inkColor;
  ctx.font = monoFont(600, 14);
  ctx.fillText(courseLabel[course], W - 70, y);

  ctx.textAlign = 'left';
  ctx.fillStyle = dimColor;
  ctx.font = monoFont(600, 10.5);
  ctx.fillText('التاريخ', 70, y - 20);
  ctx.fillStyle = inkColor;
  ctx.font = monoFont(600, 14);
  ctx.fillText(dateStr, 70, y);

  // seal
  const sealY = y - 8;
  ctx.beginPath();
  ctx.arc(cx, sealY, 30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(103, 232, 219, 0.14)';
  ctx.fill();
  ctx.strokeStyle = keyword;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = keyword;
  ctx.textAlign = 'center';
  ctx.font = '20px sans-serif';
  ctx.fillText('★', cx, sealY + 7);

  y += 58;
  ctx.textAlign = 'center';
  ctx.fillStyle = dimColor;
  ctx.font = monoFont(400, 11);
  ctx.fillText('مُصدرة بإشراف Abdallah Moaddi', cx, y);

  return canvas;
}

if (certDownloadImgBtn) {
  certDownloadImgBtn.addEventListener('click', () => {
    if (!currentCertCourse || !currentCertName) return;

    const originalLabel = certDownloadImgBtn.textContent;
    certDownloadImgBtn.disabled = true;
    certDownloadImgBtn.textContent = 'جارٍ التجهيز...';

    // Wait for the page fonts to be ready so the canvas text renders
    // with the right typeface instead of a fallback font.
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    fontsReady.then(() => {
      const canvas = drawCertificateCanvas(currentCertCourse, currentCertName, currentCertDate);
      const link = document.createElement('a');
      link.download = `certificate-${currentCertCourse}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(() => {
      alert('تعذّر إنشاء الصورة، يرجى المحاولة مرة أخرى.');
    }).finally(() => {
      certDownloadImgBtn.disabled = false;
      certDownloadImgBtn.textContent = originalLabel;
    });
  });
}

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
