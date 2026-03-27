import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

const lifestyleCards = [
  {
    id: 1,
    title: 'Healthy Lifestyle',
    image: 'https://images.unsplash.com/photo-1642425777032-0b2249756797?w=800',
    description: 'Start your wellness journey',
    link: '/category/wellness'
  },
  {
    id: 2,
    title: 'Fitness Training',
    image: 'https://images.unsplash.com/photo-1771086559194-91fffc427573?w=800',
    description: 'Build strength & endurance',
    link: '/category/fitness'
  },
  {
    id: 3,
    title: 'Skin Care',
    image: 'https://images.unsplash.com/photo-1758534272283-bbbeacf06b2d?w=800',
    description: 'Natural beauty solutions',
    link: '/category/skin'
  },
  {
    id: 4,
    title: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1642005801149-b33da87c1175?w=800',
    description: 'Healthy hair from within',
    link: '/category/hair'
  }
];

export function LifestyleSection() {
  const navigate = useNavigate();
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl mb-4 text-foreground">Live Your Best Life</h2>
          <p className="text-muted-foreground">Discover wellness solutions for every aspect of your life</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lifestyleCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(card.link)}
              className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-[300px]"
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <h3 className="text-white text-2xl lg:text-3xl mb-2">{card.title}</h3>
                  <p className="text-white/80">{card.description}</p>
                </motion.div>
              </div>
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
