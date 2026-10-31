import { PolicyPage } from "@/features/legal/components/PolicyPage";

export const metadata = {
  title: "Terms of Service",
  description: "Terms for using the PathMe learning platform.",
};

const sections = [
  {
    id: "acceptance",
    heading: "1. About these terms",
    paragraphs: [
      "These Terms of Service explain the basic rules for accessing and using PathMe, including its courses, learning materials, and related features. By using the platform, you agree to follow these terms and any applicable laws.",
      "If you do not agree, do not use the platform. If you are under the age of legal majority where you live, use PathMe with the guidance and any required permission of a parent or legal guardian.",
    ],
  },
  {
    id: "accounts",
    heading: "2. Your account",
    paragraphs: [
      "Some features require an account. Keep your sign-in details private, provide information that is accurate to the best of your knowledge, and tell us if you believe someone else has accessed your account.",
    ],
    bullets: [
      "You are responsible for activity carried out through your account, subject to applicable law.",
      "Do not impersonate another person or create an account for someone else without permission.",
      "We may restrict access when needed to protect users, the platform, or the integrity of learning activities.",
    ],
  },
  {
    id: "learning",
    heading: "3. Courses and learning content",
    paragraphs: [
      "PathMe provides educational content and tools to support learning. Course availability, descriptions, requirements, and prices are presented on the platform and may change. Learning outcomes vary by student; we do not promise a particular grade, qualification, or career result.",
      "Unless a page says otherwise, platform materials are for personal learning use. Do not copy, redistribute, sell, or publicly share content in a way that violates the rights of PathMe or its creators.",
    ],
  },
  {
    id: "conduct",
    heading: "4. Acceptable use",
    paragraphs: [
      "Use PathMe responsibly and respectfully. You may not interfere with the platform, attempt to access accounts or systems without authorization, upload harmful software, or use the service to harass, exploit, or harm others.",
    ],
  },
  {
    id: "user-content",
    heading: "5. Content you submit",
    paragraphs: [
      "You remain responsible for content you submit, such as messages, project work, or other contributions. Only submit material you have the right to use, and do not include private information about yourself or another person unless it is necessary and appropriate for the feature.",
    ],
  },
  {
    id: "availability",
    heading: "6. Availability and changes",
    paragraphs: [
      "We work to keep PathMe useful and available, but features may be updated, interrupted, or discontinued. We may update these terms as the platform changes. The revised version will be posted on this page with an updated date.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <PolicyPage
      eyebrow="Using PathMe"
      title="Terms of Service"
      description="A clear guide to using PathMe, your account responsibilities, and the expectations that help keep learning useful and respectful."
      icon="fa-file-contract"
      sections={sections}
    />
  );
}
