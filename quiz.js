/* ================================================================
   quiz.js — internal auto-graded quiz engine (replaces Google Forms)
   Loaded by BOTH index.html and lesson.html, right after common.js.
   Requires the quiz-modal markup (#quizModalOverlay etc.) to exist
   in the page that includes this file.

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
