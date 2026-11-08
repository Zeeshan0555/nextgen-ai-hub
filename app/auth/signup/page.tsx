export type AuthorApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ArticleStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';

export interface AuthorApplication {
  id: string;
  fullName: string;
  email: string;
  password: string;
  bio: string;
  expertise: string;
  portfolioUrl: string;
  status: AuthorApprovalStatus;
  createdAt: string;
  notes: string;
}

export interface AuthorAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  bio: string;
  expertise: string;
  portfolioUrl: string;
  approved: boolean;
  createdAt: string;
}

export interface AuthorArticle {
  id: string;
  authorEmail: string;
  title: string;
  category: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  adminFeedback: string;
}

export interface PublishedNewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  source: string;
  category: string;
  publishedAt: string;
  authorEmail?: string;
}

const STORAGE_KEYS = {
  applications: 'neurowire_author_applications',
  accounts: 'neurowire_author_accounts',
  articles: 'neurowire_author_articles',
  publishedNews: 'neurowire_published_news',
  admin: 'neurowire_admin_profile',
  session: 'neurowire_session',
};

const ADMIN_EMAIL = 'admin@neurowire.local';
const ADMIN_PASSWORD = 'admin123';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureAdminProfile() {
  const existing = readStorage<{ email: string; password: string; role: string } | null>(STORAGE_KEYS.admin, null);
  if (!existing) {
    writeStorage(STORAGE_KEYS.admin, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
  }
}

export function getAuthorApplications(): AuthorApplication[] {
  return readStorage<AuthorApplication[]>(STORAGE_KEYS.applications, []);
}

export function getAuthorAccounts(): AuthorAccount[] {
  return readStorage<AuthorAccount[]>(STORAGE_KEYS.accounts, []);
}

export function getAuthorArticles(): AuthorArticle[] {
  return readStorage<AuthorArticle[]>(STORAGE_KEYS.articles, []);
}

export function getPublishedNews(): PublishedNewsItem[] {
  return readStorage<PublishedNewsItem[]>(STORAGE_KEYS.publishedNews, []);
}

export function setSession(session: { email: string; role: 'admin' | 'author'; approved: boolean } | null) {
  if (!session) {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEYS.session);
    return;
  }
  writeStorage(STORAGE_KEYS.session, session);
}

export function getSession() {
  return readStorage<{ email: string; role: 'admin' | 'author'; approved: boolean } | null>(STORAGE_KEYS.session, null);
}

export function registerAuthorApplication(input: {
  fullName: string;
  email: string;
  password: string;
  bio: string;
  expertise: string;
  portfolioUrl: string;
}) {
  ensureAdminProfile();

  const apps = getAuthorApplications();
  const accounts = getAuthorAccounts();
  const alreadyExists = apps.some((item) => item.email.toLowerCase() === input.email.toLowerCase());
  const accountExists = accounts.some((item) => item.email.toLowerCase() === input.email.toLowerCase());

  if (alreadyExists || accountExists) {
    throw new Error('This email already submitted an application or already has an author account.');
  }

  const application: AuthorApplication = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    password: input.password,
    bio: input.bio.trim(),
    expertise: input.expertise.trim(),
    portfolioUrl: input.portfolioUrl.trim(),
    status: 'pending',
    notes: '',
    createdAt: new Date().toISOString(),
  };

  const account: AuthorAccount = {
    id: crypto.randomUUID(),
    email: input.email.trim(),
    password: input.password,
    fullName: input.fullName.trim(),
    bio: input.bio.trim(),
    expertise: input.expertise.trim(),
    portfolioUrl: input.portfolioUrl.trim(),
    approved: false,
    createdAt: new Date().toISOString(),
  };

  apps.unshift(application);
  accounts.unshift(account);
  writeStorage(STORAGE_KEYS.applications, apps);
  writeStorage(STORAGE_KEYS.accounts, accounts);

  return application;
}

