import "./css/StaticPage.css";
import Navbar from "./components/Navbar";

const SECTIONS = [
  { title: "1. Information we collect", body: `When you use Fixer, we collect the following types of information:\n\n• Account information: name, email address, phone number, and password when you register.\n• Device information: the make, model, and fault details of devices you submit for repair or diagnosis.\n• Usage data: pages visited, features used, diagnostic queries, and time spent on the platform.\n• Payment information: billing details processed securely through our payment partners. We do not store full card numbers.\n• Communications: messages sent to our support team or technicians through the platform.` },
  { title: "2. How we use your information", body: `We use the information we collect to:\n\n• Provide, operate, and improve the Fixer platform.\n• Match you with appropriate technicians and repair services.\n• Process payments and send receipts.\n• Send service updates, appointment reminders, and repair status notifications.\n• Improve our AI diagnostic engine based on anonymised diagnostic data.\n• Comply with legal obligations.` },
  { title: "3. Data sharing", body: `We do not sell your personal data. We share your information only in the following circumstances:\n\n• With technicians assigned to your repair, limited to the details needed to carry out the job.\n• With logistics partners who handle device pickup and delivery.\n• With payment processors to complete transactions securely.\n• With service providers who help us operate the platform (hosting, analytics, email delivery) under strict data processing agreements.\n• When required by law or to protect the rights and safety of Fixer and its users.` },
  { title: "4. Data retention", body: `We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where we are legally required to retain certain records (e.g. financial transactions, which are kept for 7 years in line with Nigerian financial regulations).` },
  { title: "5. Your rights", body: `You have the right to:\n\n• Access the personal data we hold about you.\n• Correct inaccurate information.\n• Request deletion of your data.\n• Object to certain processing activities.\n• Withdraw consent at any time where processing is based on consent.\n\nTo exercise any of these rights, contact us at privacy@fixer.ng.` },
  { title: "6. Cookies", body: `We use cookies and similar tracking technologies to improve your experience on Fixer. See our Cookies Policy for full details on what we use and how to manage your preferences.` },
  { title: "7. Security", body: `We use industry-standard security measures including encryption in transit (TLS), encrypted storage for sensitive data, access controls, and regular security audits. No system is completely secure, but we are committed to protecting your data to the best of our ability.` },
  { title: "8. Changes to this policy", body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on the platform. The date of the latest update is shown at the top of this page.` },
  { title: "9. Contact us", body: `For any privacy-related questions or requests, contact our Data Protection Officer at:\n\nprivacy@fixer.ng\nFixer Technologies Ltd, Lagos, Nigeria.` },
];

export default function PrivacyPolicy() {
  return (
    <div className="static-page">
<Navbar />
      <section className="static-hero">
        <p className="static-hero__eyebrow">Legal</p>
        <h1 className="static-hero__title">Privacy Policy</h1>
        <p className="static-hero__sub">Last updated: July 2026</p>
      </section>

      <section className="static-section">
        <div className="static-section__inner static-section__inner--narrow">
          <div className="policy-intro">
            <p>
              At Fixer, your privacy is important to us. This policy explains what personal data we collect,
              how we use it, and the choices you have. By using Fixer, you agree to the practices described here.
            </p>
          </div>

          <div className="policy-sections">
            {SECTIONS.map(s => (
              <div className="policy-section" key={s.title}>
                <h2 className="policy-section__title">{s.title}</h2>
                {s.body.split("\n\n").map((para, i) => (
                  <p className="policy-section__body" key={i}>{para}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="policy-contact">
            <p>Questions about this policy?</p>
            <a href="/contact" className="policy-contact__link">Contact our privacy team →</a>
          </div>
        </div>
      </section>

    </div>
  );
}
