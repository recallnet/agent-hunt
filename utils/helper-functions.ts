export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const formatSkill = (skill: string): string => {
  if (!skill) return "";
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
};
