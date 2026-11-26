"""
DeltaCare Academic PDF Report Generator
Generates a publication-grade, styled PDF from the project report using Chrome's headless engine.
Designed for submission to IIIT Guwahati - CS306 Machine Learning (Dr. Debashree Devi).
Author: Sayan Shit (Roll: 2401179)
Session: Monsoon 2026
"""

import os
import re
import subprocess
import sys
from pathlib import Path


# ==============================================================================
# 1. BALANCED-BRACE RECURSIVE LATEX PARSERS
# ==============================================================================

def _extract_braced(s: str, start_idx: int):
    """Extracts content inside { } starting at s[start_idx] == '{'. Returns (content, end_idx)."""
    if start_idx >= len(s) or s[start_idx] != '{':
        return None, start_idx
    depth = 1
    i = start_idx + 1
    content = []
    while i < len(s) and depth > 0:
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
        if depth > 0:
            content.append(s[i])
        i += 1
    return "".join(content), i


def parse_recursive_fractions(s: str) -> str:
    """Recursively converts \\frac{num}{den} into semantic HTML fraction elements."""
    idx = 0
    res = []
    while idx < len(s):
        if s[idx:idx+5] == r"\frac":
            num_content, next_idx = _extract_braced(s, idx + 5)
            if num_content is not None:
                den_content, end_idx = _extract_braced(s, next_idx)
                if den_content is not None:
                    parsed_num = parse_recursive_fractions(num_content)
                    parsed_den = parse_recursive_fractions(den_content)
                    res.append(f"<span class='frac'><span class='num'>{parsed_num}</span><span class='den'>{parsed_den}</span></span>")
                    idx = end_idx
                    continue
        res.append(s[idx])
        idx += 1
    return "".join(res)


def parse_recursive_sqrt(s: str) -> str:
    """Recursively converts \\sqrt{rad} into an inline radical with connected vinculum."""
    idx = 0
    res = []
    while idx < len(s):
        if s[idx:idx+5] == r"\sqrt":
            rad_content, end_idx = _extract_braced(s, idx + 5)
            if rad_content is not None:
                parsed_rad = parse_recursive_sqrt(rad_content)
                res.append(f"<span class='sqrt-wrapper'><span class='sqrt-radicand'>{parsed_rad}</span></span>")
                idx = end_idx
                continue
        res.append(s[idx])
        idx += 1
    return "".join(res)


# ==============================================================================
# 2. ROBUST LATEX MATH TO SEMANTIC HTML CONVERTER
# ==============================================================================

