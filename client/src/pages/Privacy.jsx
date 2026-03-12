import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageStyles = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333'
  };

  const headerStyles = {
    borderBottom: '3px solid #2c5f2d',
    paddingBottom: '20px',
    marginBottom: '30px'
  };

  const titleStyles = {
    fontSize: '2.5rem',
    color: '#2c5f2d',
    marginBottom: '10px'
  };

  const metaStyles = {
    color: '#666',
    fontSize: '0.9rem'
  };

  const sectionStyles = {
    marginBottom: '30px'
  };

  const h2Styles = {
    fontSize: '1.8rem',
    color: '#2c5f2d',
    marginTop: '40px',
    marginBottom: '15px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '10px'
  };

  const h3Styles = {
    fontSize: '1.3rem',
    color: '#2c5f2d',
    marginTop: '25px',
    marginBottom: '10px'
  };

  const listStyles = {
    marginLeft: '20px',
    marginBottom: '15px'
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    border: '1px solid #ddd'
  };

  const thStyles = {
    backgroundColor: '#2c5f2d',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
  };

  const tdStyles = {
    padding: '12px',
    borderBottom: '1px solid #ddd'
  };

  const backButtonStyles = {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#2c5f2d',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    marginTop: '40px',
    transition: 'background-color 0.3s'
  };

  const strongStyles = {
    color: '#2c5f2d',
    fontWeight: 'bold'
  };

  const highlightBoxStyles = {
    backgroundColor: '#f0f7f0',
    border: '1px solid #2c5f2d',
    borderRadius: '5px',
    padding: '20px',
    marginBottom: '20px'
  };

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Privacy Policy</h1>
        <p style={metaStyles}>
          <strong>Last Updated:</strong> October 11, 2025<br />
          <strong>Effective Date:</strong> October 11, 2025
        </p>
      </div>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>1. Introduction</h2>
        <p>
          Versoek ("we," "us," or "our") is committed to protecting the privacy and security of your personal data. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
          corporate carpooling platform (the "Service") accessible at versoek.nl.
        </p>
        <p>
          This Privacy Policy is designed to comply with the General Data Protection Regulation (GDPR) and Dutch data 
          protection laws. By using the Service, you acknowledge that you have read and understood this Privacy Policy 
          and our <Link to="/terms">Terms and Conditions</Link>.
        </p>
        <div style={highlightBoxStyles}>
          <strong>Your Rights:</strong> Under GDPR, you have significant rights regarding your personal data, including 
          the right to access, correct, delete, and export your data. See Section 9 for complete details.
        </div>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>2. Data Controller Information</h2>
        <p>
          Versoek is the data controller responsible for your personal data collected through the Service.
        </p>
        <p style={{ marginTop: '15px' }}>
          <strong>Contact Information:</strong><br />
          Versoek<br />
          Email: <a href="mailto:info@versoek.nl" style={{ color: '#2c5f2d' }}>info@versoek.nl</a><br />
          Website: <a href="https://versoek.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#2c5f2d' }}>https://versoek.nl</a>
        </p>
        <p>
          For any questions regarding this Privacy Policy or our data processing practices, please contact us at the 
          email address above.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>3. Personal Data We Collect</h2>
        
        <h3 style={h3Styles}>3.1 Data You Provide Directly</h3>
        <p>When you register for and use the Service, we collect the following personal data:</p>
        <ul style={listStyles}>
          <li><strong style={strongStyles}>Account Information:</strong> Name, email address, password (encrypted)</li>
          <li><strong style={strongStyles}>Profile Information:</strong> Optional profile photo, contact preferences</li>
          <li><strong style={strongStyles}>Ride Information:</strong> Pickup and drop-off locations, departure times, available seats, recurring ride schedules</li>
          <li><strong style={strongStyles}>Booking Information:</strong> Ride requests, booking confirmations, cancellations</li>
          <li><strong style={strongStyles}>Communications:</strong> Messages sent through the Service, contact form inquiries, email correspondence</li>
        </ul>

        <h3 style={h3Styles}>3.2 Data Collected Automatically</h3>
        <p>When you access and use the Service, we automatically collect:</p>
        <ul style={listStyles}>
          <li><strong style={strongStyles}>Technical Data:</strong> IP address, browser type and version, device type, operating system</li>
          <li><strong style={strongStyles}>Usage Data:</strong> Pages visited, features used, time spent on the Service, click patterns</li>
          <li><strong style={strongStyles}>Location Data:</strong> Approximate location based on IP address (not GPS tracking)</li>
          <li><strong style={strongStyles}>Cookies and Similar Technologies:</strong> See Section 11 for details</li>
        </ul>

        <h3 style={h3Styles}>3.3 Data from Third Parties</h3>
        <p>We may receive data from:</p>
        <ul style={listStyles}>
          <li><strong style={strongStyles}>Your Employer:</strong> Name, work email address, employment status (for corporate account setup)</li>
          <li><strong style={strongStyles}>Analytics Providers:</strong> Aggregated usage statistics (if you consent to analytics cookies)</li>
          <li><strong style={strongStyles}>Map Services:</strong> Location data for mapping functionality (Leaflet)</li>
        </ul>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>4. How We Use Your Personal Data</h2>
        <p>We process your personal data for the following purposes:</p>

        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Purpose</th>
              <th style={thStyles}>Data Used</th>
              <th style={thStyles}>Legal Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyles}>Account creation and authentication</td>
              <td style={tdStyles}>Name, email, password</td>
              <td style={tdStyles}>Contract performance</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}>Facilitating ride matching and bookings</td>
              <td style={tdStyles}>Ride details, locations, times</td>
              <td style={tdStyles}>Contract performance</td>
            </tr>
            <tr>
              <td style={tdStyles}>Sending notifications and communications</td>
              <td style={tdStyles}>Email address, notification preferences</td>
              <td style={tdStyles}>Contract performance, Consent</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}>Platform improvement and analytics</td>
              <td style={tdStyles}>Usage data, technical data</td>
              <td style={tdStyles}>Legitimate interests, Consent</td>
            </tr>
            <tr>
              <td style={tdStyles}>Customer support</td>
              <td style={tdStyles}>Contact information, communications</td>
              <td style={tdStyles}>Contract performance, Legitimate interests</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}>Security and fraud prevention</td>
              <td style={tdStyles}>IP address, usage patterns</td>
              <td style={tdStyles}>Legitimate interests, Legal obligation</td>
            </tr>
            <tr>
              <td style={tdStyles}>Compliance with legal obligations</td>
              <td style={tdStyles}>All relevant data</td>
              <td style={tdStyles}>Legal obligation</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>5. Legal Basis for Processing</h2>
        <p>Under GDPR, we must have a legal basis for processing your personal data. We rely on the following:</p>

        <h3 style={h3Styles}>5.1 Contract Performance</h3>
        <p>
          Processing is necessary to provide the Service you have requested, including creating your account, matching 
          you with rides, and facilitating bookings.
        </p>

        <h3 style={h3Styles}>5.2 Consent</h3>
        <p>
          You provide explicit consent for certain processing activities, such as receiving marketing communications, 
          analytics cookies, and optional data collection. You may withdraw consent at any time.
        </p>

        <h3 style={h3Styles}>5.3 Legitimate Interests</h3>
        <p>
          We process data based on our legitimate interests in operating, improving, and securing the Service, provided 
          these interests do not override your fundamental rights and freedoms.
        </p>

        <h3 style={h3Styles}>5.4 Legal Obligation</h3>
        <p>
          We process data when required to comply with legal obligations, such as tax laws, law enforcement requests, 
          or regulatory requirements.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>6. Data Sharing and Disclosure</h2>
        
        <h3 style={h3Styles}>6.1 Sharing with Other Users</h3>
        <p>
          To facilitate carpooling, certain information is shared between users:
        </p>
        <ul style={listStyles}>
          <li>Drivers can see passenger names and pickup locations for accepted bookings</li>
          <li>Passengers can see driver names and ride details for rides they join</li>
          <li>This sharing is essential to the Service and based on contract performance</li>
        </ul>

        <h3 style={h3Styles}>6.2 Service Providers</h3>
        <p>We share data with trusted third-party service providers who assist in operating the Service:</p>
        <ul style={listStyles}>
          <li><strong style={strongStyles}>Email Service Providers:</strong> To send notifications and communications</li>
          <li><strong style={strongStyles}>Analytics Services:</strong> Google Analytics (only with your consent)</li>
          <li><strong style={strongStyles}>Hosting Providers:</strong> For secure data storage and service delivery</li>
          <li><strong style={strongStyles}>Map Services:</strong> For location-based features</li>
        </ul>
        <p>All service providers are contractually obligated to protect your data and use it only for specified purposes.</p>

        <h3 style={h3Styles}>6.3 Your Employer</h3>
        <p>
          If you access the Service through a corporate account, we may share aggregated, anonymized usage statistics 
          with your employer (e.g., total rides created, CO₂ savings). We do not share individual ride details or 
          personal information without your explicit consent.
        </p>

        <h3 style={h3Styles}>6.4 Legal Requirements</h3>
        <p>We may disclose your data when required by law or to:</p>
        <ul style={listStyles}>
          <li>Comply with legal processes, court orders, or government requests</li>
          <li>Enforce our Terms and Conditions</li>
          <li>Protect the rights, property, or safety of Versoek, our users, or the public</li>
          <li>Prevent fraud, security breaches, or illegal activities</li>
        </ul>

        <h3 style={h3Styles}>6.5 Business Transfers</h3>
        <p>
          In the event of a merger, acquisition, or sale of assets, your personal data may be transferred to the 
          acquiring entity. You will be notified of any such change.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>7. International Data Transfers</h2>
        <p>
          Your personal data is processed and stored within the European Economic Area (EEA). If we transfer data 
          outside the EEA, we ensure adequate protection through:
        </p>
        <ul style={listStyles}>
          <li>Standard Contractual Clauses approved by the European Commission</li>
          <li>Adequacy decisions recognizing equivalent data protection</li>
          <li>Other legally compliant transfer mechanisms under GDPR</li>
        </ul>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>8. Data Retention</h2>
        <p>We retain your personal data only as long as necessary for the purposes outlined in this Privacy Policy:</p>

        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Data Type</th>
              <th style={thStyles}>Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyles}>Active account data</td>
              <td style={tdStyles}>Duration of account existence</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}>Completed ride data</td>
              <td style={tdStyles}>90 days after ride completion, then anonymized</td>
            </tr>
            <tr>
              <td style={tdStyles}>Deleted account data</td>
              <td style={tdStyles}>30 days (to allow for recovery), then permanently deleted</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}>Rejected ride requests</td>
              <td style={tdStyles}>30 days, then deleted</td>
            </tr>
            <tr>
              <td style={tdStyles}>Financial records (if applicable)</td>
              <td style={tdStyles}>7 years (tax compliance requirement)</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}>Security logs</td>
              <td style={tdStyles}>1 year</td>
            </tr>
            <tr>
              <td style={tdStyles}>Marketing consent records</td>
              <td style={tdStyles}>Duration of consent plus 3 years</td>
            </tr>
          </tbody>
        </table>

        <p>
          After the retention period expires, we securely delete or anonymize your data so it can no longer identify you.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>9. Your Rights Under GDPR</h2>
        <p>
          As a data subject under GDPR, you have the following rights regarding your personal data:
        </p>

        <h3 style={h3Styles}>9.1 Right to Access</h3>
        <p>
          You have the right to request a copy of all personal data we hold about you. We will provide this information 
          in a structured, commonly used, and machine-readable format.
        </p>

        <h3 style={h3Styles}>9.2 Right to Rectification</h3>
        <p>
          You can request correction of inaccurate or incomplete personal data. You can update most information directly 
          through your account settings.
        </p>

        <h3 style={h3Styles}>9.3 Right to Erasure ("Right to be Forgotten")</h3>
        <p>
          You can request deletion of your personal data when:
        </p>
        <ul style={listStyles}>
          <li>The data is no longer necessary for the purposes it was collected</li>
          <li>You withdraw consent (where processing was based on consent)</li>
          <li>You object to processing and there are no overriding legitimate grounds</li>
          <li>The data was unlawfully processed</li>
          <li>Deletion is required to comply with legal obligations</li>
        </ul>

        <h3 style={h3Styles}>9.4 Right to Data Portability</h3>
        <p>
          You can request to receive your personal data in a portable format and transmit it to another service provider.
        </p>

        <h3 style={h3Styles}>9.5 Right to Restrict Processing</h3>
        <p>
          You can request that we limit the processing of your personal data in certain circumstances, such as while 
          we verify the accuracy of disputed data.
        </p>

        <h3 style={h3Styles}>9.6 Right to Object</h3>
        <p>
          You can object to processing based on legitimate interests or for direct marketing purposes. We will cease 
          processing unless we have compelling legitimate grounds.
        </p>

        <h3 style={h3Styles}>9.7 Right to Withdraw Consent</h3>
        <p>
          Where processing is based on consent, you can withdraw that consent at any time. This does not affect the 
          lawfulness of processing before withdrawal.
        </p>

        <h3 style={h3Styles}>9.8 Right to Lodge a Complaint</h3>
        <p>
          You have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens):
        </p>
        <p style={{ marginLeft: '20px', marginTop: '10px' }}>
          <strong>Autoriteit Persoonsgegevens</strong><br />
          Website: <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#2c5f2d' }}>autoriteitpersoonsgegevens.nl</a><br />
          Phone: (+31) - (0)70 - 888 85 00
        </p>

        <div style={highlightBoxStyles}>
          <strong>How to Exercise Your Rights:</strong><br />
          To exercise any of these rights, please contact us at <a href="mailto:info@versoek.nl" style={{ color: '#2c5f2d' }}>info@versoek.nl</a>. 
          We will respond to your request within 30 days. You can also delete your account directly through the 
          account settings page.
        </div>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>10. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal data against 
          unauthorized access, alteration, disclosure, or destruction:
        </p>
        <ul style={listStyles}>
          <li><strong style={strongStyles}>Encryption:</strong> Passwords are encrypted using bcrypt hashing. HTTPS encryption protects data in transit.</li>
          <li><strong style={strongStyles}>Access Controls:</strong> Access to personal data is restricted to authorized personnel only.</li>
          <li><strong style={strongStyles}>Authentication:</strong> Secure JWT (JSON Web Token) authentication for user sessions.</li>
          <li><strong style={strongStyles}>Database Security:</strong> Secure database configuration with restricted access and regular backups.</li>
          <li><strong style={strongStyles}>Regular Updates:</strong> Software and security patches are applied regularly.</li>
          <li><strong style={strongStyles}>Monitoring:</strong> Security monitoring and logging to detect potential breaches.</li>
        </ul>
        <p>
          While we implement strong security measures, no method of transmission over the internet is 100% secure. 
          We cannot guarantee absolute security of your data.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>11. Cookies and Tracking Technologies</h2>
        
        <h3 style={h3Styles}>11.1 What Are Cookies</h3>
        <p>
          Cookies are small text files stored on your device that help us provide and improve the Service.
        </p>

        <h3 style={h3Styles}>11.2 Types of Cookies We Use</h3>
        
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Cookie Type</th>
              <th style={thStyles}>Purpose</th>
              <th style={thStyles}>Consent Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyles}><strong>Strictly Necessary</strong></td>
              <td style={tdStyles}>Authentication, session management, security</td>
              <td style={tdStyles}>No (essential for service)</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}><strong>Functional</strong></td>
              <td style={tdStyles}>Language preferences, user settings</td>
              <td style={tdStyles}>No (enhances functionality)</td>
            </tr>
            <tr>
              <td style={tdStyles}><strong>Analytics</strong></td>
              <td style={tdStyles}>Usage statistics, performance monitoring (Google Analytics)</td>
              <td style={tdStyles}>Yes</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={tdStyles}><strong>Marketing</strong></td>
              <td style={tdStyles}>Advertising, personalized content</td>
              <td style={tdStyles}>Yes (currently not used)</td>
            </tr>
          </tbody>
        </table>

        <h3 style={h3Styles}>11.3 Managing Cookies</h3>
        <p>
          You can control cookies through:
        </p>
        <ul style={listStyles}>
          <li>Our cookie consent banner when you first visit the Service</li>
          <li>The cookie settings page accessible from your account</li>
          <li>Your browser settings to block or delete cookies</li>
        </ul>
        <p>
          Note that disabling necessary cookies may affect the functionality of the Service.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>12. Children's Privacy</h2>
        <p>
          The Service is not intended for individuals under the age of 18. We do not knowingly collect personal data 
          from children. If we become aware that we have collected data from a child without parental consent, we will 
          take steps to delete that information promptly.
        </p>
        <p>
          If you believe we have collected data from a child, please contact us immediately at{' '}
          <a href="mailto:info@versoek.nl" style={{ color: '#2c5f2d' }}>info@versoek.nl</a>.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>13. Automated Decision-Making and Profiling</h2>
        <p>
          We do not engage in automated decision-making or profiling that produces legal effects or similarly 
          significantly affects you. Ride matching is based on user-specified criteria (location, time) without 
          automated profiling of individuals.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>14. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal 
          requirements, or other factors.
        </p>
        <p>
          When we make material changes, we will:
        </p>
        <ul style={listStyles}>
          <li>Update the "Last Updated" date at the top of this policy</li>
          <li>Notify you via email to the address associated with your account</li>
          <li>Display a prominent notice on the Service</li>
          <li>Provide at least 30 days' notice before the changes take effect</li>
        </ul>
        <p>
          Your continued use of the Service after the effective date of the updated Privacy Policy constitutes 
          acceptance of the changes. If you do not agree to the changes, you should stop using the Service and 
          delete your account.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>15. Contact Us</h2>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data processing 
          practices, please contact us:
        </p>
        <p style={{ marginTop: '15px', marginLeft: '20px' }}>
          <strong>Versoek</strong><br />
          Email: <a href="mailto:info@versoek.nl" style={{ color: '#2c5f2d' }}>info@versoek.nl</a><br />
          Website: <a href="https://versoek.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#2c5f2d' }}>https://versoek.nl</a>
        </p>
        <p>
          We will respond to all requests within 30 days as required by GDPR.
        </p>
      </section>

      <div style={{ 
        borderTop: '2px solid #e0e0e0', 
        paddingTop: '30px', 
        marginTop: '50px',
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666'
      }}>
        <p>
          By using the Versoek Service, you acknowledge that you have read and understood this Privacy Policy and 
          consent to the collection, use, and disclosure of your personal data as described herein.
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/" style={backButtonStyles}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Privacy;
