import { FormEvent, useEffect, useMemo, useState } from "react";

type ExperienceInput = {
  task: string;
  audience: string;
  tools: string;
  improvement: string;
  evidence: string;
};

type AudienceKey = "graduate" | "switcher" | "gap" | "freelancer" | "migrant" | "advisor";

const steps = [
  { key: "task", label: "ماذا فعلت؟", hint: "اكتب المهمة كما تتذكرها، بلا تلميع." },
  { key: "audience", label: "لمن؟", hint: "الفريق، العملاء، المؤسسة، أو الجمهور الذي خدمته." },
  { key: "tools", label: "بماذا؟", hint: "الأدوات أو الطريقة التي اعتمدت عليها." },
  { key: "improvement", label: "ما الذي تحسن؟", hint: "وقت أقل، تنظيم أفضل، تجربة أوضح، أو نتيجة أخرى." },
  { key: "evidence", label: "ما الدليل؟", hint: "عدد، نطاق، حجم، تكرار، أو مثال يمكن شرحه." },
] as const;

const initialExperience: ExperienceInput = {
  task: "أدرت محتوى حسابات التواصل الاجتماعي.",
  audience: "أربعة حسابات تجارية صغيرة.",
  tools: "تقويم محتوى موحد ومراجعة أسبوعية للأداء.",
  improvement: "أصبح النشر منتظمًا وأسهل للفريق.",
  evidence: "منشوران أسبوعيًا إلى خمسة منشورات أسبوعيًا.",
};

const audienceContent: Record<AudienceKey, { label: string; title: string; body: string }> = {
  graduate: { label: "حديث التخرج", title: "حوّل المشاريع إلى أدلة", body: "لا تحتاج إلى وظيفة طويلة كي تشرح قدرتك. استخدم مشروع التخرج، التدريب، والعمل التطوعي كوقائع يمكن ربطها بدورك ونتيجتها." },
  switcher: { label: "مغير المسار", title: "انقل خبرتك، لا تخفها", body: "الأداة تساعدك على ترجمة المهارات المشتركة بين مجالك السابق والدور الجديد، مع الاعتراف بما تحتاج إلى تعلمه." },
  gap: { label: "فجوة وظيفية", title: "اشرح الفترة بوضوح", body: "الفجوة ليست جملة اعتذار. اجمع ما تعلمته أو أنجزته خلالها، ثم اربطه بالخطوة التي تريدها الآن." },
  freelancer: { label: "مستقل", title: "اجعل المشاريع قابلة للفهم", body: "بدل سرد أسماء العملاء فقط، وضّح المشكلة التي واجهتها، نطاق عملك، وكيف عرف العميل أن العمل نفعه." },
  migrant: { label: "متقدم بلغة ثانية", title: "صوتك أولًا، ثم الترجمة", body: "اكتب الدليل من تجربتك قبل البحث عن الصياغة المثالية. النتيجة الأفضل ليست الأكثر رسمية، بل الأكثر قابلية للتصديق." },
  advisor: { label: "مرشد مهني", title: "منهج يتكرر مع كل شخص", body: "استخدم الأسئلة نفسها لاستخراج الأدلة، ثم اترك لكل متقدم صوته وسياقه بدل توزيع نصوص جاهزة." },
};

const modules = [
  ["01", "محول الخبرة إلى إنجازات", "من وصف مهمة مبهم إلى جملة يمكن الدفاع عنها: فعل، سياق، نتيجة، ودليل.", "يدخل: تجربة خام / يخرج: نقطة مهنية"],
  ["02", "قوالب حسب نوع الوظيفة", "قالب حديث التخرج ليس قالب تغيير مسار. كل نسخة تبدأ من نوع الدليل الذي يهم الدور.", "يدخل: نوع الدور / يخرج: هيكل مناسب"],
  ["03", "خطاب تقديم بشري", "سبب حقيقي للاهتمام، دليل من خبرتك، وفهم لما يحتاجه الفريق. لا فقرة تصلح لكل شركة.", "يدخل: إعلان + خبرة / يخرج: مسودة قابلة للتعديل"],
  ["04", "تخصيص الإعلان الوظيفي", "يقارن بين متطلبات الإعلان والأدلة الموجودة عندك، ويظهر ما يحتاج مثالًا بدل إخفائه.", "يدخل: السيرة + الإعلان / يخرج: خريطة ملاءمة"],
  ["05", "بنك إجابات المقابلات", "أسئلة المقابلة تتحول إلى قصص من تجربتك، لا إجابات محفوظة تعود بها كل مرة.", "يدخل: مواقفك / يخرج: إجابات تتدرب عليها"],
  ["06", "محرر الأسلوب الآلي", "يقلل المبالغة والتعميم والتكرار، ويقرب النص من الكلمات التي ستقولها فعلًا.", "ليس: كاشفًا مضمونًا للذكاء الاصطناعي"],
];

