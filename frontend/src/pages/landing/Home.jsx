import { Link } from "react-router-dom";

const StatCard = ({ title, subtitle, className = "" }) => (
  <div
    className={`rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}
  >
    <div className="text-lg font-semibold">{title}</div>
    <div className="text-sm mt-1 opacity-80">{subtitle}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
      {icon}
    </div>
    <h3 className="mt-4 font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const RoleCard = ({ title, desc, bullets, accent = "blue" }) => {
  const dot =
    accent === "green"
      ? "text-green-700"
      : accent === "slate"
      ? "text-slate-700"
      : "text-blue-700";

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm p-6 overflow-hidden">
      <div
        className={`absolute -top-10 -right-10 h-24 w-24 rounded-full opacity-20 ${
          accent === "green"
            ? "bg-green-300"
            : accent === "slate"
            ? "bg-slate-300"
            : "bg-blue-300"
        }`}
      />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
      <ul className="mt-4 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={`${dot} mt-0.5`}>✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              ▣
            </span>
            <span>QuizMaster</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            >
              Log in
            </Link>
                
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 items-center md:grid-cols-2">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              The complete
              <br className="hidden sm:block" />
              platform for quiz
              <br className="hidden sm:block" />
              assessment
            </h1>
            <p className="mt-5 text-gray-600 max-w-xl">
              Create engaging quizzes, assess student knowledge, and track
              performance with our comprehensive educational testing platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Get started
              </Link>
              <a
                href="#features"
                className="px-5 py-3 rounded-md border border-gray-300 font-medium hover:bg-gray-50"
              >
                Explore features
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="98% accuracy"
              subtitle="in automated grading"
              className="bg-blue-700 text-white border-blue-700"
            />
            <StatCard
              title="5min average"
              subtitle="quiz completion time"
              className="bg-white"
            />
            <StatCard
              title="10k+ quizzes"
              subtitle="created monthly"
              className="bg-white"
            />
            <StatCard
              title="Real-time"
              subtitle="results and analytics"
              className="bg-green-700 text-white border-green-700"
            />
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200" />

      {/* Features */}
      <section id="features" className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">
              Everything you need for online assessments
            </h2>
            <p className="mt-3 text-gray-600">
              Powerful features designed for educators and students
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="📝"
              title="Create"
              desc="Build comprehensive quizzes with multiple choice questions, set time limits, and customize difficulty levels."
            />
            <FeatureCard
              icon="⏱️"
              title="Test"
              desc="Conduct timed assessments with secure testing environments and automatic submission when time expires."
            />
            <FeatureCard
              icon="✅"
              title="Grade"
              desc="Automated grading provides instant feedback and detailed results for students and instructors."
            />
            <FeatureCard
              icon="📊"
              title="Analyze"
              desc="Track performance trends, identify knowledge gaps, and generate comprehensive analytics reports."
            />
            <FeatureCard
              icon="👥"
              title="Collaborate"
              desc="Manage multiple classes, share quizzes with colleagues, and organize students by modules."
            />
            <FeatureCard
              icon="📘"
              title="Learn"
              desc="Students can review past quizzes, track progress over time, and focus on areas needing improvement."
            />
          </div>
        </div>
      </section>

      {/* Built for every role */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">Built for every role</h2>
            <p className="mt-3 text-gray-600">
              Tailored experiences for professors, students, and administrators
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <RoleCard
              title="Professors"
              desc="Create and manage quizzes with ease. Design questions, set time limits, organize by modules, and track student performance."
              bullets={["Unlimited quiz creation", "Module organization", "Performance analytics"]}
              accent="blue"
            />
            <RoleCard
              title="Students"
              desc="Take quizzes, receive instant feedback, and track your learning progress across all modules and subjects."
              bullets={["Instant results", "Progress tracking", "Quiz history review"]}
              accent="green"
            />
            <RoleCard
              title="Administrators"
              desc="Manage users, oversee modules, and maintain the platform with comprehensive administrative tools."
              bullets={["User management", "Module oversight", "System analytics"]}
              accent="slate"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm px-6 py-12 text-center">
            <h2 className="text-3xl font-extrabold">
              Ready to transform your assessments?
            </h2>
            <p className="mt-3 text-gray-600">
              Join thousands of educators using QuizMaster to create engaging
              learning experiences.
            </p>
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <Link
               
                className="px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Get started for free
              </Link>
            <a
  href="mailto:support@yourdomain.com?subject=Contact%20from%20Quiz%20Platform"
  className="px-5 py-3 rounded-md border border-gray-300 font-medium hover:bg-gray-50"
>
  Contact
</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  ▣
                </span>
                <span>QuizMaster</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Modern quiz platform for educational excellence.
              </p>
            </div>

            <div>
              <div className="font-semibold">Product</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Resources</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>About</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} QuizMaster. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}