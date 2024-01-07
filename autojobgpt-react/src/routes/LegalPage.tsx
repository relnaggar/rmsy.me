import React, { useEffect } from 'react';
import { ReactComponent as BoxArrowUpRightIcon } from 'bootstrap-icons/icons/box-arrow-up-right.svg';


const LegalPage = (): React.JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section>
      <h2>Legal</h2>
      <section>
        <h3>Terms and Conditions</h3>

        <h4>Introduction</h4>
        <p>
          This section outlines the terms and conditions for the use of this demo application.
          By using this demo application, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and the Privacy Policy.
        </p>

        <h4>Intended Use</h4>
        <p>
          This application is a demonstration and is provided as-is for illustrative purposes only.
          This demo application should not be used as a tool for actual job applications or for storing any personal or sensitive data.
        </p>

        <h4>No Liability</h4>
        <p>
          The developer disclaims all liability for any loss, damage, or inconvenience arising as a result of the use of this demo application.
          Users are advised to use this demo application at their own risk.
        </p>

        <h4>User Responsibilities</h4>
        <p>
          Users are expected to use this demo application in a manner consistent with its intended demonstration purpose.
          Any misuse or use for critical purposes is not recommended and is at the user's discretion.
        </p>

        <h4>Modifications to Terms</h4>
        <p>
          These Terms and Conditions may be updated at any time.
          Users are encouraged to review this page periodically for any changes.
        </p>
      </section>

      <hr />

      <section>
        <h3>Privacy Policy</h3>

        <h4>Introduction</h4>
        <p>
          Your privacy is important.
          This section outlines policies regarding the collection, use, and handling of user data for this demo application.
        </p>

        <h4>Information Collection and Use</h4>
        <p>
          This demo application is a demonstration and does not intentionally collect or store personal information from users.
        </p>

        <h4>No Data Protection</h4>
        <p>
          This demo application does not implement comprehensive data protection measures, and is therefore not intended for the submission of personal or sensitive information.
        </p>

        <h4>Authentication Measures</h4>
        <p>
          This demo application uses authentication mechanisms to ensure that only the logged-in user can access, modify, or delete the information they have submitted.
          The exception to this is the developer, who has access to all data submitted by users, as described in the Data Storage section.
        </p>

        <h4>Data Transit</h4>
        <p>
          All data entered into this demo application is encrypted in transit.
          HTTPS is used to secure data as it travels between the user's device and the application's servers, protecting it from interception.
        </p>

        <h4>Data Storage</h4>
        <p>
          Data entered into this demo application is stored in a database without encryption.
          Therefore, the developer has the ability to access, modify, and delete any data submitted by users.
          This will be limited to situations where it is necessary for maintaining the application, such as debugging, fixing errors, or adding features.
          The developer will not access, modify or delete user data for any other purpose.
        </p>

        <h4>API Data Privacy</h4>
        <p>
          Any data entered into this demo application may be sent to OpenAI via their API Platform, and will therefore
          be subject to their API Platform's <a href="https://openai.com/enterprise-privacy" target="_blank" rel="noopener noreferrer">
            privacy policy <BoxArrowUpRightIcon className="ms-1" />
          </a>.
        </p>

        <h4>Changes to Privacy Policy</h4>
        <p>
          This Privacy Policy may be updated from time to time.
          Users are encouraged to review this page periodically for any changes.
        </p>
      </section>
    </section>  
  );
};

export default LegalPage;