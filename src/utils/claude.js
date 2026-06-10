// Claude API wrapper
export const callClaude = async (messages, systemPrompt = '') => {
  const apiKey = localStorage.getItem('anthropicApiKey');
  if (!apiKey) throw new Error('No Anthropic API key set. Please add it in Settings.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

export const buildStudyContext = (studyLogs, subjects, sleepLogs, exams) => {
  const subjectHours = subjects.map(s => {
    const hours = studyLogs
      .filter(l => l.subject === s.name)
      .reduce((sum, l) => sum + l.hours, 0);
    return { subject: s.name, hoursLogged: hours, weeklyGoal: s.weeklyGoal };
  });

  const recentSleep = sleepLogs.slice(-7);
  const avgSleep = recentSleep.length > 0
    ? recentSleep.reduce((s, l) => s + l.sleepHours, 0) / recentSleep.length
    : 7;

  const upcomingExams = exams
    .filter(e => new Date(e.date) > new Date())
    .map(e => ({
      name: e.name,
      daysLeft: Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return { subjectHours, avgSleepHours: avgSleep, upcomingExams };
};
