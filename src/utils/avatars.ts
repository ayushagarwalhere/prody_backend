const AVATARS: string[] = [
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=alpha',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=beta',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=gamma',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=delta',
  'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=epsilon',
];

export const getRandomAvatarUrl = (): string => {
  const index = Math.floor(Math.random() * AVATARS.length);
  return AVATARS[index]!;
};

