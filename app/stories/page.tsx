import Breadcrumb from "@/components/Breadcrumb";

const stories = [
  {
    title: "The Beginning of Leo's Café",
    date: "2020",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&h=600&fit=crop",
    excerpt: "From a small food corner to Kot Addu's favorite fast food destination. Leo's Café started with a simple vision: serve quality food that people love.",
  },
  {
    title: "Our Signature Pizza Recipe",
    date: "Customer Favorite Since Day One",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&h=600&fit=crop",
    excerpt: "What makes our pizza special? Generous toppings, perfectly baked crust, and a blend of flavors that keeps customers coming back. From Leo's Special to Peri Peri Chicken.",
  },
  {
    title: "Late Night Kitchen",
    date: "Serving Kot Addu After Hours",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&h=600&fit=crop",
    excerpt: "When hunger strikes late at night, Leo's Café is there. Our kitchen runs past midnight because we know cravings don't follow schedules.",
  },
  {
    title: "The Zinger Burger Evolution",
    date: "Crispy, Juicy, Perfect",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&h=600&fit=crop",
    excerpt: "Our zinger burger isn't just another burger. It's crispy fried chicken, fresh vegetables, and special sauce between soft buns. Made fresh to order, every time.",
  },
  {
    title: "Community & Family",
    date: "More Than Just Food",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&h=600&fit=crop",
    excerpt: "Leo's Café has become a gathering spot in Kot Addu. Families celebrate here, friends meet here, and memories are made over delicious food.",
  },
  {
    title: "Quality Over Everything",
    date: "Our Promise",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&h=600&fit=crop",
    excerpt: "We don't compromise on ingredients. Fresh vegetables, quality chicken, real cheese - every ingredient matters because your satisfaction matters.",
  },
];

export default function StoriesPage() {
  return (
    <main>
      {/* ── Page Hero Banner ── */}
      <section className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=2070&h=1380&fit=crop"
            alt="Leo's Café Stories"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 mt-16">
          <h1
            className="font-heading font-bold text-white uppercase mb-2"
            style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", letterSpacing: "2px" }}
          >
            Our Stories
          </h1>
          <Breadcrumb paths={[{ label: "Stories" }]} />
        </div>
      </section>

      {/* ── Stories Content ── */}
      <section className="py-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div className="section-heading">
            <span className="script-accent">Behind the Scenes</span>
            <h2 className="bold-title">Stories from Leo's Café</h2>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, idx) => (
              <article
                key={idx}
                className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm font-medium text-accent mb-2">
                    {story.date}
                  </div>
                  <h3
                    className="font-heading font-bold text-xl mb-3"
                    style={{ color: "var(--color-heading)" }}
                  >
                    {story.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "var(--color-body-gray)" }}
                  >
                    {story.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
