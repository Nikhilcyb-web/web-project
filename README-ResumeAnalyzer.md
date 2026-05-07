# Resume Analyzer (Resume Analyzer App)

## What you get
- Upload a resume: **PDF, DOC/DOCX, TXT, PNG, JPG/JPEG**
- Or paste resume text
- Client-side analysis to suggest:
  - Detected skills
  - Strengths
  - High-impact improvements
  - Best-fit roles with a “fit %” score

## Files
- `resume-analyzer.html` (UI)
- `css/resume-analyzer.css` (styling)
- `js/resume-analyzer.js` (analysis logic)

## Note about parsing non-text formats
The JS includes best-effort parsing hooks:
- PDF: uses `window.pdfjsLib` if available
- DOC/DOCX: uses `window.mammoth` if available
- Images: uses `window.Tesseract` if available

If you don’t load those libraries, the app will still work when you paste resume text.