def clean_math_string(s: str) -> str:
    """Converts a raw LaTeX equation string into clean, publication-grade HTML."""
    # 1. Structural transforms: fractions & square roots
    s = parse_recursive_fractions(s)
    s = parse_recursive_sqrt(s)

    # 2. Specific compound constructs (MUST run before generic replacements)
    s = s.replace(r"\nabla_{\mathbf{w}}", "&nabla;<sub><b>w</b></sub>")
    s = s.replace(r"\nabla", "&nabla;")
    s = s.replace(r"\mathbf{w}^*_{\text{Ridge}}", "<b>w</b><sup>*</sup><sub>Ridge</sub>")
    s = s.replace(r"\mathbf{w}^*", "<b>w</b><sup>*</sup>")
    s = s.replace(r"\mathbf{w}", "<b>w</b>")
    s = s.replace(r"\mathbf{X}^T", "<b>X</b><sup><i>T</i></sup>")
    s = s.replace(r"\mathbf{X}", "<b>X</b>")
    s = s.replace(r"\mathbf{y}", "<b>y</b>")
    s = s.replace(r"\mathbf{x}", "<b>x</b>")
    s = s.replace(r"\mathbf{I}", "<b>I</b>")
    s = s.replace(r"\mathbf{0}", "<b>0</b>")
    s = s.replace(r"\mathbf{1}", "<b>1</b>")
    s = re.sub(r"\\mathbf\{([^}]+)\}", r"<b>\1</b>", s)

    s = s.replace(r"\boldsymbol{\varepsilon}", "<b>&epsilon;</b>")
    s = s.replace(r"\varepsilon_i", "&epsilon;<sub><i>i</i></sub>")
    s = s.replace(r"\varepsilon", "&epsilon;")

    s = s.replace(r"\hat{y}_{\text{cf}}", "<i>y&#770;</i><sub>cf</sub>")
    s = s.replace(r"\hat{y}_{\text{smoker}}", "<i>y&#770;</i><sub>smoker</sub>")
    s = s.replace(r"\hat{y}_{\text{non-smoker}}", "<i>y&#770;</i><sub>non-smoker</sub>")
    s = s.replace(r"\hat{y}_i", "<i>y&#770;</i><sub><i>i</i></sub>")
    s = s.replace(r"\hat{y}", "<i>y&#770;</i>")
    s = s.replace(r"\bar{y}_m", "<i>y&#772;</i><sub><i>m</i></sub>")
    s = s.replace(r"\bar{y}", "<i>y&#772;</i>")
    s = s.replace(r"\bar{x}", "<i>x&#772;</i>")
    s = s.replace(r"\hat{c}_m", "<i>c&#770;</i><sub><i>m</i></sub>")

    s = s.replace(r"\langle", "&lang;")
    s = s.replace(r"\rangle", "&rang;")
    s = s.replace(r"\sim", "&sim;")
    s = s.replace(r"\dots", "&hellip;")
    s = s.replace(r"\exp", "exp")
    s = s.replace(r"\max", "max")
    s = s.replace(r"\propto", "&prop;")

    # Delimiters and brackets (MUST run before \le and \ge)
    s = s.replace(r"\left[", "[").replace(r"\right]", "]")
    s = s.replace(r"\left(", "(").replace(r"\right)", ")")
    s = s.replace(r"\left\{", "{").replace(r"\right\}", "}")
    s = s.replace(r"\left|", "|").replace(r"\right|", "|")

    # Features
    s = s.replace(r"x_{\text{age}}", "<i>x</i><sub>age</sub>")
    s = s.replace(r"x_{\text{sex}}", "<i>x</i><sub>sex</sub>")
    s = s.replace(r"x_{\text{bmi}}", "<i>x</i><sub>bmi</sub>")
    s = s.replace(r"x_{\text{children}}", "<i>x</i><sub>children</sub>")
    s = s.replace(r"x_{\text{smoker}}", "<i>x</i><sub>smoker</sub>")
    s = s.replace(r"x_{\text{region}}", "<i>x</i><sub>region</sub>")

    # Domain text terms
    domain_terms = [
        (r"\text{BMI}", "BMI"),
        (r"\text{Smoker}", "Smoker"),
        (r"\text{MAE}", "MAE"),
        (r"\text{RMSE}", "RMSE"),
        (r"\text{NLL}", "NLL"),
        (r"\text{Cov}", "Cov"),
        (r"\text{Laplace}", "Laplace"),
        (r"\text{sgn}", "sgn"),
        (r"\text{median}", "median"),
        (r"\text{Premium}", "Premium"),
        (r"\text{annual}", "annual"),
        (r"\text{monthly}", "monthly"),
        (r"\text{savings}", "savings"),
        (r"\text{train}", "train"),
        (r"\text{test}", "test"),
        (r"\text{res}", "res"),
        (r"\text{tot}", "tot"),
        (r"\text{reg}", "reg"),
        (r"\text{USD}", "USD"),
        (r"\text{kg}/\text{m}^2", "kg/m<sup>2</sup>"),
        (r"\text{female}", "female"),
        (r"\text{male}", "male"),
        (r"\text{yes}", "yes"),
        (r"\text{no}", "no"),
        (r"\text{northeast}", "northeast"),
        (r"\text{northwest}", "northwest"),
        (r"\text{southeast}", "southeast"),
        (r"\text{southwest}", "southwest"),
        (r"\text{sex_male}", "sex_male"),
        (r"\text{smoker_yes}", "smoker_yes"),
        (r"\text{region_northwest}", "region_northwest"),
        (r"\text{region_southeast}", "region_southeast"),
        (r"\text{region_southwest}", "region_southwest"),
        (r"\text{CI}", "CI"),
        (r"\text{lower}", "lower"),
        (r"\text{upper}", "upper"),
    ]
    for old, new in domain_terms:
        s = s.replace(old, new)

    s = re.sub(r"\\text\{([^}]+)\}", r"\1", s)

    # Summations
    s = s.replace(r"\sum_{i=1}^n", "&sum;<sub><i>i</i>=1..<i>n</i></sub>")
    s = s.replace(r"\sum_{i=1}^N", "&sum;<sub><i>i</i>=1..<i>N</i></sub>")
    s = s.replace(r"\sum_{m=1}^M", "&sum;<sub><i>m</i>=1..<i>M</i></sub>")
    s = s.replace(r"\sum_{i \in R_m}", "&sum;<sub><i>i</i> &isin; <i>R</i><sub><i>m</i></sub></sub>")
    s = s.replace(r"\sum", "&sum;")

    # Math fonts & alphabets
    s = s.replace(r"\mathcal{N}", "<i>N</i>")
    s = s.replace(r"\mathcal{L}", "<i>L</i>")
    s = s.replace(r"\mathcal{X}", "<i>X</i>")
    s = s.replace(r"\mathbb{R}^+", "<b>R</b><sup>+</sup>")
    s = s.replace(r"\mathbb{R}", "<b>R</b>")
    s = s.replace(r"\mathbb{I}", "<b>I</b>")

    # Greek & symbols
    s = s.replace(r"\sigma^2", "&sigma;<sup>2</sup>")
    s = s.replace(r"\sigma", "&sigma;")
    s = s.replace(r"\mu", "&mu;")
    s = s.replace(r"\alpha", "&alpha;")
    s = s.replace(r"\Delta_{\text{savings}}", "&Delta;<sub>savings</sub>")
    s = s.replace(r"\Delta", "&Delta;")

    # Operators & relations
    s = s.replace(r"R^2", "<i>R</i><sup>2</sup>")
    s = s.replace(r"L_1", "<i>L</i><sub>1</sub>")
    s = s.replace(r"L_2", "<i>L</i><sub>2</sub>")
    s = s.replace(r"\approx", "&asymp;")
    s = s.replace(r"\ge", "&ge;")
    s = s.replace(r"\le", "&le;")
    s = s.replace(r"\ne", "&ne;")
    s = s.replace(r"\pm", "&plusmn;")
    s = s.replace(r"\times", "&times;")
    s = s.replace(r"\in", "&isin;")
    s = s.replace(r"\cdot", "&sdot;")
    s = s.replace(r"\implies", "&rArr;")
    s = s.replace(r"\to", "&rarr;")
    s = s.replace(r"\forall", "&forall;")
    s = s.replace(r"\quad", " &nbsp; ")
    s = s.replace(r"\mid", "|")
    s = s.replace(r"\|", "||")
    s = s.replace(r"\{", "{").replace(r"\}", "}")
    s = s.replace(r"\_", "_")
    s = s.replace(r"\,", " ")
    s = s.replace(r"\;", " ")
    s = s.replace(r"\ ", " ")
    s = s.replace(r"\$", "$")

    # Generic subscript and superscripts
    s = re.sub(r"_\{([^}]+)\}", r"<sub>\1</sub>", s)
    s = re.sub(r"\^\{([^}]+)\}", r"<sup>\1</sup>", s)
    s = re.sub(r"_([0-9a-zA-Z])", r"<sub>\1</sub>", s)
    s = re.sub(r"\^([0-9a-zA-Z\*\+\-])", r"<sup>\1</sup>", s)

    return s


