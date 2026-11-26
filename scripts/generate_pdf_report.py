"""
DeltaCare Academic PDF Report Generator
Generates a publication-grade, styled PDF from the project report using Chrome's headless engine.
Designed for submission to IIIT Guwahati - CS306 Machine Learning (Dr. Debashree Devi).
Author: Sayan Shit (Roll: 2401179)
"""

import os
import re
import subprocess
import sys
from pathlib import Path


def markdown_to_styled_html(md_text: str) -> str:
    """Converts the project report markdown into publication-grade HTML with academic CSS styling."""

    # Preprocessing markdown elements
    # Remove markdown comments
    content = re.sub(r"<!--.*?-->", "", md_text, flags=re.DOTALL)

    # Convert headers
    content = re.sub(r"^### (.*?)$", r"<h3>\1</h3>", content, flags=re.MULTILINE)
    content = re.sub(r"^## (.*?)$", r"<h2>\1</h2>", content, flags=re.MULTILINE)
    content = re.sub(r"^# (.*?)$", r"<h1>\1</h1>", content, flags=re.MULTILINE)

    # Convert horizontal rules
    content = re.sub(r"^---$", r"<hr class='section-divider'>", content, flags=re.MULTILINE)

    # Convert bold and italics
    content = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", content)
    content = re.sub(r"\*(.*?)\*", r"<em>\1</em>", content)

    # Convert inline code
    content = re.sub(r"`([^`]+)`", r"<code class='inline-code'>\1</code>", content)

    # Replace block math $$...$$
    def replace_block_math(match):
        eq = match.group(1).strip()
        # Clean common math symbols for clean HTML rendering
        eq_html = (
            eq.replace(r"\mathbf{w}^*", "<b>w</b><sup>*</sup>")
            .replace(r"\mathbf{w}", "<b>w</b>")
            .replace(r"\mathbf{X}", "<b>X</b>")
            .replace(r"\mathbf{y}", "<b>y</b>")
            .replace(r"\mathbf{x}", "<b>x</b>")
            .replace(r"\boldsymbol{\varepsilon}", "<b>&epsilon;</b>")
            .replace(r"\varepsilon_i", "&epsilon;<sub>i</sub>")
            .replace(r"\varepsilon", "&epsilon;")
            .replace(r"\hat{y}_i", "y&#770;<sub>i</sub>")
            .replace(r"\hat{y}", "y&#770;")
            .replace(r"\bar{y}", "y&#772;")
            .replace(r"\bar{x}", "x&#772;")
            .replace(r"\sigma^2", "&sigma;<sup>2</sup>")
            .replace(r"\sigma", "&sigma;")
            .replace(r"\mu", "&mu;")
            .replace(r"\nabla_{\mathbf{w}}", "&nabla;<sub><b>w</b></sub>")
            .replace(r"\mathbf{I}", "<b>I</b>")
            .replace(r"\mathbf{0}", "<b>0</b>")
            .replace(r"\alpha", "&alpha;")
            .replace(r"\le", "&le;")
            .replace(r"\ge", "&ge;")
            .replace(r"\approx", "&asymp;")
            .replace(r"\ne", "&ne;")
            .replace(r"\times", "&times;")
            .replace(r"\sum_{i=1}^n", "&sum;<sub>i=1..n</sub>")
            .replace(r"\sum_{i=1}^N", "&sum;<sub>i=1..N</sub>")
            .replace(r"\sum_{m=1}^M", "&sum;<sub>m=1..M</sub>")
            .replace(r"\sum", "&sum;")
            .replace(r"\in", "&isin;")
            .replace(r"\mathbb{R}^+", "<b>R</b><sup>+</sup>")
            .replace(r"\mathbb{R}", "<b>R</b>")
            .replace(r"\mathcal{X}", "<i>X</i>")
            .replace(r"\mathcal{L}_{\text{NLL}}", "<i>L</i><sub>NLL</sub>")
            .replace(r"\text{NLL}", "NLL")
            .replace(r"\text{median}", "median")
            .replace(r"\text{Cov}", "Cov")
            .replace(r"\text{Laplace}", "Laplace")
            .replace(r"\text{sgn}", "sgn")
            .replace(r"\text{Premium}", "Premium")
            .replace(r"\text{annual}", "annual")
            .replace(r"\text{monthly}", "monthly")
            .replace(r"\text{savings}", "savings")
            .replace(r"\Delta_{\text{savings}}", "&Delta;<sub>savings</sub>")
            .replace(r"\Delta", "&Delta;")
            .replace(r"\hat{c}_m", "c&#770;<sub>m</sub>")
            .replace(r"\bar{y}_m", "y&#772;<sub>m</sub>")
            .replace(r"\cdot", "&sdot;")
            .replace(r"\implies", "&rArr;")
            .replace(r"\to", "&rarr;")
            .replace(r"\forall", "&forall;")
            .replace(r"\quad", " &nbsp; ")
        )
        return f"<div class='math-block'>{eq_html}</div>"

    content = re.sub(r"\$\$(.*?)\$\$", replace_block_math, content, flags=re.DOTALL)

    # Replace inline math $...$
    def replace_inline_math(match):
        txt = match.group(1).strip()
        # If it looks like a currency amount, keep as currency
        if re.match(r"^(\d+[\d,]*(\.\d+)?|\d+)$", txt):
            return f"${txt}"
        # Math replacements
        txt_html = (
            txt.replace(r"\mathbf{w}", "<b>w</b>")
            .replace(r"\mathbf{X}", "<b>X</b>")
            .replace(r"\mathbf{y}", "<b>y</b>")
            .replace(r"\mathbf{x}", "<b>x</b>")
            .replace(r"\hat{y}", "y&#770;")
            .replace(r"\bar{y}", "y&#772;")
            .replace(r"\bar{x}", "x&#772;")
            .replace(r"\varepsilon", "&epsilon;")
            .replace(r"R^2", "<i>R</i><sup>2</sup>")
            .replace(r"\text{MAE}", "MAE")
            .replace(r"\text{RMSE}", "RMSE")
            .replace(r"\ge", "&ge;")
            .replace(r"\le", "&le;")
            .replace(r"\approx", "&asymp;")
            .replace(r"\times", "&times;")
            .replace(r"\alpha", "&alpha;")
            .replace(r"\sigma", "&sigma;")
            .replace(r"\mu", "&mu;")
            .replace(r"\in", "&isin;")
            .replace(r"\mathbb{R}^+", "<b>R</b><sup>+</sup>")
            .replace(r"\mathbb{R}", "<b>R</b>")
            .replace(r"\mathcal{X}", "<i>X</i>")
            .replace(r"\to", "&rarr;")
            .replace(r"\Delta", "&Delta;")
            .replace(r"\pm", "&plusmn;")
            .replace(r"L_1", "<i>L</i><sub>1</sub>")
            .replace(r"L_2", "<i>L</i><sub>2</sub>")
        )
        return f"<span class='math-inline'>{txt_html}</span>"

    content = re.sub(r"\$([^\$\n]+)\$", replace_inline_math, content)

    # Process Markdown tables into clean HTML tables
    lines = content.split("\n")
    in_table = False
    table_rows = []
    processed_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            if not in_table:
                in_table = True
                table_rows = []
            table_rows.append(stripped)
        else:
            if in_table:
                # Process table
                in_table = False
                processed_lines.append(render_html_table(table_rows))
            processed_lines.append(line)

    if in_table:
        processed_lines.append(render_html_table(table_rows))

    content = "\n".join(processed_lines)

    # Convert unordered lists
    content = re.sub(r"^\s*-\s+(.*?)$", r"<li>\1</li>", content, flags=re.MULTILINE)
    content = re.sub(r"((?:<li>.*?</li>\n?)+)", r"<ul>\n\1</ul>\n", content)

    # Convert numbered lists
    content = re.sub(r"^\s*\d+\.\s+(.*?)$", r"<li class='ordered'>\1</li>", content, flags=re.MULTILINE)
    content = re.sub(r"((?:<li class='ordered'>.*?</li>\n?)+)", r"<ol>\n\1</ol>\n", content)

    # Wrap standalone paragraphs
    paras = content.split("\n\n")
    final_paras = []
    for p in paras:
        p_str = p.strip()
        if not p_str:
            continue
        if p_str.startswith("<h1") or p_str.startswith("<h2") or p_str.startswith("<h3") or \
           p_str.startswith("<table") or p_str.startswith("<ul") or p_str.startswith("<ol") or \
           p_str.startswith("<div") or p_str.startswith("<hr"):
            final_paras.append(p_str)
        else:
            final_paras.append(f"<p>{p_str}</p>")

    body_html = "\n\n".join(final_paras)

    # Full HTML Template with Academic Styling
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DeltaCare — CS306 Machine Learning Project Report | Sayan Shit (2401179)</title>
<style>
  @page {{
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-center {{
      content: "IIIT Guwahati · CS306 Machine Learning · Sayan Shit (2401179)";
      font-size: 8pt;
      color: #64748b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }}
    @bottom-right {{
      content: counter(page);
      font-size: 9pt;
      font-weight: bold;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }}
  }}

  * {{
    box-sizing: border-box;
  }}

  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.65;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }}

  /* Cover Block */
  .academic-header {{
    border-bottom: 3px double #0284c7;
    padding-bottom: 20px;
    margin-bottom: 26px;
    text-align: center;
  }}

  .inst-name {{
    font-size: 14pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 0.5px;
    margin: 0 0 4px 0;
    text-transform: uppercase;
  }}

  .dept-name {{
    font-size: 11pt;
    font-weight: 600;
    color: #0284c7;
    margin: 0 0 12px 0;
  }}

  .meta-grid {{
    display: table;
    width: 100%;
    margin-top: 15px;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    font-size: 9.5pt;
  }}

  .meta-col {{
    display: table-cell;
    width: 50%;
    vertical-align: top;
    text-align: left;
  }}

  .meta-col.right {{
    text-align: right;
  }}

  .meta-item {{
    margin: 3px 0;
  }}

  .meta-label {{
    color: #64748b;
    font-weight: 600;
  }}

  .meta-val {{
    color: #0f172a;
    font-weight: 700;
  }}

  h1 {{
    font-size: 17pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 16px 0 14px 0;
    text-align: center;
  }}

  h2 {{
    font-size: 12.5pt;
    font-weight: 700;
    color: #0f172a;
    border-left: 4px solid #0284c7;
    padding-left: 10px;
    margin: 26px 0 10px 0;
    line-height: 1.35;
    break-after: avoid;
    background: #f8fafc;
    padding-top: 4px;
    padding-bottom: 4px;
  }}

  h3 {{
    font-size: 10.5pt;
    font-weight: 700;
    color: #0369a1;
    margin: 16px 0 6px 0;
    line-height: 1.3;
    break-after: avoid;
  }}

  p {{
    margin: 0 0 10px 0;
    text-align: justify;
    text-justify: inter-word;
  }}

  .section-divider {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 22px 0;
  }}

  /* Academic abstract card */
  .abstract-card {{
    background: #f0fdf4;
    border-left: 4px solid #16a34a;
    padding: 12px 16px;
    border-radius: 0 6px 6px 0;
    margin: 16px 0 20px 0;
    font-size: 9.5pt;
  }}

  /* Math Blocks */
  .math-block {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 12px 0;
    text-align: center;
    font-family: "Cambria Math", "Latin Modern Math", Georgia, serif;
    font-size: 10.5pt;
    color: #0f172a;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    break-inside: avoid;
  }}

  .math-inline {{
    font-family: "Cambria Math", "Latin Modern Math", Georgia, serif;
    font-size: 10pt;
    color: #0f172a;
    padding: 0 2px;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px 0;
    font-size: 8.8pt;
    break-inside: avoid;
  }}

  th {{
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    padding: 7px 10px;
    text-align: left;
    border: 1px solid #0f172a;
  }}

  td {{
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    color: #1e293b;
  }}

  tr:nth-child(even) {{
    background: #f8fafc;
  }}

  tr:hover {{
    background: #f1f5f9;
  }}

  /* Lists */
  ul, ol {{
    margin: 6px 0 12px 0;
    padding-left: 22px;
  }}

  li {{
    margin-bottom: 4px;
    text-align: justify;
  }}

  .inline-code {{
    background: #f1f5f9;
    color: #0f172a;
    font-family: Consolas, "Courier New", monospace;
    font-size: 8.8pt;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }}

  /* Highlight callouts */
  .callout-success {{
    background: #eff6ff;
    border-left: 4px solid #2563eb;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    font-size: 9.2pt;
    break-inside: avoid;
  }}

  .page-break {{
    break-before: page;
  }}
