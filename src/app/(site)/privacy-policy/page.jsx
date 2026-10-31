import { PolicyPage } from "@/features/legal/components/PolicyPage";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how information is handled when you use PathMe.",
};

const sections = [
  {
    id: "overview",
    heading: "1. Your privacy matters",
    paragraphs: [
      "This page describes the kinds of information that may be handled when you use PathMe and why it may be needed to provide the learning platform. The information involved depends on the features you use and the details you choose to provide.",
    ],
  },
  {
    id: "information",
    heading: "2. Information you provide",
    paragraphs: [
      "When you create an account or use platform features, you may provide information such as your username, email address, phone number, profile details, course activity, or messages sent through the service.",
    ],
  },
  {
    id: "usage",
    heading: "3. How information is used",
    paragraphs: [
      "Information may be used to operate and improve PathMe, provide course and account features, respond to support requests, maintain platform security, and meet applicable legal requirements.",
    ],
  },
  {
    id: "sharing",
    heading: "4. When information may be shared",
    paragraphs: [
      "Information may be processed by service providers that help operate the platform, or disclosed when required by law or necessary to protect users and the service. The specific providers and processing arrangements depend on the services in use.",
      "Additional details about service providers and any international data transfers should be provided where applicable.",
    ],
  },
  {
    id: "security-retention",
    heading: "5. Security and retention",
    paragraphs: [
      "Reasonable safeguards should be used to protect account and learning information. No online service can guarantee absolute security. Information should be kept only for as long as needed for the purposes described here or as required by applicable law.",
    ],
  },
  {
    id: "choices",
    heading: "6. Your choices and requests",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, or request deletion of personal information. Ask a parent or legal guardian to help you understand the choices available in your region.",
    ],
  },
  {
    id: "young-learners",
    heading: "7. Young learners",
    paragraphs: [
      "PathMe is designed for student learning. If you are under the age of legal majority where you live, involve a parent or legal guardian when using the service and when sharing personal information.",
    ],
  },
  {
    id: "updates",
    heading: "8. Policy updates",
    paragraphs: [
      "This policy may change as PathMe features or legal requirements change. Updates will be posted on this page with a revised date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Your information"
      title="Privacy Policy"
      description="A straightforward overview of how information may be used to provide, protect, and improve your PathMe learning experience."
      icon="fa-shield-halved"
      sections={sections}
    />
  );
}