# ==============================================================================
# 3. MARKDOWN TABLE PROCESSOR (Badge Styling, No Emojis)
# ==============================================================================

def render_html_table(rows: list) -> str:
    """Renders markdown table rows with professional academic badge styling."""
    if len(rows) < 2:
        return ""

    header_cols = [c.strip() for c in rows[0].strip("|").split("|")]
    data_rows = rows[2:] if len(rows) > 2 else []

    html = ["<div class='table-container'><table><thead><tr>"]
    for h in header_cols:
        html.append(f"<th>{clean_math_string(h)}</th>")
    html.append("</tr></thead><tbody>")

    for r in data_rows:
        cols = [c.strip() for c in r.strip("|").split("|")]
        is_highlight_row = any("PASSED" in c for c in cols)
        row_class = " class='highlight-row'" if is_highlight_row else ""
        html.append(f"<tr{row_class}>")

        for i, c in enumerate(cols):
            cell_text = c
            cell_text = cell_text.replace("❌", "").replace("✅", "").strip()

            if "PASSED ALL" in cell_text:
                cell_text = f"<span class='badge-pass'>{cell_text}</span>"
            elif "Failed" in cell_text:
                cell_text = f"<span class='badge-fail'>{cell_text}</span>"

            html.append(f"<td>{cell_text}</td>")
        html.append("</tr>")

    html.append("</tbody></table></div>")
    return "".join(html)


