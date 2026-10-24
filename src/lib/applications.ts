import { supabase } from './supabase';

export interface ApplicationData {
  id: string;
  created_at: string;
  applicant_name: string;
  registration_number: string;
  personal_email: string;
  phone_number: string;
  department: string;
  degree_program: string;
  semester: string;
  province?: string;
  city?: string;
  gender: 'Female' | 'Male' | string;
  date_of_birth: string;
  applied_category: 'Executive Leadership' | 'Directorate Lead' | 'Department Team Member' | string;
  applied_position: string;
  second_choice_position: string;
  skill_level: string;
  ds_interest_reason?: string;
  ds_community_vision?: string;
  motivation_join: string;
  motivation_drive: string;
  can_participate_competitions: string;
  can_travel: string;
  willing_commit_deadlines: string;
  is_member_other_society: string;
  other_society_details?: string;
  detailed_prior_experience: string;
  certifications?: string;
  awards_competitions?: string;
  previous_achievements?: string;
  awards_certificates?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  portfolio_link?: string;
  additional_info?: string;
  role_specific_answers?: Record<string, any>;
  status?: string;
  admin_notes?: string;
  answers: Record<string, any>;
}

const LOCAL_STORAGE_KEY = 'dsc_applications_vault_v1';
const ADMIN_SESSION_KEY = 'dsc_admin_auth_session';

// All dummy seed applications purged - only fresh applicant records

// Helper to get local stored applications (clean of all dummy/seed records)
export function getLocalApplications(): ApplicationData[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Strictly filter out any dummy seed data
    const cleaned = parsed.filter((app: ApplicationData) => 
      !app.id?.startsWith('dsc-seed-') &&
      app.registration_number !== 'B-23-F-0142' &&
      app.registration_number !== 'B-24-S-0089' &&
      app.registration_number !== 'B-23-F-0211' &&
      app.registration_number !== 'B-22-F-0015'
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    console.warn('Error reading local applications:', e);
    return [];
  }
}

// Helper to save local applications
export function saveLocalApplications(apps: ApplicationData[]): void {
  try {
    const cleaned = apps.filter((app: ApplicationData) => !app.id?.startsWith('dsc-seed-'));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Failed to save applications locally:', e);
  }
}

// Check for duplicate registration number
export async function checkDuplicateRegistration(regNo: string): Promise<boolean> {
  const cleanRegNo = (regNo || '').trim().toLowerCase();
  if (!cleanRegNo) return false;

  // 1. Check local store
  const localList = getLocalApplications();
  const existsLocally = localList.some(
    app => (app.registration_number || '').trim().toLowerCase() === cleanRegNo
  );
  if (existsLocally) return true;

  // 2. Check Supabase if connected
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .ilike('registration_number', cleanRegNo)
      .limit(1);

    if (!error && data && data.length > 0) {
      return true;
    }
  } catch (e) {
    // Network offline or Supabase unreachable, fallback to local only
  }

  return false;
}

