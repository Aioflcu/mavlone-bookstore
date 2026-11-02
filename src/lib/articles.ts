export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMinutes: number;
  body: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: "how-to-build-a-reading-habit-that-sticks",
    title: "How to build a reading habit that actually sticks",
    excerpt:
      "Forget motivation. The readers who finish books attach reading to moments they already have — here's how to set yours up in ten minutes.",
    category: "Reading life",
    date: "2026-10-12",
    readMinutes: 6,
    body: [
      "Most people don't fail at reading because they lack discipline. They fail because reading is competing against a phone that has been engineered by thousands of people to win. The fix is not willpower — it's design.",
      "Start by choosing your moment. Everyone has two or three natural pockets of stillness: the first ten minutes with morning coffee, the commute, the last minutes before sleep. Pick one and make it the only place you read. Your brain learns context quickly; within two weeks, sitting in that spot with a book will feel automatic.",
      "Second, shrink the commitment. A 'reading habit' that requires an hour will collapse on a busy Tuesday. Twenty pages — roughly fifteen minutes — is small enough to survive bad days and large enough to finish most books in under three weeks. Momentum matters more than volume.",
      "Third, keep the next book chosen before you need it. Decision fatigue ends more reading habits than boredom does. When you're halfway through a book, pick its successor from your Mavlonebook library and have it waiting. If you enjoy audiobooks, keep one queued for moments when your hands are busy but your mind is free.",
      "Finally, track finished books, not pages. A short visible list of completed titles does more for motivation than any streak counter. Every book you finish is proof that you are the kind of person who reads — and that identity is what makes the habit permanent.",
    ],
  },
  {
    slug: "ebook-vs-paperback-which-format-fits-your-life",
    title: "Ebook or paperback? How to choose the right format for every book",
    excerpt:
      "The best format depends less on the book and more on the life you'll read it in. A practical guide to choosing well.",
    category: "Guides",
    date: "2026-09-28",
    readMinutes: 5,
    body: [
      "Ask a room of readers which format is better and you'll start a friendly war. The honest answer: each format wins in a different situation, and most serious readers end up using all of them on purpose.",
      "Ebooks are unbeatable for immediacy and volume. The book arrives the second you pay, weighs nothing, travels in your pocket, and lets you highlight without guilt. They shine for practical nonfiction — cookbooks you'll consult in bursts, business books you'll skim and re-skim, guides you'll search rather than read linearly.",
      "Paperbacks win on attention. There is no notification badge on a printed page, and study after study finds deeper focus and better recall with physical text. Choose print for books you want to study slowly — philosophy, big-idea nonfiction, anything you'll argue with in the margins. A paperback also makes a better gift and a better shelf.",
      "Audiobooks own the dead time: commutes, cooking, cleaning, walks. Narration turns fifteen scattered minutes a day into two books a month. The catch is depth — dense material can wash past you, so pick audiobooks with stories, strong narration and ideas you'll remember without a highlighter.",
      "Our practical rule: buy the ebook when you want it now, the paperback when you want it forever, and the audiobook when you want to spend your commute becoming more interesting than the traffic.",
    ],
  },
  {
    slug: "five-short-books-that-change-how-you-work",
    title: "Five short books that change how you work",
    excerpt:
      "Under 200 pages each, readable in a weekend, and still reshaping how thousands of teams run their weeks.",
    category: "Work & business",
    date: "2026-09-14",
    readMinutes: 7,
    body: [
      "The most useful business books are usually the shortest ones — written by people who respect your attention. These five all clock in under 200 pages, and all of them have outlived their publication years by changing how readers actually operate.",
      "Start with something on attention. The core insight across the best short books on productivity is the same: your calendar, not your task list, is the real to-do app. Books that teach you to defend two deep-work blocks a day will return more value than any elaborate system.",
      "Then add a book on saying no. Half of workplace stress is a boundary problem dressed up as a time-management problem. The good short titles here give you actual sentences to say, not just theory — that alone is worth the cover price.",
      "Third, read one book about writing clearly. In most careers, the person who can compress a messy problem into half a page becomes the person everyone trusts with the messy problem. It is the cheapest skill upgrade in existence.",
      "Finally, pick one book on calm leadership or quiet influence. Loud advice is easy to find; the durable kind teaches you to build trust slowly, run meetings people don't dread, and make decisions that hold. All five kinds of books are in the store right now — filter by Business & Money and sort by rating to find them.",
    ],
  },
  {
    slug: "why-instant-delivery-changed-how-we-read",
    title: "Why instant delivery quietly changed how we read",
    excerpt:
      "When a book arrives in seconds instead of days, reading stops being an errand and becomes a reflex. That changes what we finish.",
    category: "Reading life",
    date: "2026-08-30",
    readMinutes: 4,
    body: [
      "For most of reading history, buying a book was a logistics event: a trip to a shop, a shipping wait, a package to collect. Every step was a chance for interest to fade. Instant ebook delivery removed all of it — and that removal matters more than it looks.",
      "Interest has a half-life. The moment you decide a book will solve your problem is the moment you're most ready to read it. A book that arrives while that decision is still warm gets read tonight; the same book arriving in a week often becomes shelf decoration.",
      "There's a second effect: reading becomes recoverable. With every purchase kept in an account library, a lost device costs nothing. Readers are more willing to start books, more willing to re-read them, and — because re-downloading is free — more willing to annotate and revisit.",
      "None of this makes print obsolete. Print is for keeping; instant digital is for starting. The bookstores that serve readers best now do both: digital editions that arrive in seconds, and printed editions shipped from a partner press for the books you want to live on a shelf.",
    ],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}
