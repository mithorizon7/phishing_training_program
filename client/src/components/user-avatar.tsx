import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/models/auth";

interface UserAvatarProps {
  user: User | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

type UserLike = User | null | undefined;

function getInitials(user: User | null | undefined): string {
  if (!user) return "?";
  const first = user.firstName?.[0] || "";
  const last = user.lastName?.[0] || "";
  if (first || last) return (first + last).toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  return "U";
}

function getAvatarColor(userId: string | undefined): string {
  if (!userId) return "bg-muted";
  const colors = [
    "bg-chart-1",
    "bg-chart-2", 
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
  ];
  const index = userId.charCodeAt(0) % colors.length;
  return colors[index];
}

export function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`} data-testid="img-user-avatar">
      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
      <AvatarFallback className={`${getAvatarColor(user?.id)} text-white font-medium`}>
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  );
}