// Submit a new application
export async function submitApplication(data: Partial<ApplicationData>): Promise<{ success: boolean; error?: string }> {
  try {
    const regNo = (data.registration_number || '').trim();
    if (!regNo) {
      return { success: false, error: 'Registration Number is required.' };
    }

    const isDuplicate = await checkDuplicateRegistration(regNo);
    if (isDuplicate) {
      return {
        success: false,
        error: `An application with Registration Number "${regNo}" has already been submitted. Multiple submissions are not allowed.`
      };
    }

    const newApp: ApplicationData = {
      id: 'dsc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      applicant_name: data.applicant_name || '',
      registration_number: regNo,
      personal_email: data.personal_email || '',
      phone_number: data.phone_number || '',
      department: data.department || '',
      degree_program: data.degree_program || '',
      semester: data.semester || '',
      gender: data.gender || '',
      date_of_birth: data.date_of_birth || '',
      applied_category: data.applied_category || 'Department Team Member',
      applied_position: data.applied_position || '',
      second_choice_position: data.second_choice_position || '',
      skill_level: data.skill_level || 'Beginner',
      motivation_join: data.motivation_join || '',
      motivation_drive: data.motivation_drive || '',
      can_participate_competitions: data.can_participate_competitions || 'Yes',
      can_travel: data.can_travel || 'Yes',
      willing_commit_deadlines: data.willing_commit_deadlines || 'Yes',
      is_member_other_society: data.is_member_other_society || 'No',
      other_society_details: data.other_society_details || '',
      detailed_prior_experience: data.detailed_prior_experience || '',
      certifications: data.certifications || '',
      awards_competitions: data.awards_competitions || '',
      previous_achievements: data.previous_achievements || '',
      awards_certificates: [data.certifications, data.awards_competitions, data.previous_achievements].filter(Boolean).join(' | '),
      linkedin_url: data.linkedin_url || '',
      portfolio_url: data.portfolio_url || '',
      github_url: data.github_url || '',
      portfolio_link: data.portfolio_url || data.linkedin_url || data.github_url || '',
      additional_info: data.additional_info || '',
      role_specific_answers: data.role_specific_answers || {},
      status: 'Registered',
      answers: {
        ...data.answers,
        submitted_at: new Date().toISOString()
      }
    };

    // Save to local cache first (instant local persistence)
    const current = getLocalApplications();
    saveLocalApplications([newApp, ...current]);

    // Save to multi-device shared disk vault via local Vite API
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
    } catch (apiErr) {
      console.warn('Multi-device API sync offline or pending:', apiErr);
    }

    // Save to Supabase (primary cloud database)
    try {
      const combinedDept = newApp.degree_program 
        ? `${newApp.department} - ${newApp.degree_program}` 
        : newApp.department;

      const { error: sbError } = await supabase.from('applications').insert([
        {
          applicant_name: newApp.applicant_name,
          registration_number: newApp.registration_number,
          department: combinedDept,
          semester: newApp.semester,
          applied_position: newApp.applied_position,
          answers: {
            ...newApp,
            society: 'PAF-IAST Data Science Community'
          }
        }
      ]);

      if (sbError) {
        console.warn('Supabase insert note:', sbError);
      }
    } catch (dbErr) {
      console.warn('Supabase insert skipped or offline:', dbErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('submitApplication error:', err);
    return { success: false, error: err.message || 'Failed to submit application.' };
  }
}

// Auto-sync any unsynced local applications from phone/browser cache to Supabase
export async function syncLocalApplicationsToCloud(): Promise<{ synced: number; error?: string }> {
  try {
    const local = getLocalApplications();
    if (!local || local.length === 0) return { synced: 0 };

    let count = 0;
    for (const app of local) {
      if (!app.registration_number || app.id?.startsWith('dsc-seed-')) continue;
      const cleanReg = app.registration_number.trim().toLowerCase();

      try {
        const { data: existing } = await supabase
          .from('applications')
          .select('id')
          .ilike('registration_number', cleanReg)
          .limit(1);

        if (!existing || existing.length === 0) {
          const combinedDept = app.degree_program 
            ? `${app.department} - ${app.degree_program}` 
            : app.department;

          const { error } = await supabase.from('applications').insert([
            {
              applicant_name: app.applicant_name,
              registration_number: app.registration_number,
              department: combinedDept,
              semester: app.semester,
              applied_position: app.applied_position,
              answers: {
                ...app,
                society: 'PAF-IAST Data Science Community'
              }
            }
          ]);
          if (!error) count++;
        }
      } catch (e) {}
    }
    return { synced: count };
  } catch (err: any) {
    return { synced: 0, error: err.message };
  }
}

// Fetch all applications with optimal DSA Hash-Map merging and multi-device disk sync
export async function fetchAllApplications(): Promise<{ applications: ApplicationData[]; error?: string }> {
  try {
    const localList = getLocalApplications();
    const regMap = new Map<string, ApplicationData>();

    // 1. Seed with local browser cache
    localList.forEach(app => {
      const key = (app.registration_number || '').trim().toLowerCase();
      if (key && !app.id?.startsWith('dsc-seed-')) {
        regMap.set(key, app);
      }
    });

    // 2. Sync from Multi-Device API Vault (data/applications.json on host)
    try {
      const apiRes = await fetch('/api/applications');
      if (apiRes.ok) {
        const diskApps: ApplicationData[] = await apiRes.json();
        if (Array.isArray(diskApps)) {
          diskApps.forEach(app => {
            const key = (app.registration_number || '').trim().toLowerCase();
            if (key && !app.id?.startsWith('dsc-seed-')) {
              regMap.set(key, app);
            }
          });
        }
      }
    } catch (e) {
      // Local API unavailable or offline
    }

    // 3. Cloud Supabase fetch with 8000ms timeout
    try {
      const fetchPromise = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Supabase fetch timeout') }), 8000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (!error && data && data.length > 0) {
        data.forEach((item: any) => {
          const ans = item.answers || {};
          const mapped: ApplicationData = {
            id: item.id || `app-${item.registration_number}`,
            created_at: item.created_at || new Date().toISOString(),
            applicant_name: item.applicant_name || ans.applicant_name || '',
            registration_number: item.registration_number || ans.registration_number || '',
            personal_email: ans.personal_email || ans['Personal Email Address'] || '',
            phone_number: ans.phone_number || ans['Phone Number / WhatsApp'] || '',
            department: ans.department || item.department || '',
            degree_program: ans.degree_program || ans['Degree / Program'] || '',
            semester: item.semester || ans.semester || ans['Semester'] || '',
            gender: ans.gender || ans['What gender do you identify as?'] || '',
            date_of_birth: ans.date_of_birth || ans['Date of birth'] || '',
            applied_category: ans.applied_category || 'General',
            applied_position: item.applied_position || ans.applied_position || '',
            second_choice_position: ans.second_choice_position || ans['What is your second-choice position?'] || '',
            skill_level: ans.skill_level || ans['What is your current skill level in this domain?'] || 'Beginner',
            motivation_join: ans.motivation_join || ans['Why do you want to join the PAF-IAST Data Science Community?'] || '',
            motivation_drive: ans.motivation_drive || ans['What is your biggest personal motivation to contribute?'] || '',
            can_participate_competitions: ans.can_participate_competitions || 'Yes',
            can_travel: ans.can_travel || 'Yes',
            willing_commit_deadlines: ans.willing_commit_deadlines || 'Yes',
            is_member_other_society: ans.is_member_other_society || 'No',
            other_society_details: ans.other_society_details || '',
            detailed_prior_experience: ans.detailed_prior_experience || ans['Detailed prior experience related to this position/team:'] || '',
            certifications: ans.certifications || ans['Certifications & specialized training (if any):'] || '',
            awards_competitions: ans.awards_competitions || ans['Awards, honors & competition wins (if any):'] || '',
            previous_achievements: ans.previous_achievements || ans['Notable projects & extracurricular achievements:'] || '',
            awards_certificates: ans.awards_certificates || '',
            linkedin_url: ans.linkedin_url || ans['LinkedIn Profile URL:'] || '',
            portfolio_url: ans.portfolio_url || ans['Portfolio / Website / Work Showcase Link:'] || '',
            github_url: ans.github_url || ans['GitHub Profile Link:'] || '',
            portfolio_link: ans.portfolio_link || ans.portfolio_url || ans.linkedin_url || '',
            additional_info: ans.additional_info || ans['Is there anything else you\'d like us to know about you?'] || '',
            role_specific_answers: ans.role_specific_answers || {},
            status: ans.status || 'Registered',
            admin_notes: ans.admin_notes || '',
            answers: ans
          };
          const key = (mapped.registration_number || '').trim().toLowerCase();
          if (key && !regMap.has(key) && !mapped.id?.startsWith('dsc-seed-')) {
            regMap.set(key, mapped);
          }
        });
      }
    } catch (e) {
      // Supabase timeout or error: gracefully ignore
    }

    const merged = Array.from(regMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Save cleaned deduplicated list back to local cache
    saveLocalApplications(merged);

    return { applications: merged };
  } catch (err: any) {
    return { applications: getLocalApplications(), error: err.message };
  }
}

// Update application status & notes
export async function updateApplicationStatus(
  id: string,
  status: ApplicationData['status'],
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const list = getLocalApplications();
    const updated = list.map(app => {
      if (app.id === id) {
        return {
          ...app,
          status,
          admin_notes: notes !== undefined ? notes : app.admin_notes
        };
      }
      return app;
    });
    saveLocalApplications(updated);

    // Try Supabase update if ID is UUID
    try {
      await supabase
        .from('applications')
        .update({
          answers: {
            status,
            admin_notes: notes
          }
        })
        .eq('id', id);
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Delete an application
export async function deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const list = getLocalApplications();
    const filtered = list.filter(app => app.id !== id);
    saveLocalApplications(filtered);

    // Delete from shared multi-device disk store
    try {
      await fetch('/api/applications?id=' + encodeURIComponent(id), { method: 'DELETE' });
    } catch (e) {}

    // Delete from Supabase
    try {
      await supabase.from('applications').delete().eq('id', id);
    } catch (e) {}

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Admin Authentication:
// User Specified Exact ID: dsc26, Password: register
export function verifyAdminCredentials(adminId: string, pass: string): boolean {
  const cleanId = (adminId || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();

  // Primary Exact Credentials:
  // Admin ID: dsc26
  // Password: register
  if ((cleanId === 'dsc26' || cleanId === 'dsc26@society.com' || cleanId === 'dec26' || cleanId === 'dec26@society.com' || cleanId === 'pafss26') &&
      (cleanPass === 'register' || cleanPass === 'registry')) {
    return true;
  }

  return false;
}

export function saveAdminSession(adminId: string): void {
  try {
    const session = {
      adminId: adminId.trim().toLowerCase(),
      loggedInAt: new Date().toISOString(),
      role: 'SuperAdmin'
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch (e) {}
}

export function hasAdminSession(): boolean {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Boolean(session && session.adminId);
  } catch (e) {
    return false;
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    supabase.auth.signOut().catch(() => {});
  } catch (e) {}
}
