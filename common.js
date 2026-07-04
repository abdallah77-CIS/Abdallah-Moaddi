/* ================================================================
   common.js — shared data + storage helpers
   Loaded by BOTH index.html and lesson.html (load this file first).
   Keeping lesson data + progress logic here means watched-state and
   course lists always stay in sync across the two pages.
   ================================================================ */

/* ---------- localStorage keys ---------- */
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

/* ================================================================
   Lesson data
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
  { id: "cpp-1", course: "cpp", title: "Download visual studio community", desc: "", duration: "2:54", youtubeId: "Lj5whjaOEp8" },
  { id: "cpp-2", course: "cpp", title: "First program", desc: "", duration: "6:14", youtubeId: "mLllYfwiEFc" },
  { id: "cpp-3", course: "cpp", title: "Data types & variable declaration & initialization", desc: "", duration: "12:59", youtubeId: "i_w47tWS0KQ" },
  { id: "cpp-4", course: "cpp", title: "cin & Mathematical operation", desc: "", duration: "11:09", youtubeId: "9qNpDSLzWoo" },
  { id: "cpp-5", course: "cpp", title: "Escape sequence & ASCII Code", desc: "", duration: "12:17", youtubeId: "ZB2UqrWHzt8" },
  { id: "java-1", course: "java", title: "Chapter 1", desc: "", duration: "9:32", youtubeId: "tmKuap6YdfE" },
  { id: "java-2", course: "java", title: "Introduction to java application Part 1", desc: "", duration: "29:51", youtubeId: "84fXBgDaP6o" },
  { id: "java-3", course: "java", title: "Introduction to java application Part 2", desc: "", duration: "27:10", youtubeId: "uenZwitpKyE" },
  { id: "java-4", course: "java", title: "Selection statements part 1", desc: "", duration: "14:51", youtubeId: "YY77bBY49u4" },
  { id: "java-5", course: "java", title: "Selection statements part 2", desc: "", duration: "20:46", youtubeId: "UFbkVeoJf28" },
  { id: "java-6", course: "java", title: "Repetition statements (looping statements)", desc: "", duration: "36:24", youtubeId: "80k3Xu6b91o" },
  { id: "java-7", course: "java", title: "Classes and Objects", desc: "", duration: "32:11", youtubeId: "Ezh-rNpgelM" },
  { id: "java-8", course: "java", title: "Methods", desc: "", duration: "35:53", youtubeId: "nXSPBKl5Frk" },
  { id: "java-9", course: "java", title: "Revision", desc: "", duration: "50:06", youtubeId: "gTTchHG4O98" },

];



const courseLabel = { cpp: 'C++', java: 'Java' };

/* ---------- Watched-lesson state (per course, independent bars) ---------- */
function isLessonWatched(lessonId) {
  const watched = loadJSON(LS_WATCHED, {});
  return !!watched[lessonId];
}
function markLessonWatched(lessonId) {
  const watched = loadJSON(LS_WATCHED, {});
  if (watched[lessonId]) return; // already marked, avoid extra UI churn
  watched[lessonId] = true;
  saveJSON(LS_WATCHED, watched);
  if (typeof refreshAllProgressUI === 'function') refreshAllProgressUI();
}
function unmarkLessonWatched(lessonId) {
  const watched = loadJSON(LS_WATCHED, {});
  delete watched[lessonId];
  saveJSON(LS_WATCHED, watched);
  if (typeof refreshAllProgressUI === 'function') refreshAllProgressUI();
}

// Stats are computed per-course, so every course gets its own
// independent progress bar (never mixed with other courses).
function courseStats(course) {
  const lessons = ALL_LESSONS.filter(l => l.course === course);
  const watched = loadJSON(LS_WATCHED, {});
  const watchedCount = lessons.filter(l => watched[l.id]).length;
  const total = lessons.length;
  const percent = total ? Math.round((watchedCount / total) * 100) : 0;
  return { watchedCount, total, percent };
}

/* ---------- small shared utilities ---------- */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatArabicDate(date) {
  try {
    return date.toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return date.toISOString().slice(0, 10);
  }
}
