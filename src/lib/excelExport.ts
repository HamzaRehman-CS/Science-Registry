import * as XLSX from 'xlsx';
import type { ApplicationData } from './applications';

export function exportApplicationsToFormattedExcel(applications: ApplicationData[]) {
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Build Rich Formatted HTML-Excel with full CSS styling
  let html = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>DSC Registrations 2026</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
    <style>
      body {
        font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      }
      .title-banner {
        background-color: #0A1128;
        color: #FFFFFF;
        font-size: 16pt;
        font-weight: bold;
        text-align: center;
        padding: 14px;
        border: 1px solid #000000;
      }
      .subtitle-banner {
        background-color: #1E293B;
        color: #94A3B8;
        font-size: 10pt;
        text-align: center;
        padding: 6px;
      }
      .stat-banner {
        background-color: #F1F5F9;
        color: #0F172A;
        font-size: 9.5pt;
        font-weight: 600;
        padding: 8px;
        border-bottom: 2px solid #CBD5E1;
      }
      th {
        background-color: #0056A8;
        color: #FFFFFF;
        font-size: 10pt;
        font-weight: bold;
        padding: 10px 8px;
        text-align: left;
        border: 1px solid #004080;
        white-space: nowrap;
      }
      th.physical-col {
        background-color: #047857;
        color: #FFFFFF;
      }
      td {
        font-size: 9pt;
        padding: 8px;
        border: 1px solid #E2E8F0;
        vertical-align: top;
      }
      .row-even {
        background-color: #FFFFFF;
      }
      .row-odd {
        background-color: #F8FAFC;
      }
      .badge-exec {
        background-color: #EDE9FE;
        color: #5B21B6;
        font-weight: bold;
        padding: 3px 6px;
        border-radius: 4px;
      }
      .badge-dir {
        background-color: #E0F2FE;
        color: #0369A1;
        font-weight: bold;
        padding: 3px 6px;
        border-radius: 4px;
      .badge-team {
        background-color: #F1F5F9;
        color: #334155;
        font-weight: bold;
        padding: 3px 6px;
        border-radius: 4px;
      }
      .reg-no {
        font-family: Consolas, monospace;
        font-weight: bold;
        color: #0F172A;
      }
      .blank-cell {
        background-color: #F9FAFB;
        border: 1px dashed #CBD5E1;
      }
    </style>
  </head>
  <body>
    <table>
      <tr>
        <td colspan="21" class="title-banner">
          PAF-IAST DATA SCIENCE COMMUNITY • RECRUITMENT REGISTRY
        </td>
      </tr>
      <tr>
        <td colspan="21" class="subtitle-banner">
          Applicant Dossiers for Physical Review & Interview Shortlisting • Generated on ${exportDate}
        </td>
      </tr>
      <tr>
        <td colspan="21" class="stat-banner">
          Total Candidates: <b>${applications.length}</b> &nbsp;|&nbsp; 
          Community: <b>The Data Science Community • PAF-IAST</b> &nbsp;|&nbsp; 
          Confidential Evaluation Copy
        </td>
      </tr>
      <tr>
        <th>#</th>
        <th>Candidate Name</th>
        <th>Registration No</th>
        <th>Position Category</th>
        <th>Applied Position</th>
        <th>2nd Choice</th>
        <th>Department</th>
        <th>Degree Program</th>
        <th>Semester</th>
        <th>Gender</th>
        <th>Contact Email</th>
        <th>WhatsApp / Phone</th>
        <th>Skill Level</th>
        <th>Motivation</th>
        <th>Prior Experience</th>
        <th>Certifications & Courses</th>
        <th>Awards & Honors</th>
        <th>LinkedIn Profile</th>
        <th>Portfolio Link</th>
        <th class="physical-col">Physical Shortlist Decision</th>
        <th class="physical-col">Panel Interview Marks / Notes</th>
      </tr>
  `;

  applications.forEach((app, idx) => {
    const rowClass = idx % 2 === 0 ? 'row-even' : 'row-odd';
    
    let catBadgeClass = 'badge-team';
    if (app.applied_category === 'Executive Leadership' || app.applied_position.includes('President') || app.applied_position.includes('Secretary')) {
      catBadgeClass = 'badge-exec';
    } else if (app.applied_category === 'Directorate Lead' || app.applied_position.startsWith('Director')) {
      catBadgeClass = 'badge-dir';
    }

    const linkedin = app.linkedin_url || (app.portfolio_link && app.portfolio_link.includes('linkedin') ? app.portfolio_link : '');
    const portfolio = app.portfolio_url || (app.portfolio_link && !app.portfolio_link.includes('linkedin') ? app.portfolio_link : '');

    html += `
      <tr class="${rowClass}">
        <td align="center">${idx + 1}</td>
        <td><b>${escapeXml(app.applicant_name)}</b></td>
        <td class="reg-no">${escapeXml(app.registration_number)}</td>
        <td><span class="${catBadgeClass}">${escapeXml(app.applied_category)}</span></td>
        <td><b>${escapeXml(app.applied_position)}</b></td>
        <td>${escapeXml(app.second_choice_position || '-')}</td>
        <td>${escapeXml(app.department)}</td>
        <td>${escapeXml(app.degree_program || '-')}</td>
        <td>${escapeXml(app.semester)}</td>
        <td>${escapeXml(app.gender)}</td>
        <td>${escapeXml(app.personal_email)}</td>
        <td>${escapeXml(app.phone_number)}</td>
        <td>${escapeXml(app.skill_level)}</td>
        <td>${escapeXml(app.motivation_join)}</td>
        <td>${escapeXml(app.detailed_prior_experience)}</td>
        <td>${escapeXml(app.certifications || app.awards_certificates || '-')}</td>
        <td>${escapeXml(app.awards_competitions || '-')}</td>
        <td>${escapeXml(linkedin || '-')}</td>
        <td>${escapeXml(portfolio || '-')}</td>
        <td class="blank-cell">${escapeXml(app.admin_notes ? `Notes: ${app.admin_notes}` : '')}</td>
        <td class="blank-cell"></td>
      </tr>
    `;
  });

  html += `
    </table>
  </body>
  </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DSC_Recruitment_Candidates_For_Physical_Shortlisting_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// SheetJS .xlsx download
export function exportApplicationsToXLSX(applications: ApplicationData[]) {
  const rows = applications.map((app, idx) => ({
    '#': idx + 1,
    'Candidate Name': app.applicant_name,
    'Registration Number': app.registration_number,
    'Position Category': app.applied_category,
    'Applied Position': app.applied_position,
    'Second Choice': app.second_choice_position,
    'Department': app.department,
    'Degree / Program': app.degree_program,
    'Semester': app.semester,
    'Gender': app.gender,
    'Email Address': app.personal_email,
    'WhatsApp / Phone': app.phone_number,
    'Skill Level': app.skill_level,
    'Application Motivation': app.motivation_join,
    'Prior Experience': app.detailed_prior_experience,
    'Certifications': app.certifications || app.awards_certificates || '',
    'Awards & Honors': app.awards_competitions || '',
    'Notable Projects': app.previous_achievements || '',
    'LinkedIn': app.linkedin_url || '',
    'Portfolio / Website': app.portfolio_url || '',
    'Physical Shortlist Decision': '',
    'Interview Marks / Notes': app.admin_notes || '',
    'Date Submitted': new Date(app.created_at).toLocaleString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 4 },   // #
    { wch: 22 },  // Candidate Name
    { wch: 16 },  // Registration Number
    { wch: 20 },  // Position Category
    { wch: 24 },  // Applied Position
    { wch: 20 },  // Second Choice
    { wch: 22 },  // Department
    { wch: 18 },  // Degree / Program
    { wch: 14 },  // Semester
    { wch: 10 },  // Gender
    { wch: 26 },  // Email
    { wch: 16 },  // Phone
    { wch: 14 },  // Skill Level
    { wch: 30 },  // Motivation
    { wch: 35 },  // Prior Experience
    { wch: 25 },  // Certifications
    { wch: 25 },  // Awards & Honors
    { wch: 25 },  // Projects
    { wch: 24 },  // LinkedIn
    { wch: 24 },  // Portfolio
    { wch: 24 },  // Physical Shortlist Decision
    { wch: 28 },  // Interview Marks
    { wch: 20 }   // Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates Registry');
  XLSX.writeFile(workbook, `DSC_Candidates_Registry_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function escapeXml(unsafe: string | undefined | null): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\n/g, '<br/>');
}
