import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

const CloseButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      className="legal-close-btn"
      onClick={() => navigate(-1)}
      aria-label="Close"
    >
      ✕
    </button>
  );
};

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <CloseButton />
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: March 2, 2026</p>

        <section>
          <h2>1. What we collect</h2>
          <p>
            Peer Study Hub collects account information (email, username), profile information
            (avatar and bio if provided), and content you create in the platform such as posts,
            comments, reactions, and chat messages.
          </p>
        </section>

        <section>
          <h2>2. Why we collect it</h2>
          <p>
            We use your data to authenticate your account, show your profile in the app,
            display your content to other users, and operate core features such as feed,
            chat, moderation, and security monitoring.
          </p>
        </section>

        <section>
          <h2>3. How we protect data</h2>
          <p>
            Passwords are stored as hashes, access is controlled by authentication tokens,
            and role-based authorization is used for admin actions. Uploaded images are
            validated by type and file signature checks to reduce malicious upload risks.
          </p>
        </section>

        <section>
          <h2>4. Data sharing</h2>
          <p>
            We do not sell personal data. Information is shared only as needed to run the
            platform (for example, between internal services in the project architecture)
            and to meet legal obligations when required.
          </p>
        </section>

        <section>
          <h2>5. Retention and deletion</h2>
          <p>
            Account and content data are retained while your account is active. You may request
            account deletion; related profile and user-generated content will be removed or
            anonymized according to project and academic constraints.
          </p>
        </section>

        <section>
          <h2>6. Your rights</h2>
          <p>
            You may request access to your data, correction of inaccurate profile information,
            or deletion of your account data where applicable.
          </p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            For privacy questions, contact the project maintainers through the repository team
            communication channel.
          </p>
        </section>
      </div>
    </div>
  );
};

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-card">
        <CloseButton />
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: March 2, 2026</p>

        <section>
          <h2>1. Acceptance of terms</h2>
          <p>
            By creating an account or using Peer Study Hub, you agree to these terms and to
            follow platform rules.
          </p>
        </section>

        <section>
          <h2>2. Allowed use</h2>
          <p>
            The platform is for educational collaboration and communication. You agree to use
            it responsibly and lawfully.
          </p>
        </section>

        <section>
          <h2>3. Prohibited behavior</h2>
          <p>
            You must not upload malicious files, attempt unauthorized access, harass other users,
            impersonate others, or post illegal/harmful content.
          </p>
        </section>

        <section>
          <h2>4. User content</h2>
          <p>
            You keep ownership of your content, but you grant the platform permission to store,
            display, and process it to provide the service.
          </p>
        </section>

        <section>
          <h2>5. Moderation</h2>
          <p>
            Moderators and admins may review, approve, reject, or remove content that violates
            project rules or security requirements.
          </p>
        </section>

        <section>
          <h2>6. Account security</h2>
          <p>
            You are responsible for your account credentials and activity under your account.
            Report suspected unauthorized use promptly.
          </p>
        </section>

        <section>
          <h2>7. Service availability</h2>
          <p>
            The service is provided for project and educational purposes and may be changed,
            interrupted, or updated without notice.
          </p>
        </section>

        <section>
          <h2>8. Limitation of liability</h2>
          <p>
            To the maximum extent allowed in your jurisdiction, the project team is not liable
            for indirect or incidental damages resulting from use of the platform.
          </p>
        </section>
      </div>
    </div>
  );
};

export { PrivacyPolicyPage, TermsOfServicePage };