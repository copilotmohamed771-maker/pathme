import { PolicyPage } from "@/features/legal/components/PolicyPage";

export const metadata = {
  title: "Student Guidelines",
  description: "Guidelines for a safe, respectful, and positive PathMe learning experience.",
};

const sections = [
  {
    id: "learn-curiously",
    heading: "1. Learn with curiosity",
    paragraphs: [
      "Ask questions, try new ideas, and treat mistakes as part of learning. Take your time with lessons and celebrate progress as you build new skills.",
    ],
  },
  {
    id: "respect",
    heading: "2. Treat everyone with respect",
    paragraphs: [
      "PathMe is a learning community. Be kind and constructive in messages, discussions, and shared work. Different experiences and ideas are welcome.",
    ],
    bullets: [
      "Give helpful feedback about the work, not hurtful comments about the person.",
      "Do not bully, threaten, discriminate against, or deliberately embarrass anyone.",
      "Respect other people's boundaries and do not pressure them to share personal details.",
    ],
  },
  {
    id: "stay-safe",
    heading: "3. Protect your privacy",
    paragraphs: [
      "Keep personal information safe. Do not post passwords, home addresses, private phone numbers, school schedules, or financial information in public areas or project submissions.",
      "Never share your password. If you think someone else knows it or has used your account, tell a parent or guardian and contact PathMe.",
    ],
  },
  {
    id: "original-work",
    heading: "4. Create and share responsibly",
    paragraphs: [
      "Be proud of your own work. Credit sources and collaborators, and only upload images, code, or other materials that you are allowed to use. Do not submit content that is dangerous, hateful, explicit, or intended to harm someone.",
    ],
  },
  {
    id: "account-security",
    heading: "5. Use the platform safely",
    paragraphs: [
      "Use your own account and follow the platform rules. Do not try to access another person's account, disrupt lessons or services, or use PathMe to send spam or harmful links.",
    ],
  },
  {
    id: "ask-for-help",
    heading: "6. Ask for help",
    paragraphs: [
      "If something on PathMe makes you uncomfortable or you see behavior that may be unsafe, stop engaging and tell a trusted adult or parent/guardian.",
    ],
  },
];

export default function StudentGuidelinesPage() {
  return (
    <PolicyPage
      eyebrow="A positive learning community"
      title="Student Guidelines"
      description="Simple, practical expectations to help every student learn, create, and connect safely on PathMe."
      icon="fa-people-group"
      sections={sections}
    />
  );
}
