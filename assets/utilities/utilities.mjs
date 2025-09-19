// Format a date as "DD Month, YYYY"
export const getDate = (date) => {
  const d = new Date(date);

  // Correct: getDate() = day of the month
  const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month}, ${year}`;
};

// Return a random motivational subtitle string
export const getSubtitle = () => {
  const subtitles = [
    "Your thoughts, your space.",
    "Write it down. Make it real.",
    "This is your space to think.",
    "Ideas live here.",
    "Notes that matter.",
    "Jot it. Save it. Done.",
    "Keep your mind clear.",
    "Type freely. Think boldly.",
    "Capture the moment.",
    "Everything starts with a note.",
  ];

  const randomIndex = Math.floor(Math.random() * subtitles.length);
  return subtitles[randomIndex];
};

// Email Regex
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
