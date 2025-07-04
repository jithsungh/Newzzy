import { Link } from "react-router-dom";

const IndexPage = () => {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <main className="flex flex-1 items-center justify-center">
        <section className="w-full max-w-3xl mx-auto text-center py-24 px-8">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight text-primary drop-shadow-md">
            Discover News That Matters—To You
          </h1>
          <p className="text-xl text-secondary font-medium mb-8">
            Newsly delivers a personalized feed and curated content straight to your desktop. Your interests, your stories—always up to date.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/signup"
              className="bg-primary text-neutral font-semibold px-7 py-3 rounded-lg shadow hover:scale-105 transition-transform duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/explore"
              className="border border-primary text-primary px-7 py-3 rounded-lg hover:bg-primary hover:text-neutral transition duration-200 font-medium"
            >
              Explore First
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default IndexPage;
