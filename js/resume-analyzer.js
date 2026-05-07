/*
  Resume Analyzer (client-side)
  - Supports: TXT (native), PDF/DOCX/Images with best-effort browser-side parsing.
  - Note: PDF/DOCX parsing and OCR generally require external libraries or server-side processing.
    This app implements:
      * TXT: fully supported
      * PDF/DOCX: best-effort extraction using browser-native features when available (may be limited)
      * PNG/JPG: best-effort OCR using Tesseract.js *if present*; otherwise prompts user to paste text

  Expected HTML IDs (from resume-analyzer.html):
    #resumeFile, #resumeText, #analyzeBtn, #clearBtn, #status
    #overallPill, #atsSummary, #skillsChips, #strengthsList, #gapsList, #keywordsList, #rolesList, #keywordNote, #rolesNote
*/

(() => {
  const $ = (id) => document.getElementById(id);

  const resumeFileEl = $("resumeFile");
  const resumeTextEl = $("resumeText");
  const analyzeBtn = $("analyzeBtn");
  const clearBtn = $("clearBtn");
  const statusEl = $("status");

  const overallPillEl = $("overallPill");
  const atsSummaryEl = $("atsSummary");
  const skillsChipsEl = $("skillsChips");
  const strengthsListEl = $("strengthsList");
  const gapsListEl = $("gapsList");
  const keywordsListEl = $("keywordsList");
  const keywordNoteEl = $("keywordNote");
  const rolesListEl = $("rolesList");
  const rolesNoteEl = $("rolesNote");

  const DEFAULT_ROLE_LIBRARY = [
    {
      role: "Frontend Developer",
      keywords: [
        "html", "css", "javascript", "typescript", "react", "redux", "next.js", "webpack", "babel",
        "responsive", "accessibility", "a11y", "jest", "testing", "performance", "webpack",
        "css-in-js", "tailwind", "sass", "git", "rest api", "graphql", "ui"
      ],
      weights: { html: 1.3, css: 1.3, javascript: 1.3, react: 1.4, typescript: 1.2 }
    },
    {
      role: "Backend Developer (Node.js)",
      keywords: [
        "node.js", "express", "rest", "api", "graphql", "mongodb", "postgres", "sql", "sequelize",
        "authentication", "jwt", "oauth", "security", "redis", "caching", "microservices",
        "docker", "kubernetes", "jest", "testing", "logging", "scalability"
      ],
      weights: { "node.js": 1.4, express: 1.4, mongodb: 1.2, postgres: 1.2, jwt: 1.3 }
    },
    {
      role: "Data Analyst",
      keywords: [
        "sql", "python", "pandas", "numpy", "excel", "tableau", "power bi", "data visualization",
        "statistics", "regression", "dashboard", "etl", "data cleaning", "analytics",
        "hypothesis", "kpi", "business requirements"
      ],
      weights: { sql: 1.4, python: 1.2, tableau: 1.2, "power bi": 1.2 }
    },
    {
      role: "Machine Learning Engineer",
      keywords: [
        "machine learning", "ml", "python", "tensorflow", "pytorch", "sklearn", "regression",
        "classification", "neural network", "computer vision", "nlp", "feature engineering",
        "model training", "evaluation", "hyperparameter", "mle", "deployment"
      ],
      weights: { "machine learning": 1.5, python: 1.2, pytorch: 1.2, tensorflow: 1.2 }
    },
    {
      role: "UI/UX Designer",
      keywords: [
        "ui", "ux", "figma", "prototyping", "wireframe", "design system", "user research",
        "personas", "journey map", "accessibility", "usability", "hifi", "low-fi", "interaction",
        "branding"
      ],
      weights: { figma: 1.4, ux: 1.2, ui: 1.2, "design system": 1.3 }
    }
  ];

  const SKILL_BANK = [
    // Common web
    "html", "css", "javascript", "typescript", "react", "next.js", "vue", "angular", "redux",
    "node.js", "express", "graphql", "rest api", "webpack", "vite", "tailwind", "sass", "jest",
    "testing", "cypress", "playwright",
    // Data/ML
    "sql", "python", "pandas", "numpy", "tableau", "power bi", "excel", "machine learning",
    "tensorflow", "pytorch", "sklearn",
    // DevOps/SWE
    "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "git", "github actions",
    "jest", "security", "jwt", "oauth",
    // Generic
    "communication", "leadership", "teamwork", "problem solving"
  ];

  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .replace(/\u2013|\u2014/g, "-")
      .replace(/[^a-z0-9+\-#./\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const tokenize = (s) => normalize(s).split(" ").filter(Boolean);

  const countOccurrences = (haystack, needle) => {
    const h = normalize(haystack);
    const n = normalize(needle);
    if (!n) return 0;
    // Phrase-aware: simple includes count via regex
    const re = new RegExp(`\\b${escapeRegExp(n)}\\b`, "g");
    const m = h.match(re);
    return m ? m.length : 0;
  };

  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

  const extractLikelyTextFromTxt = async (file) => {
    const text = await file.text();
    return text;
  };

  const extractTextBestEffort = async (file) => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();

    // Ensure latest library globals exist (loaded via CDN in HTML)
    // If they are missing, we'll return empty and ask user to paste text.


    // TXT fully supported
    if (ext === "txt") {
      return await extractLikelyTextFromTxt(file);
    }

    // PDF: use pdf.js (loaded via CDN in HTML)
    if (ext === "pdf") {
      if (window.pdfjsLib && window.pdfjsLib.getDocument) {
        // Some pdf.js versions require setting the workerSrc.
        try {
          if (window.pdfjsLib.GlobalWorkerOptions && window.pdfjsLib.GlobalWorkerOptions.workerSrc == null) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";
          }
        } catch (_) {}

        const buf = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
        let full = "";
        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 4); pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const strings = content.items.map((it) => it.str);
          full += strings.join(" ") + "\n";
        }
        return full;
      }
      return "";
    }

    // DOCX: without external libs (mammoth) cannot parse.
    // We'll check if mammoth is present globally.
    if (ext === "docx" || ext === "doc") {
      if (window.mammoth && window.mammoth.extractRawText) {
        const buf = await file.arrayBuffer();
        const res = await window.mammoth.extractRawText({ arrayBuffer: buf });
        return res.value || "";
      }
      return "";
    }

    // Images: best effort OCR using Tesseract.js if present.
    if (ext === "png" || ext === "jpg" || ext === "jpeg") {
      if (window.Tesseract && window.Tesseract.recognize) {
        const url = URL.createObjectURL(file);
        const result = await window.Tesseract.recognize(url, "eng", {
          logger: () => {}
        });
        URL.revokeObjectURL(url);
        return (result && result.data && result.data.text) ? result.data.text : "";
      }
      return "";
    }

    return "";
  };

  const scoreResumeVsRole = (resumeText, role) => {
    const textN = normalize(resumeText);

    let keywordHits = 0;
    let keywordScore = 0;

    for (const kw of role.keywords) {
      const w = role.weights && role.weights[kw] ? role.weights[kw] : 1;
      const hitCount = countOccurrences(textN, kw);
      if (hitCount > 0) {
        keywordHits += 1;
        keywordScore += Math.min(4, hitCount) * w;
      }
    }

    // Additional heuristics:
    // - presence of bullet/metrics
    const bullets = (resumeText.match(/\n\s*[-*•]\s+/g) || []).length;
    const metrics = (resumeText.match(/\b(\d+\.?\d*)\s*(%|x|ms|s|seconds|minutes|hours|kpi|revenue|users|latency|cpu|ram)\b/gi) || []).length;
    const years = (resumeText.match(/\b(20\d{2}|19\d{2})\b/g) || []).length;

    const quality =
      Math.min(1.0, bullets / 6) * 0.2 +
      Math.min(1.0, metrics / 3) * 0.25 +
      Math.min(1.0, years / 3) * 0.1;

    const keywordMax = role.keywords.length * 2;
    const keywordPart = keywordScore / Math.max(1, keywordMax);

    const fit = Math.max(0, Math.min(1, 0.75 * keywordPart + 0.25 * quality));

    return {
      fit,
      keywordHits,
      keywordScore,
      quality,
      matchedKeywords: role.keywords.filter((kw) => countOccurrences(textN, kw) > 0)
    };
  };

  const pickSkills = (resumeText) => {
    const textN = normalize(resumeText);
    const skills = [];
    for (const s of SKILL_BANK) {
      if (countOccurrences(textN, s) > 0) skills.push(s);
    }
    // rank by frequency
    skills.sort((a, b) => countOccurrences(textN, b) - countOccurrences(textN, a));
    return Array.from(new Set(skills)).slice(0, 14);
  };

  const buildStrengthsAndGaps = (resumeText, role) => {
    const textN = normalize(resumeText);

    const strengths = [];
    const gaps = [];

    const matched = role.keywords.filter((kw) => countOccurrences(textN, kw) > 0);
    if (matched.length) {
      strengths.push(`Strong keyword coverage for: ${matched.slice(0, 6).join(", ")}${matched.length > 6 ? "…" : ""}`);
    } else {
      strengths.push("No strong role keywords detected yet. Add targeted skills from the job description.");
    }

    const bullets = (resumeText.match(/\n\s*[-*•]\s+/g) || []).length;
    if (bullets >= 3) strengths.push(`Good structure with ~${bullets} bullet points. ATS-friendly formatting detected.`);
    else gaps.push("Add more bullets with action verbs (Built, Implemented, Led) instead of paragraphs.");

    const metrics = (resumeText.match(/\b(\d+\.?\d*)\s*(%|x|ms|s|seconds|minutes|hours|kpi|revenue|users|latency|cpu|ram)\b/gi) || []).length;
    if (metrics >= 2) strengths.push(`Includes measurable impact (found ${metrics} metric-like statements).`);
    else gaps.push("Add quantified outcomes (%, time saved, latency, test coverage, revenue, users, cost)." );

    // Common missing sections heuristics
    if (!/\b(summary|profile|objective)\b/i.test(resumeText)) gaps.push("Add a short Summary/Objective (2–4 lines) tailored to the target role.");
    if (!/\b(projects?)\b/i.test(resumeText)) gaps.push("Add a Projects section (3–5 items) that map directly to the role keywords.");

    // Keyword gaps
    const missing = role.keywords.filter((kw) => countOccurrences(textN, kw) === 0);
    const topMissing = missing.slice(0, 8);
    if (topMissing.length) {
      gaps.push(`Missing high-signal keywords to consider: ${topMissing.slice(0, 5).join(", ")}${topMissing.length > 5 ? "…" : ""}`);
    }

    return { strengths: strengths.slice(0, 4), gaps: gaps.slice(0, 6) };
  };

  const buildRoleSuggestions = (resumeText) => {
    const scored = DEFAULT_ROLE_LIBRARY.map((role) => {
      const s = scoreResumeVsRole(resumeText, role);
      return { ...role, ...s };
    }).sort((a, b) => b.fit - a.fit);

    const top = scored.slice(0, 3);
    return { scored, top };
  };

  const renderChips = (items) => {
    skillsChipsEl.innerHTML = "";
    if (!items.length) {
      skillsChipsEl.textContent = "No skills detected yet.";
      return;
    }
    items.forEach((s) => {
      const d = document.createElement("div");
      d.className = "chip";
      d.textContent = s;
      skillsChipsEl.appendChild(d);
    });
  };

  const renderList = (el, items) => {
    el.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = "—";
      el.appendChild(li);
      return;
    }
    items.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      el.appendChild(li);
    });
  };

  const renderKeywordsToAdd = (resumeText, role) => {
    const textN = normalize(resumeText);
    const missing = role.keywords.filter((kw) => countOccurrences(textN, kw) === 0);
    const present = role.keywords.filter((kw) => countOccurrences(textN, kw) > 0);

    const toAdd = missing.slice(0, 10);
    renderList(keywordsListEl, toAdd);

    if (present.length) {
      keywordNoteEl.textContent = `You already mention ${present.length} of the role keywords. Add the missing ones naturally in bullets.`;
    } else {
      keywordNoteEl.textContent = `This role match is low. Replace generic items with keywords from the job description.`;
    }
  };

  const renderRoles = (resumeText) => {
    rolesListEl.innerHTML = "";
    const { scored, top } = buildRoleSuggestions(resumeText);

    const maxFit = top[0] ? top[0].fit : 1;

    top.forEach((r) => {
      const div = document.createElement("div");
      div.className = "role";

      const title = document.createElement("div");
      title.className = "role-title";
      title.textContent = r.role;

      const score = document.createElement("div");
      score.className = "score";
      const pct = Math.round(r.fit * 100);
      score.textContent = `${pct}% Fit`;

      const prog = document.createElement("div");
      prog.className = "progress";
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = `${Math.round((r.fit / Math.max(1e-6, maxFit)) * 100)}%`;
      prog.appendChild(bar);

      const matched = document.createElement("div");
      matched.className = "small";
      matched.style.marginTop = "8px";
      matched.textContent = `Matched keywords: ${r.matchedKeywords.slice(0, 6).join(", ") || "—"}${r.matchedKeywords.length > 6 ? "…" : ""}`;

      div.appendChild(title);
      div.appendChild(score);
      div.appendChild(prog);
      div.appendChild(matched);

      rolesListEl.appendChild(div);
    });

    const best = scored[0];
    if (!best || !isFinite(best.fit)) {
      rolesNoteEl.textContent = "Paste a resume to generate role suggestions.";
    } else {
      rolesNoteEl.textContent = best.fit >= 0.65
        ? `Best match: ${best.role}. Tailor the Summary and 2–3 strongest bullets to this role.`
        : `Best match: ${best.role}. Improve keyword coverage and add measurable impact to raise ATS match.`;
    }
  };

  const analyze = async () => {
    const resumeText = resumeTextEl.value.trim();
    const file = resumeFileEl.files && resumeFileEl.files[0] ? resumeFileEl.files[0] : null;

    statusEl.textContent = "";
    overallPillEl.textContent = "Overall Fit: —";

    let text = resumeText;

    if (file) {
      statusEl.textContent = `Reading ${file.name}...`;
      try {
        const extracted = await extractTextBestEffort(file);
        if (extracted && extracted.trim().length > 50) {
          text = extracted;
          // keep user text as-is if they already pasted something
          if (!resumeText) resumeTextEl.value = extracted;
          statusEl.textContent = "Extracted text successfully. Analyzing...";
        } else {
          statusEl.textContent =
            "Could not extract text from this file in your current setup. Paste resume text below to analyze.";
        }
      } catch (e) {
        console.error(e);
        statusEl.textContent = "File read failed. Paste resume text below to analyze.";
      }
    }

    if (!text || text.trim().length < 20) {
      statusEl.textContent = "Add/paste resume text first (or upload a supported TXT file).";
      return;
    }

    const skills = pickSkills(text);
    renderChips(skills);

    const { scored, top } = buildRoleSuggestions(text);
    const best = top[0] || scored[0];

    const bestPct = best ? Math.round(best.fit * 100) : 0;
    overallPillEl.textContent = `Overall Fit: ${bestPct}%`;

    atsSummaryEl.textContent = best
      ? `ATS keyword coverage is the main signal. Best match role: ${best.role} (${bestPct}% fit).`
      : "ATS summary unavailable.";

    // Strengths/gaps/keywords for best role
    if (best) {
      const { strengths, gaps } = buildStrengthsAndGaps(text, best);
      renderList(strengthsListEl, strengths);
      renderList(gapsListEl, gaps);
      renderKeywordsToAdd(text, best);
    }

    renderRoles(text);
    statusEl.textContent = "Done.";
  };

  const clearAll = () => {
    resumeFileEl.value = "";
    resumeTextEl.value = "";
    statusEl.textContent = "";

    overallPillEl.textContent = "Overall Fit: —";
    atsSummaryEl.textContent = "Upload/paste to analyze.";

    renderChips([]);
    renderList(strengthsListEl, []);
    renderList(gapsListEl, []);
    renderList(keywordsListEl, []);

    keywordNoteEl.textContent = "";
    renderList(rolesListEl, []);

    // rolesListEl is not a UL. Ensure it clears visually.
    rolesListEl.innerHTML = "";
    rolesNoteEl.textContent = "";
  };

  analyzeBtn.addEventListener("click", analyze);
  clearBtn.addEventListener("click", clearAll);

  // UX: if user pastes and hits Ctrl/Cmd+Enter
  resumeTextEl.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") analyze();
  });

  // Initial hint
  statusEl.textContent =
    "Tip: TXT fully supported. For PDF/DOCX/Images, this demo uses best-effort extraction; paste text for best results.";

  // Provide graceful compatibility for older HTML
  if (!resumeFileEl) {
    console.warn("resumeFile element not found. The UI may not match this script.");
  }
})();

