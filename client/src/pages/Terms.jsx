import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  // Scroll to top when component mounts
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

  return (
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Terms and Conditions</h1>
        <p style={metaStyles}>
          <strong>Last Updated:</strong> October 11, 2025<br />
          <strong>Effective Date:</strong> October 11, 2025
        </p>
      </div>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>1. Introduction and Acceptance</h2>
        <p>
          These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") 
          and Versoek ("we," "us," or "our"), governing your access to and use of the Versoek corporate carpooling platform 
          (the "Service").
        </p>
        <p>
          By registering for an account, accessing, or using the Service, you acknowledge that you have read, understood, 
          and agree to be bound by these Terms and our <Link to="/privacy">Privacy Policy</Link>. If you do not agree to 
          these Terms, you must not access or use the Service.
        </p>
        <p>
          These Terms apply to all users of the Service, including both drivers and passengers. The Service is provided 
          exclusively on a business-to-business (B2B) basis for corporate carpooling purposes.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>2. Definitions</h2>
        <p>For the purposes of these Terms, the following definitions apply:</p>
        <ul style={listStyles}>
          <li><strong style={strongStyles}>"Service"</strong> means the Versoek software-as-a-service platform, including all associated features, functionalities, and applications accessible via versoek.nl.</li>
          <li><strong style={strongStyles}>"User"</strong> means any individual who creates an account and uses the Service, whether as a driver or passenger.</li>
          <li><strong style={strongStyles}>"Driver"</strong> means a User who creates and offers rides on the Service.</li>
          <li><strong style={strongStyles}>"Passenger"</strong> means a User who requests to join rides offered by Drivers.</li>
          <li><strong style={strongStyles}>"Ride"</strong> means a carpooling journey created by a Driver and made available through the Service.</li>
          <li><strong style={strongStyles}>"Account"</strong> means the user profile created when registering for the Service.</li>
          <li><strong style={strongStyles}>"Company"</strong> or <strong style={strongStyles}>"Organization"</strong> means the corporate entity that has authorized use of the Service for its employees.</li>
          <li><strong style={strongStyles}>"Personal Data"</strong> means any information relating to an identified or identifiable natural person as defined under the General Data Protection Regulation (GDPR).</li>
        </ul>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>3. Eligibility and Account Registration</h2>
        
        <h3 style={h3Styles}>3.1 Eligibility</h3>
        <p>To use the Service, you must:</p>
        <ul style={listStyles}>
          <li>Be at least 18 years of age</li>
          <li>Be an employee or authorized representative of a Company using the Service</li>
          <li>Hold a valid driver's license if you intend to offer rides as a Driver</li>
          <li>Have the legal capacity to enter into binding contracts under Dutch law</li>
        </ul>

        <h3 style={h3Styles}>3.2 Account Creation</h3>
        <p>When creating an Account, you agree to:</p>
        <ul style={listStyles}>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and promptly update your Account information</li>
          <li>Maintain the security and confidentiality of your login credentials</li>
          <li>Notify us immediately of any unauthorized access to your Account</li>
          <li>Accept full responsibility for all activities conducted through your Account</li>
        </ul>

        <h3 style={h3Styles}>3.3 Account Restrictions</h3>
        <p>You may not:</p>
        <ul style={listStyles}>
          <li>Create more than one Account per person</li>
          <li>Share your Account credentials with others</li>
          <li>Transfer or assign your Account to another person</li>
          <li>Use another person's Account without authorization</li>
        </ul>
        <p>We reserve the right to suspend or terminate Accounts that violate these restrictions.</p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>4. License Grant and Restrictions</h2>
        
        <h3 style={h3Styles}>4.1 Limited License</h3>
        <p>
          Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable 
          license to access and use the Service for your personal, non-commercial carpooling purposes in connection with 
          your employment.
        </p>

        <h3 style={h3Styles}>4.2 Restrictions on Use</h3>
        <p>You agree not to:</p>
        <ul style={listStyles}>
          <li>Copy, modify, or create derivative works of the Service</li>
          <li>Reverse engineer, decompile, or disassemble any aspect of the Service</li>
          <li>Access the Service to build a competitive product or service</li>
          <li>Use automated scripts, bots, or scrapers to access the Service</li>
          <li>Circumvent any security features or access restrictions</li>
          <li>Remove, alter, or obscure any proprietary notices on the Service</li>
          <li>Resell, sublicense, or distribute access to the Service</li>
        </ul>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>5. User Conduct and Acceptable Use</h2>
        
        <h3 style={h3Styles}>5.1 Prohibited Activities</h3>
        <p>When using the Service, you agree not to:</p>
        <ul style={listStyles}>
          <li>Violate any applicable laws, regulations, or third-party rights</li>
          <li>Post false, misleading, or fraudulent ride information</li>
          <li>Harass, threaten, or discriminate against other Users</li>
          <li>Engage in any form of spam or commercial solicitation</li>
          <li>Impersonate another person or entity</li>
          <li>Upload viruses, malware, or other malicious code</li>
          <li>Interfere with the proper functioning of the Service</li>
          <li>Collect or harvest personal information of other Users</li>
          <li>Use the Service for any illegal or unauthorized purpose</li>
        </ul>

        <h3 style={h3Styles}>5.2 Driver Responsibilities</h3>
        <p>As a Driver, you agree to:</p>
        <ul style={listStyles}>
          <li>Possess a valid driver's license and vehicle registration</li>
          <li>Maintain adequate vehicle insurance as required by Dutch law</li>
          <li>Ensure your vehicle is safe and roadworthy</li>
          <li>Provide accurate ride details (time, location, available seats)</li>
          <li>Honor confirmed ride commitments or provide reasonable notice of cancellation</li>
          <li>Comply with all traffic laws and regulations</li>
          <li>Treat Passengers with respect and courtesy</li>
        </ul>

        <h3 style={h3Styles}>5.3 Passenger Responsibilities</h3>
        <p>As a Passenger, you agree to:</p>
        <ul style={listStyles}>
          <li>Arrive at the designated pickup location on time</li>
          <li>Treat Drivers with respect and courtesy</li>
          <li>Honor confirmed ride bookings or provide reasonable notice of cancellation</li>
          <li>Follow reasonable instructions from the Driver during the ride</li>
          <li>Not bring prohibited items (weapons, illegal substances, etc.) into the vehicle</li>
        </ul>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>6. Ride Creation and Booking</h2>
        
        <h3 style={h3Styles}>6.1 Ride Posting</h3>
        <p>
          Drivers may create single or recurring ride offers through the Service. All ride information must be accurate 
          and complete, including departure time, start and end locations, and available seats.
        </p>

        <h3 style={h3Styles}>6.2 Booking Process</h3>
        <p>
          Passengers may request to join available rides. Drivers have sole discretion to accept or reject booking requests. 
          Acceptance creates a mutual commitment between Driver and Passenger to participate in the ride.
        </p>

        <h3 style={h3Styles}>6.3 Cancellation Policy</h3>
        <p>
          Users may cancel rides or bookings through the Service. We encourage users to provide as much advance notice as 
          possible when cancelling to allow others to make alternative arrangements.
        </p>

        <h3 style={h3Styles}>6.4 Platform Role</h3>
        <p>
          Versoek acts solely as an intermediary platform connecting Drivers and Passengers. We do not provide transportation 
          services and are not a party to any agreements between Users regarding rides.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>7. Fees and Payment</h2>
        
        <h3 style={h3Styles}>7.1 Corporate Subscription</h3>
        <p>
          The Service is provided to Companies on a subscription basis. Individual Users authorized by their Company may 
          access the Service at no personal cost.
        </p>

        <h3 style={h3Styles}>7.2 Ride Contributions</h3>
        <p>
          Any cost-sharing arrangements between Drivers and Passengers are strictly between those Users. Versoek does not 
          facilitate, process, or take responsibility for any financial transactions between Users.
        </p>

        <h3 style={h3Styles}>7.3 Company Billing</h3>
        <p>
          Companies using the Service will be billed according to the terms specified in their Service Order or subscription 
          agreement. Payment is due within 14 calendar days of the invoice date unless otherwise agreed.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>8. Intellectual Property Rights</h2>
        
        <h3 style={h3Styles}>8.1 Versoek's Ownership</h3>
        <p>
          The Service, including all software, designs, text, graphics, logos, trademarks, and other content, is owned by 
          Versoek and protected by Dutch and international intellectual property laws.
        </p>

        <h3 style={h3Styles}>8.2 User Content</h3>
        <p>
          You retain ownership of any content you submit to the Service, including profile information and ride details. 
          By submitting content, you grant Versoek a worldwide, non-exclusive, royalty-free license to use, display, and 
          process that content solely for operating and improving the Service.
        </p>

        <h3 style={h3Styles}>8.3 Feedback</h3>
        <p>
          Any feedback, suggestions, or ideas you provide about the Service become the property of Versoek, and we may 
          use them without any obligation to you.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>9. Privacy and Data Protection</h2>
        
        <h3 style={h3Styles}>9.1 Privacy Policy</h3>
        <p>
          Our collection, use, and protection of your Personal Data is governed by our <Link to="/privacy">Privacy Policy</Link>, 
          which is incorporated into these Terms by reference.
        </p>

        <h3 style={h3Styles}>9.2 GDPR Compliance</h3>
        <p>
          We process Personal Data in accordance with the General Data Protection Regulation (GDPR) and applicable Dutch 
          data protection laws. You have rights regarding your Personal Data as described in our Privacy Policy.
        </p>

        <h3 style={h3Styles}>9.3 Data Sharing with Other Users</h3>
        <p>
          By using the Service, you acknowledge that certain information (such as your name and ride details) will be 
          shared with other Users to facilitate carpooling.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>10. Disclaimers and Limitation of Liability</h2>
        
        <h3 style={h3Styles}>10.1 Service "As Is"</h3>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
          We do not warrant that the Service will be uninterrupted, error-free, or secure.
        </p>

        <h3 style={h3Styles}>10.2 No Liability for User Interactions</h3>
        <p>
          Versoek is not responsible for the conduct of Users or any disputes between Users. We do not verify the accuracy 
          of user-provided information or conduct background checks on Users.
        </p>

        <h3 style={h3Styles}>10.3 Transportation Safety</h3>
        <p>
          Versoek does not guarantee the safety, quality, or legality of rides offered through the Service. Users participate 
          in carpooling arrangements at their own risk. Drivers are solely responsible for vehicle safety, insurance, and 
          compliance with traffic laws.
        </p>

        <h3 style={h3Styles}>10.4 Limitation of Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY DUTCH LAW, VERSOEK'S TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED 
          TO THE SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOUR COMPANY FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
        </p>

        <h3 style={h3Styles}>10.5 Excluded Damages</h3>
        <p>
          VERSOEK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING 
          LOST PROFITS, DATA LOSS, OR PERSONAL INJURY, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h3 style={h3Styles}>10.6 Legal Exceptions</h3>
        <p>
          Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, 
          fraud, or any other liability that cannot be excluded under Dutch law.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>11. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Versoek and its officers, directors, employees, and agents 
          from any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from:
        </p>
        <ul style={listStyles}>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of another party</li>
          <li>Your conduct in connection with rides arranged through the Service</li>
        </ul>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>12. Term and Termination</h2>
        
        <h3 style={h3Styles}>12.1 Term</h3>
        <p>These Terms remain in effect as long as you access or use the Service.</p>

        <h3 style={h3Styles}>12.2 Termination by User</h3>
        <p>
          You may terminate your Account at any time through the Account settings or by contacting us at info@versoek.nl. 
          Termination will result in deletion of your Personal Data in accordance with our Privacy Policy.
        </p>

        <h3 style={h3Styles}>12.3 Termination by Versoek</h3>
        <p>We may suspend or terminate your Account immediately if you:</p>
        <ul style={listStyles}>
          <li>Violate these Terms</li>
          <li>Engage in fraudulent or illegal activities</li>
          <li>Pose a safety risk to other Users</li>
          <li>Damage the reputation or operation of the Service</li>
        </ul>

        <h3 style={h3Styles}>12.4 Effect of Termination</h3>
        <p>
          Upon termination, your license to use the Service immediately ceases. All pending rides will be cancelled, 
          and you will no longer have access to your Account. Sections of these Terms that by their nature should survive 
          termination will remain in effect.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>13. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify Users of material changes via email or 
          through the Service at least 30 days before the changes take effect.
        </p>
        <p>
          Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms. 
          If you do not agree to the changes, you must stop using the Service and terminate your Account.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>14. Governing Law and Dispute Resolution</h2>
        
        <h3 style={h3Styles}>14.1 Governing Law</h3>
        <p>
          These Terms are governed by and construed in accordance with the laws of the Netherlands, without regard to 
          its conflict of law provisions.
        </p>

        <h3 style={h3Styles}>14.2 Jurisdiction</h3>
        <p>
          Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction 
          of the competent courts in the Netherlands.
        </p>

        <h3 style={h3Styles}>14.3 Dispute Resolution</h3>
        <p>
          Before initiating formal legal proceedings, parties agree to attempt to resolve disputes through good-faith 
          negotiation. If negotiation fails, mediation through a recognized Dutch mediation service may be pursued.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>15. General Provisions</h2>
        
        <h3 style={h3Styles}>15.1 Entire Agreement</h3>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire agreement between you and Versoek regarding 
          the Service.
        </p>

        <h3 style={h3Styles}>15.2 Severability</h3>
        <p>
          If any provision of these Terms is found to be invalid or unenforceable, that provision shall be limited or 
          eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force.
        </p>

        <h3 style={h3Styles}>15.3 Waiver</h3>
        <p>
          Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
        </p>

        <h3 style={h3Styles}>15.4 Assignment</h3>
        <p>
          You may not assign or transfer these Terms or your Account without our prior written consent. We may assign 
          these Terms without restriction.
        </p>

        <h3 style={h3Styles}>15.5 No Third-Party Beneficiaries</h3>
        <p>These Terms do not create any third-party beneficiary rights.</p>

        <h3 style={h3Styles}>15.6 Force Majeure</h3>
        <p>
          Versoek shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable 
          control, including natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, 
          fire, floods, accidents, or network infrastructure failures.
        </p>
      </section>

      <section style={sectionStyles}>
        <h2 style={h2Styles}>16. Contact Information</h2>
        <p>For questions, concerns, or notices regarding these Terms, please contact us:</p>
        <p style={{ marginTop: '15px' }}>
          <strong>Versoek</strong><br />
          Email: <a href="mailto:info@versoek.nl" style={{ color: '#2c5f2d' }}>info@versoek.nl</a><br />
          Website: <a href="https://versoek.nl" target="_blank" rel="noopener noreferrer" style={{ color: '#2c5f2d' }}>https://versoek.nl</a>
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
          By using the Versoek Service, you acknowledge that you have read, understood, and agree to be bound by 
          these Terms and Conditions.
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

export default Terms;