# ==============================================================================
# 4. FULL MARKDOWN TO STYLED HTML ENGINE
# ==============================================================================

def markdown_to_styled_html(md_text: str, repo_root: Path) -> str:
    """Converts the project report markdown into publication-grade HTML with academic styling."""
    content = md_text

    # 1. Protect Currency ($ followed by digit) to prevent math regex collision
    content = re.sub(r"\$(\d[\d,]*(?:\.\d+)?)", r"__CURR_\1__", content)

    # 2. Convert Markdown Images to Figure Cards BEFORE math replacements
    def img_repl(m):
        alt = m.group(1).strip()
        src = m.group(2).strip()
        if src.startswith("assets/"):
            abs_src = (repo_root / "submission" / src).resolve().as_uri()
        else:
            abs_src = (repo_root / src).resolve().as_uri()
        return f"""
<div class="figure-container">
  <img src="{abs_src}" alt="{alt}" class="report-figure" />
</div>"""

    content = re.sub(r"!\[(.*?)\]\((.*?)\)", img_repl, content)

    # 3. Convert Headings
    content = re.sub(r"^### (.*?)$", r"<h3>\1</h3>", content, flags=re.MULTILINE)
    content = re.sub(r"^## (.*?)$", r"<h2>\1</h2>", content, flags=re.MULTILINE)
    content = re.sub(r"^# (.*?)$", r"<h1>\1</h1>", content, flags=re.MULTILINE)

    # 4. Horizontal Rules
    content = re.sub(r"^---$", r"<hr class='section-divider'>", content, flags=re.MULTILINE)

    # 5. Block Math $$...$$
    def block_repl(m):
        raw = m.group(1).strip()
        cleaned = clean_math_string(raw)
        return f"<div class='math-block'>{cleaned}</div>"

    content = re.sub(r"\$\$(.*?)\$\$", block_repl, content, flags=re.DOTALL)

    # 6. Inline Math $...$
    def inline_repl(m):
        raw = m.group(1).strip()
        cleaned = clean_math_string(raw)
        return f"<span class='math-inline'>{cleaned}</span>"

    content = re.sub(r"\$([^\$\n]+?)\$", inline_repl, content)

    # 7. Restore Currency placeholders
    content = re.sub(r"__CURR_([0-9.,]+)__", r"$\1", content)

    # 8. Typography: Bold, Italics, Code
    content = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", content)
    content = re.sub(r"(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)", r"<em>\1</em>", content)
    content = re.sub(r"`([^`]+)`", r"<code class='inline-code'>\1</code>", content)

    # 9. Tables
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
                in_table = False
                processed_lines.append(render_html_table(table_rows))
            processed_lines.append(line)

    if in_table:
        processed_lines.append(render_html_table(table_rows))

    content = "\n".join(processed_lines)

    # 10. Lists
    content = re.sub(r"^\s*-\s+(.*?)$", r"<li>\1</li>", content, flags=re.MULTILINE)
    content = re.sub(r"((?:<li>.*?</li>\n?)+)", r"<ul>\n\1</ul>\n", content)

    content = re.sub(r"^\s*\d+\.\s+(.*?)$", r"<li class='ordered'>\1</li>", content, flags=re.MULTILINE)
    content = re.sub(r"((?:<li class='ordered'>.*?</li>\n?)+)", r"<ol>\n\1</ol>\n", content)

    # 11. Paragraph wrapping
    paras = content.split("\n\n")
    final_paras = []
    for p in paras:
        p_str = p.strip()
        if not p_str:
            continue
        if (
            p_str.startswith("<h1") or p_str.startswith("<h2") or p_str.startswith("<h3") or
            p_str.startswith("<div") or p_str.startswith("<ul") or p_str.startswith("<ol") or
            p_str.startswith("<table") or p_str.startswith("<hr")
        ):
            final_paras.append(p_str)
        else:
            final_paras.append(f"<p>{p_str}</p>")

    body_html = "\n\n".join(final_paras)

    # 12. Full HTML Document
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DeltaCare — CS306 Machine Learning Project Report | Sayan Shit (2401179)</title>
<style>
  @page {{
    size: A4;
    margin: 16mm 15mm 16mm 15mm;
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
    line-height: 1.62;
    font-size: 9.8pt;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }}

  /* Academic Cover Header */
  .academic-header {{
    border-bottom: 3px double #0284c7;
    padding-bottom: 16px;
    margin-bottom: 22px;
    text-align: center;
  }}

  .inst-name {{
    font-size: 13.5pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 0.5px;
    margin: 0 0 4px 0;
    text-transform: uppercase;
  }}

  .dept-name {{
    font-size: 10.5pt;
    font-weight: 600;
    color: #0284c7;
    margin: 0 0 10px 0;
  }}

  .meta-grid {{
    display: table;
    width: 100%;
    margin-top: 10px;
    border-top: 1px solid #e2e8f0;
    padding-top: 10px;
    font-size: 9pt;
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
    margin: 2.5px 0;
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
    font-size: 16pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
    margin: 14px 0 12px 0;
    text-align: center;
  }}

  h2 {{
    font-size: 12pt;
    font-weight: 700;
    color: #0f172a;
    border-left: 4px solid #0284c7;
    padding-left: 10px;
    margin: 22px 0 8px 0;
    line-height: 1.35;
    break-after: avoid;
    background: #f8fafc;
    padding-top: 4px;
    padding-bottom: 4px;
  }}

  h3 {{
    font-size: 10.2pt;
    font-weight: 700;
    color: #0369a1;
    margin: 14px 0 6px 0;
    line-height: 1.3;
    break-after: avoid;
  }}

  p {{
    margin: 0 0 9px 0;
    text-align: justify;
    text-justify: inter-word;
  }}

  .section-divider {{
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 18px 0;
  }}

  /* Math Blocks & Inline Styling */
  .math-block {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 9px 14px;
    margin: 10px 0;
    text-align: center;
    font-family: "Cambria Math", "Latin Modern Math", Georgia, serif;
    font-size: 10.2pt;
    color: #0f172a;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    break-inside: avoid;
  }}

  .math-inline {{
    font-family: "Cambria Math", "Latin Modern Math", Georgia, serif;
    font-size: 9.8pt;
    color: #0f172a;
    padding: 0 2px;
  }}

  .frac {{
    display: inline-block;
    vertical-align: middle;
    text-align: center;
    padding: 0 3px;
    font-size: 0.9em;
  }}

  .num {{
    display: block;
    border-bottom: 1.2px solid #0f172a;
    padding-bottom: 1px;
  }}

  .den {{
    display: block;
    padding-top: 1px;
  }}

  /* Square Root with Continuous Radical & Vinculum */
  .sqrt-wrapper {{
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    position: relative;
    padding-left: 13px;
    margin: 0 3px;
  }}

  .sqrt-wrapper::before {{
    content: "";
    position: absolute;
    left: 0;
    top: 0px;
    bottom: 2px;
    width: 14px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 40' preserveAspectRatio='none'%3E%3Cpath d='M 1 24 L 3.5 24 L 7 38 L 13.2 1.5 L 14 1.5' fill='none' stroke='%230f172a' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }}

  .sqrt-radicand {{
    border-top: 1.8px solid #0f172a;
    padding-top: 2px;
    padding-left: 2px;
    padding-right: 4px;
    display: inline-block;
  }}

  /* Figures & Diagrams */
  .figure-container {{
    text-align: center;
    margin: 12px 0 8px 0;
    break-inside: avoid;
  }}

  .report-figure {{
    width: 96%;
    max-width: 690px;
    height: auto;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }}

  em {{
    font-style: italic;
    color: #475569;
  }}

  /* Tables */
  .table-container {{
    margin: 12px 0 16px 0;
    break-inside: avoid;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 8.6pt;
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

  tr.highlight-row {{
    background: #ecfdf5 !important;
    border-left: 3px solid #10b981;
    font-weight: 600;
  }}

  .badge-pass {{
    display: inline-block;
    background: #10b981;
    color: #ffffff;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.3px;
  }}

  .badge-fail {{
    display: inline-block;
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
    padding: 1.5px 6px;
    border-radius: 4px;
    font-size: 7.8pt;
    font-weight: 600;
  }}

  /* Lists */
  ul, ol {{
    margin: 5px 0 10px 0;
    padding-left: 20px;
  }}

  li {{
    margin-bottom: 3.5px;
    text-align: justify;
  }}

  .inline-code {{
    background: #f1f5f9;
    color: #0f172a;
    font-family: Consolas, "Courier New", monospace;
    font-size: 8.6pt;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
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
      <div class="meta-item"><span class="meta-label">Academic Session:</span> <span class="meta-val">Monsoon 2026</span></div>
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


def main():
    repo_root = Path(__file__).resolve().parent.parent
    report_md_path = repo_root / "submission" / "PROJECT_REPORT.md"
    html_output_path = repo_root / "submission" / "PROJECT_REPORT.html"
    pdf_output_path = repo_root / "submission" / "DeltaCare_ML_Project_Report_Sayan_Shit_2401179.pdf"

    print(f"[1/4] Reading Markdown report: {report_md_path}")
    with open(report_md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    print("[2/4] Converting to academic styled HTML with robust math & diagrams...")
    html_content = markdown_to_styled_html(md_text, repo_root)

    with open(html_output_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[3/4] HTML companion saved to: {html_output_path}")

    # Render PDF via Chrome Headless
    chrome_path = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
    if not chrome_path.exists():
        chrome_path = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

    print(f"[4/4] Generating PDF via headless browser ({chrome_path.name})...")
    try:
        pdf_output_path.unlink(missing_ok=True)
    except Exception:
        pass

    cmd = [
        str(chrome_path),
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_output_path}",
        str(html_output_path.resolve()),
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)

    if pdf_output_path.exists():
        size_kb = pdf_output_path.stat().st_size / 1024.0
        print("\n" + "=" * 65)
        print("  PDF GENERATION SUCCESSFUL!")
        print("=" * 65)
        print(f" PDF File: {pdf_output_path}")
        print(f" Size:     {size_kb:.1f} KB")
        print("=" * 65)
    else:
        print(f"[ERROR] PDF generation failed with code {res.returncode}:")
        print(res.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
