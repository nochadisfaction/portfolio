/**
 * Notes configuration
 * Simple notes similar to iOS Notes app
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export const notes: readonly Note[] = [
  {
    id: "1",
    title: "About This Space",
    content:
      "Welcome to my digital workspace.\n\nI'm Vivi — also known as chadisfaction. I build systems, write code, and think too much about the intersection of AI, society, and what it means to build technology that actually matters.\n\nCurrent focus:\n• Pixelated Empathy — enterprise AI for emotional intelligence\n• Gem City — my digital embassy for tech discourse\n• Exploring the edge where machine learning meets human consciousness\n\nDomains I operate:\n→ gemcity.xyz (central hub)\n→ pixelatedempathy.com (flagship AI)\n→ chadisfaction.tech (dev playground)\n→ acab.lol (activist tech)\n→ vivi.rocks (creative outlet)\n→ bantesla.lol (critical analysis)\n\n— Vivi",
    updatedAt: "2025-02-08T00:00:00Z",
  },
  {
    id: "2",
    title: "Working With Me",
    content:
      "I collaborate on projects that challenge the status quo.\n\nWhat I'm interested in:\n• AI systems that augment human capability\n• Tools for organizers and activists\n• Open source infrastructure\n• Code as craft, not commodity\n\nWhat I'm NOT interested in:\n• VC-backed hype cycles\n• Surveillance tech (even if it's \"for safety\")\n• Extractive business models disguised as innovation\n• \"Move fast and break things\" (we've broken enough)\n\nIf you're building something that empowers the marginalized, questions power structures, or pushes AI in genuinely new directions — let's talk.\n\nchad@gemcity.xyz",
    updatedAt: "2025-02-08T00:00:00Z",
  },
  {
    id: "3",
    title: "Tech Stack Notes",
    content:
      'What I\'m currently working with:\n\nAI/ML:\n• Python, FastAPI, PostgreSQL\n• OpenAI API, custom model fine-tuning\n• Emotional intelligence pattern recognition\n\nWeb/Systems:\n• Astro, Next.js, TypeScript\n• Tailwind, React, Node\n• Rust (learning, experimenting)\n\nInfrastructure:\n• Vercel, Supabase, Docker\n• Privacy-first, decentralized where possible\n\nPhilosophy:\nBuild for the long haul. Question every dependency. Keep it human-scale.\n\n"The best code is written with one eye on the compiler and the other on the society it will shape."',
    updatedAt: "2025-02-08T00:00:00Z",
  },
] as const;
