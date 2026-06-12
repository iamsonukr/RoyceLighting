import { Wrench, Clock, Mail } from "lucide-react";

function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-12 text-white">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="border border-white/15 bg-white/[0.03] p-8 text-center shadow-2xl shadow-white/5 backdrop-blur md:p-12">
          <div className="mb-8 inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/70">
            <Clock size={16} />
            Back Soon
          </div>

          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/[0.04]">
            <Wrench className="h-11 w-11 text-white" />
          </div>

          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            We're Under Maintenance
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-8 text-white/65 md:text-lg">
            We're currently performing scheduled maintenance to improve
            performance, security, and your overall experience.
            Our team is working to bring everything back online shortly.
          </p>

          <div className="mb-8 border border-white/10 bg-black p-5">
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/45">
              Estimated Availability
            </p>
            <p className="text-xl font-semibold text-white">
              We'll be back shortly
            </p>
          </div>

          <div className="mb-10 flex items-center justify-center gap-3 text-white/65">
            <Mail size={18} />
            <a
              href="mailto:support@royacelighting.com"
              className="transition-colors hover:text-white"
            >
              support@royacelighting.com
            </a>
          </div>

          <div className="mb-8 flex justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white animate-bounce" />
            <span
              className="h-2.5 w-2.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="h-2.5 w-2.5 rounded-full bg-white animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
          </div>

          <p className="text-sm text-white/35">
            © {new Date().getFullYear()} Royace Lighting. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}

export default MaintenancePage;