export function adminLogin(email: string, password: string) {
  ensureAdminProfile();
  const admin = readStorage<{ email: string; password: string; role: string } | null>(STORAGE_KEYS.admin, null);
  if (!admin) throw new Error('Admin account missing.');
  if (admin.email.toLowerCase() === email.toLowerCase() && admin.password === password) {
    setSession({ email: admin.email, role: 'admin', approved: true });
    return true;
  }
  throw new Error('Invalid admin email or password.');
}

export function loginAuthor(email: string, password: string) {
  const accounts = getAuthorAccounts();
  const match = accounts.find(
    (account) => account.email.toLowerCase() === email.toLowerCase() && account.password === password,
  );

  if (!match) {
    throw new Error('Invalid email or password.');
  }

  if (!match.approved) {
    throw new Error('Your author account is still pending approval from the admin team.');
  }

  setSession({ email: match.email, role: 'author', approved: true });
  return match;
}

export function approveAuthorApplication(applicationId: string, approved: boolean, notes = '') {
  const apps = getAuthorApplications();
  const accounts = getAuthorAccounts();

  const appIndex = apps.findIndex((item) => item.id === applicationId);
  if (appIndex === -1) return;

  apps[appIndex].status = approved ? 'approved' : 'rejected';
  apps[appIndex].notes = notes;

  const account = accounts.find((item) => item.email.toLowerCase() === apps[appIndex].email.toLowerCase());
  if (account) {
    account.approved = approved;
  }

  writeStorage(STORAGE_KEYS.applications, apps);
  writeStorage(STORAGE_KEYS.accounts, accounts);
}

export function createArticleForAuthor(input: {
  authorEmail: string;
  title: string;
  category: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  content: string;
  imageUrl: string;
  imageAlt: string;
  status?: ArticleStatus;
}) {
  const articles = getAuthorArticles();

  const article: AuthorArticle = {
    id: crypto.randomUUID(),
    authorEmail: input.authorEmail,
    title: input.title.trim(),
    category: input.category,
    summary: input.summary.trim(),
    sourceName: input.sourceName.trim(),
    sourceUrl: input.sourceUrl.trim(),
    content: input.content.trim(),
    imageUrl: input.imageUrl.trim(),
    imageAlt: input.imageAlt.trim(),
    status: input.status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    adminFeedback: '',
  };

  articles.unshift(article);
  writeStorage(STORAGE_KEYS.articles, articles);
  return article;
}

export function updateArticleStatus(articleId: string, nextStatus: ArticleStatus, feedback = '') {
  const articles = getAuthorArticles();
  const current = articles.find((article) => article.id === articleId);
  if (!current) return null;

  current.status = nextStatus;
  current.updatedAt = new Date().toISOString();
  current.adminFeedback = feedback;

  writeStorage(STORAGE_KEYS.articles, articles);
  return current;
}

export function getArticlesForAuthor(email: string) {
  return getAuthorArticles().filter((article) => article.authorEmail.toLowerCase() === email.toLowerCase());
}

export function publishArticleToNews(articleId: string) {
  const articles = getAuthorArticles();
  const article = articles.find((item) => item.id === articleId);
  if (!article) return null;

  const newsList = getPublishedNews();
  const newsItem: PublishedNewsItem = {
    id: crypto.randomUUID(),
    title: article.title,
    summary: article.summary,
    content: article.content,
    imageUrl: article.imageUrl,
    source: article.sourceName,
    category: article.category,
    publishedAt: new Date().toISOString(),
    authorEmail: article.authorEmail,
  };

  newsList.unshift(newsItem);
  writeStorage(STORAGE_KEYS.publishedNews, newsList);

  updateArticleStatus(articleId, 'published', 'Published to live newsroom by admin.');
  return newsItem;
}

export function getPublishedNewsByAuthor(email: string) {
  return getPublishedNews().filter((item) => item.authorEmail?.toLowerCase() === email.toLowerCase());
}

export function ensureSeeded() {
  ensureAdminProfile();
}

ensureSeeded();

export const demoAdmin = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
path":"lib/news-workflow.ts"},{