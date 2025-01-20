import { Problem } from './types';

const CF_API_BASE = 'https://codeforces.com/api';

export async function getProblemIdFromUrl(url: string): Promise<string | null> {
  try {
    // Transform contest URL to problemset URL if needed
    let normalizedUrl = url;
    const contestMatch = url.match(/contest\/(\d+)\/problem\/([A-Z]\d*)/i);
    if (contestMatch) {
      normalizedUrl = `https://codeforces.com/problemset/problem/${contestMatch[1]}/${contestMatch[2]}`;
    }

    // Extract problem ID from the normalized URL
    const match = normalizedUrl.match(/problem\/(\d+)\/([A-Z]\d*)/i);
    return match ? `${match[1]}${match[2]}` : null;
  } catch {
    return null;
  }
}

export async function checkSubmission(handle: string, problemId: string, after: number): Promise<boolean> {
  try {
    const response = await fetch(`${CF_API_BASE}/user.status?handle=${handle}&from=1&count=100`);
    const data = await response.json();
    
    if (data.status !== 'OK') return false;
    
    return data.result.some((submission: any) => {
      const submissionTime = submission.creationTimeSeconds;
      const submissionProblemId = `${submission.problem.contestId}${submission.problem.index}`;
      return (
        submissionTime > after &&
        submissionProblemId === problemId &&
        submission.verdict === 'OK'
      );
    });
  } catch {
    return false;
  }
}

export async function validateCodeforcesHandle(handle: string): Promise<boolean> {
  try {
    const response = await fetch(`${CF_API_BASE}/user.info?handles=${handle}`);
    const data = await response.json();
    return data.status === 'OK';
  } catch {
    return false;
  }
}