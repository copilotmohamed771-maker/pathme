// Mock data. Replace with a real API / CMS call once a backend contract exists.
export const courses = [
  {
    id: "course-1",
    title: "Python for Young Creators",
    category: "Programming",
    price: "$49",
    level: "Beginner",
    duration: "4 Weeks",
    // Optional: path to a roadmap picture in /public (e.g. "/roadmaps/python.png").
    // When set, it is shown instead of the generated roadmap below.
    roadmapImage: null,
    roadmap: [
      {
        title: "Python Basics",
        detail: "Variables, data types and your first scripts",
        period: "Week 1",
      },
      { title: "Logic & Loops", detail: "Conditions, loops and functions", period: "Week 2" },
      { title: "Build a Game", detail: "Make a 2D arcade game with Pygame", period: "Week 3" },
      {
        title: "Final Project",
        detail: "Polish, test and present your own game",
        period: "Week 4",
      },
    ],
    bgGradient: "from-blue-500 to-indigo-600",
    icon: "fa-brands fa-python",
    description:
      "Learn fundamental programming logic by building interactive mini-games and automated art.",
    learnHighlights: [
      "Variables, Loops, and Logic statements",
      "Creating 2D arcade games with Pygame",
      "Writing clean, reusable Python scripts",
    ],
  },
  {
    id: "course-2",
    title: "AI & Machine Learning Basics",
    category: "AI & ML",
    price: "$79",
    level: "Intermediate",
    duration: "6 Weeks",
    // Optional: path to a roadmap picture in /public (e.g. "/roadmaps/python.png").
    // When set, it is shown instead of the generated roadmap below.
    roadmapImage: null,
    roadmap: [
      { title: "What is AI?", detail: "How machines learn from data", period: "Weeks 1-2" },
      { title: "Train a Model", detail: "Teach a model to recognize images", period: "Weeks 3-4" },
      { title: "Audio & Vision", detail: "Classify sounds and pictures", period: "Week 5" },
      { title: "AI Project", detail: "Build and demo your own AI app", period: "Week 6" },
    ],
    bgGradient: "from-teal-500 to-emerald-600",
    icon: "fa-solid fa-brain",
    description:
      "Explore neural networks, computer vision, and teach AI models to recognize images and audio.",
    learnHighlights: [
      "How AI models learn from training data",
      "Building image recognition applications",
      "Ethical AI & real-world applications",
    ],
  },
  {
    id: "course-3",
    title: "Math Mastery & Data Visuals",
    category: "Math",
    price: "Free Trial",
    level: "All Grades",
    duration: "3 Weeks",
    // Optional: path to a roadmap picture in /public (e.g. "/roadmaps/python.png").
    // When set, it is shown instead of the generated roadmap below.
    roadmapImage: null,
    roadmap: [
      {
        title: "Algebra Foundations",
        detail: "Equations and graphs made interactive",
        period: "Week 1",
      },
      {
        title: "Geometry Lab",
        detail: "Shapes and proofs with code simulations",
        period: "Week 2",
      },
      { title: "Data Stories", detail: "Statistics games and charts", period: "Week 3" },
    ],
    bgGradient: "from-amber-500 to-orange-600",
    icon: "fa-solid fa-square-root-variable",
    description:
      "Master algebra and geometry concepts using interactive charts, code simulations, and puzzles.",
    learnHighlights: [
      "Interactive geometry and graph building",
      "Applying math logic to problem solving",
      "Fun statistical games and charts",
    ],
  },
  {
    id: "course-4",
    title: "Web Development 101",
    category: "Programming",
    price: "$59",
    level: "Beginner",
    duration: "5 Weeks",
    // Optional: path to a roadmap picture in /public (e.g. "/roadmaps/python.png").
    // When set, it is shown instead of the generated roadmap below.
    roadmapImage: null,
    roadmap: [
      { title: "HTML Structure", detail: "Pages, headings, links and images", period: "Week 1" },
      { title: "CSS Styling", detail: "Colors, layout and typography", period: "Weeks 2-3" },
      { title: "Responsive Design", detail: "Make it look great on phones", period: "Week 4" },
      { title: "Publish Online", detail: "Launch your portfolio website", period: "Week 5" },
    ],
    bgGradient: "from-purple-500 to-pink-600",
    icon: "fa-solid fa-code",
    description:
      "Design and publish your very first personal portfolio website using modern HTML, CSS, and UI design.",
    learnHighlights: [
      "HTML structure & modern CSS styling",
      "Responsive mobile design layouts",
      "Publishing live websites online",
    ],
  },
  {
    id: "course-5",
    title: "Robotics & Hardware Lab",
    category: "Science & Tech",
    price: "$99",
    level: "Intermediate",
    duration: "6 Weeks",
    // Optional: path to a roadmap picture in /public (e.g. "/roadmaps/python.png").
    // When set, it is shown instead of the generated roadmap below.
    roadmapImage: null,
    roadmap: [
      { title: "Circuits 101", detail: "Microcontrollers and circuit flow", period: "Weeks 1-2" },
      { title: "Sensors", detail: "Read distance, light and motion data", period: "Weeks 3-4" },
      { title: "Motors & Movement", detail: "Program robot movements", period: "Week 5" },
      {
        title: "Robot Challenge",
        detail: "Complete a simulated robotics mission",
        period: "Week 6",
      },
    ],
    bgGradient: "from-cyan-500 to-blue-600",
    icon: "fa-solid fa-robot",
    description:
      "Simulate sensor hardware, microcontrollers, and program automated robotic movements.",
    learnHighlights: [
      "Microcontroller logic & circuit flow",
      "Sensor data reading & motor control",
      "Simulated hardware robotics projects",
    ],
  },
  {
    id: "course-6",
    title: "Computer Vision Foundations",
    category: "AI & ML",
    price: "$89",
    level: "Advanced",
    duration: "8 Weeks",
    // Optional: path to a roadmap picture in /public (e.g. "/roadmaps/python.png").
    // When set, it is shown instead of the generated roadmap below.
    roadmapImage: null,
    roadmap: [
      {
        title: "Image Basics",
        detail: "Pixels, color and filters with OpenCV",
        period: "Weeks 1-2",
      },
      { title: "Detection", detail: "Find objects in photos and video", period: "Weeks 3-5" },
      { title: "Face Tracking", detail: "Track faces and add overlays", period: "Weeks 6-7" },
      { title: "Vision Project", detail: "Build a smart recognition system", period: "Week 8" },
    ],
    bgGradient: "from-indigo-600 to-violet-800",
    icon: "fa-solid fa-eye",
    description:
      "Deep dive into object detection, face tracking, and video stream analysis using OpenCV.",
    learnHighlights: [
      "Object detection in live webcams",
      "Filter overlays and facial tracking",
      "Building smart visual recognition systems",
    ],
  },
];

export const featuredCourses = courses.slice(0, 3);
