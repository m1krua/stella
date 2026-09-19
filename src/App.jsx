import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileText,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  Button,
  EmptyState,
  FAQ,
  Field,
  Icon,
  SectionTitle,
  SelectField,
  StatusBadge,
  TextareaField,
  Toast,
} from "./components/UI";
import {
  languages,
  services,
  siteConfig,
  stats,
  translators,
} from "./data/site";
import { LanguageProvider, useLanguage } from "./lib/i18n";
import { AuthProvider, useAuth } from "./lib/auth";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_ADMIN_NICK,
} from "./lib/auth";
import { createOrder, fetchOrders, updateOrder } from "./services/orders";
import "./App.css";

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  useEffect(() => {
    document.title = "Стелла — переводческая компания";
  }, []);
  const logout = async () => {
    await signOut();
    setToast("Вы вышли из аккаунта");
    navigate("/login", { replace: true });
  };
  return (
    <>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link to="/" className="brand">
            <span>STELLA</span>
            <small>{t("ПЕРЕВОДЧЕСКАЯ КОМПАНИЯ")}</small>
          </Link>
          <nav
            className={`main-nav ${mobileOpen ? "nav-open" : ""}`}
            aria-label="Основная навигация"
          >
            {[
              ["Услуги", "/services"],
              ["О компании", "/about"],
              ["Переводчики", "/translators"],
              ["Цены", "/pricing"],
              ["Контакты", "/contacts"],
            ].map(([label, to]) => (
              <NavLink onClick={() => setMobileOpen(false)} key={to} to={to}>
                {t(label)}
              </NavLink>
            ))}
            <div className="mobile-actions">
              <Button to="/login" variant="outline">
                {t("Войти")}
              </Button>
              <Button to="/dashboard" icon="ArrowUpRight">
                {t("Получить расчёт")}
              </Button>
            </div>
          </nav>
          <div className="header-actions">
            <span className="lang-switch">
              <button
                className={language === "ru" ? "language-active" : ""}
                onClick={() => setLanguage("ru")}
                aria-label="Русский язык"
              >
                RU
              </button>
              <button
                className={language === "en" ? "language-active" : ""}
                onClick={() => setLanguage("en")}
                aria-label="English language"
              >
                EN
              </button>
            </span>
            {profile ? (
              <div className="user-menu">
                <span className="avatar">
                  {(profile.first_name || user?.email || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
                <Link
                  to={
                    profile.role === "admin"
                      ? "/admin"
                      : profile.role === "translator"
                        ? "/translator"
                        : "/dashboard"
                  }
                >
                  {profile.role === "admin"
                    ? "Панель администратора"
                    : profile.role === "translator"
                      ? "Кабинет переводчика"
                      : "Личный кабинет"}
                </Link>
                <button aria-label="Выйти" onClick={logout}>
                  <Icon name="LogOut" size={16} />
                </button>
              </div>
            ) : (
              <>
                <Link className="login-link" to="/login">
                  {t("Войти")}
                </Link>
                <Button to="/dashboard" icon="ArrowUpRight">
                  {t("Получить расчёт")}
                </Button>
              </>
            )}
          </div>
          <button
            className="menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Открыть меню"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>{children}</main>
      <Footer />
      <Toast message={toast} onClose={() => setToast("")} />
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand footer-brand">
            <span>STELLA</span>
            <small>ПЕРЕВОДЧЕСКАЯ КОМПАНИЯ</small>
          </Link>
          <p>
            Язык открывает больше возможностей.
            <br />
            Мы помогаем ими пользоваться.
          </p>
        </div>
        <div>
          <h4>Навигация</h4>
          <Link to="/services">Услуги</Link>
          <Link to="/about">О компании</Link>
          <Link to="/translators">Переводчики</Link>
          <Link to="/pricing">Цены</Link>
        </div>
        <div>
          <h4>Клиентам</h4>
          <Link to="/login">Войти</Link>
          <Link to="/register">Регистрация</Link>
          <Link to="/dashboard/orders/new">Новый заказ</Link>
          <Link to="/translators/apply">Стать переводчиком</Link>
        </div>
        <div>
          <h4>Контакты</h4>
          <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          <span>{siteConfig.address}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 {siteConfig.legalName}</span>
        <span>
          <Link to="/privacy">Политика конфиденциальности</Link> ·{" "}
          <Link to="/terms">Пользовательское соглашение</Link>
        </span>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Профессиональные языковые решения
            </span>
            <h1>
              Точный перевод.
              <br />
              <em>Понятный результат.</em>
            </h1>
            <p>
              Профессиональные переводы для бизнеса и частных клиентов — от
              документов до международных переговоров.
            </p>
            <div className="hero-actions">
              <Button to="/dashboard/orders/new" icon="ArrowUpRight">
                Получить расчёт
              </Button>
              <Button to="/services" variant="outline" icon="ArrowRight">
                Наши услуги
              </Button>
            </div>
            <div className="hero-note">
              <ShieldCheck size={17} /> Конфиденциально. Внимательно. В срок.
            </div>
          </div>
          <div className="hero-visual">
            <div
              className="hero-image"
              role="img"
              aria-label="Деловая встреча международной команды"
            />
            <div className="floating-card floating-card-top">
              <span className="mini-icon">
                <Check size={15} />
              </span>
              <div>
                <b>Точность в деталях</b>
                <small>Контроль качества на каждом этапе</small>
              </div>
            </div>
            <div className="floating-card floating-card-bottom">
              <strong>50+</strong>
              <span>
                языковых
                <br />
                направлений
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="stats-band">
        <div className="container stats-row">
          <div className="stats-intro">
            <span className="eyebrow">STELLA / 01</span>
            <strong>
              Язык не должен быть
              <br />
              препятствием для бизнеса
            </strong>
          </div>
          {stats.map(([value, label]) => (
            <div className="stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="НАШИ УСЛУГИ"
            title="Переводим то, что важно"
            text="Собираем нужную экспертизу под задачу, чтобы вы могли сосредоточиться на результате."
          />
          <div className="service-grid">
            {services.map((service, index) => (
              <ServiceCard service={service} key={service.id} index={index} />
            ))}
          </div>
          <div className="center-action">
            <Button to="/services" variant="outline" icon="ArrowRight">
              Все услуги
            </Button>
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container process-grid">
          <div>
            <SectionTitle
              eyebrow="ПРОЦЕСС"
              title="Спокойный путь от задачи к результату"
              text="Вы всегда понимаете, на каком этапе находится ваш заказ."
            />
            <Button to="/dashboard/orders/new" icon="ArrowUpRight">
              Оформить заявку
            </Button>
          </div>
          <div className="process-list">
            {[
              [
                "01",
                "Заявка",
                "Расскажите, что нужно перевести и к какому сроку.",
              ],
              [
                "02",
                "Расчёт стоимости и сроков",
                "Менеджер уточнит детали и предложит оптимальный формат.",
              ],
              [
                "03",
                "Работа переводчика",
                "Подбираем специалиста с опытом в вашей тематике.",
              ],
              [
                "04",
                "Проверка и передача результата",
                "Проверяем текст и передаём готовый результат.",
              ],
            ].map(([number, title, text]) => (
              <div className="process-item" key={number}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <ChevronRight size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container split-section">
          <div className="quality-visual">
            <div className="quality-stamp">
              <ShieldCheck size={25} />
              <span>
                STELLA
                <br />
                <small>QUALITY</small>
              </span>
            </div>
          </div>
          <div>
            <SectionTitle
              eyebrow="ПОЧЕМУ STELLA"
              title="Важные слова требуют внимания"
              text="Выстраиваем работу так, чтобы качество было заметно не только в финальном документе, но и в каждом взаимодействии."
            />
            <div className="benefit-list">
              {[
                "Конфиденциальность",
                "Контроль качества",
                "Профессиональные переводчики",
                "Соблюдение сроков",
                "Индивидуальный подход",
                "Поддержка клиента",
              ].map((item) => (
                <span key={item}>
                  <Check size={16} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="section language-section">
        <div className="container language-layout">
          <SectionTitle
            eyebrow="ВОЗМОЖНОСТИ"
            title="Языковые направления"
            text="Подключаем нужный язык и профильную экспертизу под вашу задачу."
          />
          <div className="language-cloud">
            {languages.map((language) => (
              <span key={language}>{language}</span>
            ))}
            <Link to="/services">
              Все языки <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="eyebrow">ГОТОВЫ ОБСУДИТЬ ЗАДАЧУ?</span>
            <h2>Нужен перевод?</h2>
            <p>
              Расскажите о задаче — мы подготовим расчёт стоимости и сроков.
            </p>
          </div>
          <Button
            to="/dashboard/orders/new"
            variant="light"
            icon="ArrowUpRight"
          >
            Получить расчёт
          </Button>
        </div>
      </section>
      <section className="section faq-section">
        <div className="container faq-layout">
          <SectionTitle
            eyebrow="FAQ"
            title="Частые вопросы"
            text="Собрали ответы на то, что важно знать перед началом работы."
          />
          <FAQ />
        </div>
      </section>
    </>
  );
}

function ServiceCard({ service, index }) {
  return (
    <Link className="service-card" to={`/services/${service.id}`}>
      <span className="card-number">0{index + 1}</span>
      <span className="service-icon">
        <Icon name={service.icon} size={23} />
      </span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span className="text-link">
        Подробнее <ArrowUpRight size={15} />
      </span>
    </Link>
  );
}

function PageHeader({ eyebrow, title, text }) {
  const { t } = useLanguage();
  return (
    <section className="page-header">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{t(title)}</h1>
        {text && <p>{t(text)}</p>}
      </div>
    </section>
  );
}

function Services() {
  return (
    <>
      <PageHeader
        eyebrow="УСЛУГИ / 02"
        title="Язык, которому можно доверять"
        text="Подбираем формат, экспертизу и процесс под задачу — от одного документа до комплексной локализации."
      />
      <section className="section">
        <div className="container service-catalog">
          {services.map((service, index) => (
            <div className="catalog-row" key={service.id}>
              <span className="catalog-index">0{index + 1}</span>
              <Icon name={service.icon} size={25} />
              <div className="catalog-main">
                <h2>{service.title}</h2>
                <p>{service.description}</p>
              </div>
              <div className="catalog-meta">
                <span>
                  <b>Что входит</b>
                  {service.includes}
                </span>
                <span>
                  <b>Срок</b>
                  {service.duration}
                </span>
              </div>
              <Button
                to={`/services/${service.id}`}
                variant="outline"
                icon="ArrowUpRight"
              >
                Подробнее
              </Button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ServiceDetail() {
  const { id } = useParams();
  const service = services.find((item) => item.id === id) || services[0];
  const { t } = useLanguage();
  return (
    <>
      <PageHeader
        eyebrow={`УСЛУГИ / ${service.title.toUpperCase()}`}
        title={service.title}
        text={service.description}
      />
      <section className="section">
        <div className="container detail-grid">
          <div>
            <div className="detail-icon">
              <Icon name={service.icon} size={30} />
            </div>
            <h2>{t("Решение для вашей задачи")}</h2>
            <p className="large-copy">
              {t(
                "Мы соединяем языковую точность с пониманием контекста, чтобы перевод помогал двигаться дальше — в переговорах, документах и продукте.",
              )}
            </p>
            <div className="detail-points">
              <span>
                <Check size={17} /> {t("Профильный специалист")}
              </span>
              <span>
                <Check size={17} /> {t("Редактура и проверка")}
              </span>
              <span>
                <Check size={17} /> {t("Конфиденциальная работа")}
              </span>
            </div>
          </div>
          <div className="form-card">
            <h3>{t("Получить расчёт")}</h3>
            <p>{t("Стоимость рассчитывается индивидуально.")}</p>
            <OrderForm />
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container faq-layout">
          <SectionTitle eyebrow="FAQ" title={t("Вопросы по услуге")} />
          <FAQ />
        </div>
      </section>
    </>
  );
}

function About() {
  return (
    <>
      <PageHeader
        eyebrow="О КОМПАНИИ / 03"
        title="Помогаем работать без языковых барьеров"
        text="Стелла — рабочая среда для точного перевода, ясной коммуникации и спокойного движения к результату."
      />
      <section className="section">
        <div className="container about-intro">
          <div className="about-quote">
            «Хороший перевод не становится заметным. Заметным становится
            результат, которого вы добились с его помощью.»
          </div>
          <div>
            <span className="eyebrow">НАШ ПОДХОД</span>
            <p className="large-copy">
              Мы строим работу вокруг задачи клиента: внимательно изучаем
              контекст, подбираем нужную экспертизу и сохраняем ясность на
              каждом этапе. Факты о компании, команда и реквизиты подключаются
              из отдельной конфигурации перед публикацией.
            </p>
          </div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container timeline">
          <SectionTitle
            eyebrow="ПУТЬ"
            title="Развиваем практику шаг за шагом"
          />
          <div className="timeline-list">
            {[
              ["01", "Основа", "Собираем процессы и базу языковой экспертизы."],
              [
                "02",
                "Фокус на качестве",
                "Выстраиваем редактуру и контроль терминологии.",
              ],
              [
                "03",
                "Для международных задач",
                "Расширяем направления и форматы сопровождения.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Translators() {
  const [query, setQuery] = useState("");
  const filtered = translators.filter((t) =>
    `${t.name} ${t.languages} ${t.specialty}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="КОМАНДА / 04"
        title="Люди, которые знают язык задачи"
        text="Открытый каталог demo-профилей. Личные контакты и приватные данные не публикуются."
      />
      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <label className="search-field">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по имени или специализации"
                aria-label="Поиск переводчика"
              />
            </label>
            <Button to="/translators/apply" icon="ArrowUpRight">
              Стать переводчиком
            </Button>
          </div>
          <div className="translator-grid">
            {filtered.map((t) => (
              <TranslatorCard translator={t} key={t.id} />
            ))}
          </div>
          {!filtered.length && (
            <EmptyState
              title="Переводчики не найдены"
              text="Попробуйте изменить запрос."
            />
          )}
        </div>
      </section>
    </>
  );
}
function TranslatorCard({ translator }) {
  return (
    <Link className="translator-card" to={`/translators/${translator.id}`}>
      <div className="translator-top">
        <span className="profile-avatar">{translator.initials}</span>
        <StatusBadge status={translator.status} />
      </div>
      <h3>{translator.name}</h3>
      <p>{translator.languages}</p>
      <span className="translator-specialty">{translator.specialty}</span>
      <div className="card-footer">
        <span>{translator.experience}</span>
        <ArrowUpRight size={16} />
      </div>
    </Link>
  );
}
function TranslatorProfile() {
  const { id } = useParams();
  const translator = translators.find((t) => t.id === id) || translators[0];
  return (
    <>
      <PageHeader
        eyebrow="ПРОФИЛЬ ПЕРЕВОДЧИКА"
        title={translator.name}
        text={translator.bio}
      />
      <section className="section">
        <div className="container profile-layout">
          <div className="profile-hero">
            <span className="profile-avatar profile-avatar-large">
              {translator.initials}
            </span>
            <StatusBadge status={translator.status} />
          </div>
          <div className="profile-content">
            <h2>Профессиональный профиль</h2>
            <p className="large-copy">{translator.bio}</p>
            <div className="profile-facts">
              <span>
                <b>Языки</b>
                {translator.languages}
              </span>
              <span>
                <b>Специализация</b>
                {translator.specialty}
              </span>
              <span>
                <b>Опыт</b>
                {translator.experience}
              </span>
              <span>
                <b>Формат</b>Письменный и устный перевод
              </span>
            </div>
            <Button to="/dashboard/orders/new" icon="ArrowUpRight">
              Оставить заявку
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function OrderForm() {
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { user } = useAuth();
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      if (!user?.id)
        throw new Error("Войдите в аккаунт перед созданием заказа.");
      await createOrder({
        clientId: user.id,
        serviceName: data.get("service"),
        sourceLanguage: data.get("source"),
        targetLanguage: data.get("target"),
        deadline: data.get("deadline"),
        comment: data.get("comment"),
        file: data.get("file"),
      });
      setSent(true);
    } catch (submitError) {
      setError(
        submitError.message ||
          "Не удалось отправить заявку. Попробуйте ещё раз.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (sent)
    return (
      <div className="success-box">
        <Icon name="CircleCheck" size={24} />
        <strong>{t("Заявка успешно отправлена.")}</strong>
        <p>{t("Менеджер свяжется с вами после первичной оценки.")}</p>
      </div>
    );
  return (
    <form className="stack-form" onSubmit={submit}>
      <SelectField label={t("Услуга")} name="service">
        <option value="">{t("Выберите услугу")}</option>
        {services.map((s) => (
          <option key={s.id} value={s.title}>
            {t(s.title)}
          </option>
        ))}
      </SelectField>
      <div className="form-two">
        <SelectField label={t("Язык оригинала")} name="source">
          <option>{t("Русский")}</option>
          <option>{t("Английский")}</option>
        </SelectField>
        <SelectField label={t("Язык перевода")} name="target">
          <option>{t("Английский")}</option>
          <option>{t("Русский")}</option>
        </SelectField>
      </div>
      <Field label="Срок" name="deadline" type="date" />
      <Field
        label={t("Email")}
        name="email"
        type="email"
        placeholder="you@company.com"
        required
      />
      <TextareaField
        label={t("Комментарий")}
        name="comment"
        placeholder={t("Коротко опишите задачу")}
      />
      <label className="upload-field">
        <span>{t("Файл")}</span>
        <input
          name="file"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.png"
        />
        <small>PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, JPG, PNG</small>
      </label>
      {error && (
        <div className="form-error">
          <Icon name="CircleAlert" size={16} />
          {error}
        </div>
      )}
      <Button
        type="submit"
        icon={saving ? "LoaderCircle" : "Send"}
        disabled={saving}
      >
        {saving ? "Сохранение…" : t("Отправить заявку")}
      </Button>
    </form>
  );
}

function Pricing() {
  return (
    <>
      <PageHeader
        eyebrow="ЦЕНЫ / 05"
        title="Стоимость под задачу, а не по шаблону"
        text="Мы не прячем сложные проекты в фиксированные тарифы. Сначала разбираемся в задаче, затем предлагаем понятный расчёт."
      />
      <section className="section">
        <div className="container pricing-grid">
          <div>
            <SectionTitle
              eyebrow="ЧТО ВЛИЯЕТ НА СТОИМОСТЬ"
              title="Честная оценка начинается с контекста"
            />
            <div className="factor-grid">
              {[
                "Языковая пара",
                "Объём текста",
                "Сложность",
                "Тематика",
                "Срочность",
                "Формат",
                "Необходимость заверения",
              ].map((x, i) => (
                <div key={x}>
                  <span>0{i + 1}</span>
                  <b>{x}</b>
                  <Check size={16} />
                </div>
              ))}
            </div>
          </div>
          <div className="pricing-note">
            <span className="detail-icon">
              <Icon name="Calculator" size={28} />
            </span>
            <h3>Стоимость рассчитывается индивидуально.</h3>
            <p>
              Отправьте материалы или опишите задачу, и менеджер вернётся с
              расчётом стоимости и сроков.
            </p>
            <Button to="/dashboard/orders/new" icon="ArrowUpRight">
              Рассчитать стоимость
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Contacts() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow="КОНТАКТЫ / 06"
        title="Давайте обсудим задачу"
        text="Ответим на вопросы, уточним детали и предложим следующий шаг."
      />
      <section className="section">
        <div className="container contact-grid">
          <div className="contact-details">
            <span className="eyebrow">STELLA / CONTACT</span>
            <div>
              <b>Телефон</b>
              <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
            </div>
            <div>
              <b>Email</b>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </div>
            <div>
              <b>Адрес</b>
              <span>{siteConfig.address}</span>
            </div>
            <div>
              <b>График работы</b>
              <span>{siteConfig.hours}</span>
            </div>
            <small>{siteConfig.demoNotice}</small>
          </div>
          <div className="form-card">
            <h3>Написать нам</h3>
            {sent ? (
              <div className="success-box">
                <Icon name="CircleCheck" size={24} />
                <strong>Сообщение отправлено.</strong>
                <p>Спасибо, мы свяжемся с вами.</p>
              </div>
            ) : (
              <form
                className="stack-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <Field
                  label="Имя"
                  name="name"
                  placeholder="Ваше имя"
                  required
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete={mode === "login" ? "username" : "email"}
                  required
                />
                <Field label="Телефон" name="phone" placeholder="+996 ..." />
                <TextareaField
                  label="Сообщение"
                  name="message"
                  placeholder="Расскажите о задаче"
                  required
                />
                <Button type="submit" icon="Send">
                  Отправить сообщение
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
      <section className="map-block">
        <div className="container">
          <div className="map-placeholder">
            <Icon name="MapPin" size={28} />
            <span>Карта будет подключена после подтверждения адреса</span>
          </div>
        </div>
      </section>
    </>
  );
}

function Auth({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isDemo, resetPasswordForEmail, updatePassword } =
    useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [show, setShow] = useState(false);
  const formRef = useRef(null);
  const recovery = mode === "forgot" || mode === "reset";

  useEffect(() => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setError("");
    setSuccess("");
    setShow(false);
  }, [mode, location.pathname]);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const data = new FormData(e.currentTarget);
    if (mode === "forgot") {
      try {
        await resetPasswordForEmail(data.get("email"));
        setSuccess(
          isDemo
            ? "В demo-режиме ссылка не отправляется. Откройте форму нового пароля."
            : "Ссылка для восстановления отправлена на email.",
        );
      } catch (authError) {
        setError(authError.message || "Не удалось отправить ссылку.");
      }
      return;
    }
    if (mode === "reset") {
      const newPassword = String(data.get("password") || "");
      const repeatPassword = String(data.get("repeat") || "");
      if (newPassword.length < 8)
        return setError("Пароль должен содержать минимум 8 символов.");
      if (newPassword !== repeatPassword)
        return setError("Пароли должны совпадать.");
      try {
        await updatePassword(newPassword);
        setSuccess("Пароль успешно изменён");
      } catch (authError) {
        setError(authError.message || "Не удалось сохранить пароль.");
      }
      return;
    }
    if (mode === "register" && data.get("password") !== data.get("repeat"))
      return setError("Пароли должны совпадать.");
    if (mode === "register" && String(data.get("password")).length < 8)
      return setError("Пароль должен содержать минимум 8 символов.");
    try {
      if (mode === "login") {
        const result = await signIn({
          email: data.get("email"),
          password: data.get("password"),
        });
        const role = result.profile?.role || "client";
        navigate(
          role === "admin"
            ? "/admin"
            : role === "translator"
              ? "/translator"
              : "/dashboard",
        );
      } else {
        const result = await signUp({
          email: data.get("email"),
          password: data.get("password"),
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          role: "client",
        });

        if (result?.requiresEmailConfirmation) {
          setError(
            "Аккаунт создан, но вход не выполнен. В настройках Supabase Auth отключите подтверждение email, чтобы регистрация сразу открывала аккаунт.",
          );
          return;
        }

        const role = result.profile?.role || "client";
        navigate(role === "translator" ? "/translator" : "/dashboard");
      }
    } catch (authError) {
      setError(
        authError.message || "Не удалось выполнить вход. Попробуйте ещё раз.",
      );
    }
  };
  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span>STELLA</span>
          <small>ПЕРЕВОДЧЕСКАЯ КОМПАНИЯ</small>
        </Link>
        <span className="eyebrow">
          {recovery
            ? "Восстановление доступа"
            : mode === "login"
              ? "С возвращением"
              : "Новый аккаунт"}
        </span>
        <h1>
          {recovery
            ? mode === "reset"
              ? "Новый пароль"
              : "Вернуть доступ"
            : mode === "login"
              ? "Войти в кабинет"
              : "Создать аккаунт"}
        </h1>
        <p>
          {recovery
            ? mode === "reset"
              ? "Задайте новый пароль."
              : "Введите email, и мы подготовим ссылку для восстановления."
            : mode === "login"
              ? "Управляйте заявками и документами в одном месте."
              : "Выберите формат работы со Стеллой."}
        </p>
        {mode === "register" && (
          <div className="role-switch">
            <Link className="active" to="/register">
              Я клиент
            </Link>
            <Link to="/translators/apply">Я переводчик</Link>
          </div>
        )}
        {success ? (
          <div className="success-box">
            <Icon name="CircleCheck" size={24} />
            <strong>{success}</strong>
            <p>
              <Link to="/login">Войти</Link>
            </p>
          </div>
        ) : (
          <form ref={formRef} className="stack-form" onSubmit={submit}>
            {!recovery && mode === "register" && (
              <div className="form-two">
                <Field
                  label="Имя"
                  name="firstName"
                  placeholder="Ваше имя"
                  required
                />
                <Field
                  label="Фамилия"
                  name="lastName"
                  placeholder="Фамилия"
                  required
                />
              </div>
            )}
            {mode !== "reset" && (
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
              />
            )}
            {(mode === "login" || mode === "register" || mode === "reset") && (
              <label className="field">
                <span>Пароль</span>
                <span className="password-input">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    placeholder="Минимум 8 символов"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label="Показать пароль"
                  >
                    <Icon name={show ? "EyeOff" : "Eye"} size={17} />
                  </button>
                </span>
              </label>
            )}
            {(mode === "register" || mode === "reset") && (
              <Field
                label="Повторите пароль"
                name="repeat"
                type="password"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                required
              />
            )}
            {mode === "login" && (
              <div className="auth-links compact-links">
                <Link to="/forgot-password">Забыли пароль?</Link>
              </div>
            )}
            {error && (
              <div className="form-error">
                <Icon name="CircleAlert" size={16} />
                {error}
              </div>
            )}
            <Button type="submit" icon="ArrowRight">
              {mode === "forgot"
                ? "Отправить ссылку"
                : mode === "reset"
                  ? "Сохранить пароль"
                  : mode === "login"
                    ? "Войти"
                    : "Создать аккаунт"}
            </Button>
          </form>
        )}
        <div className="auth-links">
          <Link to="/">Вернуться назад</Link>
          {mode === "login" && <Link to="/register">Создать аккаунт</Link>}
          {mode === "register" && <Link to="/login">Войти</Link>}
          {(mode === "forgot" || mode === "reset") && (
            <Link to="/login">Вернуться ко входу</Link>
          )}
          {!recovery && mode !== "login" && mode !== "register" && (
            <span>
              Нет аккаунта? <Link to="/register">Создать</Link>
            </span>
          )}
          {!recovery && mode === "login" && (
            <span>
              Нет аккаунта? <Link to="/register">Создать</Link>
            </span>
          )}
        </div>
        <small className="demo-hint">
          {isDemo
            ? "Demo mode: Supabase env-переменные не настроены, используется локальная демонстрация."
            : "Авторизация выполняется через Supabase Auth."}
        </small>
      </div>
    </section>
  );
}

function Dashboard({ user, role = "client" }) {
  const translator = role === "translator";
  const admin = role === "admin";
  const [adminCreateOpen, setAdminCreateOpen] = useState(false);
  const displayName =
    user?.first_name || user?.name || user?.email?.split("@")[0] || "клиент";
  const links = admin
    ? [
        ["Обзор", "/admin", "LayoutDashboard"],
        ["Заказы", "/admin/orders", "ClipboardList"],
        ["Пользователи", "/admin/users", "Users"],
        ["Переводчики", "/admin/translators", "Languages"],
        ["Заявки переводчиков", "/admin/applications", "FileCheck"],
        ["Услуги", "/admin/services", "Settings"],
      ]
    : translator
      ? [
          ["Обзор", "/translator", "LayoutDashboard"],
          ["Мои задания", "/translator/tasks", "ClipboardList"],
          ["Мой профиль", "/translator/profile", "User"],
          ["Документы", "/translator/documents", "FileText"],
          ["Настройки", "/translator/settings", "Settings"],
        ]
      : [
          ["Обзор", "/dashboard", "LayoutDashboard"],
          ["Мои заявки", "/dashboard/orders", "ClipboardList"],
          ["Новый заказ", "/dashboard/orders/new", "Plus"],
          ["Сообщения", "/dashboard/messages", "MessageSquare"],
          ["Документы", "/dashboard/documents", "FileText"],
          ["Профиль", "/dashboard/profile", "User"],
          ["Настройки", "/dashboard/settings", "Settings"],
        ];
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link to="/" className="brand">
          <span>STELLA</span>
          <small>КАБИНЕТ</small>
        </Link>
        <nav>
          {links.map(([label, to, icon]) => (
            <NavLink
              end={
                to === "/dashboard" || to === "/translator" || to === "/admin"
              }
              key={to}
              to={to}
            >
              <Icon name={icon} size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="sidebar-logout" to="/">
          <Icon name="LogOut" size={17} />
          Выйти
        </Link>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-top">
          <div>
            <span className="eyebrow">
              {admin
                ? "ADMIN / OVERVIEW"
                : translator
                  ? "TRANSLATOR / OVERVIEW"
                  : "CLIENT / OVERVIEW"}
            </span>
            <h1>
              {admin ? "Панель управления" : `Добро пожаловать, ${displayName}`}
            </h1>
          </div>
          <Button
            to={admin ? undefined : translator ? "/translator/tasks" : "/dashboard/orders/new"}
            type={admin ? "button" : "button"}
            onClick={admin ? () => setAdminCreateOpen(true) : undefined}
            icon={translator ? "Plus" : undefined}
          >
            {translator ? "Открыть задания" : "Новый заказ"}
          </Button>
        </div>
        <DashboardContent role={role} onNewOrder={() => setAdminCreateOpen(true)} adminCreateOpen={adminCreateOpen} onCloseCreate={() => setAdminCreateOpen(false)} />
      </div>
    </div>
  );
}
function DashboardContent({ role, onNewOrder, adminCreateOpen, onCloseCreate }) {
  if (role === "admin") return <AdminContent onNewOrder={onNewOrder} createOpen={adminCreateOpen} onCloseCreate={onCloseCreate} />;
  if (role === "translator")
    return (
      <>
        <div className="dashboard-cards">
          <Metric title="Новые задания" value="4" icon="Sparkles" />
          <Metric title="Активные" value="2" icon="Clock3" />
          <Metric title="Завершённые" value="18" icon="CircleCheck" />
        </div>
        <div className="dashboard-panel">
          <div className="panel-heading">
            <h2>Последние задания</h2>
            <Link to="/translator/tasks">
              Все задания <ArrowRight size={15} />
            </Link>
          </div>
          <TaskRows />
        </div>
      </>
    );
  return (
    <>
      <div className="dashboard-cards">
        <Metric title="Активные заявки" value="3" icon="Layers3" />
        <Metric title="Новые" value="1" icon="Sparkles" />
        <Metric title="В работе" value="2" icon="Clock3" />
        <Metric title="Завершённые" value="12" icon="CircleCheck" />
      </div>
      <div className="dashboard-panel">
        <div className="panel-heading">
          <h2>Последние заявки</h2>
          <Link to="/dashboard/orders">
            Все заявки <ArrowRight size={15} />
          </Link>
        </div>
        <OrderRows />
      </div>
    </>
  );
}
function AdminContent({ onNewOrder, createOpen, onCloseCreate }) {
  const { pathname } = useLocation();
  if (pathname === "/admin" || pathname === "/admin/orders") return <AdminOrdersPanel onNewOrder={onNewOrder} createOpen={createOpen} onCloseCreate={onCloseCreate} />;
  const sections = {
    "/admin/orders": [
      "Все заказы",
      "Управляйте статусами, сроками, стоимостью и назначением переводчика.",
      <OrderRows />,
    ],
    "/admin/users": [
      "Пользователи",
      "Клиенты, переводчики и администраторы системы.",
      <AdminTable
        headers={["Имя", "Email", "Роль", "Статус"]}
        rows={[
          ["Демо клиент", "client@example.com", "client", "Активен"],
          [
            "Профиль переводчика",
            "translator@example.com",
            "translator",
            "На проверке",
          ],
        ]}
      />,
    ],
    "/admin/translators": [
      "Переводчики",
      "Проверяйте профили и управляйте доступностью команды.",
      <AdminTable
        headers={["Имя", "Языки", "Специализация", "Статус"]}
        rows={translators.map((item) => [
          item.name,
          item.languages,
          item.specialty,
          item.status,
        ])}
      />,
    ],
    "/admin/applications": [
      "Заявки переводчиков",
      "Новые профессиональные анкеты для рассмотрения.",
      <EmptyState
        title="Новых заявок нет"
        text="Все поступившие заявки появятся здесь."
      />,
    ],
    "/admin/services": [
      "Услуги",
      "Создавайте и редактируйте каталог услуг.",
      <AdminTable
        headers={["Услуга", "Описание", "Срок", "Действие"]}
        rows={services.map((item) => [
          item.title,
          item.description,
          item.duration,
          "Редактировать",
        ])}
      />,
    ],
    "/admin/messages": [
      "Сообщения",
      "Входящие обращения клиентов и команды.",
      <EmptyState
        title="Сообщений нет"
        text="Новые обращения появятся здесь."
      />,
    ],
    "/admin/settings": [
      "Настройки",
      "Контакты и параметры публичного сайта.",
      <div className="form-card">
        <Field
          label="Email компании"
          name="companyEmail"
          defaultValue={siteConfig.email}
        />
        <Field
          label="Телефон компании"
          name="companyPhone"
          defaultValue={siteConfig.phone}
        />
        <Button type="button" icon="Save">
          Сохранить настройки
        </Button>
      </div>,
    ],
  };
  if (sections[pathname]) {
    const [title, text, content] = sections[pathname];
    return (
      <div className="admin-section">
        <SectionTitle eyebrow="ADMIN / MANAGEMENT" title={title} text={text} />
        <div className="dashboard-panel">{content}</div>
      </div>
    );
  }
  return (
    <>
      <div className="dashboard-cards">
        <Metric title="Всего заказов" value="128" icon="ClipboardList" />
        <Metric title="Новые заявки" value="9" icon="Sparkles" />
        <Metric title="Активные" value="24" icon="Clock3" />
        <Metric title="Завершённые" value="95" icon="CircleCheck" />
      </div>
      <div className="dashboard-panel">
        <div className="panel-heading">
          <h2>Последние заказы</h2>
          <Link to="/admin/orders">
            Все заказы <ArrowRight size={15} />
          </Link>
        </div>
        <OrderRows />
      </div>
    </>
  );
}
function AdminOrdersPanel({ onNewOrder, createOpen, onCloseCreate }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ serviceName: "", sourceLanguage: "Русский", targetLanguage: "Английский", deadline: "", status: "new", price: "", comment: "" });

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try { setOrders(await fetchOrders({ role: "admin", userId: user?.id })); }
    catch (loadError) { setError(loadError.message || "Не удалось загрузить заказы."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [user?.id]);

  const openCreate = () => {
    setSelected(null);
    setForm({ serviceName: "", sourceLanguage: "Русский", targetLanguage: "Английский", deadline: "", status: "new", price: "", comment: "" });
    onNewOrder?.();
  };
  const openEdit = (order) => {
    setSelected(order);
    setForm({ serviceName: order.service_name || "", sourceLanguage: order.source_language || "", targetLanguage: order.target_language || "", deadline: order.deadline || "", status: order.status || "new", price: order.price ?? "", comment: order.comment || "" });
    onNewOrder?.();
  };
  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      if (selected) await updateOrder(selected.id, form);
      else await createOrder({ clientId: user.id, ...form });
      onCloseCreate?.(); await loadOrders();
    } catch (saveError) { setError(saveError.message || "Не удалось сохранить заказ."); }
    finally { setSaving(false); }
  };

  return <div className="admin-section">
    <SectionTitle eyebrow="ADMIN / ORDERS" title="Заказы" text="Просматривайте, добавляйте и редактируйте заказы из одного рабочего списка." />
    <div className="dashboard-panel">
      <div className="panel-heading"><h2>Все заказы</h2><Button type="button" onClick={openCreate}>Новый заказ</Button></div>
      {loading && <div className="loading-inline"><Icon name="LoaderCircle" size={18} />Загрузка заказов…</div>}
      {error && <div className="form-error"><Icon name="CircleAlert" size={16} />{error}</div>}
      {!loading && !error && !orders.length && <EmptyState title="Заказов пока нет" text="Добавьте первый заказ кнопкой выше." />}
      {!loading && !error && orders.length > 0 && <div className="admin-table admin-orders-table"><div className="admin-table-row admin-table-head"><b>Заказ</b><b>Услуга</b><b>Языки</b><b>Статус</b><b>Действие</b></div>{orders.map((order) => <div className="admin-table-row" key={order.id}><span>{order.id.slice(0, 8)}</span><span>{order.service_name || "Без названия"}</span><span>{order.source_language} → {order.target_language}</span><span><StatusBadge status={order.status === "new" ? "Новая" : order.status} /></span><button className="table-action" type="button" onClick={() => openEdit(order)}>Редактировать</button></div>)}</div>}
    </div>
    {createOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCloseCreate?.()}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="order-modal-title"><div className="panel-heading"><h2 id="order-modal-title">{selected ? "Редактировать заказ" : "Новый заказ"}</h2><button className="modal-close" type="button" onClick={onCloseCreate} aria-label="Закрыть"><X size={18} /></button></div><form className="stack-form" onSubmit={submit}><Field label="Услуга" name="serviceName" value={form.serviceName} onChange={updateField} required /><div className="form-two"><Field label="Язык оригинала" name="sourceLanguage" value={form.sourceLanguage} onChange={updateField} required /><Field label="Язык перевода" name="targetLanguage" value={form.targetLanguage} onChange={updateField} required /></div><Field label="Срок" name="deadline" type="date" value={form.deadline} onChange={updateField} /><SelectField label="Статус" name="status" value={form.status} onChange={updateField}><option value="new">Новая</option><option value="in_progress">В работе</option><option value="completed">Завершена</option><option value="cancelled">Отменена</option></SelectField><Field label="Стоимость" name="price" type="number" min="0" value={form.price} onChange={updateField} /><TextareaField label="Комментарий" name="comment" value={form.comment} onChange={updateField} /><div className="modal-actions"><Button type="button" variant="outline" onClick={onCloseCreate}>Отмена</Button><Button type="submit" disabled={saving}>{saving ? "Сохранение…" : "Сохранить заказ"}</Button></div></form></div></div>}
  </div>;
}
function AdminTable({ headers, rows }) {
  return (
    <div className="admin-table">
      <div className="admin-table-row admin-table-head">
        {headers.map((header) => (
          <b key={header}>{header}</b>
        ))}
      </div>
      {rows.map((row, index) => (
        <div className="admin-table-row" key={index}>
          {row.map((cell, cellIndex) => (
            <span key={cellIndex}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}
function Metric({ title, value, icon }) {
  return (
    <div className="metric">
      <span>
        <Icon name={icon} size={18} />
      </span>
      <b>{value}</b>
      <small>{title}</small>
    </div>
  );
}
function OrderRows() {
  const { user, profile } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchOrders({ role: profile?.role, userId: user?.id })
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((fetchError) => {
        if (active)
          setError(fetchError.message || "Не удалось загрузить заказы.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile?.role, user?.id]);
  if (loading)
    return (
      <div className="loading-inline">
        <Icon name="LoaderCircle" size={18} />
        Загрузка заказов…
      </div>
    );
  if (error)
    return (
      <div className="form-error">
        <Icon name="CircleAlert" size={16} />
        {error}
      </div>
    );
  if (!rows.length)
    return (
      <EmptyState
        title="Заказов пока нет"
        text="Новые заказы появятся здесь после отправки заявки."
      />
    );
  return (
    <div className="order-list">
      {rows.map((order) => (
        <Link
          to={`/dashboard/orders/${order.id}`}
          className="order-row"
          key={order.id}
        >
          <span className="order-id">{order.id.slice(0, 8)}</span>
          <div>
            <b>{order.service_name || "Переводческая услуга"}</b>
            <small>
              {order.source_language} → {order.target_language} ·{" "}
              {new Date(order.created_at).toLocaleDateString("ru-RU")}
            </small>
          </div>
          <StatusBadge
            status={order.status === "new" ? "Новая" : order.status}
          />
          <span className="order-price">
            {order.price ? `${order.price}` : "По оценке"}
          </span>
          <ChevronRight size={17} />
        </Link>
      ))}
    </div>
  );
}
function TaskRows() {
  return (
    <div className="order-list">
      {[
        "Договор поставки · RU → EN",
        "Презентация продукта · EN → RU",
        "Справка · RU → KY",
      ].map((task, index) => (
        <div className="order-row" key={task}>
          <span className="order-id">0{index + 1}</span>
          <div>
            <b>{task}</b>
            <small>{index === 0 ? "Срок 18.09.2026" : "Новая задача"}</small>
          </div>
          <StatusBadge status={index === 0 ? "В работе" : "Доступен"} />
          <Button variant="ghost" to="/translator/tasks">
            Подробнее
          </Button>
        </div>
      ))}
    </div>
  );
}
function Orders() {
  return (
    <div className="dashboard-shell">
      <Dashboard user={{ name: "Клиент" }} />
    </div>
  );
}
function NewOrder() {
  return (
    <section className="section form-page">
      <div className="container narrow">
        <PageHeader
          eyebrow="ЛИЧНЫЙ КАБИНЕТ / НОВЫЙ ЗАКАЗ"
          title="Расскажите о задаче"
          text="Файлы можно добавить в формате PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, JPG или PNG."
        />
        <div className="form-card">
          <OrderForm />
        </div>
      </div>
    </section>
  );
}
function Legal({ type }) {
  return (
    <>
      <PageHeader
        eyebrow={type === "privacy" ? "ДОКУМЕНТ" : "УСЛОВИЯ"}
        title={
          type === "privacy"
            ? "Политика конфиденциальности"
            : "Пользовательское соглашение"
        }
        text="Эта страница содержит placeholder-текст для последующей юридической редакции заказчиком."
      />
      <section className="section">
        <div className="container legal-copy">
          <h2>Общие положения</h2>
          <p>
            Текст документа будет заменён юридически корректной редакцией перед
            публикацией. Здесь обозначаются цели обработки данных, порядок
            работы с материалами и права пользователя.
          </p>
          <h2>Работа с данными</h2>
          <p>
            Мы используем только необходимые данные для обработки заявок, связи
            с клиентом и исполнения согласованных услуг. Конкретные сроки
            хранения и реквизиты оператора должны быть подтверждены заказчиком.
          </p>
          <h2>Контакты</h2>
          <p>По вопросам документа обратитесь по адресу {siteConfig.email}.</p>
        </div>
      </section>
    </>
  );
}
function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="not-found">
      <span className="not-found-code">404</span>
      <h1>{t("Страница не найдена")}</h1>
      <p>{t("Похоже, такой страницы нет или она была перемещена.")}</p>
      <Button to="/" icon="ArrowLeft">
        {t("Вернуться на главную")}
      </Button>
    </section>
  );
}

function TranslatorApply() {
  const navigate = useNavigate();
  const { signUp, isDemo } = useAuth();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await signUp({
        email: data.get("email"),
        password: data.get("password"),
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        role: "translator",
      });
      setSent(true);
      setTimeout(() => navigate("/translator"), 500);
    } catch (authError) {
      setError(authError.message || "Не удалось отправить заявку.");
    }
  };
  if (sent)
    return (
      <section className="auth-page">
        <div className="auth-card success-box">
          <Icon name="CircleCheck" size={28} />
          <strong>Заявка переводчика отправлена.</strong>
          <p>Профиль будет доступен после входа в кабинет.</p>
        </div>
      </section>
    );
  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span>STELLA</span>
          <small>ПЕРЕВОДЧЕСКАЯ КОМПАНИЯ</small>
        </Link>
        <span className="eyebrow">ПРОФИЛЬ ПЕРЕВОДЧИКА</span>
        <h1>Стать переводчиком</h1>
        <p>
          Создайте аккаунт и отправьте профессиональную информацию на
          рассмотрение.
        </p>
        <form className="stack-form" onSubmit={submit}>
          <div className="form-two">
            <Field
              label="Имя"
              name="firstName"
              placeholder="Ваше имя"
              required
            />
            <Field
              label="Фамилия"
              name="lastName"
              placeholder="Фамилия"
              required
            />
          </div>
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
          />
          <Field
            label="Пароль"
            name="password"
            type="password"
            placeholder="Минимум 8 символов"
            required
          />
          <Field
            label="Языки"
            name="languages"
            placeholder="Русский, English"
            required
          />
          <Field
            label="Специализация"
            name="specialization"
            placeholder="Юридический перевод"
            required
          />
          <TextareaField
            label="О себе"
            name="description"
            placeholder="Расскажите о профессиональном опыте"
          />
          <label className="upload-field">
            <span>Фото или портфолио</span>
            <input
              name="portfolioFile"
              type="file"
              accept="image/jpeg,image/png,.pdf,.doc,.docx"
            />
            <small>JPG, PNG, PDF, DOC, DOCX</small>
          </label>
          {error && (
            <div className="form-error">
              <Icon name="CircleAlert" size={16} />
              {error}
            </div>
          )}
          <Button type="submit" icon="Send">
            Отправить заявку
          </Button>
        </form>
        <div className="auth-links">
          <Link to="/login">Вернуться ко входу</Link>
        </div>
        <small className="demo-hint">
          {isDemo
            ? "Demo mode: данные сохраняются локально до подключения Supabase."
            : "Данные будут сохранены в Supabase."}
        </small>
      </div>
    </section>
  );
}

function ProtectedRoute({ user, profile, children, role }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && profile?.role !== role)
    return (
      <Navigate
        to={
          profile?.role === "admin"
            ? "/admin"
            : profile?.role === "translator"
              ? "/translator"
              : "/dashboard"
        }
        replace
      />
    );
  return children;
}
function ClientRoute({ user, profile, children }) {
  return (
    <ProtectedRoute user={user} profile={profile} role="client">
      {children}
    </ProtectedRoute>
  );
}
function TranslatorRoute({ user, profile, children }) {
  return (
    <ProtectedRoute user={user} profile={profile} role="translator">
      {children}
    </ProtectedRoute>
  );
}
function AdminRoute({ user, profile, children }) {
  return (
    <ProtectedRoute user={user} profile={profile} role="admin">
      {children}
    </ProtectedRoute>
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-screen">
        <Icon name="LoaderCircle" size={28} />
        <span>Загрузка аккаунта…</span>
      </div>
    );
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/translators" element={<Translators />} />
            <Route path="/translators/:id" element={<TranslatorProfile />} />
            <Route path="/translators/apply" element={<TranslatorApply />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/forgot-password" element={<Auth mode="forgot" />} />
            <Route path="/reset-password" element={<Auth mode="reset" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user} profile={profile}>
                  <Dashboard user={profile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/orders"
              element={
                <ProtectedRoute user={user} profile={profile}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/orders/new"
              element={
                <ProtectedRoute user={user} profile={profile}>
                  <NewOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/orders/:id"
              element={
                <ProtectedRoute user={user} profile={profile}>
                  <NewOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/translator"
              element={
                <ProtectedRoute user={user} profile={profile} role="translator">
                  <Dashboard user={profile} role="translator" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/translator/tasks"
              element={
                <ProtectedRoute user={user} profile={profile} role="translator">
                  <Dashboard user={profile} role="translator" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/translator/profile"
              element={
                <ProtectedRoute user={user} profile={profile} role="translator">
                  <About />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} profile={profile} role="admin">
                  <Dashboard user={profile} role="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute user={user} profile={profile} role="admin">
                  <Dashboard user={profile} role="admin" />
                </ProtectedRoute>
              }
            />
            <Route path="/privacy" element={<Legal type="privacy" />} />
            <Route path="/terms" element={<Legal type="terms" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LanguageProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
