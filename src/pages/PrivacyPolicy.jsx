import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const styles = `
.privacy-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e40af;
}

.page-header {
  padding: 120px 40px 80px;
  text-align: center;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  color: #ffffff;
}

.page-header h1 {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 56px;
  font-weight: 500;
  margin: 0 0 20px;
}

.page-header p {
  font-family: 'Arial', sans-serif;
  font-size: 20px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.95;
}

.privacy-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 40px;
}

.privacy-section {
  margin-bottom: 48px;
}

.privacy-section h2 {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 32px;
  font-weight: 500;
  color: #1e40af;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(30, 64, 175, 0.2);
}

.privacy-section h3 {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 500;
  color: #1e40af;
  margin: 32px 0 16px;
}

.privacy-section p {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333333;
  margin: 0 0 16px;
}

.privacy-section ul {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333333;
  margin: 0 0 16px;
  padding-left: 24px;
}

.privacy-section li {
  margin-bottom: 8px;
}

.privacy-section strong {
  color: #1e40af;
  font-weight: 600;
}

.last-updated {
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  color: #666666;
  font-style: italic;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(30, 64, 175, 0.1);
}

.contact-info {
  background: rgba(30, 64, 175, 0.05);
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 12px;
  padding: 32px;
  margin-top: 48px;
}

.contact-info h3 {
  margin-top: 0;
}

@media (max-width: 768px) {
  .page-header {
    padding: 100px 24px 60px;
  }

  .page-header h1 {
    font-size: 36px;
  }

  .page-header p {
    font-size: 18px;
  }

  .privacy-container {
    padding: 40px 24px;
  }

  .privacy-section h2 {
    font-size: 28px;
  }

  .privacy-section h3 {
    font-size: 20px;
  }
}
`

function PrivacyPolicy({ onLoginClick, onLogoClick, onNavigateToCompany }) {
  return (
    <>
      <style>{styles}</style>
      <div className="privacy-page">
        <Navbar 
          onLoginClick={onLoginClick}
          onLogoClick={onLogoClick}
          onNavigateToCompany={onNavigateToCompany}
        />
        
        <div className="page-header">
          <h1>Privacy Policy</h1>
          <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
        </div>

        <div className="privacy-container">
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              AthenaVI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered video creation platform and services.
            </p>
            <p>
              By using AthenaVI, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </div>

          <div className="privacy-section">
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Avatar preferences, voice settings, and customization options</li>
              <li><strong>Content:</strong> Videos, scripts, images, and other content you upload or create using our platform</li>
              <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely through third-party payment processors)</li>
              <li><strong>Communications:</strong> Messages, feedback, and support requests you send to us</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you use our services, we automatically collect certain information, including:</p>
            <ul>
              <li><strong>Usage Data:</strong> How you interact with our platform, features used, and time spent</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
              <li><strong>Log Data:</strong> Access times, pages viewed, and actions taken on our platform</li>
              <li><strong>Cookies and Tracking Technologies:</strong> Information collected through cookies, web beacons, and similar technologies</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Personalize your experience and deliver content relevant to your interests</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </div>

          <div className="privacy-section">
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            
            <h3>4.1 Service Providers</h3>
            <p>We may share information with third-party service providers who perform services on our behalf, such as:</p>
            <ul>
              <li>Cloud hosting and storage providers</li>
              <li>Payment processors</li>
              <li>Analytics and monitoring services</li>
              <li>Customer support platforms</li>
            </ul>

            <h3>4.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to valid requests by public authorities.</p>

            <h3>4.3 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>
          </div>

          <div className="privacy-section">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data centers and infrastructure</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </div>

          <div className="privacy-section">
            <h2>6. Your Rights and Choices</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Cookie Preferences:</strong> Manage cookie settings through your browser</li>
            </ul>
            <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section below.</p>
          </div>

          <div className="privacy-section">
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
            </p>
          </div>

          <div className="privacy-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately, and we will take steps to delete such information.
            </p>
          </div>

          <div className="privacy-section">
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to the transfer of your information to these countries.
            </p>
          </div>

          <div className="privacy-section">
            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </div>

          <div className="contact-info">
            <h3>11. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> privacy@athenavi.com</li>
              <li><strong>Address:</strong> AthenaVI Privacy Team, [Your Address]</li>
            </ul>
            <p>We will respond to your inquiry within 30 days.</p>
          </div>
        </div>

        <Footer onNavigateToCompany={onNavigateToCompany} />
      </div>
    </>
  )
}

export default PrivacyPolicy