</style>
</head>
<body>

<div class="academic-header">
  <div class="inst-name">Indian Institute of Information Technology Guwahati</div>
  <div class="dept-name">Department of Computer Science & Engineering</div>
  
  <div class="meta-grid">
    <div class="meta-col">
      <div class="meta-item"><span class="meta-label">Course:</span> <span class="meta-val">CS306 — Machine Learning</span></div>
      <div class="meta-item"><span class="meta-label">Instructor:</span> <span class="meta-val">Dr. Debashree Devi</span></div>
      <div class="meta-item"><span class="meta-label">Academic Session:</span> <span class="meta-val">Autumn 2026</span></div>
    </div>
    <div class="meta-col right">
      <div class="meta-item"><span class="meta-label">Student Name:</span> <span class="meta-val">Sayan Shit</span></div>
      <div class="meta-item"><span class="meta-label">Roll Number:</span> <span class="meta-val">2401179</span></div>
      <div class="meta-item"><span class="meta-label">Program:</span> <span class="meta-val">B. Tech. 3rd Year CSE</span></div>
    </div>
  </div>
</div>

{body_html}

</body>
</html>"""
    return full_html


def render_html_table(rows: list) -> str:
    """Helper to convert markdown table rows into styled HTML."""
    if len(rows) < 2:
        return ""

    header_cols = [c.strip() for c in rows[0].strip("|").split("|")]
    
    # Check alignment or separator in rows[1]
    data_rows = rows[2:] if len(rows) > 2 else []

    html = ["<table><thead><tr>"]
    for h in header_cols:
        html.append(f"<th>{h}</th>")
    html.append("</tr></thead><tbody>")

    for r in data_rows:
        cols = [c.strip() for c in r.strip("|").split("|")]
        html.append("<tr>")
        for i, c in enumerate(cols):
            # If it's a bold or code tag inside, leave intact
            html.append(f"<td>{c}</td>")
        html.append("</tr>")

    html.append("</tbody></table>")
    return "".join(html)


def main():
    repo_root = Path(__file__).resolve().parent.parent
    report_md_path = repo_root / "submission" / "PROJECT_REPORT.md"
    html_output_path = repo_root / "submission" / "PROJECT_REPORT.html"
    pdf_output_path = repo_root / "submission" / "DeltaCare_ML_Project_Report_Sayan_Shit_2401179.pdf"

    print(f"[1/4] Reading Markdown report: {report_md_path}")
    with open(report_md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    print("[2/4] Converting to academic styled HTML...")
    html_content = markdown_to_styled_html(md_text)

    with open(html_output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[3/4] HTML companion saved to: {html_output_path}")

    # Render PDF via Chrome Headless
    chrome_path = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
    if not chrome_path.exists():
        chrome_path = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

    print(f"[4/4] Generating PDF via headless browser ({chrome_path.name})...")
    cmd = [
        str(chrome_path),
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_output_path}",
        str(html_output_path.resolve()),
    ]

    subprocess.run(cmd, check=True)

    if pdf_output_path.exists():
        size_kb = pdf_output_path.stat().st_size / 1024.0
        print("\n" + "=" * 65)
        print("  PDF GENERATION SUCCESSFUL!")
        print("=" * 65)
        print(f" PDF File: {pdf_output_path}")
        print(f" Size:     {size_kb:.1f} KB")
        print("=" * 65)
    else:
        print("[ERROR] PDF generation failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
