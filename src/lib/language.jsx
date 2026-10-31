"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "pathme-language";
const languageListeners = new Set();
const SERVER_LANGUAGE_SNAPSHOT = Object.freeze({
  language: "en",
  ready: false,
});
let languageSnapshot = SERVER_LANGUAGE_SNAPSHOT;

function publishLanguage(language) {
  if (
    languageSnapshot.language === language &&
    languageSnapshot.ready
  ) {
    return;
  }
  languageSnapshot = { language, ready: true };
  languageListeners.forEach((onChange) => onChange());
}

function syncLanguageFromStorage() {
  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  publishLanguage(savedLanguage === "ar" ? "ar" : "en");
}

function subscribeToLanguage(onChange) {
  languageListeners.add(onChange);
  window.addEventListener("storage", syncLanguageFromStorage);

  return () => {
    languageListeners.delete(onChange);
    window.removeEventListener("storage", syncLanguageFromStorage);
  };
}

function getLanguageSnapshot() {
  return languageSnapshot;
}

function getServerLanguageSnapshot() {
  return SERVER_LANGUAGE_SNAPSHOT;
}

function subscribeToHydration(onHydrated) {
  queueMicrotask(onHydrated);
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

const ARABIC_TRANSLATIONS = {
  Home: "الرئيسية",
  Courses: "الدورات",
  "About Us": "من نحن",
  "Course Catalog": "قائمة الدورات",
  "Main": "القائمة الرئيسية",
  "Select language": "اختر اللغة",
  "Back to all courses": "العودة إلى جميع الدورات",
  "Your next learning adventure": "مغامرتك التعليمية القادمة",
  "A little about this course": "نبذة عن هذه الدورة",
  "Skills you’ll take with you": "المهارات التي ستكتسبها",
  "What you will learn": "ما ستتعلمه",
  "One step at a time": "خطوة بخطوة",
  "Your course roadmap": "خريطة الدورة",
  "We’re working on this course roadmap. The visual roadmap will be available soon.":
    "نعمل على إعداد خريطة هذه الدورة، وستكون متاحة قريبًا.",
  "Your course investment": "تكلفة الدورة",
  Duration: "المدة",
  Level: "المستوى",
  "Ready to turn your curiosity into a new skill?":
    "هل أنت مستعد لتحويل فضولك إلى مهارة جديدة؟",
  "We’ll help you get started over WhatsApp.":
    "سنساعدك على البدء عبر واتساب.",
  Free: "مجانًا",
  "Free Trial": "تجربة مجانية",
  "Contact for price": "تواصل لمعرفة السعر",
  off: "خصم",
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدم",
  ALLGRADES: "جميع الصفوف",
  "All levels": "جميع المستويات",
  "Duration varies": "تختلف المدة",
  "Read more": "اقرأ المزيد",
  "Read less": "اقرأ أقل",
  "Learn / Build / Apply": "تعلّم / ابنِ / طبّق",
  "Your next big idea starts with a first step.": "فكرتك الكبيرة القادمة تبدأ بخطوة أولى.",
  "Learn practical skills, make things you’re proud of, and find your own path into the future.":
    "اكتسب مهارات عملية، وأنشئ ما تفخر به، واعثر على طريقك نحو المستقبل.",
  "Your learning path": "مسارك التعليمي",
  "Small steps. Big possibilities.": "خطوات صغيرة. إمكانيات كبيرة.",
  "Discover your interests": "اكتشف اهتماماتك",
  "Build real-world skills": "اكتسب مهارات عملية",
  "Create what’s next": "اصنع المستقبل",
  "Made for curious minds and future builders.": "صُنع للعقول الفضولية وصنّاع المستقبل.",
  "Start your journey": "ابدأ رحلتك",
  "Welcome back": "مرحبًا بعودتك",
  "Create your account": "أنشئ حسابك",
  "Good to see you again.": "سعداء برؤيتك مجددًا.",
  "Join PathMe and start building skills for what’s next.":
    "انضم إلى PathMe وابدأ باكتساب مهارات المستقبل.",
  "Log in to pick up where your learning journey left off.":
    "سجّل الدخول لمتابعة رحلتك التعليمية من حيث توقفت.",
  Username: "اسم المستخدم",
  "Choose a username": "اختر اسم مستخدم",
  "Use letters and numbers; don’t include spaces.":
    "استخدم الأحرف والأرقام دون مسافات.",
  "Email address": "البريد الإلكتروني",
  "Enter your username": "أدخل اسم المستخدم",
  "Phone number": "رقم الهاتف",
  "Country calling code": "مفتاح الاتصال الدولي",
  "Loading country calling codes…": "جارٍ تحميل مفاتيح الاتصال الدولية…",
  Retry: "إعادة المحاولة",
  Password: "كلمة المرور",
  "Forgot password?": "هل نسيت كلمة المرور؟",
  "At least 8 characters": "٨ أحرف على الأقل",
  "Enter your password": "أدخل كلمة المرور",
  "Hide password": "إخفاء كلمة المرور",
  "Show password": "إظهار كلمة المرور",
  "I am a": "أنا",
  "Select role": "اختر نوع الحساب",
  Parent: "ولي أمر",
  Student: "طالب",
  Gender: "النوع",
  "Select gender": "اختر النوع",
  Female: "أنثى",
  Male: "ذكر",
  "Prefer not to say": "أفضل عدم الإفصاح",
  Age: "العمر",
  "Enter your age": "أدخل عمرك",
  "I agree to the": "أوافق على",
  "Terms of service": "شروط الخدمة",
  "Privacy policy": "سياسة الخصوصية",
  "Please wait…": "يرجى الانتظار…",
  OR: "أو",
  "Sign up with Google": "إنشاء حساب باستخدام Google",
  "Google sign-in needs NEXT_PUBLIC_GOOGLE_CLIENT_ID configured.":
    "يتطلب تسجيل الدخول عبر Google إعداد NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
  "Already have an account?": "لديك حساب بالفعل؟",
  "New to PathMe?": "جديد على PathMe؟",
  "Create an account": "إنشاء حساب",
  "Your learning journey starts here": "رحلتك التعليمية تبدأ من هنا",
  "Choose your account role": "اختر نوع حسابك",
  "Choose your role": "اختر نوع الحساب",
  "Select how you’ll use PathMe before continuing with Google.":
    "حدد كيفية استخدامك لـ PathMe قبل المتابعة باستخدام Google.",
  "Continue to Google": "المتابعة إلى Google",
  "Explore courses": "استكشف الدورات",
  "© 2026 PathMe Inc. All rights reserved. Your Path to Intelligence.":
    "© 2026 PathMe Inc. جميع الحقوق محفوظة. طريقك نحو المعرفة.",
  "Privacy Policy": "سياسة الخصوصية",
  "Terms of Service": "شروط الخدمة",
  "Student Guidelines": "إرشادات الطلاب",
  "Log in": "تسجيل الدخول",
  "Log out": "تسجيل الخروج",
  "Logging out": "جارٍ تسجيل الخروج",
  "Create account": "إنشاء حساب",
  "Sign up": "إنشاء حساب",
  "Explore Courses": "استكشف الدورات",
  "Close menu": "إغلاق القائمة",
  "Open menu": "فتح القائمة",
  "Your profile": "ملفك الشخصي",
  "Featured Pathways": "مسارات مميزة",
  "Popular Courses for Students": "دورات شائعة للطلاب",
  "View All Courses": "عرض جميع الدورات",
  "AI & PROGRAMMING EDUCATION FOR WHAT'S NEXT": "تعليم الذكاء الاصطناعي والبرمجة للمستقبل",
  "Build real skills.": "اكتسب مهارات حقيقية.",
  "Create real projects.": "أنشئ مشاريع حقيقية.",
  "Shape your future.": "اصنع مستقبلك.",
  "Practical, interactive learning pathways designed specifically for school students to master technology, coding, science, and future-ready skills.":
    "مسارات تعليمية عملية وتفاعلية مصممة خصيصًا لطلاب المدارس لإتقان التكنولوجيا والبرمجة والعلوم ومهارات المستقبل.",
  "Search courses": "ابحث عن الدورات",
  "Search Python, AI, Math, Web Dev...": "ابحث عن بايثون أو الذكاء الاصطناعي أو الرياضيات...",
  "Search Courses": "ابحث عن الدورات",
  "Popular categories:": "التصنيفات الشائعة:",
  "Browse All Courses": "تصفح جميع الدورات",
  "Learn More About Us": "اعرف المزيد عنا",
  "Could not load popular categories.": "تعذر تحميل التصنيفات الشائعة.",
  "Popular categories could not be loaded:": "تعذر تحميل التصنيفات الشائعة:",
  "Why PathMe?": "لماذا PathMe؟",
  "Built for Tomorrow’s Innovators": "صُمم لمبتكري المستقبل",
  "AI & ML Focused": "متخصصون في الذكاء الاصطناعي وتعلم الآلة",
  "From foundation theory to real-world impact projects.": "من الأساسيات النظرية إلى مشاريع ذات أثر واقعي.",
  "Practical Learning": "تعلم عملي",
  "Build interactive applications and real projects, not just lecture notes.": "أنشئ تطبيقات تفاعلية ومشاريع حقيقية، وليس مجرد ملاحظات دراسية.",
  "Student Community": "مجتمع الطلاب",
  "Collaborate with peers, share ideas, and grow together faster.": "تعاون مع زملائك وشارك الأفكار وتطوروا معًا.",
  "Future Ready": "استعد للمستقبل",
  "Master high-demand skills for high school, college, and modern careers.": "أتقن المهارات المطلوبة للمدرسة والجامعة والوظائف الحديثة.",
  "Explore Pathways": "استكشف المسارات",
  "Find your next favorite thing to learn.": "اكتشف الشيء التالي الذي تحب تعلمه.",
  "Build real skills, make something you’re proud of, and discover where your curiosity can take you.":
    "اكتسب مهارات حقيقية وأنشئ ما تفخر به واكتشف إلى أين يمكن أن يقودك فضولك.",
  "Find your course": "اعثر على دورتك",
  "Refine the catalog by topic, level, or price.": "خصص قائمة الدورات حسب الموضوع أو المستوى أو السعر.",
  "Hide filters": "إخفاء عوامل التصفية",
  "Show filters": "إظهار عوامل التصفية",
  "Search courses...": "ابحث عن الدورات...",
  Search: "بحث",
  Categories: "التصنيفات",
  "Course level": "مستوى الدورة",
  "Course filters": "عوامل تصفية الدورات",
  active: "نشط",
  "Filter by": "تصفية حسب",
  selected: "محدد",
  Show: "عرض",
  more: "المزيد",
  "All Grades": "جميع الصفوف",
  "Price range": "نطاق السعر",
  "Minimum price must be less than or equal to maximum price.": "يجب أن يكون الحد الأدنى للسعر أقل من الحد الأقصى أو مساويًا له.",
  "Loading courses...": "جارٍ تحميل الدورات...",
  "Could not load courses": "تعذر تحميل الدورات",
  "Try again": "حاول مرة أخرى",
  "No courses match these filters": "لا توجد دورات تطابق عوامل التصفية",
  "Try changing your search or filters.": "جرّب تغيير البحث أو عوامل التصفية.",
  "What you will learn:": "ما ستتعلمه:",
  "Explore course": "استكشف الدورة",
  Navigation: "التنقل",
  "Explore subjects": "استكشف المواد",
  "Loading categories…": "جارٍ تحميل التصنيفات…",
  "Show fewer categories": "عرض تصنيفات أقل",
  "Explore more categories": "استكشف المزيد من التصنيفات",
  "Practical learning pathways that help students explore technology, build real projects, and grow future-ready skills.":
    "مسارات تعليمية عملية تساعد الطلاب على استكشاف التكنولوجيا وإنشاء مشاريع حقيقية واكتساب مهارات المستقبل.",
  "LEARN / BUILD / APPLY": "تعلّم / ابنِ / طبّق",
  "About PathMe": "عن PathMe",
  "Learning that helps you": "تعلم يساعدك على",
  "find your next step.": "اكتشاف خطوتك التالية.",
  "PathMe helps students explore technology, build practical skills, and turn their curiosity into projects they can be proud of.":
    "يساعد PathMe الطلاب على استكشاف التكنولوجيا واكتساب مهارات عملية وتحويل فضولهم إلى مشاريع يفخرون بها.",
  "Explore our courses": "استكشف دوراتنا",
  "PathMe in numbers": "PathMe بالأرقام",
  "A growing community of learners": "مجتمع متنامٍ من المتعلمين",
  "Practical courses": "دورات عملية",
  "Built to turn curiosity into real skills": "مصممة لتحويل الفضول إلى مهارات حقيقية",
  "Students enrolled": "الطلاب المسجلون",
  "Learning and building with PathMe": "يتعلمون وينشئون مع PathMe",
  "Learning categories": "تصنيفات التعلم",
  "Explore ideas across technology and more": "استكشف أفكارًا في التكنولوجيا وغيرها",
  "What guides us": "ما يرشدنا",
  "Learning with purpose": "تعلم لهدف",
  "Every part of the PathMe experience is designed to help students take an idea and make something meaningful with it.":
    "صُمم كل جانب من تجربة PathMe لمساعدة الطلاب على تحويل أفكارهم إلى إنجازات ذات معنى.",
  "Learn by doing": "تعلم بالممارسة",
  "Turn new concepts into hands-on projects and practical skills you can use beyond the classroom.":
    "حوّل المفاهيم الجديدة إلى مشاريع عملية ومهارات يمكنك استخدامها خارج الفصل الدراسي.",
  "Find your path": "اعثر على مسارك",
  "Explore a broad range of subjects and discover the topics that inspire you to keep learning.":
    "استكشف مجموعة واسعة من المواد واكتشف الموضوعات التي تلهمك لمواصلة التعلم.",
  "Grow together": "تطوروا معًا",
  "Build confidence through an encouraging learning experience designed around student growth.":
    "عزز ثقتك من خلال تجربة تعليمية مشجعة تركز على نمو الطلاب.",
  "Get ready for what’s next": "استعد لما هو قادم",
  "Develop creative thinking and future-ready skills one lesson, experiment, and project at a time.":
    "طوّر التفكير الإبداعي ومهارات المستقبل درسًا وتجربةً ومشروعًا في كل مرة.",
  "Your next step starts here": "خطوتك التالية تبدأ هنا",
  "Ready to discover what you can create?": "هل أنت مستعد لاكتشاف ما يمكنك إنشاؤه؟",
  "Explore all courses": "استكشف جميع الدورات",
  "What you will learn:": "ما ستتعلمه:",
  "Explore course": "استكشف الدورة",
  "Loading popular courses...": "جارٍ تحميل الدورات الشائعة...",
  "Popular courses are temporarily unavailable. Please visit the course catalog to try again.":
    "الدورات الشائعة غير متاحة مؤقتًا. تفضل بزيارة قائمة الدورات وحاول مرة أخرى.",
  "No courses are available yet. Please check back soon.":
    "لا توجد دورات متاحة حتى الآن. يرجى العودة قريبًا.",
  "Course filters could not be fully loaded, but you can still browse courses.":
    "تعذر تحميل جميع عوامل تصفية الدورات، ولكن لا يزال بإمكانك تصفح الدورات.",
  "Loading filter options...": "جارٍ تحميل خيارات التصفية...",
  "Selections are combined to narrow your results.": "تُستخدم اختياراتك معًا لتضييق نطاق النتائج.",
  "Clear all filters": "مسح جميع عوامل التصفية",
  Minimum: "الحد الأدنى",
  Maximum: "الحد الأقصى",
  "No minimum": "بلا حد أدنى",
  "No maximum": "بلا حد أقصى",
  "Leave blank if you don’t have a limit.": "اتركه فارغًا إذا لم يكن لديك حد.",
  "Loading options...": "جارٍ تحميل الخيارات...",
  "No options available.": "لا توجد خيارات متاحة.",
  "All Grades": "جميع الصفوف",
  "Show less": "عرض أقل",
  Previous: "السابق",
  Next: "التالي",
  "Course pages": "صفحات الدورات",
  Page: "صفحة",
  of: "من",
  courses: "دورات",
  Beginner: "مبتدئ",
  Intermediate: "متوسط",
  Advanced: "متقدم",
  "Statistics could not be loaded.": "تعذر تحميل الإحصائيات.",
  "Loading the latest PathMe stats…": "جارٍ تحميل أحدث إحصائيات PathMe…",
  "Explore more categories": "استكشف المزيد من التصنيفات",
  "Categories could not be loaded:": "تعذر تحميل التصنيفات:",
  "Could not load categories.": "تعذر تحميل التصنيفات.",
  "About statistics": "إحصائيات حول PathMe",
  "Learning that helps you": "تعلم يساعدك على",
  "find your next step.": "اكتشاف خطوتك التالية.",
  "Explore our courses": "استكشف دوراتنا",
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { language, ready } = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    syncLanguageFromStorage();
  }, []);

  const changeLanguage = useCallback((nextLanguage) => {
    if (nextLanguage === "ar" || nextLanguage === "en") {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      publishLanguage(nextLanguage);
    }
  }, []);

  const t = useCallback(
    (text) => (language === "ar" ? ARABIC_TRANSLATIONS[text] || text : text),
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{ language, languageReady: ready, setLanguage: changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }
  return context;
}

export function useOptionalLanguage() {
  return useContext(LanguageContext);
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
}