const pricing = [
  ["قالب مجاني مع مثال", "بداية سريعة لتجربة المنهج", "مجاني"],
  ["حزمة السيرة والرسائل", "سيرة ورسائل مبنية على أدلتك", "9–19 دولارًا"],
  ["النظام الكامل", "تخصيص ومقابلات مع الحزمة", "29–59 دولارًا"],
  ["مراجعة شخصية", "جلسة أو مراجعة بشرية متخصصة", "79–199 دولارًا"],
  ["للمراكز والجامعات", "ترخيص خاص للبرامج المهنية", "حسب النطاق"],
];

const faqs = [
  ["هل يضمن Human Job Kit وظيفة؟", "لا. لا يملك أي قالب أو أداة قرار الشركة. ما نملكه هو مساعدتك على عرض خبرتك بوضوح، ومواءمة طلبك مع الدور، وتقليل اللغة العامة."],
  ["هل يكتب بدلًا مني؟", "يبدأ من إجاباتك وتجاربك. النتيجة مسودة تساعدك على التفكير والتحرير، وليست نصًا محفوظًا يجب نسخه كما هو."],
  ["هل يناسب تغيير المجال؟", "نعم، لأن الأسئلة تبحث عن الأدلة القابلة للنقل بين المجالات. وفي الوقت نفسه، تظهر الفجوات التي تحتاج إلى تعلم بدل أن تخفيها."],
  ["ماذا أفعل إذا كانت عندي فجوة وظيفية؟", "حوّل الفترة إلى سياق قابل للشرح: ماذا تعلمت أو أنجزت، وما الذي تغيّر، وكيف يخدم ذلك الخطوة التالية."],
  ["هل هو كاشف للذكاء الاصطناعي؟", "لا نعد بكشف مضمون. نسميه محررًا يجعل النص أوضح وأكثر صدقًا وأقرب إلى صوتك، وهذا هو الشيء الذي نستطيع تحسينه فعلًا."],
];

function buildAchievement(input: ExperienceInput) {
  const task = input.task.replace(/[.،]+$/, "").trim() || "عمل على مهمة مهنية";
  const audience = input.audience.replace(/[.،]+$/, "").trim() || "فريق أو عملاء";
  const tools = input.tools.replace(/[.،]+$/, "").trim();
  const improvement = input.improvement.replace(/[.،]+$/, "").trim();
  const evidence = input.evidence.replace(/[.،]+$/, "").trim();
  return `${task.replace(/^مسؤول عن\s*/i, "أدار ")} لـ${audience}، ${improvement || "وحسّن طريقة العمل"}${tools ? ` باستخدام ${tools}` : ""}${evidence ? `، مع دليل واضح: ${evidence}` : "."}`;
}

