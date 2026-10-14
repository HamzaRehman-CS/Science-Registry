import { supabase } from './supabase';

export interface SocietyComment {
  id: string;
  created_at: string;
  target_name: string;
  comment: string;
  unfit_nominee?: string;
}

export interface NewCommentPayload {
  target_name: string;
  comment: string;
  unfit_nominee?: string;
}

/**
 * Submit an anonymous comment/roast to the database.
 * 100% Anonymous: No user identity, IP, or personal information is gathered or stored.
 */
export async function submitAnonymousComment(payload: NewCommentPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedName = payload.target_name.trim();
    const trimmedComment = payload.comment.trim();
    const trimmedUnfit = (payload.unfit_nominee || '').trim();

    if (!trimmedName) {
      return { success: false, error: 'Please specify the name of the person!' };
    }
    if (!trimmedComment || trimmedComment.length < 5) {
      return { success: false, error: 'Comment must be at least 5 characters long!' };
    }

    const uniqueAnonRef = `ANON-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const { error } = await supabase
      .from('applications')
      .insert([
        {
          applicant_name: trimmedName,
          registration_number: uniqueAnonRef,
          department: 'Science Society Fun Activity',
          semester: 'Fun 2026',
          applied_position: trimmedUnfit ? `Unfit: ${trimmedUnfit.slice(0, 45)}` : 'Fun Roast/Comment',
          answers: {
            type: 'society_comment',
            target_name: trimmedName,
            comment: trimmedComment,
            unfit_nominee: trimmedUnfit,
            created_at: new Date().toISOString()
          }
        }
      ]);

    if (error) {
      console.error('Error submitting comment:', error);
      return { success: false, error: error.message || 'Failed to submit comment. Please try again.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected submission error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}

/**
 * Fetch all anonymous comments (for authenticated Admin only)
 */
export async function fetchAnonymousComments(): Promise<{ comments: SocietyComment[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { comments: [], error: error.message };
    }

    const comments: SocietyComment[] = [];

    for (const row of data || []) {
      if (row.answers?.type === 'society_comment' || (row.registration_number && row.registration_number.startsWith('ANON-'))) {
        comments.push({
          id: row.id,
          created_at: row.created_at,
          target_name: row.answers?.target_name || row.applicant_name,
          comment: row.answers?.comment || (typeof row.answers === 'string' ? row.answers : 'No comment text'),
          unfit_nominee: row.answers?.unfit_nominee || (row.applied_position?.startsWith('Unfit: ') ? row.applied_position.replace('Unfit: ', '') : undefined)
        });
      }
    }

    return { comments };
  } catch (err: any) {
    return { comments: [], error: err.message };
  }
}

/**
 * Delete a comment by ID (Admin only)
 */
export async function deleteAnonymousComment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
