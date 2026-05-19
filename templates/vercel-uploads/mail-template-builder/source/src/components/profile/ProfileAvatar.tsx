'use client';

interface ProfileAvatarProps {
  name: string;
  email: string;
  avatar?: string;
}

export function ProfileAvatar({ name, email, avatar }: ProfileAvatarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <img
          src={avatar || `https://ui-avatars.com/api/?name=${name}&background=random`}
          alt={name}
          className="w-20 h-20 rounded-full border-4 border-gray-100 dark:border-gray-700"
        />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
      </div>
      <div>
        <h3 className="text-lg font-semibold dark:text-white">{name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
      </div>
    </div>
  );
}