function ThemeIcon({ isLight }: { isLight: boolean }) {
  return <span aria-hidden="true" className="mono" style={{ fontSize: 14 }}>{isLight ? "☼" : "◐"}</span>;
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<ExperienceInput>(initialExperience);
  const [activeAudience, setActiveAudience] = useState<AudienceKey>("graduate");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("job-seeker");
  const [consent, setConsent] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "idle" | "error" | "success"; text: string }>({ type: "idle", text: "" });

  useEffect(() => {
    const saved = window.localStorage.getItem("hjk-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("hjk-theme", theme);
  }, [theme]);

  const currentStep = steps[step];
  const achievement = useMemo(() => buildAchievement(experience), [experience]);
  const isComplete = Object.values(experience).every((value) => value.trim().length > 0);
  const activeAudienceContent = audienceContent[activeAudience];

  function scrollToDemo() {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  function updateField(value: string) {
    setExperience((current) => ({ ...current, [currentStep.key]: value }));
  }

  function handleDemoNext() {
    if (step < steps.length - 1) setStep((current) => current + 1);
  }

  function handleDemoReset() {
    setExperience(initialExperience);
    setStep(0);
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailStatus({ type: "error", text: "[ERROR: أدخل بريدًا صالحًا]" });
      return;
    }
    if (!consent) {
      setEmailStatus({ type: "error", text: "[ERROR: وافق على حفظ طلبك]" });
      return;
    }
    window.localStorage.setItem("hjk-waitlist", JSON.stringify({ email, role, consent: true }));
    setEmailStatus({ type: "success", text: "[SAVED: سُجل اهتمامك على هذا الجهاز]" });
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">تجاوز إلى المحتوى</a>
      <header className="header">
        <div className="container header-inner">
          <a className="wordmark" href="#top" aria-label="Human Job Kit، الصفحة الرئيسية">
            <span className="wordmark-mark" aria-hidden="true"><span /><span /><span /></span>
            <span>HUMAN JOB KIT <span style={{ color: "var(--muted)" }}>/ عدة التوظيف الإنساني</span></span>
          </a>
          <nav id="main-nav" className={`nav ${menuOpen ? "open" : ""}`} aria-label="التنقل الرئيسي">
            <a href="#how" onClick={() => setMenuOpen(false)}>كيف يعمل</a>
            <a href="#tools" onClick={() => setMenuOpen(false)}>الأدوات</a>
            <a href="#fit" onClick={() => setMenuOpen(false)}>لمن؟</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>الأسعار</a>
          </nav>
          <div className="header-actions">
            <button className="icon-button" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"} title="تبديل الوضع"><ThemeIcon isLight={theme === "dark"} /></button>
            <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="main-nav" aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}>{menuOpen ? "×" : "≡"}</button>
            <button className="btn small" type="button" onClick={scrollToDemo}>جرّب المثال <span aria-hidden="true">↘</span></button>
          </div>
        </div>
      </header>

      <main id="main">
        <section id="top" className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">Human Job Kit / 001</span>
              <h1>حوّل خبرتك إلى <em>دليل مقنع</em> على قدرتك.</h1>
              <p className="hero-copy">عدة التوظيف الإنساني تساعدك على كتابة سيرة ورسائل وإجابات مقابلات مبنية على ما فعلته فعلًا، وبصوت يشبهك.</p>
              <div className="hero-actions">
                <button className="btn" type="button" onClick={scrollToDemo}>حوّل تجربة إلى إنجاز <span aria-hidden="true">↘</span></button>
                <a className="btn secondary" href="#how">شاهد المنهج <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            <div className="hero-rail" aria-label="حدود المنتج">
              <div className="rail-row"><span className="mono">[01] المشكلة</span><strong>خبرة حقيقية، عرض عام.</strong></div>
              <div className="rail-row"><span className="mono">[02] المنهج</span><strong>الفعل + السياق + النتيجة + الدليل.</strong></div>
              <div className="rail-row"><span className="mono">[03] الوعد</span><strong>طلب أوضح، لا وظيفة مضمونة.</strong></div>
              <div className="hero-stamp mono"><span>STATUS / HUMAN-FIRST</span><span><i className="eyebrow" style={{ color: "var(--text)", fontStyle: "normal", letterSpacing: 0 }}>LIVE EXAMPLE</i></span></div>
            </div>
          </div>
        </section>

        <section id="demo" className="section demo-section">
          <div className="container demo-wrap">
            <div className="demo-lead">
              <span className="eyebrow">تجربة صغيرة، فرق واضح</span>
              <h2>لا تبدأ من النص. ابدأ من الدليل.</h2>
              <p>أجب عن خمسة أسئلة قصيرة. لا نطلب منك أن تبدو مثاليًا، بل أن تتذكر ما حدث ويمكنك شرحه.</p>
              <p className="mono" style={{ color: "var(--quiet)", fontSize: 10, marginTop: 32 }}>LOCAL DEMO / لا يُرسل أي نص إلى خادم</p>
            </div>
            <div className="form-panel" aria-label="محوّل الخبرة إلى إنجازات">
              <div className="form-top"><span className="mono">EXPERIENCE → EVIDENCE</span><span className="mono form-count">0{step + 1} / 05</span></div>
              <div className="steps" role="tablist" aria-label="خطوات التجربة">
                {steps.map((item, index) => <button key={item.key} className={`step-dot ${index === step ? "active" : ""} ${index < step ? "done" : ""}`} type="button" role="tab" aria-selected={index === step} onClick={() => setStep(index)}><span>{index < step ? "✓" : `0${index + 1}`}</span>{item.label}</button>)}
              </div>
              <div className="form-body">
                <label className="field-label" htmlFor={`experience-${currentStep.key}`}><span>{currentStep.label}</span><small>مطلوب</small></label>
                <p className="field-help">{currentStep.hint}</p>
                <textarea id={`experience-${currentStep.key}`} className="textarea" value={experience[currentStep.key]} onChange={(event) => updateField(event.target.value)} placeholder="اكتب إجابة قصيرة من واقع تجربتك..." aria-describedby="demo-status" />
                <div className="form-actions">
                  <span id="demo-status" className="status">{experience[currentStep.key].trim() ? "[جاهز]" : "[ينقصنا دليل]"}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn secondary small" type="button" onClick={handleDemoReset}>إعادة</button>
                    {step < steps.length - 1 ? <button className="btn small" type="button" onClick={handleDemoNext}>التالي <span aria-hidden="true">←</span></button> : null}
                  </div>
                </div>
                {step === steps.length - 1 && <div className="result-panel"><span className="result-label">[OUTPUT: {isComplete ? "جاهز للمراجعة" : "ينقصنا بعض السياق"}]</span><div className="result-grid"><div className="result-box weak"><h3>قبل</h3><p>مسؤول عن إدارة حسابات التواصل الاجتماعي.</p></div><div className="result-box after"><h3>بعد</h3><p>{achievement}</p></div></div></div>}
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="section">
          <div className="container">
            <div className="section-head"><span className="eyebrow">ست أدوات، منهج واحد</span><div><h2 className="section-title">كل مخرج يبدأ من تجربة، لا من فقرة جاهزة.</h2><p className="section-intro" style={{ marginTop: 22 }}>تساعدك الأدوات على استخراج ما تعرفه، اختيار الدليل المناسب، ثم صياغته بطريقة يستطيع شخص آخر فهمها وتصديقها.</p></div></div>
            <div className="module-list">{modules.map(([number, title, body, tag]) => <article className="module-row" key={number}><span className="module-no">/{number}</span><div><h3>{title}</h3><span className="module-tag">{tag}</span></div><p>{body}</p></article>)}</div>
          </div>
        </section>

        <section id="how" className="section evidence">
          <div className="container evidence-grid">
            <div><span className="eyebrow">الدليل في الصياغة</span><h2 className="section-title" style={{ marginTop: 20 }}>الفرق ليس في الزخرفة.</h2><div className="evidence-tabs" role="tablist" aria-label="أمثلة الخبرات">{(["graduate", "switcher", "gap"] as AudienceKey[]).map((key) => <button className={`tab ${activeAudience === key ? "active" : ""}`} type="button" role="tab" aria-selected={activeAudience === key} onClick={() => setActiveAudience(key)} key={key}>{audienceContent[key].label}</button>)}</div><p className="evidence-note">مثال توضيحي. استبدل الرقم والتفاصيل بما تستطيع إثباته من تجربتك.</p></div>
            <div className="compare"><div className="compare-head"><span>FORMAT</span><span>ما الذي يقرأه الطرف الآخر؟</span></div><div className="compare-row weak"><span className="label">عام</span><p>مسؤول عن إدارة حسابات التواصل الاجتماعي.</p></div><div className="compare-row"><span className="label">محدد</span><p>أدار محتوى أربعة حسابات تجارية، ورفع وتيرة النشر من مرتين إلى خمس مرات أسبوعيًا باستخدام تقويم محتوى موحد.</p></div><div className="compare-row"><span className="label">القاعدة</span><p><strong>فعل</strong> + سياق + <strong>نتيجة</strong> + دليل يمكن شرحه.</p></div></div>
          </div>
        </section>

        <section className="section" id="workflow">
          <div className="container"><div className="section-head"><span className="eyebrow">كيف يعمل</span><div><h2 className="section-title">من الذاكرة إلى طلب يمكن الدفاع عنه.</h2><p className="section-intro" style={{ marginTop: 22 }}>الأداة لا تحذف التعقيد من مسارك. تساعدك على ترتيبه حتى تعرف ماذا تقول وماذا تحتاج إلى تطويره.</p></div></div><div className="workflow-grid">{[["01", "اجمع التفاصيل", "ابدأ بما حدث، لا بما يبدو احترافيًا."], ["02", "استخرج الأدلة", "ابحث عن الحجم، التكرار، الوقت، أو الموقف."], ["03", "خصص الطلب", "اربط دليلك بما يحتاجه هذا الدور تحديدًا."], ["04", "تدرّب على الشرح", "حوّل الجملة إلى قصة تستطيع قولها في المقابلة."]].map(([number, title, body]) => <div className="workflow-step" key={number}><span className="num">/{number}</span><h3>{title}</h3><p>{body}</p></div>)}</div></div>
        </section>

        <section id="fit" className="section audience">
          <div className="container audience-grid"><div><span className="eyebrow">لمن؟</span><h2 className="section-title" style={{ marginTop: 20 }}>كل مسار له دليل مختلف.</h2><div className="audience-list" style={{ marginTop: 38 }}>{(Object.keys(audienceContent) as AudienceKey[]).map((key) => <button type="button" key={key} className={`audience-tab ${activeAudience === key ? "active" : ""}`} onClick={() => setActiveAudience(key)}>{audienceContent[key].label}</button>)}</div></div><div className="audience-result"><span className="mono">PROFILE / {activeAudience.toUpperCase()}</span><h3>{activeAudienceContent.title}</h3><p>{activeAudienceContent.body}</p></div></div>
        </section>

        <section id="pricing" className="section">
          <div className="container"><div className="section-head"><span className="eyebrow">أسعار اختبارية</span><div><h2 className="section-title">ابدأ بما تحتاجه الآن.</h2><p className="section-intro" style={{ marginTop: 22 }}>هذه نطاقات لا قرارات نهائية. لا يوجد checkout هنا، فقط طريقة لفهم شكل المنتج المحتمل.</p></div></div><div className="pricing-table"><div className="price-row head"><span>النسخة</span><span>ما تتضمنه</span><span style={{ textAlign: "end" }}>النطاق</span></div>{pricing.map(([name, detail, value]) => <div className="price-row" key={name}><span className="price-name">{name}</span><span className="price-detail">{detail}</span><span className="price-value">{value}</span></div>)}</div><p className="pricing-foot">للسوق العربي، يمكن اختبار نطاق تقريبي بين 35 و150 ريالًا للنسخة الرقمية، مع سعر أعلى للمراجعة الشخصية.</p></div>
        </section>

        <section className="section evidence" id="faq"><div className="container faq-grid"><div><span className="eyebrow">حدود واضحة</span><h2 className="section-title" style={{ marginTop: 20 }}>نعدك بما نملكه.</h2><p className="section-intro" style={{ marginTop: 22 }}>تحسين طريقة عرض خبرتك، وزيادة ملاءمة طلبك، وتقليل اللغة العامة والمصطنعة. قرار الشركة ليس ضمن المنتج.</p></div><div className="faq-list">{faqs.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}</summary><div className="faq-answer">{answer}</div></details>)}</div></div></section>

        <section className="cta-section" id="waitlist"><div className="container cta-grid"><div><span className="eyebrow">قريبًا / النسخة الأولى</span><h2>اكتب ما فعلته. ثم اجعله مفهومًا.</h2><p>سجل اهتمامك لتجربة النسخة الأولى. هذا النموذج تجريبي، ولا يرسل بريدًا حقيقيًا أو يشارك بياناتك خارج جهازك.</p></div><form className="email-form" onSubmit={handleEmailSubmit} noValidate><label className="mono" htmlFor="email" style={{ fontSize: 10 }}>EMAIL / بريدك الإلكتروني</label><input id="email" className="email-input" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailStatus({ type: "idle", text: "" }); }} placeholder="you@example.com" aria-describedby="email-status" /><label className="mono" htmlFor="role" style={{ fontSize: 10 }}>PROFILE / نوع الاستخدام</label><select id="role" className="email-select" value={role} onChange={(event) => setRole(event.target.value)}><option value="job-seeker">باحث عن عمل</option><option value="career-switcher">مغير مسار</option><option value="advisor">مرشد مهني</option><option value="institution">مركز أو جامعة</option></select><label className="consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> <span>أوافق على حفظ طلبي محليًا لهذا العرض التجريبي. لا توجد رسائل تسويقية في هذه المرحلة.</span></label><div id="email-status" className={`email-status ${emailStatus.type}`} role="status" aria-live="polite">{emailStatus.text}</div><button className="btn" type="submit" style={{ background: "white", color: "var(--accent)", borderColor: "white" }}>سجل اهتمامك <span aria-hidden="true">↙</span></button></form></div></section>
      </main>

      <footer className="footer"><div className="container footer-grid"><p>Human Job Kit يساعدك على التعبير عن خبرتك. لا يضمن مقابلة أو قبولًا أو راتبًا. إحصاءات السياق: <a href="https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/" target="_blank" rel="noreferrer">تقرير المنتدى الاقتصادي العالمي 2025</a> و<a href="https://hiringlab.indeed.com/2025/11/20/indeed-2026-us-jobs-hiring-trends-report/" target="_blank" rel="noreferrer">توقعات Indeed 2026</a>.</p><div className="footer-links"><a href="#top">العودة للأعلى ↑</a><a href="#faq">الحدود والأسئلة</a><a href="#waitlist">قائمة الاهتمام</a></div></div></footer>
    </div>
  );
}
