import "./css/StaticPage.css";
import Navbar from "./components/Navbar";

const SECTIONS = [
  {
    title: "1. How shipment works",
    body: `Once you submit a shipment request through the Fixer platform, we will arrange a courier to collect your device from your specified address within 1–2 business days. You will receive a tracking number via email as soon as the pickup is confirmed.\n\nAll devices are collected in secure, padded packaging provided by Fixer. You do not need to source your own box.`,
  },
  {
    title: "2. Accepted devices",
    body: `We accept smartphones, laptops, tablets, desktop computers, gaming consoles, smart watches, and most personal electronic devices. We do not currently accept large household electronics (TVs, printers, home appliances) or devices with severe physical damage that poses a safety risk (e.g. swollen batteries, cracked screens with exposed glass shards without protective covering).`,
  },
  {
    title: "3. Diagnosis & repair estimate",
    body: `Upon receiving your device, our technicians will conduct a full diagnostic within 24–48 hours. You will receive a detailed report outlining:\n\n• Identified faults\n• Recommended repairs\n• Cost estimate (parts + labour)\n• Estimated turnaround time\n\nNo repair work will begin until you have reviewed and approved the estimate.`,
  },
  {
    title: "4. Turnaround time",
    body: `Standard repairs are completed within 3–5 business days of approval. Complex repairs (motherboard-level, micro-soldering, data recovery) may take 7–10 business days. We will notify you of any delays before they occur.`,
  },
  {
    title: "5. Return shipping",
    body: `Once your device has been repaired and passed our quality check, it will be securely packaged and returned to your specified delivery address. Return shipping is included in the repair cost for standard devices. You will receive a tracking link via email and SMS as soon as the device is dispatched.`,
  },
  {
    title: "6. Warranty on repairs",
    body: `All repairs carried out by Fixer technicians come with a 90-day warranty covering the specific fault that was repaired. If the same issue recurs within 90 days, we will repair it at no additional cost. This warranty does not cover new damage, liquid ingress, or faults unrelated to the original repair.`,
  },
  {
    title: "7. Device safety & liability",
    body: `Fixer takes full responsibility for your device from the moment it is collected to the moment it is delivered back to you. In the unlikely event of loss or damage during transit, Fixer will compensate you for the assessed value of the device up to ₦500,000. Devices are insured throughout the logistics process.`,
  },
  {
    title: "8. Cancellations",
    body: `You may cancel a shipment request at any time before pickup at no charge. If you wish to cancel after the device has been collected, a logistics fee may apply. To cancel, contact our support team via the Help page or email us at support@fixer.ng.`,
  },
];

export default function ShipmentPolicy() {
  return (
    <div className="static-page">
<Navbar />
      <section className="static-hero">
        <p className="static-hero__eyebrow">Shipment Policy</p>
        <h1 className="static-hero__title">How device shipment &amp; repair works</h1>
        <p className="static-hero__sub">Last updated: July 2026</p>
      </section>

      <section className="static-section">
        <div className="static-section__inner static-section__inner--narrow">

          <div className="policy-intro">
            <p>
              This policy explains how Fixer handles your device once you submit a shipment request —
              from pickup to diagnosis, repair, and safe return. Please read it carefully before sending in your device.
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
            <p>Questions about our shipment policy?</p>
            <a href="/contact" className="policy-contact__link">Contact our support team →</a>
          </div>

        </div>
      </section>

    </div>
  );
}
