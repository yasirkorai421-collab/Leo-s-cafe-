import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-dark-panel text-body-gray py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Info Panel */}
        <div>
          <h2 className="font-heading font-bold text-white text-2xl mb-6">Leo's Café</h2>
          <p className="mb-6 leading-relaxed">
            Located in New Zain Plaza near THQ Hospital, Kot Addu, Punjab. Your favorite spot for loaded pizzas, 
            crispy burgers, and fresh shawarmas. We serve quality fast food made with care.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-accent transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="https://www.facebook.com/Leo450.1/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-accent transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a href="https://www.instagram.com/Leo450.1/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white hover:bg-accent transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>

        {/* Open Hours */}
        <div>
          <h3 className="font-heading font-bold text-white text-xl mb-6">Open Hours</h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center text-[#ccc]"><span className="w-1/3">Monday</span><span>12:01 PM - 11:30 PM</span></li>
            <li className="flex justify-between items-center text-[#ccc]"><span className="w-1/3">Tuesday</span><span>12:01 PM - 11:30 PM</span></li>
            <li className="flex justify-between items-center text-[#ccc]"><span className="w-1/3">Wednesday</span><span>12:01 PM - 11:30 PM</span></li>
            <li className="flex justify-between items-center text-[#ccc]"><span className="w-1/3">Thursday</span><span>12:01 PM - 11:30 PM</span></li>
            <li className="flex justify-between items-center text-[#ccc]"><span className="w-1/3">Friday</span><span>3:00 PM - 11:30 PM</span></li>
            <li className="flex justify-between items-center text-[#ccc]"><span className="w-1/3">Saturday</span><span>12:01 PM - 11:30 PM</span></li>
            <li className="flex justify-between items-center text-[#ccc]"><span className="w-1/3">Sunday</span><span>12:01 PM - 11:30 PM</span></li>
          </ul>
        </div>

        {/* Instagram Grid */}
        <div>
          <h3 className="font-heading font-bold text-white text-xl mb-6">Instagram</h3>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-800 relative overflow-hidden">
                <Image
                  src={`https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=200&h=200&fit=crop&auto=format`}
                  alt="Instagram feed"
                  fill
                  sizes="100px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-heading font-bold text-white text-xl mb-6">Newsletter</h3>
          <p className="mb-6 leading-relaxed">
            Far far away, behind the word mountains, far from the countries.
          </p>
          <form className="space-y-2">
            <input 
              type="email" 
              placeholder="Enter email address" 
              className="w-full bg-[#2a2a2a] text-white placeholder-gray-400 px-4 py-4 focus:outline-none"
            />
            <button className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-gray-500">
        <p>Copyright ©{new Date().getFullYear()} All rights reserved | This template is made with ♥ by Colorlib</p>
      </div>
    </footer>
  );
}
